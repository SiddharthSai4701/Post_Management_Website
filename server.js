import express from "express";
import connectMongoDB from "./db.js";
import authRouter from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Mongo DB
connectMongoDB();

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