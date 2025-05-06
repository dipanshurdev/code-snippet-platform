"use client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SnippetEditor from "./pages/SnippetEditor";
import SharedSnippet from "./pages/SharedSnippet";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import "./App.css";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/snippet/:id"
                element={
                  <ProtectedRoute>
                    <SnippetEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/snippet/new"
                element={
                  <ProtectedRoute>
                    <SnippetEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/shared/:shareId" element={<SharedSnippet />} />
            </Routes>
          </main>
          <ToastContainer position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
