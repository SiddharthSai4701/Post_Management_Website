import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    token: String,
    createdAt: {
        type: Date,
        default: new Date()
    },
    // This field will contain an array of IDs of the posts that a user creates
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

const User = mongoose.model('User', userSchema);
export default User;