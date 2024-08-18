import express from "express";
import connectMongoDB from "./db.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash/lib/flash.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Mongo DB
connectMongoDB();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// cookies middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000*60*24*7 // Store cookies in the browser for 1 week before expiration
    }
}));

// flash messages middleware
app.use(flash())

// Store flash messages for views
app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
})
// Set EJS as templating engine
app.set('view engine', 'ejs')

// Home route
app.get('/', (req, res) => {
    res.render('index', {title: 'Home Page'});
});

app.use('/', authRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});