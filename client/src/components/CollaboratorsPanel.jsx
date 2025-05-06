"use client"
import { FaTimes, FaUser } from "react-icons/fa"
import "./CollaboratorsPanel.css"

const CollaboratorsPanel = ({ collaborators, onClose }) => {
  return (
    <div className="collaborators-panel">
      <div className="collaborators-header">
        <h3>Active Collaborators</h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="collaborators-list">
        {collaborators.length > 0 ? (
          collaborators.map((user) => (
            <div key={user._id} className="collaborator-item">
              <div className="collaborator-avatar">
                <FaUser />
              </div>
              <div className="collaborator-info">
                <div className="collaborator-name">{user.name}</div>
                <div className="collaborator-email">{user.email}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-collaborators">No active collaborators</div>
        )}
      </div>
    </div>
  )
}

export default CollaboratorsPanel
