const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const ejs = require('ejs');
const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/SPMS", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

const userSchema = new mongoose.Schema({
    name: String,
    CodeforcesHandle: String,
    CurrentRating: Number,
    MaxRating: Number,
    Rank: String,
    MaxRank: String,
    Organization: String
});

const User = mongoose.model('User', userSchema);


app.get('/', (req, res) => {
    res.send("Student Progress Management System API");
});


app.get('/api/students', async (req, res) => {
    // const handle = req.params.handle;

    try {
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=vivek30032005`);
        const obj = response.data.result[0];

        let existingUser = await User.findOne({ CodeforcesHandle: obj.handle });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', data: existingUser });
        }

        const newUser = new User({
            name: obj.firstName + " " + (obj.lastName || ""),
            CodeforcesHandle: obj.handle,
            CurrentRating: obj.rating,
            MaxRating: obj.maxRating,
            Rank: obj.rank,
            MaxRank: obj.maxRank,
            Organization: obj.organization || "N/A"
        });

        await newUser.save();
        res.status(201).json({ message: 'User data saved to MongoDB', data: newUser });
    } catch (error) {
        console.error("Error fetching/saving data:", error.message);
        res.status(500).json({ error: "Failed to fetch or save Codeforces data" });
    }
});
app.get('/students', async (req, res) => {
    try {
        const students = await User.find();
        res.render('students', { students });
    } catch (error) {
        res.status(500).send("Error fetching students");
    }
});
app.get('/students/:CodeforcesHandle', async (req, res) => {
    try {
        // const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${req.params.CodeforcesHandle}`);
        const response = await axios.get(`https://codeforces.com/api/user.rating?handle=tic_tac`);
        const response2 = await axios.get(`https://codeforces.com/api/user.status?handle=${req.params.CodeforcesHandle}`);
        const obj = response.data.result;
        const obj2 = response2.data.result; 
        // console.log(obj2);
        let solved_problem = 0;
        for(const ob of obj2){
            if(ob.verdict === 'OK') solved_problem++;
        }
        console.log(solved_problem);
        const objectfiltered = [];
        objectfiltered.push(0);
        for(const ob of obj){
            objectfiltered.push(ob.newRating);
        }
        console.log(objectfiltered);
        res.render('chart', { objectfiltered });
    } catch (error) {
        res.status(500).send("Error fetching student details");
    }
});

connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });
});
