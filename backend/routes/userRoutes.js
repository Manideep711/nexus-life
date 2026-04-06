import express from "express";
import { updateActiveRole, getUsers, deleteUser, updateUser } from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/role", protect, updateActiveRole);
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id", protect, admin, updateUser);

export default router;
