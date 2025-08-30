import express from 'express'
import { getConnection } from '../config/database.js'

const router = express.Router()

// Get today's workout
router.get('/today', async (req, res) => {
  try {
    const connection = await getConnection()
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    
    const [workouts] = await connection.query(
      'SELECT * FROM workouts WHERE user_id = ? AND day = ? ORDER BY id',
      [req.user.id, today]
    )
    
    connection.release()
    res.json(workouts)
  } catch (error) {
    console.error('Error fetching today\'s workout:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all workouts for a user
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection()
    
    const [workouts] = await connection.query(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY day, id',
      [req.user.id]
    )
    
    connection.release()
    res.json(workouts)
  } catch (error) {
    console.error('Error fetching workouts:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Save workout log
router.post('/log', async (req, res) => {
  try {
    const { workoutId, actualSets, actualReps, actualWeight } = req.body
    const connection = await getConnection()
    
    const [result] = await connection.query(
      'INSERT INTO logs (user_id, workout_id, actual_sets, actual_reps, actual_weight, date) VALUES (?, ?, ?, ?, ?, CURDATE())',
      [req.user.id, workoutId, actualSets, actualReps, actualWeight]
    )
    
    connection.release()
    res.status(201).json({
      message: 'Workout logged successfully',
      logId: result.insertId
    })
  } catch (error) {
    console.error('Error logging workout:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get workout logs for a specific date
router.get('/logs/:date', async (req, res) => {
  try {
    const { date } = req.params
    const connection = await getConnection()
    
    const [logs] = await connection.query(
      `SELECT l.*, w.exercise, w.sets as planned_sets, w.reps as planned_reps, w.start_weight as planned_weight
       FROM logs l
       JOIN workouts w ON l.workout_id = w.id
       WHERE l.user_id = ? AND l.date = ?
       ORDER BY l.created_at`,
      [req.user.id, date]
    )
    
    connection.release()
    res.json(logs)
  } catch (error) {
    console.error('Error fetching workout logs:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get workout logs for a date range
router.get('/logs', async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const connection = await getConnection()
    
    let query = `
      SELECT l.*, w.exercise, w.sets as planned_sets, w.reps as planned_reps, w.start_weight as planned_weight
      FROM logs l
      JOIN workouts w ON l.workout_id = w.id
      WHERE l.user_id = ?
    `
    const params = [req.user.id]
    
    if (startDate && endDate) {
      query += ' AND l.date BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }
    
    query += ' ORDER BY l.date DESC, l.created_at'
    
    const [logs] = await connection.query(query, params)
    
    connection.release()
    res.json(logs)
  } catch (error) {
    console.error('Error fetching workout logs:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete a workout log
router.delete('/logs/:logId', async (req, res) => {
  try {
    const { logId } = req.params
    const connection = await getConnection()
    
    const [result] = await connection.query(
      'DELETE FROM logs WHERE id = ? AND user_id = ?',
      [logId, req.user.id]
    )
    
    if (result.affectedRows === 0) {
      connection.release()
      return res.status(404).json({ message: 'Log not found' })
    }
    
    connection.release()
    res.json({ message: 'Log deleted successfully' })
  } catch (error) {
    console.error('Error deleting workout log:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
