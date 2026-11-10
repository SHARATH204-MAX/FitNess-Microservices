
package com.fitness.aiservice.service;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GroqService {

    private final WebClient webClient;
    private final String model;

    public GroqService(
            @Value("${groq.api.url}") String apiUrl,
            @Value("${groq.api.key}") String apiKey,
            @Value("${groq.api.model}") String model) {

        this.model = model;

        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiKey
                )
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    public String generateContent(String prompt) {

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "temperature", 0.3,
                "max_completion_tokens", 1500
        );

        try {

            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(
                            new ParameterizedTypeReference<
                                    Map<String, Object>>() {}
                    )
                    .block();

            if (response == null) {
                throw new RuntimeException(
                        "Empty response received from Groq"
                );
            }

            // Extract choices from response
            List<?> choices = (List<?>) response.get("choices");

            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException(
                        "No choices found in Groq response"
                );
            }

            // Extract first choice
            Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);

            // Extract message
            Map<?, ?> message =
                    (Map<?, ?>) firstChoice.get("message");

            if (message == null) {
                throw new RuntimeException(
                        "No message found in Groq response"
                );
            }

            // Extract generated content
            String content = (String) message.get("content");

            if (content == null || content.isBlank()) {
                throw new RuntimeException(
                        "Groq returned empty recommendation content"
                );
            }

            log.info("Groq response generated successfully");

            return content;

        } catch (Exception e) {

            log.error(
                    "Groq API request failed: {}",
                    e.getMessage(),
                    e
            );

            throw new RuntimeException(
                    "Failed to generate recommendation using Groq",
                    e
            );
        }
    }
}
