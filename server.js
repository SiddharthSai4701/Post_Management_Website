import express from "express";
import connectMongoDB from "./db.js";
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash/lib/flash.js";
import postRouter from "./routes/postRoutes.js";
import path from 'path';
import ConnectMongodbSession from "connect-mongodb-session";

const MongoDBStore = ConnectMongodbSession(session);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Mongo DB
connectMongoDB();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Make uploads directory static
app.use('/uploads', express.static(path.join(process.cwd(), '/uploads')));
// cookies middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000*60*24*7 // Store cookies in the browser for 1 week before expiration
    },
    store: new MongoDBStore({
        uri: process.env.MONGO_DB_URI,
        collection: 'sessions'
    })
}));

// flash messages middleware
app.use(flash())

// Store flash messages for views
app.use(function(req, res, next){
    res.locals.message = req.flash();
    next();
})

// Store authenticated user's session data for views
app.use(function(req, res, next){
    res.locals.user = req.session.user || null;
    next();
})

// Set EJS as templating engine
app.set('view engine', 'ejs')

// Auth routes
app.use('/', authRouter);

// Post routes
app.use('/', postRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});