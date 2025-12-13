# 📰 Insight — Personalized News Aggregator (MERN Stack)

#### **Insight** is a distraction-free, personalized news briefing platform built using the **MERN Stack** .Unlike traditional news portals filled with random headlines, Insight gives users full control by letting them curate feeds based on **Topics** (AI, Technology, Startups, etc.) and **Regions** (India, USA, UK, etc.). ####
---
## 🚀 Features
#### Secure Authentication
- Sign Up & Login using **JWT Authentication**
- Password hashing using **Bcrypt**
#### Modern "Glass" UI  
- Stunning **Glassmorphism-based interface**
- Fully **Responsive**
- **Light/Dark mode** with OS-level sync
#### Smart Filtering  
- Filter news by **Country** + **Topics** in combination  
- Fetches only the **latest 3 days** of news
#### Persistent User Preferences  
- User topics and region preferences stored in **MongoDB**
- Auto-loaded feed upon login
#### Performance Optimization (Redis Caching)
- Implements Redis (Upstash) caching strategy
- Reduces API response time from ~500ms to <50ms
- Drastically reduces external API calls
####  Real-Time News Fetching  
- Uses **NewsAPI**
- Sorted by *freshness* (newest first)
####  Responsive Across All Devices  
- Desktop, Tablet and Mobile optimized
---
### 🛠️ Tech Stack
#### ***Frontend***
- React.js (Vite)
- Context API (Global Auth State)
- CSS3 Variables (Dynamic Theming)
- Axios
### ***Backend***
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- **Redis** (Upstash) for Caching
- CORS, Dotenv
---
### 🛠️ High-Level Architecture (HLA)
```bash
+---------------------+          +----------------------+
|   Client (Frontend) |          |   External World     |
|   (React.js App)    |          |   (NewsAPI.org)      |
|  [Browser/User UI]  |          |   [3rd Party Data]   |
+----------+----------+          +-----------+----------+
           |                                 ^
           | HTTP Request (JSON)             | API Call (Only on Miss)
           v                                 |
+--------------------------------------------+----------+
|              Server (Backend)                         |
|             (Node.js + Express)                       |
|                                                       |
|    [   Security Guard (Middleware)  ]                 |
|    [   Brain / Logic (Controllers)  ]                 |
+---------------------+--------------+------------------+
                      |              |
                      |              | Check / Save
       Mongoose Query |              |
                      v              v
           +-----------------+    +-----------------+
           |    Database     |    |      Cache      |
           | (MongoDB Atlas) |    | (Upstash Redis) |
           | [Users & Prefs] |    |  [News Data]    |
           +-----------------+    +-----------------+

```
### 🛠️ Low-Level Architecture (LLA)
```bash
INCOMING REQUEST (e.g., GET /api/news)
                  ||
                  \/
      +---------------------------+
      |      1. ROUTES            |  <-- "The Traffic Controller"
      |  (Checks URL: /news)      |
      +-----------+---------------+
                  |
                  v
      +---------------------------+
      |    2. MIDDLEWARE          |  <-- "The Security Guard"
      |  (Checks JWT Token)       |
      +-----------+---------------+
                  |
                  v
      +---------------------------+
      |    3. CONTROLLER          |  <-- "The Decision Maker"
      |  (Smart Fetch Logic)      |
      +-----+-------------+-------+
            |             |
   (Get User Prefs)   (Check Cache)
            |             |
            v             v
    +-------------+   +-------------+
    |  4. MONGODB |   |   5. REDIS  |
    | (User Model)|   | (Cache Hit?)|
    +-------------+   +------+------+
                             |
                    (No? Cache Miss)
                             |
                             v
                      +-------------+
                      |  6. AXIOS   |
                      | (NewsAPI)   |
                      +-------------+   
```
---
### ⚙️Installation & Setup Guide
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

# Redis - Make sure there are no spaces after the equal sign
UPSTASH_REDIS_REST_URL=[https://your-db-url.upstash.io](https://your-db-url.upstash.io)
UPSTASH_REDIS_REST_TOKEN=your_long_token_here
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
Your app will run on: 
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

👨‍💻 Author
**Nikhil Rajput**
[![GitHub](https://img.shields.io/badge/GitHub-nikhilr--r-black?logo=github)](https://github.com/nikhilr-r)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Nikhil%20Rajput-blue?logo=linkedin)](https://www.linkedin.com/in/nikhil-rajput-nr1906/) 
