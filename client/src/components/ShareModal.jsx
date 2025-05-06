"use client"

import { useState } from "react"
import { FaShareAlt, FaTimes, FaCopy, FaCheck } from "react-icons/fa"
import "./Modal.css"

const ShareModal = ({ snippet, onClose, onShare }) => {
  const [shareType, setShareType] = useState("public")
  const [expiresIn, setExpiresIn] = useState("never")
  const [shareUrl, setShareUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsSubmitting(true)

    const shareData = {
      type: shareType,
      expiresIn: expiresIn === "never" ? null : expiresIn,
    }

    const url = await onShare(shareData)

    if (url) {
      setShareUrl(url)
    }

    setIsSubmitting(false)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>
            <FaShareAlt /> Share Snippet
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {!shareUrl ? (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p className="modal-subtitle">Share "{snippet.title}"</p>

              <div className="form-group">
                <label>Share Type</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="shareType"
                      value="public"
                      checked={shareType === "public"}
                      onChange={() => setShareType("public")}
                    />
                    Public (Anyone with the link)
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="shareType"
                      value="private"
                      checked={shareType === "private"}
                      onChange={() => setShareType("private")}
                    />
                    Private (Only specific users)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="expiresIn">Expires In</label>
                <select
                  id="expiresIn"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="select-input"
                >
                  <option value="never">Never</option>
                  <option value="1d">1 Day</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Generating Link..." : "Generate Link"}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="modal-body">
              <p className="modal-subtitle">Share this link with others:</p>

              <div className="share-url-container">
                <input type="text" value={shareUrl} readOnly className="share-url-input" />
                <button
                  className="btn-icon copy-button"
                  onClick={handleCopyUrl}
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {isCopied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShareModal
