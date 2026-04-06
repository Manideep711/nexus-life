import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import { Server } from "socket.io";
import http from "http";
import verifyRoutes from "./routes/verifyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { fileURLToPath } from "url";
import path from "path";
// Initialize environment variables
dotenv.config();

// Connect MongoDB
connectDB();

// Initialize express app
const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:8080", 
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
)

app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/users", userRoutes);
// Create HTTP server and wrap app
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // allow both local ports and production URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make socket instance available in requests
app.set("io", io);

// Handle socket events
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
