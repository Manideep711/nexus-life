import User from "../models/User.js";

/**
 * @desc Get all users with pending verification
 * @route GET /api/admin/verifications
 * @access Admin
 */
export const getAllVerifications = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      verificationStatus: { $in: ["pending", "rejected", "verified"] },
    }).select("fullName email verificationStatus verificationDoc");

    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching verifications:", error);
    res.status(500).json({ message: "Server error fetching verifications" });
  }
};
