import express from "express";
import connectMongoDB from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

connectMongoDB();

app.get('/', (req, res) => {
    res.send("Hello World")
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


app.listen(3000, () => {
    console.log("RANDOM")
});
