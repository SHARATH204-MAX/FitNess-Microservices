
package com.fitness.aiservice.service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
@Slf4j
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // Minimum interval between request starts: 6 seconds.
    private static final long MIN_REQUEST_INTERVAL_MS = 6000;

    // Coordinates request timing across concurrent callers.
    private final AtomicLong nextRequestTime = new AtomicLong(0);

    public GeminiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAnswer(String question) {

        Map<String, Object> requestBody = Map.of(
                "contents",
                new Object[]{
                        Map.of(
                                "parts",
                                new Object[]{
                                        Map.of("text", question)
                                }
                        )
                }
        );

        return sendRequest(requestBody)
                .retryWhen(
                        Retry.backoff(2, Duration.ofSeconds(5))
                                .maxBackoff(Duration.ofSeconds(20))
                                .jitter(0.5)
                                .filter(this::isRetryableError)
                                .doBeforeRetry(signal ->
                                        log.warn(
                                                "Retrying Gemini request. Retry number: {}",
                                                signal.totalRetries() + 1
                                        )
                                )
                )
                .doOnError(this::logGeminiError)
                .block();
    }

    private Mono<String> sendRequest(Map<String, Object> requestBody) {

        return Mono.defer(() -> {

            long currentTime = System.currentTimeMillis();

            // Reserve a request slot atomically.
            long scheduledTime = nextRequestTime.getAndUpdate(
                    previous -> Math.max(previous, currentTime)
                            + MIN_REQUEST_INTERVAL_MS
            );

            long waitTime = Math.max(0, scheduledTime - currentTime);

            if (waitTime > 0) {
                log.info(
                        "Waiting {} ms before Gemini API request",
                        waitTime
                );
            }

            // Non-blocking delay. This also runs again on every retry.
            return Mono.delay(Duration.ofMillis(waitTime))
                    .then(
                            webClient.post()
                                    .uri(geminiApiUrl + geminiApiKey)
                                    .header("Content-Type", "application/json")
                                    .bodyValue(requestBody)
                                    .retrieve()
                                    .bodyToMono(String.class)
                    );
        });
    }

    private boolean isRetryableError(Throwable error) {

        if (!(error instanceof WebClientResponseException ex)) {
            return false;
        }

        int status = ex.getStatusCode().value();

        if (status == 502 || status == 503 || status == 504) {
            return true;
        }

        if (status == 429) {

            String responseBody = ex.getResponseBodyAsString()
                    .toLowerCase()
                    .replace("_", "")
                    .replace(" ", "");

            // Do not retry clearly identified daily quota exhaustion.
            if (responseBody.contains("perday")
                    || responseBody.contains("requestsperday")
                    || responseBody.contains("dailyquota")) {

                log.error(
                        "Gemini daily quota appears exhausted. Response: {}",
                        ex.getResponseBodyAsString()
                );

                return false;
            }

            // Other 429 errors get bounded retries.
            return true;
        }

        return false;
    }

    private void logGeminiError(Throwable error) {

        if (error instanceof WebClientResponseException ex) {

            log.error("Gemini HTTP Status: {}", ex.getStatusCode());

            log.error(
                    "Gemini Error Response: {}",
                    ex.getResponseBodyAsString()
            );

            log.error(
                    "Gemini Retry-After: {}",
                    ex.getHeaders().getFirst("Retry-After")
            );

        } else {

            log.error("Gemini API communication failed", error);
        }
    }
}
