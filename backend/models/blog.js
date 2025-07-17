import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  description: { type: String, required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true }, 
  authorName:  { type: String},
  images:      [String], 
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date }
});

export const Blog = mongoose.model('Blog',blogSchema)
