import express, { Route } from "express";
import response from "express/lib/response.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from 'path';
import User from '../models/userModel.js';
import Post from '../models/postModel.js'
import fs from 'fs';

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

// My posts page
postRouter.get('/my-posts', protectedRoute, async (req, res) => {

    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('posts');

        if(!user) {
            req.flash('error', 'User not found!');
            return res.redirect('/');
        }

        res.render('posts/my-posts', { 
            title: 'My Posts', 
            active: 'my_posts',
            posts: user.posts 
        });


    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while fetching your posts!');
        res.redirect('/my-posts');
    }
});

// Route for creating a new post
postRouter.get('/create-post', protectedRoute, (req, res) => {
    res.render('posts/create-post', {title: 'Create Post', active: 'create_post'});
});

// Route for editing a post
postRouter.get('/edit-post/:id', protectedRoute, async (req, res) => {

    try {
        const currentPost = await Post.findById(req.params.id);

        if(!currentPost) {
            req.flash('error', 'Post not found!');
            return res.redirect('/my-posts')
        }

        res.render('posts/edit-post', { title: 'Edit Post', active: 'edit_post', currentPost });

    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while updating your post!');
        res.redirect('/my-posts');
    }
});

// Handle update post
postRouter.post('/update-post/:id', protectedRoute, upload.single('image'), async (req, res) => {

    try {
        const currentPost = await Post.findById(req.params.id);

        if (!currentPost) {
            req.flash('error', 'Post not found!');
            return res.redirect('/my-posts')
        }

        currentPost.title = req.body.title;
        currentPost.content = req.body.content;
        currentPost.slug = req.body.title.replace(/\s+/g, '-').toLowerCase();

        // If there is a new file, we will first delete the old image from the uploads directory and then upload the new one
        if (req.file) {
            fs.unlink(path.join(process.cwd(), 'uploads') + '/' + currentPost.image, (err) => {
                if(err) {
                    console.error(err);
                }
            });

            currentPost.image = req.file.filename;
        }

        await currentPost.save();

        req.flash('success', 'Post updated successfully!');
        res.redirect('/my-posts');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while updating your post!');
        res.redirect('/my-posts');
    }

})

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