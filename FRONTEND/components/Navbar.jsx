import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/workout', label: 'Workout', icon: '🏋️' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/calories', label: 'Calories', icon: '🍎' },
    { path: '/upload', label: 'Upload', icon: '📁' }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar desktop-nav">
        <div className="container">
          <div className="nav-brand">
            <Link to="/dashboard">
              <span className="brand-icon">💪</span>
              <span className="brand-text">Chart2Fit</span>
            </Link>
          </div>
          
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="nav-user">
            <span className="user-name">Hi, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-container">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Navbar
