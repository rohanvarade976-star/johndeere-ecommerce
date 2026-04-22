# 🌿 John Deere E-Commerce Parts Diagram System
### Version 4.0 — Complete Final Project

> **Academic Project** | ThoughtWorks Technologies India Pvt Ltd × MITAOE  
> Software Engineering (SPPU) | Agile/Scrum | 2025–2026

---

## 📋 Project Overview

A full-stack e-commerce web application enabling farmers, dealers and technicians to:
- Browse **real John Deere equipment models** with official tractor photographs
- View **interactive clickable parts diagrams** with glowing hotspot overlays
- **Click any hotspot** to instantly identify parts — name, number, price, stock
- **Purchase online** with cart, 3-step checkout, multiple payment options
- **Track orders** with visual timeline and progress bar
- **Google Sign-In** for one-click authentication
- **Review and rate** purchased parts with verified purchase badges
- **Download invoice** after every order
- **Admin panel** with revenue charts, stock alerts, order management

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, Framer Motion, Recharts, @react-oauth/google |
| Backend | Node.js 18, Express.js |
| Database | MySQL 8.0 (15 tables, 45 parts including 8R Series) |
| Auth | JWT + Google OAuth 2.0 |
| Design System | Custom John Deere Brand CSS (Inter font, dark mode) |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet.js, bcryptjs, express-rate-limit, parameterized queries |

---

## 🚀 Quick Setup — Windows PowerShell

### Option A: Automated (Recommended)
```powershell
.\setup_windows.ps1
```

### Option B: Manual Step-by-Step

**Step 1 — Database**
```powershell
Get-Content database\schema.sql | mysql -u root -p
```

**Step 2 — Backend**
```powershell
cd backend
Copy-Item .env.example .env
# Edit .env — set DB_PASSWORD to your MySQL password
npm install
npm run dev
# Should show: ✅ MySQL connected | 🚀 API at http://localhost:5000
```

**Step 3 — Frontend** (new terminal)
```powershell
cd frontend
Copy-Item .env.example .env
# Optional: Add REACT_APP_GOOGLE_CLIENT_ID for Google Sign-In
npm install
npm start
# Opens http://localhost:3000 automatically
```

---

## 🔑 Demo Accounts

| Email | Password | Role |
|---|---|---|
| admin@johndeere-parts.com | Password@123 | Admin |
| customer@example.com | Password@123 | Customer |
| dealer@johndeere-parts.com | Password@123 | Dealer |

*Or register a new account / use Google Sign-In*

---

## 🔐 Google Sign-In Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add `http://localhost:3000` to Authorized JavaScript Origins
5. Copy Client ID to both `.env` files:
   - `backend/.env` → `GOOGLE_CLIENT_ID=your_id_here`
   - `frontend/.env` → `REACT_APP_GOOGLE_CLIENT_ID=your_id_here`

---

## 📦 Equipment & Parts Database

### Equipment Models (8 models)
| Model | Series | HP | Region |
|---|---|---|---|
| 5075E | 5E Series | 75 HP | Asia Pacific |
| 5050D | 5D Series | 50 HP | Asia Pacific |
| 6120B | 6B Series | 120 HP | Asia Pacific |
| W70 Combine | W Series | 225 HP | Asia Pacific |
| S660 Combine | S Series | 330 HP | North America |
| R4038 Sprayer | R Series | 275 HP | Europe |
| **8R 230** | **8R Series** | **230 HP** | North America |
| **8R 410** | **8R Series** | **410 HP** | North America |

### Parts Catalog (45 parts)
- **15 parts** — 5E/5D/6B Series (India tractors)
- **30 parts** — 8R Series (from Official Parts Guide TR150428, Pub: 15/04/2025)
  - Required Parts (filters, oils)
  - Wear Parts (alternators, pumps, sensors)
  - Oil & Capacities reference data

---

## ✨ Complete Feature List

### Customer Features
- 🔍 Visual part identification via interactive diagrams with hotspot click
- 🛒 Shopping cart with GST (18%) and free shipping above ₹5000
- 💳 Multi-payment checkout: UPI, Credit Card, Debit Card, Net Banking, COD
- 📦 Order tracking with 6-stage visual progress bar
- 📄 Invoice download (text format) after every order
- ❤️ Wishlist / Save for later with heart icon toggle
- ⭐ Reviews and ratings (1-5 stars) with Verified Purchase badge
- 🔍 Search by part name, number, description
- 🔽 Sort by: Most Popular, Price ↑/↓, Rating, Newest
- 🔔 Notification system with bell icon
- 🌙 Dark mode (auto-detects system preference)
- 📱 Fully mobile responsive on all screen sizes

### Auth Features
- 📧 Email/password registration with OTP verification
- **🔐 Google Sign-In (OAuth 2.0)** — one-click login
- 🔒 JWT session (7-day expiry, auto-refresh)
- 🛡️ Role-based access: Customer / Dealer / Admin

### Admin Panel
- 📊 Revenue chart (Recharts bar chart, 6-month history)
- 📈 KPI cards: Orders, Revenue, Parts, Customers
- ⚠️ Low stock alerts with part number and count
- 🏆 Top selling parts table
- 📦 Order management with status dropdown (7 statuses)
- ⚙️ Parts CRUD with image upload
- 🚜 Equipment model management
- 👥 User management with suspend/activate
- 📥 Export parts catalog to CSV

---

## 📁 Project Structure

```
johndeere-ecommerce/
├── 📁 database/
│   └── schema.sql          ← 15 tables + 45 parts seed data
├── 📁 backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/db.js
│       ├── middleware/auth.js
│       ├── utils/email.js
│       ├── controllers/
│       │   ├── authController.js     ← JWT + Google OAuth
│       │   ├── equipmentController.js
│       │   ├── partsController.js
│       │   └── orderController.js    ← Cart + Orders + Admin
│       └── routes/index.js           ← 35+ API endpoints
├── 📁 frontend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── index.js                  ← GoogleOAuthProvider wrapper
│       ├── styles/globals.css        ← JD Brand Design System
│       ├── utils/api.js              ← All Axios API calls
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── CartContext.js
│       ├── components/
│       │   ├── common/Navbar.js      ← Search overlay, cart badge, user menu
│       │   ├── common/Footer.js
│       │   ├── auth/GoogleButton.js  ← Google Sign-In component
│       │   ├── ui/SmartImage.js      ← 3-layer image fallback
│       │   ├── ui/StarRating.js
│       │   └── ui/Skeleton.js
│       └── pages/ (16 pages)
│           ├── HomePage.js           ← Hero + featured equipment + parts
│           ├── LoginPage.js          ← Email + Google Sign-In
│           ├── RegisterPage.js       ← Email + Google + role selection
│           ├── VerifyPage.js         ← OTP verification
│           ├── EquipmentPage.js      ← Equipment catalog + filters
│           ├── DiagramPage.js        ← Interactive hotspot diagram viewer
│           ├── PartsPage.js          ← Parts catalog + sort + filter
│           ├── PartDetailPage.js     ← Reviews, ratings, related parts
│           ├── CartPage.js           ← Cart with GST + shipping
│           ├── CheckoutPage.js       ← 3-step animated checkout
│           ├── OrdersPage.js         ← Order history + cancel
│           ├── OrderDetailPage.js    ← Timeline + progress + invoice
│           ├── WishlistPage.js       ← Saved parts
│           ├── ProfilePage.js        ← User profile editor
│           ├── AdminPage.js          ← Full admin panel
│           └── NotFoundPage.js
└── setup_windows.ps1       ← One-click Windows setup

```

---

## 👥 Project Team — MITAOE

| Student ID | Name | UML Diagrams |
|---|---|---|
| 202301040024 | Sakshi Patil | Profile Diagram, State Machine Diagram |
| 202301040025 | Srushti Kapase | Component Diagram, Package Diagram |
| 202301040131 | Sujal Sonawane | Sequence Diagram, Timing Diagram |
| 202301040132 | Rohan Varade | Activity Diagram, Communication Diagram |
| 202301040236 | Saqlain Momin | Class Diagram, Object Diagram |
| 202402040028 | Saishwari Korade | Use Case Diagram, Interaction Overview |

**Industry Mentor:** Sanika Powar, Software Engineer  
ThoughtWorks Technologies India Pvt Ltd | sanika.powar@thoughtworks.com

---

## 📐 SDLC — Agile/Scrum (6 Sprints × 2 Weeks)

| Sprint | Deliverable |
|---|---|
| 1 | SRS, Architecture, DB Schema, JWT + Google OAuth, OTP |
| 2 | Equipment Catalog, Diagram Upload, Admin Panel Base |
| 3 | Interactive Diagram Viewer with Hotspot System |
| 4 | Parts Catalog, Search, Reviews, Wishlist |
| 5 | Cart, 3-Step Checkout, Order Placement, Payments |
| 6 | Order Tracking, Invoice, Admin Dashboard, 8R Parts, Testing |

---

## 📊 Cost Estimation (COCOMO II)
- UFP: 372 → AFP: 402 → **SLOC: 18,894**
- Effort: **38.2 person-months**
- Duration: 3 months (compressed, 6-member team)
- **Total Cost: ₹8,25,000**

---

*Reference: 8R Series parts data sourced from John Deere Replacement Parts Guide (TR150428), Publish Date: 15/04/2025*
