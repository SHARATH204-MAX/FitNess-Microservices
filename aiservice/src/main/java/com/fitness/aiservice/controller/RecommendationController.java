package com.fitness.aiservice.controller;

import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    public Flux<Recommendation> getUserRecommendations(
            @PathVariable String userId) {

        return recommendationService.getUserRecommendation(userId);
    }

    @GetMapping("/activity/{activityId}")
    public Mono<ResponseEntity<Recommendation>> getActivityRecommendation(
            @PathVariable String activityId) {

        return recommendationService.getActivityRecommendation(activityId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}