"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { toast } from "react-toastify"
import Editor from "@monaco-editor/react"
import { FaUser, FaCalendarAlt, FaCode } from "react-icons/fa"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import "./SharedSnippet.css"

const SharedSnippet = () => {
  const { shareId } = useParams()
  const { isAuthenticated } = useAuth()

  const [snippet, setSnippet] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSharedSnippet()
  }, [shareId])

  const fetchSharedSnippet = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/snippets/shared/${shareId}`)
      setSnippet(response.data.snippet)
      setOwner(response.data.owner)
    } catch (error) {
      console.error("Error fetching shared snippet:", error)
      setError("This shared snippet does not exist or has expired")
      toast.error("Failed to load shared snippet")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-error-container">
        <h2>Snippet Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="shared-snippet-container">
      <div className="shared-snippet-header">
        <h2>{snippet.title}</h2>

        <div className="shared-snippet-meta">
          <div className="meta-item">
            <FaUser /> Created by {owner.name}
          </div>
          <div className="meta-item">
            <FaCalendarAlt /> {formatDate(snippet.createdAt)}
          </div>
          <div className="meta-item">
            <FaCode /> {snippet.language}
          </div>
        </div>

        {snippet.description && <div className="shared-snippet-description">{snippet.description}</div>}

        {isAuthenticated && (
          <div className="shared-snippet-actions">
            <Link to="/" className="btn-secondary">
              Go to Dashboard
            </Link>
            <Link to={`/snippet/${snippet._id}`} className="btn-primary">
              Open in Editor
            </Link>
          </div>
        )}
      </div>

      <div className="shared-snippet-editor">
        <Editor
          height="100%"
          language={snippet.language}
          value={snippet.code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
          }}
        />
      </div>
    </div>
  )
}

export default SharedSnippet
