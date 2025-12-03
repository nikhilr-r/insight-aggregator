# 📰 Insight — Personalized News Aggregator (MERN Stack)

**Insight** is a distraction-free, personalized news briefing platform built using the **MERN Stack**.  
Unlike traditional news portals filled with random headlines, Insight gives users full control by letting them curate feeds based on **Topics** (AI, Technology, Startups, etc.) and **Regions** (India, USA, UK, etc.).

---

## 🚀 Features

### 🔐 Secure Authentication
- Sign Up & Login using **JWT Authentication**
- Password hashing using **Bcrypt**

### 🎨 Modern "Glass" UI  
- Stunning **Glassmorphism-based interface**
- Fully **Responsive**
- **Light/Dark mode** with OS-level sync

### 🌍 Smart Filtering  
- Filter news by **Country** + **Topics** in combination  
- Fetches only the **latest 3 days** of news

### 🧠 Persistent User Preferences  
- User topics and region preferences stored in **MongoDB**
- Auto-loaded feed upon login

### ⚡ Real-Time News Fetching  
- Uses **NewsAPI**
- Sorted by *freshness* (newest first)

### 📱 Responsive Across All Devices  
- Desktop, Tablet and Mobile optimized

---

## 🛠️ Tech Stack

### **Frontend**
- React.js (Vite)
- Context API (Global Auth State)
- CSS3 Variables (Dynamic Theming)
- Axios

### **Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- CORS, Dotenv

---

## ⚙️ Installation & Setup Guide

Follow these steps to run the project locally.

**1. Clone the Repository**

```bash
git clone https://github.com/nikhilr-r/insight-aggregator.git
cd insight-aggregator 
```
**2. Backend Setup**

Navigate to the backend folder:
```bash 
cd server
npm install 
```
Create a .env file inside server/:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NEWS_API_KEY=your_newsapi_key
```
Start backend:
```bash
npm run dev
```

**3. Frontend Setup**
Open a new terminal and run:
```bash
cd client
npm install
```
Create .env inside client:
```bash
VITE_API_URL=http://localhost:5000
```
Start the frontend:
```bash
npm run dev
```
### Your app will run on:
```bash  
http://localhost:5173 
 ```

🔗 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/users` | Register a new user | Public |
| POST | `/api/users/login` | Authenticate user & get Token | Public |
| GET | `/api/users/me` | Get current user details | Private (Token) |
| PUT | `/api/users/preferences` | Update Topics & Country | Private (Token) |
| GET | `/api/news` | Fetch personalized news feed | Private (Token) |

🗺️ Roadmap

[1] User Authentication & Security

[2] Personalized Feed Algorithm

[3] Country & Topic Filters

[4] Professional UI/UX Overhaul

[5] Redis Caching (Performance Optimization) - Coming Soon

[6] AI Summarizer (Generative AI integration) - Coming Soon

👨‍💻 Author

**Nikhil Rajput**

[![GitHub](https://img.shields.io/badge/GitHub-nikhilr--r-black?logo=github)](https://github.com/nikhilr-r)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nikhil%20Rajput-blue?logo=linkedin)](https://www.linkedin.com/in/nikhil-rajput-nr1906/) 