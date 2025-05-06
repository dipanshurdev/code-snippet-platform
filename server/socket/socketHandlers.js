import jwt from "jsonwebtoken"
import User from "../models/User.js"
import Snippet from "../models/Snippet.js"

export const setupSocketHandlers = (io) => {
  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")
      socket.userId = decoded.userId

      const user = await User.findById(decoded.userId)
      if (!user) {
        return next(new Error("User not found"))
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`)

    // Join a snippet room
    socket.on("join-snippet", async (snippetId) => {
      try {
        // Check if user has access to this snippet
        const snippet = await Snippet.findOne({
          _id: snippetId,
          $or: [{ owner: socket.userId }, { collaborators: socket.userId }],
        })

        if (!snippet) {
          socket.emit("error", "Snippet not found or access denied")
          return
        }

        // Join the room
        socket.join(`snippet:${snippetId}`)

        // Add user to collaborators if not already there
        if (!snippet.collaborators.includes(socket.userId) && snippet.owner.toString() !== socket.userId) {
          snippet.collaborators.push(socket.userId)
          await snippet.save()
        }

        // Notify others that user joined
        socket.to(`snippet:${snippetId}`).emit("user-joined", {
          _id: socket.userId,
          name: socket.user.name,
          email: socket.user.email,
        })

        console.log(`User ${socket.userId} joined snippet room: ${snippetId}`)
      } catch (error) {
        console.error("Error joining snippet room:", error)
        socket.emit("error", "Failed to join snippet room")
      }
    })

    // Leave a snippet room
    socket.on("leave-snippet", (snippetId) => {
      socket.leave(`snippet:${snippetId}`)

      // Notify others that user left
      socket.to(`snippet:${snippetId}`).emit("user-left", {
        _id: socket.userId,
        name: socket.user.name,
        email: socket.user.email,
      })

      console.log(`User ${socket.userId} left snippet room: ${snippetId}`)
    })

    // Handle code changes
    socket.on("code-change", (data) => {
      // Broadcast to all clients in the room except the sender
      socket.to(`snippet:${data.snippetId}`).emit("code-change", {
        code: data.code,
        language: data.language,
        cursorPosition: data.cursorPosition,
        userId: socket.userId,
        userName: socket.user.name,
      })
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })
}
