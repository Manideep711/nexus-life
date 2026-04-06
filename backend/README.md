# Nexus Lifeline Backend

This is the backend server for the Nexus Lifeline application, built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Setup & Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ADMIN_EMAIL=admin@example.com
    ```

4.  **Start the Server:**
    -   **Development (with nodemon):**
        ```bash
        npm run dev
        ```
    -   **Production:**
        ```bash
        npm start
        ```

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Real-time**: Socket.io
-   **Authentication**: JSON Web Tokens (JWT) & bcryptjs
-   **File Uploads**: Multer

## 📡 API Endpoints

### Authentication (`/api/auth`)
-   `POST /signup` - Register a new user (Donor/Requester/NGO).
-   `POST /login` - Authenticate user and return JWT.

### Dashboard (`/api/dashboard`)
-   `GET /` - Fetch user profile, verification status, and relevant resources.

### Resources (`/api/resources`)
-   `POST /` - Create a new resource (Blood/Food) [Donor only].
    -   *Requires `latitude` and `longitude` in body.*
-   `GET /` - Get all resources (for admin/debug).
-   `GET /nearby` - Get available resources from other users.
    -   *Query Params: `?lat=...&lng=...&radius=...` (radius in km, default 50)*
-   `GET /my` - Get logged-in user's resources.
-   `GET /:id` - Get details of a specific resource.
-   `PATCH /:id` - Update resource details.
-   `PATCH /:id/status` - Update resource status (e.g., available/unavailable).
-   `DELETE /:id` - Remove a resource.

### Requests (`/api/requests`)
-   `POST /` - Create a new request for a resource.
-   `GET /` - Get requests received by the donor (pending only).
-   `GET /my` - Get requests made by the requester.
-   `PATCH /:id/respond` - Accept or Decline a request [Donor only].
    -   *If accepted, a chat room is automatically created.*

### Chat (`/api/chats`)
-   `GET /` - Get all active chats for the user.
-   `GET /:chatId` - Get message history for a specific chat.
-   `POST /send` - Send a text message to a chat room.

### Verification (`/api/verify`)
-   `POST /upload` - Upload a verification document (PDF/Image).
-   `GET /all` - Get all users with pending/verified status [Admin only].
-   `PATCH /:userId/review` - Approve or Reject a verification request [Admin only].

## 🔄 Real-time Features (Socket.io)

-   **Events**:
    -   `joinChat(chatId)`: Join a specific chat room.
    -   `leaveChat(chatId)`: Leave a chat room.
    -   `newMessage`: Listen for incoming messages in real-time.

## 📂 Project Structure

```
backend/
├── config/         # Database configuration
├── controllers/    # Route logic (Auth, Chat, Resources, etc.)
├── middleware/     # Auth checks, File uploads
├── models/         # Mongoose schemas (User, Resource, Chat)
├── routes/         # API Route definitions
├── uploads/        # Stored verification documents
├── server.js       # Entry point
└── package.json    # Dependencies
```
