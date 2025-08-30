import XLSX from 'xlsx'
import fs from 'fs'
import { getConnection } from '../config/database.js'

export const processWorkoutFile = async (filePath, userId) => {
  try {
    // Read the file
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    // Find header row (look for Day, Exercise, Sets, Reps, etc.)
    let headerRowIndex = -1
    let headerRow = []
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (row && row.length > 0) {
        const firstCell = String(row[0]).toLowerCase()
        if (firstCell.includes('day') || firstCell.includes('exercise')) {
          headerRowIndex = i
          headerRow = row
          break
        }
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error('Could not find header row with Day/Exercise columns')
    }
    
    // Map column indices
    const dayIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('day')
    )
    const exerciseIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('exercise')
    )
    const setsIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('set')
    )
    const repsIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('rep')
    )
    const weightIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('weight') || 
      String(cell).toLowerCase().includes('kg') ||
      String(cell).toLowerCase().includes('lb')
    )
    const progressionIndex = headerRow.findIndex(cell => 
      String(cell).toLowerCase().includes('progression') ||
      String(cell).toLowerCase().includes('prog')
    )
    
    if (dayIndex === -1 || exerciseIndex === -1) {
      throw new Error('Required columns (Day, Exercise) not found')
    }
    
    // Process data rows
    const exercises = []
    const connection = await getConnection()
    
    // Clear existing workouts for this user
    await connection.query('DELETE FROM workouts WHERE user_id = ?', [userId])
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i]
      
      if (!row || row.length === 0) continue
      
      const day = row[dayIndex]
      const exercise = row[exerciseIndex]
      
      if (!day || !exercise) continue
      
      // Clean and validate data
      const cleanDay = String(day).trim()
      const cleanExercise = String(exercise).trim()
      
      if (!cleanDay || !cleanExercise) continue
      
      const sets = setsIndex !== -1 ? parseInt(row[setsIndex]) || 0 : 0
      const reps = repsIndex !== -1 ? parseInt(row[repsIndex]) || 0 : 0
      const weight = weightIndex !== -1 ? parseFloat(row[weightIndex]) || null : null
      const progression = progressionIndex !== -1 ? String(row[progressionIndex]).trim() || null : null
      
      // Insert into database
      const [result] = await connection.query(
        'INSERT INTO workouts (user_id, day, exercise, sets, reps, start_weight, progression_rule) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, cleanDay, cleanExercise, sets, reps, weight, progression]
      )
      
      exercises.push({
        id: result.insertId,
        exercise: cleanExercise,
        sets,
        reps,
        start_weight: weight,
        day: cleanDay,
        progression_rule: progression
      })
    }
    
    connection.release()
    
    // Clean up uploaded file
    fs.unlinkSync(filePath)
    
    return {
      exercises,
      totalExercises: exercises.length,
      message: `Successfully processed ${exercises.length} exercises`
    }
    
  } catch (error) {
    console.error('File processing error:', error)
    
    // Clean up uploaded file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    throw new Error(`Failed to process file: ${error.message}`)
  }
}

// Helper function to validate file format
export const validateWorkoutFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Check if sheet has data
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    if (range.e.r < 1) {
      throw new Error('File appears to be empty')
    }
    
    return true
  } catch (error) {
    throw new Error(`Invalid file format: ${error.message}`)
  }
}
