# feedback-system
This is just the source code of our asssignment on creating a system that collect ideas, and feedbacks\
Here are the list of features already implemented and ready to use

## Features:

### User:
1. - [x] Register and login, using JWT as authentication method, fully implemented refresh tokens and access tokens
2. - [x] Create, read, update, remove threads, like a group of posts
3. - [x] Create, read, update, remove posts that they created
4. - [x] On each posts, user can write comments
5. - [x] Create post within a thread, and comment on a post **<ins>anonymously</ins>**
6. - [x] Upvote or downvote posts, or comments
7. - [x] See their activity list, like created threads, posts, comments, upvotes and downvotes on which posts and comments 
8. - [x] Embed multiple files such as pdf, docx, png, jpg within their post (max of 25, 500MBs each)
9. - [x] Manage their own profile, such as username and password
10. - [ ] Two factor auth
11. - [ ] Forgot Password feature 

### Admin and manager
1. - [x] Admin access can only be granted by another admin, upon any user
2. - [x] Read, approve, remove any thread
3. - [x] Read, delete any post
4. - [x] Read, delete any comment
5. - [x] Read, delete any user (admin only)
6. - [x] Receive emails about newly created threads, or posts
7. - [x] All user's features

### Coordinator
1. - [x] Receive emails about newly created threads, or posts
2. - [x] All user's features

## Public hosting
Currently this backend project is hosted on Heroku, go to [this link](https://feedback-system-backend.herokuapp.com/).\
This backend project is documented using Swagger, at [this link](https://feedback-system-backend.herokuapp.com/api-docs). 

## Installation
1. This project does **NOT** have a `.env` file, in order to run this locally, please provide these variables within your own `.env` file

|Variables|Definition|
|--|--|
|PORT|The local host port that this project will run on|
|JWT_ACCESS_SECRET|The secret for JWT to validate and create access tokens|
|JWT_REFRESH_SECRET|The secret for JWT to validate and create refresh tokens|
|MONGO|The MongoDB connection string|
|EMAIL|The email that will be used to construct and **SEND** emails to admin and coordinators, **NOT** a receiving address |
|PASSWORD|Password to that email address, please use a temp gmail account|
|CLOUDINARY_API_KEY|Your cloudinary API key, since this project stores images on Cloudinary|
|CLOUDINARY_API_SECRET|Your cloudinary API secret|

2. Have NodeJS installed on your machine\
Run `npm i` within the downloaded project, to let it install all of the dependencies

3. Access `localhost:{PORT}` to enter to the project, by default, you'll be redirected to `/threads`, \
and it will be empty since any newly created MongoDB cluster is empty \
The `PORT` variable depends on your `.env` file

4. Swagger docs will be served at `localhost:{PORT}/api-docs`
5. In order to persist login state, put the `accessToken` received from login route, into the `Authorize` button on the top right 
<img src="https://res.cloudinary.com/feedback-system-app-storage-backend/image/upload/v1648803508/2022-04-01_3.51.30_PM_p7cdnc.png" width="30%" height="30%"/>
<img src="https://res.cloudinary.com/feedback-system-app-storage-backend/image/upload/v1648803508/2022-04-01_3.52.33_PM_ebpkfm.png" width="30%" height="30%"/>
<img src="https://res.cloudinary.com/feedback-system-app-storage-backend/image/upload/v1648803508/2022-04-01_3.52.45_PM_pgjkx2.png" width="30%" height="30%"/>
<img src="https://res.cloudinary.com/feedback-system-app-storage-backend/image/upload/v1648803795/2022-04-01_3.52.56_PM_kbux3u.png" width="30%" height="30%"/>

6. You're now good to go! 🥳

