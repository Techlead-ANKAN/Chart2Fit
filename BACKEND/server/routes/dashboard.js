import express from 'express'
import { getConnection } from '../config/database.js'

const router = express.Router()

// Get dashboard overview data
router.get('/overview', async (req, res) => {
  try {
    const connection = await getConnection()
    
    // Get today's workout count
    const [todayWorkouts] = await connection.query(
      'SELECT COUNT(DISTINCT workout_id) as count FROM logs WHERE user_id = ? AND date = CURDATE()',
      [req.user.id]
    )
    
    // Get this week's workout count
    const [weeklyWorkouts] = await connection.query(
      'SELECT COUNT(DISTINCT workout_id) as count FROM logs WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)',
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
    
    // Get today's calories
    const [todayCalories] = await connection.query(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = ? AND date = CURDATE()',
      [req.user.id]
    )
    
    // Get today's workout plan
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const [todayPlan] = await connection.query(
      'SELECT * FROM workouts WHERE user_id = ? AND day = ? ORDER BY id',
      [req.user.id, today]
    )
    
    connection.release()
    
    res.json({
      todayWorkouts: todayWorkouts[0]?.count || 0,
      weeklyWorkouts: weeklyWorkouts[0]?.count || 0,
      currentStreak: streakData[0]?.streak || 0,
      todayCalories: todayCalories[0]?.total || 0,
      todayPlan
    })
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const connection = await getConnection()
    
    // Get recent workout logs
    const [recentWorkouts] = await connection.query(
      `SELECT l.*, w.exercise
       FROM logs l
       JOIN workouts w ON l.workout_id = w.id
       WHERE l.user_id = ?
       ORDER BY l.date DESC, l.created_at DESC
       LIMIT 10`,
      [req.user.id]
    )
    
    // Get recent meals
    const [recentMeals] = await connection.query(
      `SELECT *
       FROM meals
       WHERE user_id = ?
       ORDER BY date DESC, created_at DESC
       LIMIT 10`,
      [req.user.id]
    )
    
    connection.release()
    
    res.json({
      recentWorkouts,
      recentMeals
    })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get quick stats
router.get('/quick-stats', async (req, res) => {
  try {
    const connection = await getConnection()
    
    // Total workouts this month
    const [monthlyWorkouts] = await connection.query(
      'SELECT COUNT(DISTINCT workout_id) as count FROM logs WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
      [req.user.id]
    )
    
    // Average calories this week
    const [weeklyAvgCalories] = await connection.query(
      'SELECT AVG(daily_calories) as avg_calories FROM (SELECT date, SUM(calories) as daily_calories FROM meals WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY date) as daily_totals',
      [req.user.id]
    )
    
    // Most frequent exercise
    const [topExercise] = await connection.query(
      `SELECT w.exercise, COUNT(*) as sessions
       FROM logs l
       JOIN workouts w ON l.workout_id = w.id
       WHERE l.user_id = ?
       GROUP BY w.exercise
       ORDER BY sessions DESC
       LIMIT 1`,
      [req.user.id]
    )
    
    // Total calories this month
    const [monthlyCalories] = await connection.query(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
      [req.user.id]
    )
    
    connection.release()
    
    res.json({
      monthlyWorkouts: monthlyWorkouts[0]?.count || 0,
      weeklyAvgCalories: Math.round(weeklyAvgCalories[0]?.avg_calories || 0),
      topExercise: topExercise[0]?.exercise || 'No workouts yet',
      monthlyCalories: monthlyCalories[0]?.total || 0
    })
  } catch (error) {
    console.error('Error fetching quick stats:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
