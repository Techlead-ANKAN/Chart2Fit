import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import './Calories.css'

const Calories = () => {
  const [meals, setMeals] = useState([])
  const [newMeal, setNewMeal] = useState({
    food_name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calorieData, setCalorieData] = useState([])
  const [dailyGoal] = useState(2000) // Default daily calorie goal

  useEffect(() => {
    fetchCalorieData()
  }, [])

  const fetchCalorieData = async () => {
    try {
      const [mealsRes, chartRes] = await Promise.all([
        axios.get('/calories/meals'),
        axios.get('/calories/chart')
      ])
      
      setMeals(mealsRes.data)
      setCalorieData(chartRes.data)
    } catch (error) {
      console.error('Error fetching calorie data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setNewMeal({
      ...newMeal,
      [e.target.name]: e.target.value
    })
  }

  const addMeal = async (e) => {
    e.preventDefault()
    if (!newMeal.food_name || !newMeal.calories) return

    setSaving(true)
    try {
      const response = await axios.post('/calories/meals', {
        ...newMeal,
        date: new Date().toISOString().split('T')[0]
      })
      
      setMeals([...meals, response.data])
      setNewMeal({
        food_name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      })
      
      // Refresh chart data
      fetchCalorieData()
    } catch (error) {
      console.error('Error adding meal:', error)
      alert('Error adding meal. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteMeal = async (mealId) => {
    try {
      await axios.delete(`/calories/meals/${mealId}`)
      setMeals(meals.filter(meal => meal.id !== mealId))
      fetchCalorieData()
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Error deleting meal. Please try again.')
    }
  }

  const getTodayCalories = () => {
    const today = new Date().toISOString().split('T')[0]
    return meals
      .filter(meal => meal.date === today)
      .reduce((total, meal) => total + parseInt(meal.calories || 0), 0)
  }

  const getProgressPercentage = () => {
    const todayCalories = getTodayCalories()
    return Math.min((todayCalories / dailyGoal) * 100, 100)
  }

  if (loading) {
    return (
      <div className="calories-container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading your nutrition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="calories-container">
      <div className="container">
        {/* Header */}
        <div className="calories-header">
          <h1>Calorie Tracking</h1>
          <div className="calorie-progress">
            <div className="progress-info">
              <span className="current-calories">{getTodayCalories()}</span>
              <span className="goal-calories">/ {dailyGoal} cal</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add Meal Form */}
        <div className="add-meal-section">
          <h2>Add Meal</h2>
          <form onSubmit={addMeal} className="meal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Food Name</label>
                <input
                  type="text"
                  name="food_name"
                  value={newMeal.food_name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="e.g., Grilled Chicken Breast"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Calories</label>
                <input
                  type="number"
                  name="calories"
                  value={newMeal.calories}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="165"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Protein (g)</label>
                <input
                  type="number"
                  name="protein"
                  value={newMeal.protein}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="31"
                />
              </div>
              
              <div className="form-group">
                <label>Carbs (g)</label>
                <input
                  type="number"
                  name="carbs"
                  value={newMeal.carbs}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Fat (g)</label>
                <input
                  type="number"
                  name="fat"
                  value={newMeal.fat}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="3.6"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn add-meal-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="loading"></div>
                  Adding...
                </>
              ) : (
                'Add Meal'
              )}
            </button>
          </form>
        </div>

        {/* Calorie Chart */}
        <div className="chart-section">
          <h2>Weekly Calorie Intake</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calorieData}>
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
                  dataKey="calories" 
                  fill={var('--accent')}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="meals-section">
          <h2>Today's Meals</h2>
          {meals.length > 0 ? (
            <div className="meals-list">
              {meals.map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-info">
                    <h3>{meal.food_name}</h3>
                    <div className="meal-macros">
                      <span className="macro">{meal.calories} cal</span>
                      {meal.protein && <span className="macro">{meal.protein}g protein</span>}
                      {meal.carbs && <span className="macro">{meal.carbs}g carbs</span>}
                      {meal.fat && <span className="macro">{meal.fat}g fat</span>}
                    </div>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteMeal(meal.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-meals">
              <p>No meals logged today. Add your first meal above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Calories
