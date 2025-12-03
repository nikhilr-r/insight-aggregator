📰 Insight News Aggregator

A personalized, distraction-free news briefing platform built with the MERN Stack.

Insight is a smart news aggregator that filters out the noise. Unlike traditional news sites that bombard users with random headlines, Insight allows users to curate their own feed based on specific Interests (e.g., Technology, Startups, AI) and Regions (e.g., India, USA, UK).

🚀 Key Features

🔐 Secure Authentication: Complete Sign Up & Login system using JWT (JSON Web Tokens) and Bcrypt password hashing.

🎨 Modern "Glass" UI: A professional, responsive interface featuring Glassmorphism, tailored for both Light and Dark modes (System Sync).

🌍 Smart Filtering: Users can filter news by Country (India, USA, UK, etc.) and specific Topics simultaneously.

🧠 Persistent Preferences: User settings are saved in MongoDB, ensuring the feed is ready the moment they log back in.

⚡ Real-Time Data: Fetches the latest stories via the NewsAPI, sorted by freshness (Last 3 days).

📱 Responsive Design: Fully optimized for Desktop, Tablet, and Mobile.

🛠️ Tech Stack

Frontend

React.js (Vite): For a blazing fast Single Page Application (SPA).

Context API: For global state management (User Auth).

CSS3 Variables: For dynamic theming (Dark/Light mode).

Axios: For efficient API communication.

Backend

Node.js & Express: Robust RESTful API architecture.

MongoDB & Mongoose: NoSQL database for flexible user profiles.

JWT & Bcrypt: Industry-standard security.

Cors & Dotenv: Security and environment management.

⚙️ Installation & Setup Guide

Follow these steps to run the project locally.

1. Clone the Repository

git clone [https://github.com/YOUR_USERNAME/insight-aggregator.git](https://github.com/YOUR_USERNAME/insight-aggregator.git)
cd insight-aggregator


2. Backend Setup

Navigate to the server folder and install dependencies.

cd server
npm install


Create a .env file in the server/ folder and add your secrets:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NEWS_API_KEY=your_newsapi_key


Start the backend server:

npm run dev


3. Frontend Setup

Open a new terminal, navigate to the client folder, and install dependencies.

cd client
npm install


Create a .env file in the client/ folder:

VITE_API_URL=http://localhost:5000


Start the React application:

npm run dev


Your app should now be running on http://localhost:5173! 🚀

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