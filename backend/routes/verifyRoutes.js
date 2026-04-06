import express from "express";
import multer from "multer";
import { protect, admin } from "../middleware/authMiddleware.js";
import { uploadVerificationDoc, reviewVerification } from "../controllers/verifyController.js";
import { getAllVerifications } from "../controllers/adminController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// Upload document (User)
router.post("/upload", protect, upload.single("document"), uploadVerificationDoc);

// Review verification (Admin)
router.patch("/:userId/review", protect, admin, reviewVerification);

// Get all verifications (Admin)
router.get("/all", protect, admin, getAllVerifications);

export default router;
