# Student Progress Management System (SPMS)

A comprehensive web application for tracking and analyzing student progress in competitive programming, specifically designed for Codeforces users.

---

## 🚀 Live Demo & Landing Page

- The root route `/` now features a modern, welcoming landing page with:
  - App name and description
  - Total students count (live from your database)
  - Navigation buttons: View Students, Add Student, Download CSV, GitHub

**Example:**
![Landing Page Screenshot](docs/landing-page.png)

---

## Features

### Student Table View
- **Complete Student Listing**: View all enrolled students with their basic information
- **Student Information**: Name, Email, Phone Number, Codeforces Handle, Current Rating, Max Rating
- **CRUD Operations**: Add, Edit, Delete students with full form validation
- **CSV Export**: Download entire student dataset as CSV file
- **Visual Rating Indicators**: Color-coded ratings (Green for 1600+, Yellow for 1200-1599, Red for below 1200)
- **Quick Actions**: View detailed progress, edit, or delete students directly from the table

### Student Profile View
Comprehensive analysis dashboard with two main sections:

#### 1. Contest History
- **Time-based Filtering**: Filter by last 30, 90, or 365 days
- **Rating Progression Graph**: Visual representation of rating changes over time
- **Contest Details Table**: 
  - Contest name and date
  - Rank achieved
  - Old and new ratings
  - Rating change (with color coding)
  - Number of unsolved problems in each contest
- **Interactive Charts**: Responsive line charts showing rating trends

#### 2. Problem Solving Data
- **Time-based Filtering**: Filter by last 7, 30, or 90 days
- **Key Statistics**:
  - Most difficult problem solved (by rating)
  - Total problems solved
  - Average rating of solved problems
  - Average problems solved per day
- **Rating Distribution Chart**: Bar chart showing problems solved by rating buckets
- **Submission Heatmap**: GitHub-style activity heatmap showing daily submission patterns

---

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: EJS templating engine
- **Charts**: Chart.js for data visualization
- **External API**: Codeforces API for user data
- **HTTP Client**: Axios for API requests
- **CSV Export**: csv-writer for data export

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-progress-management-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Ensure MongoDB is running on `mongodb://127.0.0.1:27017/`
   - The application will automatically create the `SPMS` database

4. **Start the application**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Go to `/students` to view the student management interface

---

## Deployment on Render

1. **Push your code to GitHub**
2. **Create a free MongoDB Atlas cluster** and get your connection string
3. **Go to [https://dashboard.render.com](https://dashboard.render.com)**
4. **Create a new Web Service**
   - Connect your GitHub repo
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variable: `MONGODB_URI` = your MongoDB Atlas URI
5. **Deploy!**
6. **Visit your Render URL** (e.g., `https://your-app.onrender.com`)

---

## API Endpoints

### Main UI
- `GET /` - Modern landing page with navigation and stats
- `GET /students` - View all students
- `GET /students/add` - Add new student form
- `POST /students/add` - Create new student
- `GET /students/edit/:id` - Edit student form
- `POST /students/edit/:id` - Update student
- `POST /students/delete/:id` - Delete student
- `GET /students/download-csv` - Download student data as CSV
- `GET /students/:CodeforcesHandle` - View detailed student profile with filtering options

### Health Check
- `GET /route` - Returns a JSON health/status message

### Legacy API
- `GET /api/students` - Legacy endpoint for adding hardcoded user

---

## Data Model

### User Schema
```javascript
{
  name: String,
  email: String,
  phoneNumber: String,
  CodeforcesHandle: String,
  CurrentRating: Number,
  MaxRating: Number,
  Rank: String,
  MaxRank: String,
  Organization: String
}
```

---

## Features in Detail

### Contest Analysis
- Fetches contest history from Codeforces API
- Calculates rating changes and performance metrics
- Shows unsolved problems per contest
- Provides visual rating progression

### Problem Solving Analysis
- Analyzes submission patterns
- Calculates difficulty distribution
- Shows daily activity patterns
- Provides performance statistics

### Data Visualization
- **Line Charts**: Rating progression over time
- **Bar Charts**: Problem distribution by rating
- **Heatmaps**: Daily submission activity
- **Color-coded Ratings**: Visual rating indicators

---

## Usage Examples

### Adding a Student
1. Navigate to `/students`
2. Click "Add New Student"
3. Fill in the required information:
   - Full Name (required)
   - Email (optional)
   - Phone Number (optional)
   - Codeforces Handle (required)
4. Submit the form

### Viewing Student Progress
1. From the student table, click "View Details"
2. Use the filter dropdowns to adjust time periods
3. Analyze contest performance and problem-solving patterns
4. View interactive charts and statistics

### Exporting Data
1. From the student table, click "Download CSV"
2. The file will be automatically downloaded with all student data

---

## Configuration

The application uses the following default configuration:
- **Port**: 3000
- **Database**: MongoDB at `mongodb://127.0.0.1:27017/SPMS`
- **External API**: Codeforces API

---

## Dependencies

### Production Dependencies
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `ejs`: Template engine
- `axios`: HTTP client
- `csv-writer`: CSV export functionality

### Development Dependencies
- `nodemon`: Auto-restart for development

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## License

This project is licensed under the ISC License.

---

## Support

For issues and questions, please create an issue in the repository or contact the development team.