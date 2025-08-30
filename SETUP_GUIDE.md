# Chart2Fit Setup Guide

Complete manual setup instructions for the Chart2Fit fitness tracking application.

## 🗄️ Database Setup (MariaDB/MySQL)

### 1. Install MariaDB/MySQL

**Windows:**
- Download XAMPP from: https://www.apachefriends.org/
- Or download standalone MariaDB from: https://mariadb.org/download/

**macOS:**
```bash
brew install mariadb
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mariadb-server
```

### 2. Start MariaDB Service

**Windows (XAMPP):**
- Start XAMPP Control Panel
- Click "Start" next to MariaDB

**Windows (Standalone):**
- Start as Windows Service or manually

**macOS:**
```bash
brew services start mariadb
```

**Linux:**
```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 3. Create Database

Connect to MariaDB using phpMyAdmin or command line:

```sql
CREATE DATABASE chart2fit;
```

### 4. Create Database User (Optional but Recommended)

```sql
-- Create user for better security
CREATE USER 'chart2fit_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON chart2fit.* TO 'chart2fit_user'@'localhost';
FLUSH PRIVILEGES;
```

## ⚙️ Environment Configuration

### 1. Create .env File

```bash
cd BACKEND
cp env.example .env
```

### 2. Edit .env File

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root                    # or your created user
DB_PASSWORD=                    # your MariaDB password
DB_NAME=chart2fit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/
```

## 📦 Dependencies Installation

### 1. Backend Dependencies

```bash
cd BACKEND
npm install
```

### 2. Frontend Dependencies

```bash
cd FRONTEND
npm install
```

## 🗂️ Directory Structure Setup

### 1. Create Uploads Directory

```bash
cd BACKEND
mkdir uploads
```

### 2. Verify Project Structure

```
Chart2Fit/
├── BACKEND/
│   ├── server/
│   ├── uploads/          # Create this
│   ├── package.json
│   ├── .env             # Create from env.example
│   └── README.md
└── FRONTEND/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## 🚀 Starting the Application

### 1. Start Backend Server

```bash
cd BACKEND
npm start
# or for development: npm run dev
```

### 2. Start Frontend Development Server

```bash
cd FRONTEND
npm run dev
```

## 🔧 Manual Database Tables (If Auto-Creation Fails)

The application should automatically create tables, but if it fails, run these manually:

```sql
USE chart2fit;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workouts table
CREATE TABLE workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  day VARCHAR(50) NOT NULL,
  exercise VARCHAR(255) NOT NULL,
  sets INT NOT NULL,
  reps INT NOT NULL,
  start_weight DECIMAL(5,2),
  progression_rule VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Logs table
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  workout_id INT NOT NULL,
  actual_sets INT NOT NULL,
  actual_reps INT NOT NULL,
  actual_weight DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
);

-- Meals table
CREATE TABLE meals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  calories INT NOT NULL,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fat DECIMAL(5,2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 📋 Setup Checklist

- [ ] **Install MariaDB/MySQL**
- [ ] **Start MariaDB service**
- [ ] **Create `chart2fit` database**
- [ ] **Create database user (optional)**
- [ ] **Copy `env.example` to `.env` in BACKEND folder**
- [ ] **Edit `.env` with your database credentials**
- [ ] **Install backend dependencies** (`cd BACKEND && npm install`)
- [ ] **Install frontend dependencies** (`cd FRONTEND && npm install`)
- [ ] **Create `uploads` directory in BACKEND folder**
- [ ] **Start backend server** (`cd BACKEND && npm start`)
- [ ] **Start frontend server** (`cd FRONTEND && npm run dev`)

## 🌐 Access Points

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Error**: `Database connection failed`
**Solution**: 
- Check MariaDB is running
- Verify credentials in `.env` file
- Ensure database `chart2fit` exists

#### 2. Port Already in Use
**Error**: `EADDRINUSE: address already in use`
**Solution**: 
- Change PORT in `.env` file
- Or kill existing processes using the port

#### 3. File Upload Errors
**Error**: `ENOENT: no such file or directory`
**Solution**: 
- Ensure `uploads` directory exists in BACKEND folder
- Check write permissions on the directory

#### 4. CORS Issues
**Error**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked`
**Solution**: 
- Backend is configured to allow frontend requests
- Ensure both servers are running on correct ports

### Test Database Connection

```bash
cd BACKEND
node -e "
import { connectDB } from './server/config/database.js';
connectDB().then(() => console.log('Database connected!')).catch(console.error);
"
```

### Check Server Status

```bash
# Test backend health
curl http://localhost:5000/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

## 📁 File Upload Format

The application accepts Excel (.xlsx, .xls) and CSV files with this format:

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

## 🔒 Security Notes

- Change the default JWT_SECRET in production
- Use a strong database password
- Consider using environment-specific database users
- Regularly backup your database

## 🎉 Success Indicators

Once setup is complete, you should be able to:

1. **Access the frontend** at `http://localhost:3000`
2. **Register a new user account**
3. **Login with your credentials**
4. **Upload an Excel/CSV workout file**
5. **View your dashboard and track workouts**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all checklist items are completed
3. Check console logs for error messages
4. Ensure all services are running on correct ports

---

**Happy Fitness Tracking! 🏋️‍♂️**
