import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: generate JWT
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "requester",
      phone,
    });

    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Force admin if email matches env ADMIN_EMAIL
    let role = user.role;
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
      role = "admin";

      // Persist admin role to DB if not already admin
      if (user.role !== "admin") {
        user.role = "admin";
        try {
          await user.save();
          console.log(`✅ User ${email} promoted to admin (env match).`);
        } catch (saveErr) {
          console.error("Error saving admin role:", saveErr);
        }
      }
    }

    const token = generateToken(user._id, user.email, role);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if they don't exist
      user = await User.create({
        fullName: name,
        email,
        password: await bcrypt.hash(sub, 10), // Hash the Google sub as a random non-usable password
        role: "requester", // Default role
      });
    }

    let role = user.role;
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
      role = "admin";
      if (user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
    }

    const jwtToken = generateToken(user._id, user.email, role);

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google Token" });
  }
};
