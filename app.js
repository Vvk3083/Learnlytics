const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
require(path.join(__dirname, 'models/user.js'));
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.send("Student Progress Management System API");
});
app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes); // Same controller handles both

// DB and Server Init
connectDB().then(() => {
    app.listen(3000, () => {
        console.log("Server running at http://localhost:3000");
    });
});
