import express from "express";
import User from "../models/userModel.js"
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { guestRoute, protectedRoute } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

// Route for login
authRouter.get('/login', guestRoute, (req, res) => {
    res.render('login', {title: 'Login Page', active: 'login'});
});

// Route for register
authRouter.get('/register', guestRoute, (req, res) => {
    res.render('register', {title: 'Register Page', active: 'register'});
});

// Route for forgot password
authRouter.get('/forgot-password', guestRoute, (req, res) => {
    res.render('forgot-password', {title: 'Forgot Password Page'});
});

// Reset password
authRouter.get('/reset-password', guestRoute, (req, res) => {
    res.render('reset-password', {title: 'Reset Password Page'});
});

authRouter.get('/profile', protectedRoute, (req, res) => {
    res.render('profile', {title: 'Profile Page', active: 'profile'});
});

// Handle registration
authRouter.post('/register', guestRoute, async(req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email })

        if (userExists) {
            req.flash('error', 'A user with this email already exists')
            return res.redirect('/login')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        user.save();

        // Let the user know that they have registered successfully
        req.flash('success', 'Registration successful!');
        res.redirect('/login');

    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again!')
        res.redirect('/register');

    }
});

// Handle user login
authRouter.post('/login', guestRoute, async(req, res) => {
    const { email, password} = req.body;

    try {
        const user = await User.findOne({ email })
        if (user) {
            const passwordMatches = await bcrypt.compare(password, user.password)
            if(passwordMatches) {
                req.session.user = user;
                res.redirect('/profile')
            } else {
                req.flash('error', 'Invalid password!')
                res.redirect('/login')
            }
        } else {
            req.flash('error', 'Invalid user!')
            res.redirect('/login')
        }
        
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again!')
        res.redirect('/login');
        
    }
});

// Handle user logout
authRouter.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

export default authRouter;