import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayWorkouts: 0,
    weeklyWorkouts: 0,
    totalCalories: 0,
    weeklyCalories: 0,
    streak: 0
  })
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, workoutRes] = await Promise.all([
        axios.get('/dashboard/stats'),
        axios.get('/workouts/today')
      ])
      
      setStats(statsRes.data)
      setTodayWorkout(workoutRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="date">{getDayName()}, {new Date().toLocaleDateString()}</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏋️</div>
            <div className="stat-content">
              <h3>{stats.todayWorkouts}</h3>
              <p>Today's Workouts</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{stats.weeklyWorkouts}</h3>
              <p>This Week</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{stats.streak}</h3>
              <p>Day Streak</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🍎</div>
            <div className="stat-content">
              <h3>{stats.totalCalories}</h3>
              <p>Today's Calories</p>
            </div>
          </div>
        </div>

        {/* Today's Workout */}
        {todayWorkout && todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
          <div className="today-workout-card">
            <div className="card-header">
              <h2>Today's Workout</h2>
              <Link to="/workout" className="btn">
                Start Workout
              </Link>
            </div>
            
            <div className="workout-exercises">
              {todayWorkout.exercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <span className="exercise-name">{exercise.exercise}</span>
                  <span className="exercise-details">
                    {exercise.sets}×{exercise.reps} @ {exercise.start_weight}kg
                  </span>
                </div>
              ))}
              {todayWorkout.exercises.length > 3 && (
                <div className="more-exercises">
                  +{todayWorkout.exercises.length - 3} more exercises
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-workout-card">
            <div className="card">
              <h2>No Workout Today</h2>
              <p>Take a rest day or upload your workout plan</p>
              <Link to="/upload" className="btn">
                Upload Workout Plan
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/workout" className="action-card">
              <div className="action-icon">🏋️</div>
              <h3>Start Workout</h3>
              <p>Begin today's training session</p>
            </Link>

            <Link to="/calories" className="action-card">
              <div className="action-icon">🍎</div>
              <h3>Log Calories</h3>
              <p>Track your nutrition intake</p>
            </Link>

            <Link to="/progress" className="action-card">
              <div className="action-icon">📊</div>
              <h3>View Progress</h3>
              <p>Check your fitness journey</p>
            </Link>

            <Link to="/upload" className="action-card">
              <div className="action-icon">📁</div>
              <h3>Upload Plan</h3>
              <p>Import your workout chart</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
