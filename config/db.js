const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://vivek30032005:process.env.password@cluster0.33yr68u.mongodb.net/SPMS", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
