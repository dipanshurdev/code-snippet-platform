"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Editor from "@monaco-editor/react"
import { FaSave, FaShareAlt, FaUsers } from "react-icons/fa"
import api from "../services/api"
import socketService from "../services/socketService"
import ShareModal from "../components/ShareModal"
import CollaboratorsPanel from "../components/CollaboratorsPanel"
import "./SnippetEditor.css"

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell/Bash" },
]

const SnippetEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNewSnippet = id === "new"

  const [snippet, setSnippet] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    collectionId: "",
  })

  const [collections, setCollections] = useState([])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const editorRef = useRef(null)
  const isEditorReady = useRef(false)
  const isSocketConnected = useRef(false)
  const isLocalChange = useRef(false)

  useEffect(() => {
    fetchCollections()

    if (!isNewSnippet) {
      fetchSnippet()
    } else {
      setIsLoading(false)
    }

    return () => {
      if (!isNewSnippet) {
        socketService.leaveSnippetRoom(id)
        socketService.cleanup()
      }
    }
  }, [id])

  const fetchCollections = async () => {
    try {
      const response = await api.get("/collections")
      setCollections(response.data)
    } catch (error) {
      console.error("Error fetching collections:", error)
      toast.error("Failed to load collections")
    }
  }

  const fetchSnippet = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/snippets/${id}`)
      setSnippet(response.data)

      // Connect to socket for real-time collaboration
      const token = localStorage.getItem("token")
      socketService.connect(token)
      socketService.joinSnippetRoom(id)
      isSocketConnected.current = true

      // Set up socket event listeners
      socketService.onCodeChange(handleRemoteCodeChange)
      socketService.onUserJoined(handleUserJoined)
      socketService.onUserLeft(handleUserLeft)

      // Fetch current collaborators
      fetchCollaborators()
    } catch (error) {
      console.error("Error fetching snippet:", error)
      toast.error("Failed to load snippet")
      navigate("/")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/snippets/${id}/collaborators`)
      setCollaborators(response.data)
    } catch (error) {
      console.error("Error fetching collaborators:", error)
    }
  }

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
    isEditorReady.current = true
  }

  const handleCodeChange = (value) => {
    if (isLocalChange.current) return

    isLocalChange.current = true
    setSnippet((prev) => ({ ...prev, code: value }))

    // Emit code change to other collaborators
    if (!isNewSnippet && isSocketConnected.current) {
      const cursorPosition = editorRef.current?.getPosition()
      socketService.emitCodeChange(id, value, snippet.language, cursorPosition)
    }

    isLocalChange.current = false
  }

  const handleRemoteCodeChange = (data) => {
    if (isLocalChange.current) return

    isLocalChange.current = true

    setSnippet((prev) => ({
      ...prev,
      code: data.code,
      language: data.language,
    }))

    isLocalChange.current = false
  }

  const handleUserJoined = (user) => {
    toast.info(`${user.name} joined the session`)
    fetchCollaborators()
  }

  const handleUserLeft = (user) => {
    toast.info(`${user.name} left the session`)
    fetchCollaborators()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSnippet((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (!snippet.title.trim()) {
        toast.error("Please enter a title for your snippet")
        return
      }

      const snippetData = {
        title: snippet.title,
        description: snippet.description,
        code: snippet.code,
        language: snippet.language,
        collectionId: snippet.collectionId || null,
      }

      let response

      if (isNewSnippet) {
        response = await api.post("/snippets", snippetData)
        toast.success("Snippet created successfully")
        navigate(`/snippet/${response.data._id}`)
      } else {
        response = await api.put(`/snippets/${id}`, snippetData)
        toast.success("Snippet saved successfully")
      }

      setSnippet(response.data)
    } catch (error) {
      console.error("Error saving snippet:", error)
      toast.error("Failed to save snippet")
    } finally {
      setIsSaving(false)
    }
  }

  const handleShareSnippet = async (shareData) => {
    try {
      const response = await api.post(`/snippets/${id}/share`, shareData)
      setIsShareModalOpen(false)
      toast.success("Snippet shared successfully")
      return response.data.shareUrl
    } catch (error) {
      console.error("Error sharing snippet:", error)
      toast.error("Failed to share snippet")
      return null
    }
  }

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="snippet-editor-container">
      <div className="editor-header">
        <div className="editor-form">
          <input
            type="text"
            name="title"
            value={snippet.title}
            onChange={handleInputChange}
            placeholder="Snippet title"
            className="editor-title-input"
          />

          <div className="editor-controls">
            <select name="language" value={snippet.language} onChange={handleInputChange} className="language-select">
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              name="collectionId"
              value={snippet.collectionId || ""}
              onChange={handleInputChange}
              className="collection-select"
            >
              <option value="">No Collection</option>
              {collections.map((collection) => (
                <option key={collection._id} value={collection._id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="editor-actions">
          {!isNewSnippet && (
            <>
              <button
                className="btn-secondary"
                onClick={() => setShowCollaborators(!showCollaborators)}
                title="View collaborators"
              >
                <FaUsers /> {collaborators.length}
              </button>

              <button className="btn-secondary" onClick={() => setIsShareModalOpen(true)} title="Share snippet">
                <FaShareAlt /> Share
              </button>
            </>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            <FaSave /> {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="editor-description">
        <textarea
          name="description"
          value={snippet.description}
          onChange={handleInputChange}
          placeholder="Add a description for your snippet"
          className="description-textarea"
        />
      </div>

      <div className="editor-main">
        <div className={`editor-wrapper ${showCollaborators ? "with-sidebar" : ""}`}>
          <Editor
            height="100%"
            language={snippet.language}
            value={snippet.code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>

        {showCollaborators && (
          <CollaboratorsPanel collaborators={collaborators} onClose={() => setShowCollaborators(false)} />
        )}
      </div>

      {isShareModalOpen && (
        <ShareModal snippet={snippet} onClose={() => setIsShareModalOpen(false)} onShare={handleShareSnippet} />
      )}
    </div>
  )
}

export default SnippetEditor
