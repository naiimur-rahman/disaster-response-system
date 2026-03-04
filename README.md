# 🌊 Disaster Response & Relief Coordination System

A **production-ready full-stack DBMS project** for coordinating disaster response: tracking disasters, managing shelters, matching volunteers, reuniting families, distributing resources, and tracking donations — powered by MySQL, Express.js, and real-time Socket.io.

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure login with bcryptjs password hashing, role-based access control (Admin, Coordinator, Volunteer, Viewer) |
| 🌊 **Disaster Management** | Track active disasters with type, severity, zones, real-time status, and CSV export |
| 🏠 **Shelter Management** | Manage shelter capacity with visual progress bars, nearest-shelter finder, and Leaflet.js map |
| 👥 **Victim Registry** | Register and track affected individuals with status monitoring and CSV export |
| ❤️ **Family Reunification** | Help families find missing loved ones with confetti celebration on reunion |
| 🙋 **Volunteer System** | Leaderboard, skill-based matching, deployment tracking |
| 📦 **Resource Inventory** | Stock tracking with low-stock alerts and distribution history |
| 💰 **Donation Transparency** | Full donation audit trail with verification status and CSV export |
| 🚁 **Rescue Operations** | Track field rescue operations with team leads and people rescued |
| 📞 **Emergency Contacts** | Directory of emergency services with service type filtering |
| 👤 **Donor Management** | Full donor profile management with donation history |
| 📊 **Live Dashboard** | Animated counters, Chart.js charts, real-time Socket.io updates |
| 📋 **Disaster Reports** | Comprehensive generated reports with stored procedure results |
| ✅ **Input Validation** | express-validator on all POST/PUT routes with 422 field-level errors |
| 🔄 **Pagination** | All list endpoints support `?page=1&limit=20` with total count |
| 📤 **File Upload** | Multer-based image/PDF uploads via `/api/upload` |
| 📧 **Email Alerts** | Nodemailer notifications for critical events (optional SMTP config) |
| 🗺️ **Map Integration** | Leaflet.js disaster/shelter location maps |
| 🐳 **Docker Support** | Dockerfile + docker-compose for full local deployment |
| ⚡ **CI/CD Pipeline** | GitHub Actions CI with lint + test on push/PR |
| 🔒 **Security Hardening** | Helmet.js, CORS config, stricter auth rate limiting |

---

## 🗃️ Tech Stack

| Layer | Technology |
|---|---|
| **Database** | MySQL 8.0+ |
| **Backend** | Node.js + Express.js |
| **Frontend** | Pure HTML5 + CSS3 + Vanilla JavaScript |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Real-time** | Socket.io |
| **Validation** | express-validator |
| **Charts** | Chart.js (CDN) |
| **Maps** | Leaflet.js (CDN) |
| **DB Driver** | mysql2 (with connection pooling) |
| **File Upload** | Multer |
| **Email** | Nodemailer |
| **Testing** | Jest + Supertest |
| **Security** | Helmet.js |
| **Logging** | Morgan |

---

## 📁 Project Structure

```
disaster-response-system/
├── LICENSE
├── README.md
├── .gitignore
├── .prettierrc
├── .editorconfig
├── .dockerignore
├── docker-compose.yml
├── .github/workflows/ci.yml
├── database/
│   ├── schema.sql          # 14 tables with constraints
│   ├── procedures.sql      # 4 stored procedures
│   ├── triggers.sql        # 5 triggers
│   ├── views.sql           # 4 views
│   └── seed_data.sql       # Bangladesh-context sample data
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── .eslintrc.json
│   ├── config/
│   │   ├── database.js
│   │   └── validateEnv.js
│   ├── middleware/
│   │   ├── auth.js          # JWT authenticate + authorize
│   │   ├── validate.js      # express-validator chains
│   │   ├── asyncHandler.js
│   │   ├── errorHandler.js
│   │   └── upload.js        # Multer config
│   ├── routes/
│   │   ├── auth.js          # login, register, /me
│   │   ├── disasters.js     # + DELETE, pagination, validation
│   │   ├── shelters.js      # + DELETE, pagination, validation
│   │   ├── victims.js       # + DELETE, pagination, validation
│   │   ├── familyLinks.js   # + DELETE, pagination, validation
│   │   ├── volunteers.js    # + DELETE, pagination, validation
│   │   ├── resources.js     # + DELETE, pagination, validation
│   │   ├── donations.js     # + DELETE, pagination, validation, CSV export
│   │   ├── rescueOperations.js
│   │   ├── emergencyContacts.js
│   │   ├── donors.js
│   │   └── dashboard.js
│   ├── services/
│   │   └── emailService.js
│   └── __tests__/
│       ├── auth.test.js
│       ├── disasters.test.js
│       └── shelters.test.js
├── frontend/
│   ├── index.html  login.html  disasters.html  shelters.html
│   ├── victims.html  family.html  volunteers.html  resources.html
│   ├── donations.html  reports.html  rescue.html  contacts.html
│   ├── css/ (style.css, responsive.css)
│   └── js/ (app.js, sidebar.js)
├── uploads/              # File upload storage (git-ignored)
└── docs/
    ├── api.md
    └── er-diagram.md
```

---

## 🗃️ Database Features

### Tables (14 total)
`disasters`, `affected_zones`, `shelters`, `victims`, `family_links`, `volunteers`, `resources`, `distributions`, `donors`, `donations`, `rescue_operations`, `emergency_contacts`, `audit_log`, `users`

### Stored Procedures
1. **`MatchVolunteers(disaster_id, skill)`** — Find available volunteers ranked with `DENSE_RANK()`
2. **`FindNearestShelter(lat, lon)`** — Haversine formula distance calculation
3. **`DisasterReport(disaster_id)`** — Multi-result-set comprehensive report
4. **`AllocateResources(resource_id, shelter_id, quantity, volunteer_id)`** — Transactional distribution

### Triggers
- Auto-update shelter status on capacity changes
- Low stock alert logged to audit_log
- Auto-deduct resources after distribution
- Audit trail on victims INSERT/UPDATE

### Views
- `live_dashboard`, `donation_transparency`, `volunteer_leaderboard`, `zone_urgency_report`

---

## 🚀 Setup Guide

### Prerequisites
- MySQL 8.0+ · Node.js 18+ · npm

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p disaster_response < database/procedures.sql
mysql -u root -p disaster_response < database/triggers.sql
mysql -u root -p disaster_response < database/views.sql
mysql -u root -p disaster_response < database/seed_data.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET
npm install
npm start
```

### 3. Open Application

```
http://localhost:3000/login.html
```

**Demo:** `admin` / `password123`

---

## 🐳 Docker Setup

```bash
# Create a .env file with:
# MYSQL_ROOT_PASSWORD=your_db_password
# JWT_SECRET=your_jwt_secret

docker-compose up --build
```

Application available at `http://localhost:3000`

---

## 🧪 Testing

```bash
cd backend
npm test          # Run all tests with coverage
```

Tests use Jest + Supertest with mocked database connections (no real MySQL required).

---

## 🔒 Security

- JWT tokens expire in 24 hours
- Passwords hashed with bcryptjs (salt rounds: 10)
- Helmet.js sets secure HTTP headers
- Auth endpoints rate-limited to 10 req/15min
- Input validated with express-validator on all write endpoints
- Environment variables validated on startup (fails fast if missing)

---

## 🎨 Design

- **Dark Glassmorphism** theme with `backdrop-filter: blur(20px)`
- **Animated counters** and staggered card animations
- **Pulse badges** for Active/Critical/Missing status
- **Confetti** on family reunification
- **Particles** background on login
- **Skeleton loading** screens
- **Responsive** for tablet and mobile
- **Real-time** Socket.io dashboard updates

---

*Built for CSE DBMS Lab Project Show*

