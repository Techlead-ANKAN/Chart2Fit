import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import axios from 'axios'
import './Progress.css'

const Progress = () => {
  const [workoutData, setWorkoutData] = useState([])
  const [strengthData, setStrengthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    fetchProgressData()
  }, [timeRange])

  const fetchProgressData = async () => {
    try {
      const [workoutRes, strengthRes] = await Promise.all([
        axios.get(`/progress/workouts?range=${timeRange}`),
        axios.get(`/progress/strength?range=${timeRange}`)
      ])
      
      setWorkoutData(workoutRes.data)
      setStrengthData(strengthRes.data)
    } catch (error) {
      console.error('Error fetching progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case 'year': return 'This Year'
      default: return 'This Week'
    }
  }

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading your progress data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="progress-container">
      <div className="container">
        {/* Header */}
        <div className="progress-header">
          <h1>Progress Tracking</h1>
          <div className="time-range-selector">
            <button 
              className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={`range-btn ${timeRange === 'year' ? 'active' : ''}`}
              onClick={() => setTimeRange('year')}
            >
              Year
            </button>
          </div>
        </div>

        {/* Workout Completion Chart */}
        <div className="chart-section">
          <h2>Workout Completion - {getTimeRangeLabel()}</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke={var('--border')} />
                <XAxis 
                  dataKey="day" 
                  stroke={var('--text-secondary')}
                  fontSize={12}
                />
                <YAxis 
                  stroke={var('--text-secondary')}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: var('--card-bg'),
                    border: `1px solid ${var('--border')}`,
                    borderRadius: '8px',
                    color: var('--text-primary')
                  }}
                />
                <Bar 
                  dataKey="completed" 
                  fill={var('--accent')}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strength Progression Chart */}
        <div className="chart-section">
          <h2>Strength Progression - {getTimeRangeLabel()}</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={var('--border')} />
                <XAxis 
                  dataKey="date" 
                  stroke={var('--text-secondary')}
                  fontSize={12}
                />
                <YAxis 
                  stroke={var('--text-secondary')}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: var('--card-bg'),
                    border: `1px solid ${var('--border')}`,
                    borderRadius: '8px',
                    color: var('--text-primary')
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke={var('--accent')}
                  strokeWidth={3}
                  dot={{ fill: var('--accent'), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: var('--accent'), strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="progress-summary">
          <h2>Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <h3>{workoutData.length}</h3>
                <p>Total Workouts</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">🔥</div>
              <div className="summary-content">
                <h3>
                  {workoutData.length > 0 
                    ? Math.round((workoutData.filter(d => d.completed > 0).length / workoutData.length) * 100)
                    : 0}%
                </h3>
                <p>Completion Rate</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">💪</div>
              <div className="summary-content">
                <h3>
                  {strengthData.length > 0 
                    ? Math.max(...strengthData.map(d => d.weight))
                    : 0}kg
                </h3>
                <p>Max Weight</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <h3>
                  {strengthData.length > 1 
                    ? Math.round(((strengthData[strengthData.length - 1]?.weight || 0) - (strengthData[0]?.weight || 0)) * 10) / 10
                    : 0}kg
                </h3>
                <p>Weight Gain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress
