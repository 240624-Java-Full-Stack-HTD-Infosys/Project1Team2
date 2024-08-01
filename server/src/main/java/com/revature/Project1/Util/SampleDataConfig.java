package com.revature.Project1.Util;


import com.revature.Project1.Services.FollowerService;
import com.revature.Project1.Services.PostService;
import com.revature.Project1.Services.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SampleDataConfig {
    @Bean
    CommandLineRunner commandLineRunner(UserService userService, PostService postService, FollowerService followerService) {
        return ( args )-> {
            boolean isUserTablePopulated = userService.isUserTablePopulated();
          if(!isUserTablePopulated){
              userService.populateSampleUsers();
          }else{
              System.out.println("Skipping populating users. Database already contains at least 3 users.");
          }

            boolean isPostTablePopulated = postService.isPostTablePopulated();
            if (!isPostTablePopulated) {
                postService.populateSamplePosts();
            } else {
                System.out.println("Skipping populating posts. Database already contains at least 3 posts.");
            }

            boolean isFollowerTablePopulated = followerService.isFollowerTablePopulated();
            if (!isFollowerTablePopulated) {
                followerService.populateSampleFollowers();
            } else {
                System.out.println("Skipping populating followers. Database already contains sample followers.");
            }
        };

    }




}
