# 🩸 Nexus Lifeline (Frontend)

This directory contains the React/Vite frontend for **Nexus Lifeline**, a comprehensive platform connecting individuals in need of critical resources (Blood & Food) with willing donors and NGOs.

For the detailed, full-stack project documentation, including features, technology stack, backend APIs, and setup instructions, please refer to the **[root README.md](../README.md)**.

## 🚀 Quick Start (Frontend)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure you have a `.env` file referencing the backend URL and any necessary keys (like Google Maps API).
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_MAPS_API_KEY=your_maps_key
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## 🛠️ Key Technologies
- **React 18 + Vite**
- **TypeScript**
- **Tailwind CSS & Shadcn UI**
- **React Router v6**
- **React Hook Form + Zod**
- **Socket.io-client** (Real-time chat)
- **@vis.gl/react-google-maps** (Location tracking)
