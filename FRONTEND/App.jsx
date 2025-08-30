import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Workout from './pages/Workout'
import Progress from './pages/Progress'
import Calories from './pages/Calories'
import Upload from './pages/Upload'
import './App.css'

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'var(--primary-bg)'
      }}>
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/workout" 
            element={isAuthenticated ? <Workout /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/progress" 
            element={isAuthenticated ? <Progress /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/calories" 
            element={isAuthenticated ? <Calories /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/upload" 
            element={isAuthenticated ? <Upload /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
