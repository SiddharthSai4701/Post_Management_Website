import express from "express";
import User from "../models/userModel.js"
import bcrypt from "bcryptjs/dist/bcrypt.js";
import { guestRoute, protectedRoute } from "../middlewares/authMiddleware.js";
import nodemailer from 'nodemailer';

const authRouter = express.Router();

// Using Nodemailer
// node mailer credentials
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: process.env.NODE_MAILER_PORT,
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS
    }
  });

// Using Gmail
// var transport = nodemailer.createTransport({
//     service: 'gmail',
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     auth: {
//       user: process.env.MY_EMAIL_ID,
//       pass: process.env.MY_EMAIL_APP_PASSWORD
//     }
//   });

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
    res.render('forgot-password', {title: 'Forgot Password Page', active: 'forgot'});
});

// Reset password
authRouter.get('/reset-password/:token', guestRoute, async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ token });

    if(!user) {
        req.flash('error', 'Link expired or invalid');
        return res.redirect('/forgot-password');
    }
    res.render('reset-password', {title: 'Reset Password Page', active: 'reset', token});
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
});

// Handle forgot password
authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if(!user) {
            req.flash('error', 'User not found for this email');
            return res.redirect('/forgot-password');
        }
        // If user exists, send reset link to that mail ID
        // First generate a random token that will be sent along with the reset password link and will also be
        // stored in the database
         
        const token = Math.random().toString(36).slice(2);
        user.token = token;
        await user.save();

        console.log("TOKEN")
        console.log(token)

        const info = await transport.sendMail({
            from: `"Siddharth Vijay Sai" <${process.env.MY_EMAIL_ID}>`, // sender address
            to: email, // list of receivers
            subject: "Password Reset Link", // Subject line
            text: "Reset your password", // plain text body
            html: `<p>Click this link to reset your password: <a href='http://localhost:3000/reset-password/${token}'>Reset</a></p>`, // html body
          });

        if(info.messageId) {
            req.flash('success', 'Password rest link has been sent to your email!');
            res.redirect('/forgot-password');
        } else {
            req.flash('error', 'Error sending email');
            res.redirect('/forgot-password');
        }
        
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again!')
        res.redirect('/forgot-password');
    }

});

// Handle reset password
authRouter.post('/reset-password', async (req, res) => {
    const { token, new_password, confirm_new_password } = req.body;
    try {
        const user = await User.findOne({ token });

        if(new_password !== confirm_new_password) {
            req.flash('error', 'Passwords do not match!');
            return res.redirect(`/reset-password/${token}`);
        }

        if(!user) {
            req.flash('error', 'Invalid token!');
            return res.redirect(`/forgot-password`);
        }

        user.password = await bcrypt.hash(new_password, 10);
        user.token = null;
        await user.save();

        req.flash('success', 'Password reset successfully!');
        res.redirect('/login');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong, try again!')
        res.redirect('/reset-password');
    }
    
})

export default authRouter;