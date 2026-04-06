// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: { type: String, enum: ["donor", "requester", "admin"], default: "requester" },
  phone: { type: String },
  bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], default: null },
  organizationName: { type: String }, // optional for any verified user representing an org
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ["none", "pending", "verified", "rejected"], default: "none" },
  verificationDoc: { type: String }, // file path for uploaded document
});


export default mongoose.model("User", userSchema);
