import express from 'express'
import { body, validationResult } from 'express-validator'
import { getConnection } from '../config/database.js'

const router = express.Router()

// Get today's meals
router.get('/today', async (req, res) => {
  try {
    const connection = await getConnection()
    
    const [meals] = await connection.query(
      'SELECT * FROM meals WHERE user_id = ? AND date = CURDATE() ORDER BY created_at DESC',
      [req.user.id]
    )
    
    // Calculate total calories for today
    const [totalCalories] = await connection.query(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = ? AND date = CURDATE()',
      [req.user.id]
    )
    
    connection.release()
    
    res.json({
      meals,
      totalCalories: totalCalories[0]?.total || 0
    })
  } catch (error) {
    console.error('Error fetching today\'s meals:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add a new meal
router.post('/', [
  body('foodName').trim().isLength({ min: 1 }).withMessage('Food name is required'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive number'),
  body('protein').optional().isFloat({ min: 0 }).withMessage('Protein must be a positive number'),
  body('carbs').optional().isFloat({ min: 0 }).withMessage('Carbs must be a positive number'),
  body('fat').optional().isFloat({ min: 0 }).withMessage('Fat must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { foodName, calories, protein, carbs, fat, date } = req.body
    const connection = await getConnection()
    
    const [result] = await connection.query(
      'INSERT INTO meals (user_id, food_name, calories, protein, carbs, fat, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, foodName, calories, protein || null, carbs || null, fat || null, date || new Date().toISOString().split('T')[0]]
    )
    
    connection.release()
    
    res.status(201).json({
      message: 'Meal added successfully',
      mealId: result.insertId
    })
  } catch (error) {
    console.error('Error adding meal:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a meal
router.delete('/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params
    const connection = await getConnection()
    
    const [result] = await connection.query(
      'DELETE FROM meals WHERE id = ? AND user_id = ?',
      [mealId, req.user.id]
    )
    
    if (result.affectedRows === 0) {
      connection.release()
      return res.status(404).json({ message: 'Meal not found' })
    }
    
    connection.release()
    res.json({ message: 'Meal deleted successfully' })
  } catch (error) {
    console.error('Error deleting meal:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get weekly calorie data
router.get('/weekly', async (req, res) => {
  try {
    const connection = await getConnection()
    
    const [weeklyData] = await connection.query(
      `SELECT 
        date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat,
        COUNT(*) as meal_count
       FROM meals 
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY date
       ORDER BY date`,
      [req.user.id]
    )
    
    connection.release()
    res.json(weeklyData)
  } catch (error) {
    console.error('Error fetching weekly calorie data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get monthly calorie data
router.get('/monthly', async (req, res) => {
  try {
    const connection = await getConnection()
    
    const [monthlyData] = await connection.query(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(carbs) as total_carbs,
        SUM(fat) as total_fat
       FROM meals 
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY date
       ORDER BY date`,
      [req.user.id]
    )
    
    connection.release()
    res.json(monthlyData)
  } catch (error) {
    console.error('Error fetching monthly calorie data:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get calorie summary
router.get('/summary', async (req, res) => {
  try {
    const connection = await getConnection()
    
    // Today's calories
    const [todayCalories] = await connection.query(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = ? AND date = CURDATE()',
      [req.user.id]
    )
    
    // This week's average
    const [weeklyAvg] = await connection.query(
      'SELECT AVG(daily_calories) as avg_calories FROM (SELECT date, SUM(calories) as daily_calories FROM meals WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY date) as daily_totals',
      [req.user.id]
    )
    
    // This month's total
    const [monthlyTotal] = await connection.query(
      'SELECT SUM(calories) as total FROM meals WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
      [req.user.id]
    )
    
    connection.release()
    
    res.json({
      todayCalories: todayCalories[0]?.total || 0,
      weeklyAverage: Math.round(weeklyAvg[0]?.avg_calories || 0),
      monthlyTotal: monthlyTotal[0]?.total || 0
    })
  } catch (error) {
    console.error('Error fetching calorie summary:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
