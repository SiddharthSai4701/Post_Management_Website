import express, { Route } from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const postRouter = express.Router();

// Home route
postRouter.get('/', (req, res) => {
    res.render('index', { title: 'Home Page', active: 'home' });
});

postRouter.get('/my-posts', protectedRoute, (req, res) => {
    res.render('posts/my-posts', {title: 'My Posts', active: 'my_posts'})
});

// Route for creating a new post
postRouter.get('/create-post', protectedRoute, (req, res) => {
    res.render('posts/create-post', {title: 'Create Post', active: 'create_post'});
});

// Route for editing a post
postRouter.get('/edit-post/:id', protectedRoute, (req, res) => {
    res.render('posts/edit-post', { title: 'Edit Post', active: 'edit_post' });
});

// Route for viewing a post
postRouter.get('/post/:id', (req, res) => {
    res.render('posts/view-post', {title: 'View Post', active: 'view_post'})
})

export default postRouter;