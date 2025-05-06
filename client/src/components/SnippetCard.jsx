"use client"
import { FaEdit, FaShareAlt, FaTrash, FaCode } from "react-icons/fa"
import "./SnippetCard.css"

const SnippetCard = ({ snippet, onEdit, onShare, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="snippet-card">
      <div className="snippet-card-header">
        <div className="language-badge">
          <FaCode /> {snippet.language}
        </div>
        <h3 className="snippet-title">{snippet.title}</h3>
      </div>

      {snippet.description && (
        <div className="snippet-description">
          {snippet.description.length > 100 ? `${snippet.description.substring(0, 100)}...` : snippet.description}
        </div>
      )}

      <div className="snippet-preview">
        <pre>
          <code>{snippet.code.length > 150 ? `${snippet.code.substring(0, 150)}...` : snippet.code}</code>
        </pre>
      </div>

      <div className="snippet-footer">
        <div className="snippet-date">Updated {formatDate(snippet.updatedAt)}</div>

        <div className="snippet-actions">
          <button className="btn-icon" onClick={onEdit} title="Edit snippet">
            <FaEdit />
          </button>

          <button className="btn-icon" onClick={onShare} title="Share snippet">
            <FaShareAlt />
          </button>

          <button className="btn-icon btn-danger" onClick={onDelete} title="Delete snippet">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SnippetCard
