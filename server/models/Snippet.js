import mongoose from "mongoose"

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      default: "javascript",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      default: null,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    shares: [
      {
        type: {
          type: String,
          enum: ["public", "private"],
          default: "public",
        },
        shareId: {
          type: String,
          required: true,
        },
        expiresAt: {
          type: Date,
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for faster searches
snippetSchema.index({ title: "text", description: "text", language: "text" })

const Snippet = mongoose.model("Snippet", snippetSchema)

export default Snippet
