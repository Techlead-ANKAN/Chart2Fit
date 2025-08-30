import express from 'express'
import { getConnection } from '../config/database.js'

const router = express.Router()

// Get workout completion data
router.get('/completion', async (req, res) => {
  try {
    const { period = 'week' } = req.query
    const connection = await getConnection()
    
    let dateFilter = ''
    let groupBy = ''
    
    switch (period) {
      case 'week':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
        groupBy = 'DATE(l.date)'
        break
      case 'month':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
        groupBy = 'DATE(l.date)'
        break
      case 'year':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)'
        groupBy = 'DATE_FORMAT(l.date, "%Y-%m")'
        break
      default:
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
        groupBy = 'DATE(l.date)'
    }
    
    const [completionData] = await connection.query(
      `SELECT 
        ${groupBy} as date,
        COUNT(DISTINCT l.workout_id) as completed_exercises,
        COUNT(DISTINCT w.id) as total_exercises,
        ROUND((COUNT(DISTINCT l.workout_id) / COUNT(DISTINCT w.id)) * 100, 2) as completion_rate
       FROM workouts w
       LEFT JOIN logs l ON w.id = l.workout_id AND l.user_id = w.user_id ${dateFilter}
       WHERE w.user_id = ?
       GROUP BY ${groupBy}
       ORDER BY date`,
      [req.user.id]
    )
    
    connection.release()
    res.json(completionData)
  } catch (error) {
    console.error('Error fetching completion data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get strength progression data
router.get('/strength', async (req, res) => {
  try {
    const { period = 'month' } = req.query
    const connection = await getConnection()
    
    let dateFilter = ''
    
    switch (period) {
      case 'week':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)'
        break
      case 'month':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
        break
      case 'year':
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)'
        break
      default:
        dateFilter = 'AND l.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
    }
    
    const [strengthData] = await connection.query(
      `SELECT 
        w.exercise,
        l.date,
        AVG(l.actual_weight) as avg_weight,
        MAX(l.actual_weight) as max_weight,
        COUNT(*) as sessions
       FROM logs l
       JOIN workouts w ON l.workout_id = w.id
       WHERE l.user_id = ? AND l.actual_weight IS NOT NULL ${dateFilter}
       GROUP BY w.exercise, l.date
       ORDER BY w.exercise, l.date`,
      [req.user.id]
    )
    
    connection.release()
    res.json(strengthData)
  } catch (error) {
    console.error('Error fetching strength data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get overall progress summary
router.get('/summary', async (req, res) => {
  try {
    const connection = await getConnection()
    
    // Get total workouts completed this week
    const [weeklyWorkouts] = await connection.query(
      'SELECT COUNT(DISTINCT workout_id) as count FROM logs WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
      [req.user.id]
    )
    
    // Get total workouts completed this month
    const [monthlyWorkouts] = await connection.query(
      'SELECT COUNT(DISTINCT workout_id) as count FROM logs WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
      [req.user.id]
    )
    
    // Get current streak
    const [streakData] = await connection.query(
      `SELECT COUNT(*) as streak
       FROM (
         SELECT DISTINCT date
         FROM logs
         WHERE user_id = ?
         ORDER BY date DESC
       ) consecutive_dates
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [req.user.id]
    )
    
    // Get average weight progression
    const [weightProgression] = await connection.query(
      `SELECT 
        w.exercise,
        AVG(l.actual_weight) as avg_weight,
        COUNT(*) as sessions
       FROM logs l
       JOIN workouts w ON l.workout_id = w.id
       WHERE l.user_id = ? AND l.actual_weight IS NOT NULL
       GROUP BY w.exercise
       ORDER BY avg_weight DESC
       LIMIT 5`,
      [req.user.id]
    )
    
    connection.release()
    
    res.json({
      weeklyWorkouts: weeklyWorkouts[0]?.count || 0,
      monthlyWorkouts: monthlyWorkouts[0]?.count || 0,
      currentStreak: streakData[0]?.streak || 0,
      topExercises: weightProgression
    })
  } catch (error) {
    console.error('Error fetching progress summary:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
