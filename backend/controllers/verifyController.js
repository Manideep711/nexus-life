import User from "../models/User.js";

/**
 * @desc Upload verification document
 * @route POST /api/verify/upload
 * @access Protected (User)
 */
export const uploadVerificationDoc = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    await User.findByIdAndUpdate(req.user._id, {
      verificationStatus: "pending",
     verificationDoc: req.file.path,
    });

    res.status(200).json({
      message: "Verification document uploaded successfully. Pending admin review.",
    });
  } catch (error) {
    console.error("Error uploading verification document:", error);
    res.status(500).json({ message: "Server error during upload." });
  }
};

/**
 * @desc Review user verification (Admin only)
 * @route PATCH /api/verify/:userId/review
 * @access Admin
 */
export const reviewVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // "verified" | "rejected"

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.verificationStatus = status;
    user.isVerified = status === "verified";
    await user.save();

    res.json({
      message: `User verification marked as ${status}.`,
      user,
    });
  } catch (error) {
    console.error("Error reviewing verification:", error);
    res.status(500).json({ message: "Server error during verification review." });
  }
};
