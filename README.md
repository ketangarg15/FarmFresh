# FarmFresh 🌾

**FarmFresh** is a modern, full-stack e-commerce web application designed to connect local organic farmers directly with consumers. By removing intermediaries, it ensures customers receive fresh, high-quality organic produce while helping farmers get fair profits for their hard work.

🔗 **Live URL:** [https://farmfresh-s9ul.onrender.com/](https://farmfresh-s9ul.onrender.com/)

---

## 🚀 Features

- 👤 **Role-Based Authentication:** Register and log in as either a **Customer** or a **Farmer** with secure session-based authentication using `Passport.js`.
- 🚜 **Farmer Dashboard:** Farmers can manage their store listings (create, read, update, delete organic products), set prices, track stock levels, and monitor orders.
- 🛒 **Intuitive Shopping Experience:** Customers can browse fresh organic products, search for items, view detail pages, manage their shopping cart, and place orders.
- 📦 **Order & Delivery Tracking:** Live status tracking for customers to check if their fresh goods are packaged, dispatched, or delivered.
- 🖼️ **Cloud Image Storage:** Secure, high-performance product image uploads powered by **Cloudinary**.
- 💾 **Persistent Sessions:** User session data is stored securely in MongoDB using `connect-mongo`.

---

## 🛠️ Tech Stack

### Frontend
- **React (v19)** — Component-based UI library.
- **Vite** — Fast modern build tool and development server.
- **React Router DOM** — Client-side routing.
- **Vanilla CSS** — Custom styling for custom-tailored layouts.

### Backend
- **Node.js** & **Express.js** — Robust REST API backend.
- **MongoDB** & **Mongoose** — NoSQL database and object data modeling.
- **Passport.js** — Secure authentication and session management.
- **Multer** & **Cloudinary** — Handling multipart/form-data for product image uploads.

---

## ⚙️ Installation & Setup

Follow these steps to run the application locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/FarmFresh.git
cd FarmFresh
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory and configure the following variables:

```env
# MongoDB Connection String
DB_URL=mongodb+srv://your_username:your_password@cluster0.net/farmers-market?retryWrites=true&w=majority

# Session Secret Key
SESSION_SECRET=your_super_secret_session_key

# Cloudinary Credentials (For image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Server Port
PORT=3000
```

---

### Step 3: Install Dependencies & Run

You can run the backend and frontend together using the root package scripts.

#### 1. Install root & backend dependencies:
```bash
npm install
```

#### 2. Install frontend dependencies and build the frontend assets:
```bash
npm run build
```

#### 3. Start the application:
```bash
npm start
```

The server will start running on [http://localhost:3000](http://localhost:3000), serving the React frontend compiled static files automatically.

---

### Alternative: Running in Development Mode (Hot Reloading)

If you want to make changes to the frontend with hot-module replacement (HMR), run the frontend and backend servers separately:

#### 1. Start the Backend Server (from the root directory):
```bash
# Install dependencies if not already done
npm install
# Start server
npm start
```
*The backend API will run on `http://localhost:3000`.*

#### 2. Start the Frontend Dev Server (from the `frontend/` directory):
```bash
cd frontend
# Install dependencies
npm install
# Run the Vite development server
npm run dev
```
*The frontend development server will run on `http://localhost:5173` (or another free port shown in your terminal).*

---

## 📁 Directory Structure

```text
FarmFresh/
├── config/             # Configuration files (e.g. cloudinary setup)
├── controllers/        # Express route controller handlers
├── frontend/           # React frontend source code
│   ├── dist/           # Compiled production static files
│   ├── src/            # React components, pages, hooks, and styles
│   └── vite.config.js  # Vite build configuration
├── models/             # Mongoose database models (User, Product, Order, etc.)
├── routes/             # REST API endpoint definitions
├── utils/              # Utility functions and helper classes
├── app.js              # Application entry point
├── middleware.js       # Custom Express middleware (auth, validations)
├── package.json        # Project manifest & dependency config
└── .env                # Secret environment variables (ignored by git)
```

---

## 🌐 Deployment on Render

This project is configured to deploy easily on **Render** (or any Node.js hosting platform):

1. **Build Command:** `npm run build` (This automatically installs frontend packages and runs Vite's build tool).
2. **Start Command:** `npm start` (This runs `node app.js` to start the backend, which serves the compiled frontend statically).
3. Ensure you add all `.env` keys under the **Environment Variables** tab in your Render dashboard dashboard.
