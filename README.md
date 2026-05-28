# 🎫 TicketPro — Full-Stack Ticketing System

A complete IT Support Ticketing System built with **Spring Boot (Java)** + **Next.js (React)** + **PostgreSQL** + **Bootstrap 5**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database | PostgreSQL |
| Frontend | Next.js 14, React 18, Bootstrap 5, Bootstrap Icons |
| Auth | JWT (Access + Refresh Token) |

---

## ✅ Features Implemented

### Authentication & Authorization
- ✅ Login / Register / Logout
- ✅ JWT-based stateless auth
- ✅ Role-based access: **USER**, **SUPPORT_AGENT**, **ADMIN**

### User Dashboard
- ✅ Raise tickets with subject, description, priority
- ✅ View own ticket list with filters
- ✅ Add comments to tickets
- ✅ See ticket status (Open → In Progress → Resolved → Closed)
- ✅ View ticket history with comments

### Ticket Management
- ✅ Full ticket lifecycle management
- ✅ Assign tickets to agents
- ✅ Comment thread with timestamps and user info
- ✅ Priority: LOW, MEDIUM, HIGH, URGENT
- ✅ File attachments (upload/download)

### Admin Panel
- ✅ User management (add, edit, deactivate)
- ✅ Assign roles (Admin, Support Agent, User)
- ✅ View all tickets
- ✅ Quick assign and status change

### Good-to-Have Features
- ✅ Search & Filter (subject, status, priority)
- ✅ Ticket Prioritization
- ✅ File Attachments (secure upload/download)
- ✅ Rate Ticket Resolution (1-5 stars + feedback)
- ✅ Dashboard stats cards
- ✅ Responsive design (mobile-friendly)

---

## 🛠 Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

---

### 1️⃣ Database Setup

```sql
-- Open psql or pgAdmin and run:
CREATE DATABASE ticketing_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE ticketing_db TO postgres;
```

---

### 2️⃣ Backend Setup

```bash
cd ticketing-system/backend

# Configure database in:
# src/main/resources/application.properties
# Change these if needed:
# spring.datasource.username=postgres
# spring.datasource.password=postgres

# Build and run
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**

✅ Demo data is auto-seeded on first run!

---

### 3️⃣ Frontend Setup

```bash
cd ticketing-system/frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Run development server
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo.com | admin123 |
| **Support Agent** | agent@demo.com | agent123 |
| **User** | user@demo.com | user123 |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login
GET  /api/auth/me          - Get current user
```

### Tickets
```
GET    /api/tickets           - Get tickets (filtered)
POST   /api/tickets           - Create ticket
GET    /api/tickets/{id}      - Get ticket by ID
PUT    /api/tickets/{id}      - Update ticket
POST   /api/tickets/{id}/assign    - Assign to agent
POST   /api/tickets/{id}/comments  - Add comment
POST   /api/tickets/{id}/rate      - Rate resolution
POST   /api/tickets/{id}/attachments       - Upload file
GET    /api/tickets/{id}/attachments/{aid} - Download file
GET    /api/tickets/stats          - Dashboard stats
```

### Admin
```
GET    /api/admin/users       - Get all users
POST   /api/admin/users       - Create user
PUT    /api/admin/users/{id}  - Update user
DELETE /api/admin/users/{id}  - Deactivate user
GET    /api/admin/agents      - Get all agents
```

---

## 📁 Project Structure

```
ticketing-system/
├── backend/
│   ├── src/main/java/com/ticketing/
│   │   ├── config/          # Security, CORS, DataSeeder
│   │   ├── controller/      # REST Controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA Entities
│   │   ├── enums/           # Role, Status, Priority
│   │   ├── exception/       # Custom exceptions + handler
│   │   ├── repository/      # JPA Repositories
│   │   ├── security/        # JWT Filter & Service
│   │   └── service/         # Business Logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    ├── pages/
    │   ├── index.js          # Redirect page
    │   ├── login.js          # Login page
    │   ├── register.js       # Register page
    │   ├── dashboard.js      # Dashboard with stats
    │   ├── profile.js        # User profile
    │   ├── tickets/
    │   │   ├── index.js      # Ticket list
    │   │   ├── new.js        # Create ticket
    │   │   └── [id].js       # Ticket detail
    │   └── admin/
    │       ├── users.js      # User management
    │       └── tickets.js    # All tickets (admin)
    ├── components/
    │   ├── Layout.js         # Main layout wrapper
    │   ├── Sidebar.js        # Navigation sidebar
    │   └── Badges.js         # Status/Priority badges
    ├── context/
    │   └── AuthContext.js    # Auth state management
    ├── utils/
    │   └── api.js            # Axios API client
    └── styles/
        └── globals.css       # Custom styles
```

---

## 🎨 UI Pages

| Page | Path | Role |
|------|------|------|
| Login | /login | All |
| Register | /register | All |
| Dashboard | /dashboard | All |
| Ticket List | /tickets | All |
| New Ticket | /tickets/new | User |
| Ticket Detail | /tickets/:id | All |
| Admin Users | /admin/users | Admin |
| Admin Tickets | /admin/tickets | Admin |
| Profile | /profile | All |

---

## 🔐 Role Permissions

| Action | USER | SUPPORT_AGENT | ADMIN |
|--------|------|---------------|-------|
| Create ticket | ✅ | ❌ | ❌ |
| View own tickets | ✅ | — | — |
| View all tickets | ❌ | ✅ (assigned) | ✅ |
| Add comments | ✅ | ✅ | ✅ |
| Change status | ❌ | ✅ | ✅ |
| Assign tickets | ❌ | ❌ | ✅ |
| Rate resolution | ✅ | ❌ | ❌ |
| Manage users | ❌ | ❌ | ✅ |

---

## 📧 Email Notifications (Optional)

To enable email notifications, update `application.properties`:
```properties
spring.mail.username=your-gmail@gmail.com
spring.mail.password=your-app-password
```

Generate Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords

---

Built with ❤️ for the LeapScholar Assignment
