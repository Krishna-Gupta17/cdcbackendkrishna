import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true },
  phone:        { type: Number, required: true },
  message:      { type: String, required: true }
}, {
  timestamps: true
});

export const Feedback = mongoose.model('Feedback',feedbackSchema); 
