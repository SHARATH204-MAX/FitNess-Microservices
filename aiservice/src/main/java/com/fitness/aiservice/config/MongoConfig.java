package com.fitness.aiservice.config;

import com.mongodb.reactivestreams.client.MongoClient;
import com.mongodb.reactivestreams.client.MongoClients;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableReactiveMongoAuditing;
import org.springframework.data.mongodb.core.ReactiveMongoTemplate;

@Configuration
@EnableReactiveMongoAuditing
public class MongoConfig {

    @Bean
    public MongoClient reactiveMongoClient() {
        return MongoClients.create(
                "mongodb://localhost:27017/fitnessrecommendation"
        );
    }

    @Bean
    public ReactiveMongoTemplate reactiveMongoTemplate(
            MongoClient reactiveMongoClient) {

        return new ReactiveMongoTemplate(
                reactiveMongoClient,
                "fitnessrecommendation"
        );
    }
}