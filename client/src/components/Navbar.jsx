"use client"
import { Link, useNavigate } from "react-router-dom"
import { FaCode, FaSignOutAlt, FaUser } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import "./Navbar.css"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          <FaCode /> CodeSnippet
        </Link>
      </div>

      <div className="navbar-menu">
        {isAuthenticated ? (
          <div className="navbar-user">
            <div className="user-info">
              <FaUser className="user-icon" />
              <span className="user-name">{user?.name}</span>
            </div>

            <button className="logout-button" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link btn-primary">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
