# FinanceAI — Full-Stack Finance Analytics App

## Stack
- Frontend: React 18 + Tailwind CSS + Framer Motion + Recharts
- Backend: Node.js + Express.js
- Database: MongoDB
- Auth: JWT

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Install & seed backend
```bash
cd server
npm install
npm run seed        # Seeds demo user + 12 months of transactions
npm run dev         # Starts on http://localhost:5000
```

### 2. Start frontend
```bash
cd client
npm install         # (if not already done)
npm start           # Starts on http://localhost:3000
```

### Demo Credentials
- Email: `demo@financeapp.com`
- Password: `demo1234`

## Features
- JWT auth (signup/login/logout)
- Dashboard with animated stat cards + AI insights
- Analytics: descriptive, diagnostic, predictive, behavioral
- Financial health score (0–100)
- Transactions CRUD with filters + CSV export
- Spending heatmap, pie/bar/area charts
- Apple iOS-inspired glassmorphism dark UI
- Framer Motion animations throughout
- Profile & Settings pages with iOS-style drill-down

## Project Structure
```
finance-app/
├── server/
│   ├── controllers/   (auth, transactions, analytics)
│   ├── models/        (User, Transaction)
│   ├── routes/        (auth, transactions, analytics)
│   ├── middleware/    (auth, errorHandler)
│   ├── seed.js
│   └── index.js
└── client/
    └── src/
        ├── api/
        ├── components/ (layout, ui, charts)
        ├── context/
        ├── pages/
        └── utils/
```
