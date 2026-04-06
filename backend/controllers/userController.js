import User from "../models/User.js";

export const updateActiveRole = async (req, res) => {
  try {
    const { activeRole } = req.body;
    if (!["donor", "requester"].includes(activeRole))
      return res.status(400).json({ message: "Invalid role selected." });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { activeRole },
      { new: true }
    );

    res.json({ message: `Active role set to ${activeRole}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;
    user.verificationStatus = req.body.verificationStatus || user.verificationStatus;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      verificationStatus: updatedUser.verificationStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
