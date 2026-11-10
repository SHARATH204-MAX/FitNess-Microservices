
package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;

    @RabbitListener(
            queues = "activity.queue",
            concurrency = "1"
    )
    public void processActivity(Activity activity) {

        log.info(
                "Received activity for processing: {}",
                activity.getId()
        );

        Recommendation recommendation =
                aiService.generateRecommendation(activity);

        Recommendation savedRecommendation =
                recommendationRepository.save(recommendation).block();


        if (savedRecommendation == null) {
            throw new IllegalStateException(
                    "MongoDB returned null while saving recommendation"
            );
        }

        log.info("SAVED RECOMMENDATION: {}", savedRecommendation);

        log.info("SAVED RECOMMENDATION ID: {}",
                savedRecommendation.getId());

        log.info("SAVED ACTIVITY ID: {}",
                savedRecommendation.getActivityId());

        log.info(
                "Recommendation successfully saved! Mongo ID: {}, Activity ID: {}",
                savedRecommendation.getId(),
                savedRecommendation.getActivityId()
        );
    }
}
