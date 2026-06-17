# 🎓 VidyaQuest — STEM Education Platform for Rural Students

A gamified, offline-capable STEM learning platform for students in Grades 6-12.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed ([download](https://nodejs.org))

### Steps

1. **Install dependencies**
   ```bash
   cd stem-rural-platform/backend
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open browser**  
   Go to: **http://localhost:3000**

---

## 🔑 Demo Login
- **Username:** `arjun`
- **Password:** `demo123`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎮 Gamified Learning | XP points, levels, badges, streaks |
| 📚 4 STEM Subjects | Math, Science, Technology, Engineering |
| 🌐 Multilingual | English, Hindi (हिंदी), Marathi (मराठी) |
| 📱 Mobile-First | Optimized for phones and tablets |
| 🏆 Leaderboard | Compete with other students |
| 🎖️ Badge System | 6 achievement badges to earn |
| 📶 Offline-Ready | HTML5/CSS works without internet |

## 🏗️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JS
- **Backend:** Node.js + Express.js
- **Database:** SQLite (via better-sqlite3)
- **Auth:** JWT + bcrypt

## 📁 Project Structure

```
stem-rural-platform/
├── backend/
│   ├── server.js        # Express server + API
│   └── package.json
├── frontend/
│   ├── index.html       # Single Page App
│   ├── css/main.css     # All styles
│   └── js/app.js        # Frontend logic
├── database/            # SQLite DB (auto-created)
└── README.md
```

## 📖 Subjects & Lessons

### 🔢 Mathematics
- Introduction to Algebra
- Linear Equations  
- Geometry Basics

### 🔬 Science
- Newton's Laws of Motion
- Photosynthesis
- Electricity Basics

### 💻 Technology
- Introduction to Coding
- Internet & Networks

### ⚙️ Engineering
- Design Thinking

## 🎮 Gamification System

- **XP Points** — Earn XP by completing lessons (30-150 XP each)
- **Levels** — Level up every 200 XP
- **Streaks** — Daily login streaks tracked with fire emoji 🔥
- **Badges** — 6 badges: First Step, Explorer, Scholar, Champion, STEM Star, Quiz Master
- **Leaderboard** — School-wide rankings by XP

---

*Built for rural India's students — because every child deserves world-class STEM education* 🌟
