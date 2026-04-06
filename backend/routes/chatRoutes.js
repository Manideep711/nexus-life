import express from "express";
import { getMyChats, sendMessage,getChatById } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyChats);
router.post("/send", protect, sendMessage);
router.get("/:chatId", protect, getChatById); 

export default router;