package com.revature.Project1.Services;

import com.revature.Project1.Models.Follower;
import com.revature.Project1.Models.Notification;
import com.revature.Project1.Models.User;
import com.revature.Project1.Repositories.FollowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Random;
@Service
public class FollowerService {


    private final FollowerRepository followerRepository;

    private final UserService userService;


    private final NotificationService notificationService;

    @Autowired
    public FollowerService(FollowerRepository followerRepository, UserService userService, NotificationService notificationService) {
        this.followerRepository = followerRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public List<Follower> getAllFollowers() {
        return followerRepository.findAll();
    }

    public Optional<Follower> getFollowerById(Long followerId) {
        return followerRepository.findById(followerId);
    }


    // Method to get all users that a user is following
    public List<Follower> getUsersFollowedByUser(Long followerUserId) {
        return followerRepository.findByFollowerUserId(followerUserId);
    }


    // Method to get all followers of a user
    public List<Follower> getFollowersOfUser(Long followeeUserId) {
        return followerRepository.findByFollowingUserId(followeeUserId);
    }
    public Follower createFollower(Follower follower) {
        Follower newFollower = followerRepository.save(follower);
        User followeeUser = userService.getUserById(follower.getFollowing().getUserId()).orElseThrow();
        notificationService.createNotification(followeeUser, Notification.NotificationType.NEW_FOLLOWER, "You have a new follower.");
        return newFollower;
    }

    public Follower updateFollower(Follower follower) {
        return followerRepository.save(follower);
    }

    public void deleteFollower(Long followerId) {
        followerRepository.deleteById(followerId);
    }

//    public boolean isFollowerTablePopulated() {
//        return followerRepository.count() > 7;
//    }
//
//    public void populateSampleFollowers() {
//        List<User> users = userService.getAllUsers();
//        if (users.size() < 3) {
//            System.out.println("Not enough users to populate sample followers.");
//            return;
//        }
//
//        for (User user : users) {
//            User randomUserToFollow = selectRandomUserToFollow(users, user);
//            createFollower(new Follower(user, randomUserToFollow));
//        }
//    }
//
//    private User selectRandomUserToFollow(List<User> users, User currentUser) {
//        Random random = new Random();
//        // Filter out the current user from the list of users
//        List<User> potentialFollowees = users.stream()
//                .filter(user -> !user.getUserId().equals(currentUser.getUserId()))
//                .toList();
//
//        // Select a random user from the filtered list
//        return potentialFollowees.get(random.nextInt(potentialFollowees.size()));
//    }
}