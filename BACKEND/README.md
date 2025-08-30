# Chart2Fit Backend

A Node.js/Express backend for the Chart2Fit fitness tracking application with MariaDB database.

## Features

- **Authentication**: JWT-based user registration and login
- **Workout Management**: Upload Excel/CSV workout plans, track daily workouts
- **Progress Tracking**: Workout completion and strength progression analytics
- **Calorie Tracking**: Meal logging and calorie monitoring
- **Dashboard**: Aggregated statistics and overview data
- **File Upload**: Excel/CSV parsing for workout plans

## Prerequisites

- Node.js (v16 or higher)
- MariaDB/MySQL database
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend folder:**
   ```bash
   cd BACKEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=chart2fit
   JWT_SECRET=your-secret-key
   ```

4. **Set up MariaDB database:**
   - Create a MariaDB database named `chart2fit`
   - The application will automatically create tables on first run

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token

### Workouts
- `GET /api/workouts/today` - Get today's workout plan
- `GET /api/workouts` - Get all workouts
- `POST /api/workouts/log` - Log workout completion
- `GET /api/workouts/logs/:date` - Get workout logs for specific date
- `DELETE /api/workouts/logs/:logId` - Delete workout log

### File Upload
- `POST /api/workouts/upload` - Upload Excel/CSV workout plan

### Progress
- `GET /api/progress/completion` - Get workout completion data
- `GET /api/progress/strength` - Get strength progression data
- `GET /api/progress/summary` - Get progress summary

### Calories
- `GET /api/calories/today` - Get today's meals
- `POST /api/calories` - Add new meal
- `DELETE /api/calories/:mealId` - Delete meal
- `GET /api/calories/weekly` - Get weekly calorie data
- `GET /api/calories/summary` - Get calorie summary

### Dashboard
- `GET /api/dashboard/overview` - Get dashboard overview
- `GET /api/dashboard/recent-activity` - Get recent activity
- `GET /api/dashboard/quick-stats` - Get quick statistics

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Workouts Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `day` (VARCHAR)
- `exercise` (VARCHAR)
- `sets` (INT)
- `reps` (INT)
- `start_weight` (DECIMAL)
- `progression_rule` (VARCHAR)
- `created_at` (TIMESTAMP)

### Logs Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `workout_id` (Foreign Key)
- `actual_sets` (INT)
- `actual_reps` (INT)
- `actual_weight` (DECIMAL)
- `date` (DATE)
- `created_at` (TIMESTAMP)

### Meals Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `food_name` (VARCHAR)
- `calories` (INT)
- `protein` (DECIMAL)
- `carbs` (DECIMAL)
- `fat` (DECIMAL)
- `date` (DATE)
- `created_at` (TIMESTAMP)

## File Upload Format

The application accepts Excel (.xlsx, .xls) and CSV files with the following expected format:

| Day | Exercise | Sets | Reps | Start Weight | Progression |
|-----|----------|------|------|--------------|-------------|
| Monday | Bench Press | 3 | 8 | 100 | +5kg/week |
| Monday | Squats | 4 | 10 | 80 | +2.5kg/week |

**Required columns:**
- Day (day of the week)
- Exercise (exercise name)

**Optional columns:**
- Sets (number of sets)
- Reps (number of repetitions)
- Start Weight (starting weight in kg/lbs)
- Progression (progression rule)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- File upload validation and size limits
- SQL injection prevention with parameterized queries

## Error Handling

The API returns consistent error responses:
```json
{
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:5000` by default.
