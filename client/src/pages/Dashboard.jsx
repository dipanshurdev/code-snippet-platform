"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { FaPlus, FaSearch, FaFolder } from "react-icons/fa"
import api from "../services/api"
import SnippetCard from "../components/SnippetCard"
import CollectionModal from "../components/CollectionModal"
import ShareModal from "../components/ShareModal"
import "./Dashboard.css"

const Dashboard = () => {
  const [snippets, setSnippets] = useState([])
  const [collections, setCollections] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCollection, setActiveCollection] = useState(null)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [activeCollection])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch collections
      const collectionsResponse = await api.get("/collections")
      setCollections(collectionsResponse.data)

      // Fetch snippets (filtered by collection if one is active)
      const snippetsUrl = activeCollection ? `/snippets?collectionId=${activeCollection._id}` : "/snippets"

      const snippetsResponse = await api.get(snippetsUrl)
      setSnippets(snippetsResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load your snippets and collections")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.language.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCollection = async (collectionData) => {
    try {
      await api.post("/collections", collectionData)
      setIsCollectionModalOpen(false)
      fetchData()
      toast.success("Collection created successfully")
    } catch (error) {
      console.error("Error creating collection:", error)
      toast.error("Failed to create collection")
    }
  }

  const handleShareSnippet = async (shareData) => {
    try {
      const response = await api.post(`/snippets/${selectedSnippet._id}/share`, shareData)
      setIsShareModalOpen(false)
      toast.success("Snippet shared successfully")
      return response.data.shareUrl
    } catch (error) {
      console.error("Error sharing snippet:", error)
      toast.error("Failed to share snippet")
      return null
    }
  }

  const handleDeleteSnippet = async (snippetId) => {
    if (window.confirm("Are you sure you want to delete this snippet?")) {
      try {
        await api.delete(`/snippets/${snippetId}`)
        setSnippets(snippets.filter((snippet) => snippet._id !== snippetId))
        toast.success("Snippet deleted successfully")
      } catch (error) {
        console.error("Error deleting snippet:", error)
        toast.error("Failed to delete snippet")
      }
    }
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="collections-header">
          <h3>Collections</h3>
          <button className="btn-icon" onClick={() => setIsCollectionModalOpen(true)} title="Create new collection">
            <FaPlus />
          </button>
        </div>

        <div className="collections-list">
          <div
            className={`collection-item ${activeCollection === null ? "active" : ""}`}
            onClick={() => setActiveCollection(null)}
          >
            <FaFolder /> All Snippets
          </div>

          {collections.map((collection) => (
            <div
              key={collection._id}
              className={`collection-item ${activeCollection?._id === collection._id ? "active" : ""}`}
              onClick={() => setActiveCollection(collection)}
            >
              <FaFolder /> {collection.name}
            </div>
          ))}
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-header">
          <h2>{activeCollection ? activeCollection.name : "All Snippets"}</h2>
          <div className="dashboard-actions">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button className="btn-primary" onClick={() => navigate("/snippet/new")}>
              <FaPlus /> New Snippet
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="snippets-grid">
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet._id}
                  snippet={snippet}
                  onEdit={() => navigate(`/snippet/${snippet._id}`)}
                  onShare={() => {
                    setSelectedSnippet(snippet)
                    setIsShareModalOpen(true)
                  }}
                  onDelete={() => handleDeleteSnippet(snippet._id)}
                />
              ))
            ) : (
              <div className="no-snippets">
                <p>No snippets found. Create your first snippet!</p>
                <button className="btn-primary" onClick={() => navigate("/snippet/new")}>
                  <FaPlus /> New Snippet
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isCollectionModalOpen && (
        <CollectionModal onClose={() => setIsCollectionModalOpen(false)} onSave={handleCreateCollection} />
      )}

      {isShareModalOpen && selectedSnippet && (
        <ShareModal snippet={selectedSnippet} onClose={() => setIsShareModalOpen(false)} onShare={handleShareSnippet} />
      )}
    </div>
  )
}

export default Dashboard
