const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('./models/User');

// API to save new user
router.get('/', async (req, res) => {
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

// View all students in a table
router.get('/view', async (req, res) => {
    try {
        const students = await User.find();
        res.render('students', { students });
    } catch (error) {
        res.status(500).send("Error fetching students");
    }
});

// Get detailed rating and submission data of one student
router.get('/:CodeforcesHandle', async (req, res) => {
    try {
        const handle = req.params.CodeforcesHandle;

        const [ratingRes, statusRes] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
            axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
        ]);

        res.send({
            ratingHistory: ratingRes.data.result,
            submissionStatus: statusRes.data.result
        });
    } catch (error) {
        console.error("Error fetching student details:", error.message);
        res.status(500).send("Error fetching student details");
    }
});

module.exports = router;
