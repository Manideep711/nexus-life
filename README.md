# 🩸 Nexus Lifeline

## 🌟 Overview
**Nexus Lifeline** is a comprehensive, full-stack platform designed to connect individuals in need of critical resources (such as Blood and Food) with willing donors and NGOs. By leveraging real-time location tracking and instant communication, the platform bridges the gap between those who want to help and those who desperately need assistance. It offers an intuitive, real-time experience to ensure resources reach the right people as quickly as possible.

## ✨ Key Features
- **Role-Based Access Control:** Secure user registration tailored for Donors, Requesters, and NGOs.
- **Resource Management (Blood & Food):** Donors can create "offers", and requesters can post "needs" for specific resources.
- **Geo-Location & Nearby Resources:** Integrated geographically via Google Maps to surface available resources within a specific radius (e.g., 50km).
- **Real-Time Chat Integration:** Immediate, Socket.io-based messaging between donors and requesters triggered the moment a request is accepted.
- **Verification System:** Admin approval workflow through document uploads (e.g., identity or NGO certificates) to maintain high trust and platform safety.
- **Responsive & Modern UI:** A highly polished, aesthetic frontend built using React, Shadcn UI, and Tailwind CSS.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React (Vite) & TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Radix UI Primitives, Lucide Icons
- **Routing:** React Router DOM
- **State & Data Fetching:** React Query, React Hook Form + Zod (Validation)
- **Maps Integration:** Google Maps API (`@vis.gl/react-google-maps`)
- **Real-Time Features:** Socket.io-client

### Backend
- **Framework & Runtime:** Node.js with Express.js
- **Database:** MongoDB (using Mongoose for schemas & queries)
- **Real-Time Communication:** Socket.io
- **Security & Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **File Uploads:** Multer (for storing verification documents locally, or pre-configured for future cloud buckets)

## 📂 Project Architecture

```text
nexus-lifeline/
├── backend/                  # Node.js + Express server
│   ├── config/               # Database and Env configurations
│   ├── controllers/          # Business logic handlers (Auth, Chat, Resources)
│   ├── middleware/           # Express middleware (Auth protection, Multer uploads)
│   ├── models/               # Mongoose data schemas (User, Resource, Request, Chat)
│   ├── routes/               # API route definitions
│   ├── uploads/              # Local storage directory for verification documents
│   └── server.js             # Main server entry point
└── frontend/                 # React + Vite client app
    ├── public/               # Static assets & HTML entry
    ├── src/                  # Core application components, pages, and hooks
    ├── package.json          # Frontend dependencies
    └── tailwind.config.ts    # Tailwind utility classes and theme configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (local or MongoDB Atlas)
- Google Maps API Key (for frontend location services)

### Backend Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Variables:**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_EMAIL=admin@example.com
   ```
4. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   *(The server should launch by default on port 5000)*

### Frontend Setup
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Ensure your frontend `.env` points to the backend API (`http://localhost:5000/api`) and contains your Google Maps API Key.
4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   *(The app typically runs on `http://localhost:5173` or `http://localhost:8080`)*

## 🤝 Contributing
Contributions are always welcome! Please fork this repository, make your desired feature additions or bug fixes, and submit a pull request for review. Let's build a platform that saves lives and makes resource sharing simpler!
