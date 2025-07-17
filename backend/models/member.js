import mongoose from "mongoose";

const memberSchema = new mongoose.Schema ({
  memberName:      { type: String },
  memberEmail:     { type: String, },
  memberYear:      { type: Number,},
  memberImage:     { type: String },
  memberBio:       { type: String },
  memberRole:      { type: String,  },
  memberSocial:    {
    linkedin:      { type: String },
    github:        { type: String },
  },
});

export const Member = mongoose.model('Member',memberSchema);

