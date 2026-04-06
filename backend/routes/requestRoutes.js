import express from "express";
import {
  createRequest,
  getReceivedRequests,
  respondToRequest,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/", protect, getReceivedRequests);
router.patch("/:id/respond", protect, respondToRequest);

export default router;
