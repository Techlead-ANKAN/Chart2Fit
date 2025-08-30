import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Workout.css'

const Workout = () => {
  const [workout, setWorkout] = useState(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTodayWorkout()
  }, [])

  const fetchTodayWorkout = async () => {
    try {
      const response = await axios.get('/workouts/today')
      setWorkout(response.data)
      
      // Initialize logs for each exercise
      if (response.data.exercises) {
        const initialLogs = {}
        response.data.exercises.forEach((exercise, index) => {
          initialLogs[index] = {
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.start_weight,
            completed: false
          }
        })
        setLogs(initialLogs)
      }
    } catch (error) {
      console.error('Error fetching workout:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLog = (exerciseIndex, field, value) => {
    setLogs(prev => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        [field]: value
      }
    }))
  }

  const toggleCompleted = (exerciseIndex) => {
    setLogs(prev => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        completed: !prev[exerciseIndex].completed
      }
    }))
  }

  const saveWorkout = async () => {
    setSaving(true)
    try {
      const workoutData = {
        date: new Date().toISOString().split('T')[0],
        exercises: Object.keys(logs).map(index => ({
          exercise_id: workout.exercises[index].id,
          actual_sets: logs[index].sets,
          actual_reps: logs[index].reps,
          actual_weight: logs[index].weight,
          completed: logs[index].completed
        }))
      }
      
      await axios.post('/workouts/log', workoutData)
      alert('Workout saved successfully!')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Error saving workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getProgressPercentage = () => {
    if (!workout || !workout.exercises) return 0
    const completed = Object.values(logs).filter(log => log.completed).length
    return Math.round((completed / workout.exercises.length) * 100)
  }

  if (loading) {
    return (
      <div className="workout-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading today's workout...</p>
        </div>
      </div>
    )
  }

  if (!workout || !workout.exercises || workout.exercises.length === 0) {
    return (
      <div className="workout-container">
        <div className="container">
          <div className="no-workout">
            <h1>No Workout Today</h1>
            <p>There's no workout scheduled for today. Upload your workout plan to get started!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="workout-container">
      <div className="container">
        {/* Header */}
        <div className="workout-header">
          <h1>Today's Workout</h1>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
            <span className="progress-text">{getProgressPercentage()}% Complete</span>
          </div>
        </div>

        {/* Exercise List */}
        <div className="exercises-list">
          {workout.exercises.map((exercise, index) => (
            <div 
              key={index} 
              className={`exercise-card ${logs[index]?.completed ? 'completed' : ''}`}
            >
              <div className="exercise-header">
                <div className="exercise-info">
                  <h3>{exercise.exercise}</h3>
                  <p className="exercise-target">
                    Target: {exercise.sets}×{exercise.reps} @ {exercise.start_weight}kg
                  </p>
                </div>
                <button
                  className={`complete-btn ${logs[index]?.completed ? 'completed' : ''}`}
                  onClick={() => toggleCompleted(index)}
                >
                  {logs[index]?.completed ? '✓' : '○'}
                </button>
              </div>

              <div className="exercise-inputs">
                <div className="input-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    value={logs[index]?.sets || exercise.sets}
                    onChange={(e) => updateLog(index, 'sets', parseInt(e.target.value) || 0)}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="input-group">
                  <label>Reps</label>
                  <input
                    type="number"
                    value={logs[index]?.reps || exercise.reps}
                    onChange={(e) => updateLog(index, 'reps', parseInt(e.target.value) || 0)}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="input-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={logs[index]?.weight || exercise.start_weight}
                    onChange={(e) => updateLog(index, 'weight', parseFloat(e.target.value) || 0)}
                    className="input"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="workout-actions">
          <button 
            className="btn save-btn"
            onClick={saveWorkout}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loading"></div>
                Saving...
              </>
            ) : (
              'Save Workout'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Workout
