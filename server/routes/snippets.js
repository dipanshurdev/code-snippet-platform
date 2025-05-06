import express from "express"
import { v4 as uuidv4 } from "uuid"
import Snippet from "../models/Snippet.js"
import { verifyToken, optionalAuth } from "../middleware/auth.js"

const router = express.Router()

// Get all snippets for the current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const { collectionId } = req.query

    const query = {
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    }

    if (collectionId) {
      query.collectionId = collectionId
    }

    const snippets = await Snippet.find(query).sort({ updatedAt: -1 })

    res.json(snippets)
  } catch (error) {
    console.error("Get snippets error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new snippet
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, code, language, collectionId } = req.body

    const snippet = new Snippet({
      title,
      description,
      code,
      language,
      owner: req.userId,
      collectionId: collectionId || null,
    })

    await snippet.save()

    res.status(201).json(snippet)
  } catch (error) {
    console.error("Create snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a specific snippet
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    })

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" })
    }

    res.json(snippet)
  } catch (error) {
    console.error("Get snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a snippet
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, code, language, collectionId } = req.body

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    })

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" })
    }

    snippet.title = title
    snippet.description = description
    snippet.code = code
    snippet.language = language
    snippet.collectionId = collectionId || null

    await snippet.save()

    res.json(snippet)
  } catch (error) {
    console.error("Update snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a snippet
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      owner: req.userId,
    })

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" })
    }

    await snippet.remove()

    res.json({ message: "Snippet deleted" })
  } catch (error) {
    console.error("Delete snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Share a snippet
router.post("/:id/share", verifyToken, async (req, res) => {
  try {
    const { type, expiresIn } = req.body

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      owner: req.userId,
    })

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" })
    }

    // Generate a unique share ID
    const shareId = uuidv4()

    // Calculate expiration date if provided
    let expiresAt = null
    if (expiresIn) {
      expiresAt = new Date()

      if (expiresIn === "1d") {
        expiresAt.setDate(expiresAt.getDate() + 1)
      } else if (expiresIn === "7d") {
        expiresAt.setDate(expiresAt.getDate() + 7)
      } else if (expiresIn === "30d") {
        expiresAt.setDate(expiresAt.getDate() + 30)
      }
    }

    // Add share to snippet
    snippet.shares.push({
      type: type || "public",
      shareId,
      expiresAt,
    })

    await snippet.save()

    // Generate share URL
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000"
    const shareUrl = `${baseUrl}/shared/${shareId}`

    res.json({
      shareId,
      shareUrl,
      expiresAt,
    })
  } catch (error) {
    console.error("Share snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a shared snippet
router.get("/shared/:shareId", optionalAuth, async (req, res) => {
  try {
    const { shareId } = req.params

    // Find snippet with the given share ID
    const snippet = await Snippet.findOne({
      "shares.shareId": shareId,
    }).populate("owner", "name email")

    if (!snippet) {
      return res.status(404).json({ message: "Shared snippet not found" })
    }

    // Find the specific share
    const share = snippet.shares.find((s) => s.shareId === shareId)

    // Check if share has expired
    if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
      return res.status(410).json({ message: "This shared link has expired" })
    }

    // Check if private share and user is authenticated
    if (share.type === "private" && (!req.userId || !snippet.collaborators.includes(req.userId))) {
      return res.status(403).json({ message: "You do not have permission to view this snippet" })
    }

    res.json({
      snippet,
      owner: snippet.owner,
    })
  } catch (error) {
    console.error("Get shared snippet error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get collaborators for a snippet
router.get("/:id/collaborators", verifyToken, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      $or: [{ owner: req.userId }, { collaborators: req.userId }],
    }).populate("collaborators", "name email")

    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" })
    }

    res.json(snippet.collaborators)
  } catch (error) {
    console.error("Get collaborators error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
