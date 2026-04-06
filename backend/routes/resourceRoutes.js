import express from "express";
import {
  createResource,
  getAllResources,
  updateResource,
  getResourceById,
  updateResourceStatus, 
  deleteResource,
} from "../controllers/resourceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createResource);
router.get("/", protect, getAllResources);
router.get("/:id", protect, getResourceById); 
router.patch("/:id", protect, updateResource);
router.patch("/:id/status", protect, updateResourceStatus);
router.delete("/:id", protect, deleteResource);

export default router;
