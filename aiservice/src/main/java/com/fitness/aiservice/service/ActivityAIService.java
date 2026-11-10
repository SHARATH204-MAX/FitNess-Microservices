
package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAIService {

  private final GroqService groqService;

  private final ObjectMapper objectMapper = new ObjectMapper();

  public Recommendation generateRecommendation(Activity activity) {

    String prompt = createPromptForActivity(activity);

    String response = groqService.generateContent(prompt);

    log.info("RESPONSE FROM AI: {}", response);

    return processAiResponse(activity, response);
  }

  private Recommendation processAiResponse(
          Activity activity,
          String aiResponse) {

    try {

      // Groq returns the generated JSON directly.
      // Remove Markdown code fences if the model adds them.

      String jsonContent = aiResponse
              .replaceFirst("(?s)^\\s*```(?:json)?\\s*", "")
              .replaceFirst("(?s)\\s*```\\s*$", "")
              .trim();

      // Parse Groq's JSON response directly.
      JsonNode analysisJson =
              objectMapper.readTree(jsonContent);

      if (analysisJson == null || !analysisJson.isObject()) {
        throw new IllegalArgumentException(
                "Groq response is not a valid JSON object"
        );
      }

      JsonNode analysisNode = analysisJson.path("analysis");

      if (analysisNode.isMissingNode() || !analysisNode.isObject()) {
        throw new IllegalArgumentException(
                "Missing analysis object in Groq response"
        );
      }

      // Extract analysis sections.
      StringBuilder fullAnalysis = new StringBuilder();

      addAnalysisSection(
              fullAnalysis,
              analysisNode,
              "overall",
              "Overall:"
      );

      addAnalysisSection(
              fullAnalysis,
              analysisNode,
              "pace",
              "Pace:"
      );

      addAnalysisSection(
              fullAnalysis,
              analysisNode,
              "heartRate",
              "Heart Rate:"
      );

      addAnalysisSection(
              fullAnalysis,
              analysisNode,
              "caloriesBurned",
              "Calories:"
      );

      // Extract improvements, suggestions and safety.
      List<String> improvements =
              extractImprovements(
                      analysisJson.path("improvements")
              );

      List<String> suggestions =
              extractSuggestions(
                      analysisJson.path("suggestions")
              );

      List<String> safety =
              extractSafetyGuidelines(
                      analysisJson.path("safety")
              );

      // Build Recommendation object.
      Recommendation recommendation = Recommendation.builder()
              .activityId(activity.getId())
              .userId(activity.getUserId())
              .activityType(activity.getType())
              .recommendation(fullAnalysis.toString().trim())
              .improvements(improvements)
              .suggestions(suggestions)
              .safety(safety)
              .createdAt(LocalDateTime.now())
              .build();

      log.info(
              "AI response successfully processed for activity: {}",
              activity.getId()
      );

      return recommendation;

    } catch (Exception e) {

      log.error(
              "Failed to process Groq response for activity: {}",
              activity.getId(),
              e
      );

      return createDefaultRecommendation(activity);
    }
  }

  private Recommendation createDefaultRecommendation(
          Activity activity) {

    return Recommendation.builder()
            .activityId(activity.getId())
            .userId(activity.getUserId())
            .activityType(activity.getType())
            .recommendation(
                    "Unable to generate detailed analysis"
            )
            .improvements(
                    Collections.singletonList(
                            "Continue with your current routine"
                    )
            )
            .suggestions(
                    Collections.singletonList(
                            "Consider consulting a fitness professional"
                    )
            )
            .safety(
                    Arrays.asList(
                            "Always warm up before exercise",
                            "Stay hydrated",
                            "Listen to your body"
                    )
            )
            .createdAt(LocalDateTime.now())
            .build();
  }

  private List<String> extractSafetyGuidelines(
          JsonNode safetyNode) {

    List<String> safety = new ArrayList<>();

    if (safetyNode.isArray()) {

      safetyNode.forEach(item ->
              safety.add(item.asText())
      );
    }

    return safety.isEmpty()
            ? Collections.singletonList(
            "Follow general safety guidelines"
    )
            : safety;
  }

  private List<String> extractSuggestions(
          JsonNode suggestionsNode) {

    List<String> suggestions = new ArrayList<>();

    if (suggestionsNode.isArray()) {

      suggestionsNode.forEach(suggestion -> {

        String workout =
                suggestion.path("workout").asText();

        String description =
                suggestion.path("description").asText();

        suggestions.add(
                String.format(
                        "%s: %s",
                        workout,
                        description
                )
        );
      });
    }

    return suggestions.isEmpty()
            ? Collections.singletonList(
            "No specific suggestions provided"
    )
            : suggestions;
  }

  private List<String> extractImprovements(
          JsonNode improvementsNode) {

    List<String> improvements = new ArrayList<>();

    if (improvementsNode.isArray()) {

      improvementsNode.forEach(improvement -> {

        String area =
                improvement.path("area").asText();

        String detail =
                improvement.path("recommendation").asText();

        improvements.add(
                String.format(
                        "%s: %s",
                        area,
                        detail
                )
        );
      });
    }

    return improvements.isEmpty()
            ? Collections.singletonList(
            "No specific improvements provided"
    )
            : improvements;
  }

  private void addAnalysisSection(
          StringBuilder fullAnalysis,
          JsonNode analysisNode,
          String key,
          String prefix) {

    JsonNode value = analysisNode.path(key);

    if (value.isTextual() && !value.asText().isBlank()) {

      fullAnalysis.append(prefix)
              .append(" ")
              .append(value.asText())
              .append("\n\n");
    }
  }

  private String createPromptForActivity(Activity activity) {

    return String.format(
            """
            Analyze this fitness activity and provide detailed
            recommendations in the following EXACT JSON format.

            Return ONLY valid JSON. Do not include Markdown,
            explanations, or code fences.

            {
              "analysis": {
                "overall": "Overall analysis here",
                "pace": "Pace analysis here",
                "heartRate": "Heart rate analysis here",
                "caloriesBurned": "Calories analysis here"
              },
              "improvements": [
                {
                  "area": "Area name",
                  "recommendation": "Detailed recommendation"
                }
              ],
              "suggestions": [
                {
                  "workout": "Workout name",
                  "description": "Detailed workout description"
                }
              ],
              "safety": [
                "Safety point 1",
                "Safety point 2"
              ]
            }

            Analyze this activity:

            Activity Type: %s
            Duration: %d minutes
            Calories Burned: %d
            Additional Metrics: %s

            Provide detailed analysis focusing on performance,
            improvements, next workout suggestions, and safety.

            Ensure all JSON fields match the specified structure.
            """,
            activity.getType(),
            activity.getDuration(),
            activity.getCaloriesBurned(),
            activity.getAdditionalMetrics()
    );
  }
}
