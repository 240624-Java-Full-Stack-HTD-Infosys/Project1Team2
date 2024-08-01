# Project 1 - Social Media SPA
RevConnect is a social media project that aims to provide a platform for personal users, businesses, and creators to 
connect with each other. The core functional scope includes features such as personal user accounts where users can post, like, 
comment and share posts, edit, and delete their posts. The project also includes business and creator accounts, which allow 
them to create and promote posts.

## Dates
 - Code Freeze: EOB 7/31/24
 - Due: 8/2/24
 - Presentations: 8/2/24 - 10:30 AM ET

## Technologies
 - Java
 - SQL
 - REST
 - HTTP
 - JUnit
 - Mockito
 - Spring
 - React
 - JWT

## User Stories
#### As a user, I should be able to:
 - Register myself and create an account(Done. Rest by Mawuli)
 - Login to my account(Done)
 - Create a basic profile with name and bio(anthony)
 - Create a post, like, comment and share the posts(angela /griffin)
 - Edit and delete the posts created by me(angela/griffin)
 - Send connect requests to users(Mawuli - only confirmed connect requests can message each other)
 - Follow other users (normal users, and content creators)(Mawuli - Anyone can follow anyone)

## Stretch Goals
 - Admin functionality - modify, delete posts and comments, ban users(Nileema)
 - Chat with other users in the application(Angela)
 - Get email notifications about connect requests, a new follower, and any post activity in the following users and content creators(Backend Done. Frontend left TODO by Mawuli)

## Functional Requirements
 - Users should be able to register and login
 - Users should be able to create and edit a profile
 - Users should be able to create posts, like, comment, and share posts
 - Users should be able to edit and delete posts
 - Users should be able to follow, connect, and/or friend other users

## Non-functional Requirements
 - Adhere to REST guiding principles
   - Uniform Interface
   - Client-Server
   - Stateless Session Management
   - Cacheability
   - 3-Tier server
 - All resource representations must be transmitted as JSON request/response bodies
 - Adhere to SOLID principles, most importantly the Single Responsibility Principle
 - Encrypt passwords for storage
 - Implement encrypted bearer tokens for session management (JWT cookies)
 - Use Spring framework, and the Core, Web, and Data modules for the server
 - Use React library for the SPA client
 - Validate and sanitize all user inputs in the client



<!-- To set up email service -->

