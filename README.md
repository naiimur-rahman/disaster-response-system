# 🌊 Disaster Response & Relief Coordination System

A **complete full-stack DBMS project** built for a CSE Project Show. This system coordinates disaster response: tracking disasters, managing shelters, matching volunteers, reuniting families, distributing resources, and tracking donations — all powered by advanced SQL.

---

## 🎯 Features

| Feature | Description |
|---|---|
| 🌊 **Disaster Management** | Track active disasters with type, severity, zones, and real-time status |
| 🏠 **Shelter Management** | Manage shelter capacity with visual progress bars and nearest-shelter finder |
| 👥 **Victim Registry** | Register and track affected individuals with status monitoring |
| ❤️ **Family Reunification** | Help families find missing loved ones with confetti celebration on reunion |
| 🙋 **Volunteer System** | Leaderboard, skill-based matching, deployment tracking |
| 📦 **Resource Inventory** | Stock tracking with low-stock alerts and distribution history |
| 💰 **Donation Transparency** | Full donation audit trail with verification status |
| 📊 **Live Dashboard** | Animated counters, Chart.js charts, live activity feed |
| 📋 **Disaster Reports** | Comprehensive generated reports with charts |
| �� **User Authentication** | Role-based access (Admin, Coordinator, Volunteer, Viewer) |

---

## 🗃️ Tech Stack

| Layer | Technology |
|---|---|
| **Database** | MySQL 8.0+ |
| **Backend** | Node.js + Express.js |
| **Frontend** | Pure HTML5 + CSS3 + Vanilla JavaScript |
| **Charts** | Chart.js (CDN) |
| **DB Driver** | mysql2 (with connection pooling) |
| **Auth** | bcryptjs |

---

## 📁 Project Structure

```
disaster-response-system/
├── README.md
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
│   ├── config/database.js
│   └── routes/
│       ├── disasters.js
│       ├── shelters.js
│       ├── victims.js
│       ├── familyLinks.js
│       ├── volunteers.js
│       ├── resources.js
│       ├── donations.js
│       └── dashboard.js
├── frontend/
│   ├── index.html login.html disasters.html shelters.html
│   ├── victims.html family.html volunteers.html resources.html
│   ├── donations.html reports.html
│   ├── css/ (style.css, responsive.css)
│   └── js/ (app.js, sidebar.js)
└── docs/er-diagram.md
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
# Edit .env with your MySQL credentials
npm install
npm start
```

### 3. Open Application

```
http://localhost:3000/login.html
```

**Demo:** `admin` / `password123`

---

## 🎨 Design

- **Dark Glassmorphism** theme with `backdrop-filter: blur(20px)`
- **Animated counters** and staggered card animations
- **Pulse badges** for Active/Critical/Missing status
- **Confetti** on family reunification
- **Particles** background on login
- **Skeleton loading** screens
- **Responsive** for tablet and mobile

---

*Built for CSE DBMS Lab Project Show*
