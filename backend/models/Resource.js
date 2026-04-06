import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    postType: {
      type: String,
      enum: ["offer", "need"],
      required: true
    },
    resourceType: {
      type: String,
      enum: ["blood", "food"],
      required: true
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null
    },
    quantity: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: true
    },
    expiresAt: {  // ✅ consistent naming with backend & frontend
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ["available", "pending", "fulfilled", "unavailable"],
      default: "available"
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

resourceSchema.index({ location: "2dsphere" });

export default mongoose.model("Resource", resourceSchema);
