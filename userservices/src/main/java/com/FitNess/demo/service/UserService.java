
package com.FitNess.demo.service;

import com.FitNess.demo.dto.RegisterRequest;
import com.FitNess.demo.dto.UserResponse;
import com.FitNess.demo.exception.UserNotFoundException;
import com.FitNess.demo.model.User;
import com.FitNess.demo.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserService {

    @Autowired
    private UserRepository repository;

    public UserResponse register(RegisterRequest request) {

        // Check whether the email already exists
        if (repository.existsByEmail(request.getEmail())) {

            User existingUser = repository.findByEmail(request.getEmail());
            if (existingUser.getKeycloakId() == null && request.getKeycloakId() != null) {
                existingUser.setKeycloakId(request.getKeycloakId());
                existingUser = repository.save(existingUser);
            }

            UserResponse userResponse = new UserResponse();

            userResponse.setId(existingUser.getId());
            userResponse.setKeycloakId(existingUser.getKeycloakId());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstname(existingUser.getFirstName());
            userResponse.setLastname(existingUser.getLastName());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdateAt(existingUser.getUpdateAt());

            return userResponse;
        }

        // Create a new user
        User user = new User();

        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setKeycloakId(request.getKeycloakId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Save user in database
        User savedUser = repository.save(user);

        // Prepare response
        UserResponse userResponse = new UserResponse();

        userResponse.setId(savedUser.getId());
        userResponse.setKeycloakId(savedUser.getKeycloakId());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstname(savedUser.getFirstName());
        userResponse.setLastname(savedUser.getLastName());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdateAt(savedUser.getUpdateAt());

        return userResponse;
    }

    public UserResponse getUserProfile(String userId) {

        User user = repository.findByKeycloakId(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        UserResponse userResponse = new UserResponse();

        userResponse.setId(user.getId());
        userResponse.setKeycloakId(user.getKeycloakId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstname(user.getFirstName());
        userResponse.setLastname(user.getLastName());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdateAt(user.getUpdateAt());

        return userResponse;
    }

    public boolean existByUserId(String userId) {

        log.info("Calling User Validation API for userId: {}", userId);

        return repository.existsByKeycloakId(userId);
    }
}
