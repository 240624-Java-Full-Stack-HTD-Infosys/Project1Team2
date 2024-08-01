package com.revature.Project1.Services;


import com.revature.Project1.Models.Notification;
import com.revature.Project1.Models.User;
import com.revature.Project1.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(long userId) {
        return userRepository.findById(userId);
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }


    public void banUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setActive(false);
            userRepository.save(user);
        }
    }

    public void unbanUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setActive(true);
            userRepository.save(user);
        }
    }


    public boolean isUserTablePopulated() {
        long userRepoCount = userRepository.count();
        System.out.println("-=-=-=-=-=-==--=-=-=-=-=-=-=-=-=-=-=-=-=");
        System.out.println("userRepository.count() = " + userRepoCount);
        System.out.println("-=-=-=-=-=-==--=-=-=-=-=-=-=-=-=-=-=-=-=");
        return userRepoCount > 3;
    }

    public void populateSampleUsers() {
        List<User> sampleUsers = new ArrayList<>();
        User user1 = new User("john_doe", "john.doe@example.com", "password", "John", "Doe", "Software Engineer", false, true);
        sampleUsers.add(user1);
        User user2 =new User("jane_doe", "jane.doe@example.com", "password", "Jane", "Doe", "Chief Technololgy Officer", false, true);
        sampleUsers.add(user2);
        User user3 = new User("jim_beam", "jim.beam@example.com", "password", "Jim", "Beam", "Chief Information Officer", false, true);
        sampleUsers.add(user3);

        userRepository.saveAll(sampleUsers);
    }
}