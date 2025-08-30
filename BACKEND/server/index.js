import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/auth.js'
import workoutRoutes from './routes/workouts.js'
import progressRoutes from './routes/progress.js'
import caloriesRoutes from './routes/calories.js'
import dashboardRoutes from './routes/dashboard.js'

// Import database connection
import { connectDB } from './config/database.js'

// Import middleware
import { authenticateToken } from './middleware/auth.js'

// Import file processor
import { processWorkoutFile } from './utils/fileProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'), false)
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})

// Create uploads directory if it doesn't exist
import fs from 'fs'
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/workouts', authenticateToken, workoutRoutes)
app.use('/api/progress', authenticateToken, progressRoutes)
app.use('/api/calories', authenticateToken, caloriesRoutes)
app.use('/api/dashboard', authenticateToken, dashboardRoutes)

// File upload route
app.post('/api/workouts/upload', authenticateToken, upload.single('workoutFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

            // Process the uploaded file
        const result = await processWorkoutFile(req.file.path, req.user.id)

        res.json({
          message: 'Workout plan uploaded successfully',
          exercises: result.exercises,
          totalExercises: result.totalExercises
        })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Error processing file' })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' })
    }
  }
  
  console.error(error)
  res.status(500).json({ message: 'Internal server error' })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
const startServer = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()


