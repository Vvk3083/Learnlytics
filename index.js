const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const ejs = require('ejs');
const app = express();
const path = require('path');
const csv = require('csv-writer').createObjectCsvWriter;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    email: String,
    phoneNumber: String,
    CodeforcesHandle: String,
    CurrentRating: Number,
    MaxRating: Number,
    Rank: String,
    MaxRank: String,
    Organization: String
});

const User = mongoose.model('User', userSchema);

// Helper function to get date range based on filter
const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate, endDate };
};

// Helper function to filter data by date range
const filterByDateRange = (data, startDate, endDate) => {
    return data.filter(item => {
        const itemDate = new Date(item.creationTimeSeconds * 1000);
        return itemDate >= startDate && itemDate <= endDate;
    });
};

app.get('/', async (req, res) => {
    const totalStudents = await User.countDocuments();
    res.render('home', { totalStudents });
});

// Get all students with CRUD operations
app.get('/students', async (req, res) => {
    try {
        const students = await User.find();
        res.render('students', { students });
    } catch (error) {
        res.status(500).send("Error fetching students");
    }
});

// Add new student form
app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

// Add new student
app.post('/students/add', async (req, res) => {
    try {
        const { name, email, phoneNumber, codeforcesHandle } = req.body;
        
        // Fetch data from Codeforces API
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
        const userData = response.data.result[0];

        const newUser = new User({
            name,
            email,
            phoneNumber,
            CodeforcesHandle: codeforcesHandle,
            CurrentRating: userData.rating || 0,
            MaxRating: userData.maxRating || 0,
            Rank: userData.rank || 'unrated',
            MaxRank: userData.maxRank || 'unrated',
            Organization: userData.organization || 'N/A'
        });

        await newUser.save();
        res.redirect('/students');
    } catch (error) {
        console.error("Error adding student:", error.message);
        res.status(500).send("Error adding student");
    }
});

// Edit student form
app.get('/students/edit/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        res.render('editStudent', { student });
    } catch (error) {
        res.status(500).send("Error fetching student");
    }
});

// Update student
app.post('/students/edit/:id', async (req, res) => {
    try {
        const { name, email, phoneNumber, codeforcesHandle } = req.body;
        
        // Fetch updated data from Codeforces API
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=${codeforcesHandle}`);
        const userData = response.data.result[0];

        await User.findByIdAndUpdate(req.params.id, {
            name,
            email,
            phoneNumber,
            CodeforcesHandle: codeforcesHandle,
            CurrentRating: userData.rating || 0,
            MaxRating: userData.maxRating || 0,
            Rank: userData.rank || 'unrated',
            MaxRank: userData.maxRank || 'unrated',
            Organization: userData.organization || 'N/A'
        });

        res.redirect('/students');
    } catch (error) {
        console.error("Error updating student:", error.message);
        res.status(500).send("Error updating student");
    }
});

// Delete student
app.post('/students/delete/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/students');
    } catch (error) {
        res.status(500).send("Error deleting student");
    }
});

// Download CSV
app.get('/students/download-csv', async (req, res) => {
    try {
        const students = await User.find();
        
        const csvWriter = csv({
            path: 'students.csv',
            header: [
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'phoneNumber', title: 'Phone Number' },
                { id: 'CodeforcesHandle', title: 'Codeforces Handle' },
                { id: 'CurrentRating', title: 'Current Rating' },
                { id: 'MaxRating', title: 'Max Rating' },
                { id: 'Rank', title: 'Rank' },
                { id: 'MaxRank', title: 'Max Rank' },
                { id: 'Organization', title: 'Organization' }
            ]
        });

        await csvWriter.writeRecords(students);
        
        res.download('students.csv', 'students.csv', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
        });
    } catch (error) {
        console.error("Error generating CSV:", error.message);
        res.status(500).send("Error generating CSV");
    }
});

// Enhanced student profile with filtering
app.get('/students/:CodeforcesHandle', async (req, res) => {
    try {
        console.log('Accessing student profile for:', req.params.CodeforcesHandle);
        const { contestFilter = '30', problemFilter = '30' } = req.query;
        console.log('Filters:', { contestFilter, problemFilter });
        
        // Fetch all required data from Codeforces API
        const [ratingResponse, statusResponse, problemsResponse] = await Promise.all([
            axios.get(`https://codeforces.com/api/user.rating?handle=${req.params.CodeforcesHandle}`),
            axios.get(`https://codeforces.com/api/user.status?handle=${req.params.CodeforcesHandle}`),
            axios.get(`https://codeforces.com/api/problemset.problems`)
        ]);

        const ratingData = ratingResponse.data.result;
        const submissionData = statusResponse.data.result;
        const problemsData = problemsResponse.data.result.problems;

        console.log('Raw data counts:', {
            ratingData: ratingData.length,
            submissionData: submissionData.length,
            problemsData: problemsData.length
        });

        // Get date ranges for filtering
        const contestDateRange = getDateRange(parseInt(contestFilter));
        const problemDateRange = getDateRange(parseInt(problemFilter));

        // Filter contest data
        const filteredContests = filterByDateRange(ratingData, contestDateRange.startDate, contestDateRange.endDate);
        
        // Filter submission data
        const filteredSubmissions = filterByDateRange(submissionData, problemDateRange.startDate, problemDateRange.endDate);

        console.log('Filtered data counts:', {
            filteredContests: filteredContests.length,
            filteredSubmissions: filteredSubmissions.length
        });

        // Calculate contest statistics
        const contestStats = filteredContests.map(contest => ({
            contestId: contest.contestId,
            contestName: contest.contestName,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingChange: contest.newRating - contest.oldRating,
            date: new Date(contest.ratingUpdateTimeSeconds * 1000)
        }));

        // Calculate problem solving statistics
        const solvedProblems = filteredSubmissions.filter(sub => sub.verdict === 'OK');
        const totalProblems = solvedProblems.length;
        const averageRating = totalProblems > 0 
            ? Math.round(solvedProblems.reduce((sum, sub) => sum + (sub.problem.rating || 0), 0) / totalProblems)
            : 0;
        
        const mostDifficultProblem = solvedProblems.length > 0
            ? solvedProblems.reduce((max, sub) => 
                (sub.problem.rating || 0) > (max.problem.rating || 0) ? sub : max
              )
            : null;

        const daysInFilter = parseInt(problemFilter);
        const averageProblemsPerDay = daysInFilter > 0 ? (totalProblems / daysInFilter).toFixed(2) : 0;

        console.log('Calculated stats:', {
            totalProblems,
            averageRating,
            averageProblemsPerDay,
            mostDifficultProblem: mostDifficultProblem ? mostDifficultProblem.problem.rating : 'N/A'
        });

        // Create rating bucket data for bar chart
        const ratingBuckets = {};
        solvedProblems.forEach(sub => {
            const rating = sub.problem.rating;
            if (rating) {
                const bucket = Math.floor(rating / 100) * 100;
                ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1;
            }
        });

        // Create submission heatmap data
        const heatmapData = {};
        filteredSubmissions.forEach(sub => {
            const date = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });

        // Get contest problem counts
        const contestProblemCounts = {};
        problemsData.forEach(problem => {
            if (problem.contestId) {
                contestProblemCounts[problem.contestId] = (contestProblemCounts[problem.contestId] || 0) + 1;
            }
        });

        // Calculate unsolved problems for each contest
        const contestUnsolvedProblems = {};
        filteredContests.forEach(contest => {
            const contestProblems = contestProblemCounts[contest.contestId] || 0;
            const solvedInContest = filteredSubmissions.filter(sub => 
                sub.verdict === 'OK' && 
                sub.problem.contestId === contest.contestId
            ).length;
            contestUnsolvedProblems[contest.contestId] = contestProblems - solvedInContest;
        });

        console.log('Rendering studentProfile with data:', {
            handle: req.params.CodeforcesHandle,
            contestStatsLength: contestStats.length,
            ratingBucketsKeys: Object.keys(ratingBuckets).length,
            heatmapDataKeys: Object.keys(heatmapData).length
        });

        res.render('studentProfile', {
            handle: req.params.CodeforcesHandle,
            contestFilter,
            problemFilter,
            contestStats,
            totalProblems,
            averageRating,
            mostDifficultProblem,
            averageProblemsPerDay,
            ratingBuckets,
            heatmapData,
            contestUnsolvedProblems
        });

    } catch (error) {
        console.error("Error fetching student details:", error.message);
        res.status(500).send("Error fetching student details: " + error.message);
    }
});

// API endpoint for existing functionality
app.get('/api/students', async (req, res) => {
    try {
        const response = await axios.get(`https://codeforces.com/api/user.info?handles=vivek30032005`);
        const obj = response.data.result[0];

        let existingUser = await User.findOne({ CodeforcesHandle: obj.handle });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists', data: existingUser });
        }

        const newUser = new User({
            name: obj.firstName + " " + (obj.lastName || ""),
            email: "N/A",
            phoneNumber: "N/A",
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

// Test route to verify studentProfile view
app.get('/test-profile', (req, res) => {
    const sampleData = {
        handle: 'testuser',
        contestFilter: '30',
        problemFilter: '30',
        contestStats: [
            {
                contestId: 1234,
                contestName: 'Test Contest 1',
                rank: 150,
                oldRating: 1200,
                newRating: 1250,
                ratingChange: 50,
                date: new Date('2024-01-15')
            },
            {
                contestId: 1235,
                contestName: 'Test Contest 2',
                rank: 200,
                oldRating: 1250,
                newRating: 1220,
                ratingChange: -30,
                date: new Date('2024-01-20')
            }
        ],
        totalProblems: 25,
        averageRating: 1350,
        mostDifficultProblem: { problem: { rating: 1800 } },
        averageProblemsPerDay: '0.83',
        ratingBuckets: {
            '1200': 5,
            '1300': 8,
            '1400': 6,
            '1500': 4,
            '1600': 2
        },
        heatmapData: {
            '2024-01-15': 3,
            '2024-01-16': 1,
            '2024-01-17': 2,
            '2024-01-18': 0,
            '2024-01-19': 4
        },
        contestUnsolvedProblems: {
            '1234': 2,
            '1235': 1
        }
    };
    
    res.render('studentProfile', sampleData);
});

connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });
});
