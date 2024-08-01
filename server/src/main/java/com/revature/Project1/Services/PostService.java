package com.revature.Project1.Services;


import com.revature.Project1.Models.Follower;
import com.revature.Project1.Models.Notification;
import com.revature.Project1.Models.Post;
import com.revature.Project1.Models.User;
import com.revature.Project1.Repositories.PostRepository;
import com.revature.Project1.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.revature.Project1.Services.UserService;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PostService {


    private final PostRepository postRepository;



    private final NotificationService notificationService;
    private UserRepository userRepository;

    @Autowired
    public PostService(PostRepository postRepository, NotificationService notificationService, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(Long postId) {
        return postRepository.findById(postId);
    }

    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByUserUserId(userId);
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(Post post) {
        return postRepository.save(post);
    }


    public void deletePost(Long postId, User user) {
        Optional<Post> postOptional = postRepository.findById(postId);
        if (postOptional.isPresent()) {
            Post post = postOptional.get();
            if (user.getAdmin() || post.getUser().getUserId().equals(user.getUserId())) {
                postRepository.deleteById(postId);
            } else {
                throw new SecurityException("User is not authorized to delete this post");
            }
        }
    }


    public void createPostActivityNotification(Post post) {
        User postOwner = post.getUser();
        notificationService.createNotification(postOwner, Notification.NotificationType.POST_ACTIVITY, "There is new activity on your post.");
    }

    public boolean isPostTablePopulated() {
        return postRepository.count() >= 3;
    }

    public void populateSamplePosts() {

        List<User> users = userRepository.findAll();
        if (users.size() < 3) {
            throw new IllegalStateException("Not enough users to populate sample posts");
        }

        List<Set<Post>> samplePostsPerUser = List.of(
                Set.of(
                        new Post(users.get(0), "This is a sample post content 1."),
                        new Post(users.get(0), "This is a sample post content 2."),
                        new Post(users.get(0), "This is a sample post content 3."),
                        new Post(users.get(0), "This is a sample post content 4."),
                        new Post(users.get(0), "This is a sample post content 5."),
                        new Post(users.get(0), "This is a sample post content 6."),
                        new Post(users.get(0), "This is a sample post content 7.")
                ),
                Set.of(
                        new Post(users.get(1), "This is a sample post content 1."),
                        new Post(users.get(1), "This is a sample post content 2."),
                        new Post(users.get(1), "This is a sample post content 3."),
                        new Post(users.get(1), "This is a sample post content 4."),
                        new Post(users.get(1), "This is a sample post content 5."),
                        new Post(users.get(1), "This is a sample post content 6."),
                        new Post(users.get(1), "This is a sample post content 7.")
                ),
                Set.of(
                        new Post(users.get(2), "This is a sample post content 1."),
                        new Post(users.get(2), "This is a sample post content 2."),
                        new Post(users.get(2), "This is a sample post content 3."),
                        new Post(users.get(2), "This is a sample post content 4."),
                        new Post(users.get(2), "This is a sample post content 5."),
                        new Post(users.get(2), "This is a sample post content 6."),
                        new Post(users.get(2), "This is a sample post content 7.")
                )
        );

        for (int i = 0; i < 3; i++) {
            users.get(i).setPosts(samplePostsPerUser.get(i));
        }

        userRepository.saveAll(users);
    }

}