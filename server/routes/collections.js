import express from "express"
import Collection from "../models/Collection.js"
import Snippet from "../models/Snippet.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Get all collections for the current user
router.get("/", verifyToken, async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.userId }).sort({ name: 1 })
    res.json(collections)
  } catch (error) {
    console.error("Get collections error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new collection
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body

    const collection = new Collection({
      name,
      description,
      owner: req.userId,
    })

    await collection.save()

    res.status(201).json(collection)
  } catch (error) {
    console.error("Create collection error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a specific collection
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.userId,
    })

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" })
    }

    res.json(collection)
  } catch (error) {
    console.error("Get collection error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a collection
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body

    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.userId,
    })

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" })
    }

    collection.name = name
    collection.description = description

    await collection.save()

    res.json(collection)
  } catch (error) {
    console.error("Update collection error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a collection
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const collection = await Collection.findOne({
      _id: req.params.id,
      owner: req.userId,
    })

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" })
    }

    // Remove collection ID from all snippets in this collection
    await Snippet.updateMany({ collectionId: collection._id }, { $set: { collectionId: null } })

    await collection.remove()

    res.json({ message: "Collection deleted" })
  } catch (error) {
    console.error("Delete collection error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
