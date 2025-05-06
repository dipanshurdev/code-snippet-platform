"use client"

import { useState } from "react"
import { FaFolder, FaTimes } from "react-icons/fa"
import "./Modal.css"

const CollectionModal = ({ onClose, onSave, collection = null }) => {
  const [formData, setFormData] = useState({
    name: collection?.name || "",
    description: collection?.description || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      return
    }

    setIsSubmitting(true)
    await onSave(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>
            <FaFolder /> {collection ? "Edit Collection" : "Create Collection"}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Collection Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter collection name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter collection description"
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CollectionModal
