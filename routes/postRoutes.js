import express from "express";
import response from "express/lib/response.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from 'path';
import User from '../models/userModel.js';
import Post from '../models/postModel.js'

const postRouter = express.Router();

// Set up storage engine using multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now()+path.extname(file.originalname));
    }
});

// Initialize upload variable with the storage engine
const upload = multer({ storage: storage })

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
});

// Handle create new post request
postRouter.post('/create-post', protectedRoute, upload.single('image'), async(req, res) => {
    try {
        const { title, content } = req.body;
        const image = req.file.filename;
        // Replace all spaces in the title with hyphens
        const slug = title.replace(/\s+/g, '-').toLowerCase();

        const user = await User.findById(req.session.user._id);

        // Create a post
        const post = new Post({ title, slug, content, image, user });

        // Save post in user's posts array
        await User.updateOne({_id: req.session.user._id }, { $push: { posts: post._id }});

        await post.save();

        req.flash('success', 'Post created successfully');
        res.redirect('/my-posts');
        
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/create-post');
    }

});

export default postRouter;