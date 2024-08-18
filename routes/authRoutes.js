import express from "express";

const authRouter = express.Router();

// Route for login
authRouter.get('/login', (req, res) => {
    res.render('login', {title: 'Login Page'});
});

// Route for register
authRouter.get('/register', (req, res) => {
    res.render('register', {title: 'Register Page'});
});

// Route for forgot password
authRouter.get('/forgot-password', (req, res) => {
    res.render('forgot-password', {title: 'Forgot Password Page'});
});

// Reset password
authRouter.get('/reset-password', (req, res) => {
    res.render('reset-password', {title: 'Reset Password Page'});
});
export default authRouter;