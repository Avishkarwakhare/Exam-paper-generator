# 🎓 ExamGenie - Advanced Exam Management System

A comprehensive full-stack examination management platform with role-based access control, automated grading, and AI-powered question generation.

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

---

## 🎯 Overview

**ExamGenie** is a production-ready, role-based examination management system designed for educational institutions. It supports three distinct user roles (Admin, Teacher, Student) with complete workflows for question bank management, exam creation, automated grading, and comprehensive analytics.

### What is ExamGenie Used For?

- **Educational Institutions**: Schools, colleges, and universities
- **Online Training Platforms**: Corporate training and certification
- **Assessment Centers**: Standardized testing environments
- **Remote Learning**: Distance education and e-learning platforms

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Bcrypt password hashing (12 rounds)
- Role-based access control (RBAC)
- Protected routes with auto-redirect
- Session management with token expiration

### 👨‍💼 Admin Dashboard
- **User Management**: Create, edit, delete users (Admin, Teacher, Student)
- **System Analytics**: Real-time statistics and metrics
- **Student Assignment**: Assign students to teachers
- **Access Control**: Activate/deactivate user accounts
- **Monitoring**: View question bank and exam statistics

### 👨‍🏫 Teacher Portal
- **Question Bank**: Create, edit, and organize questions
  - Multiple choice questions (4 options)
  - Subject, topic, and difficulty categorization
  - Mark allocation per question
- **Exam Creation**: Build exams with rule-based question selection
  - Define topics and difficulty levels
  - Set duration and total marks
  - Assign to specific students
- **Student Management**: View assigned students
- **Results Analytics**: 
  - Individual student performance
  - Class-wide statistics
  - Average, highest, and lowest scores
- **AI-Powered**: Generate questions using AI (Mistral 7B via OpenRouter)

### 👨‍🎓 Student Portal
- **Exam Access**: View all assigned exams
- **Exam Attempts**: 
  - Start exam with randomized questions
  - Timed exam interface
  - Submit answers for automatic grading
- **Results**: 
  - Instant score calculation
  - Detailed answer review
  - Performance history
- **Prevent Cheating**: One-time attempt per exam

### 🤖 Advanced Features
- **Auto-Grading**: Instant scoring on exam submission
- **Question Randomization**: Unique question sets per student
- **PDF Generation**: Export exam papers
- **Real-time Updates**: Hot Module Replacement (HMR)
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (React + Vite)            │
│                  Port: 8080                     │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Admin   │  │ Teacher  │  │ Student  │     │
│  │Dashboard │  │ Portal   │  │ Portal   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     Protected Routes + JWT Auth          │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────────┐
│          Backend (Express.js + Node.js)         │
│                  Port: 5000                     │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐  │
│  │   Auth Middleware (JWT Verification)     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐           │
│  │ Admin  │  │Teacher │  │Student │           │
│  │  API   │  │  API   │  │  API   │           │
│  │(9 eps) │  │(11 eps)│  │(5 eps) │           │
│  └────────┘  └────────┘  └────────┘           │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │     Business Logic & Controllers         │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────┐
│           MongoDB Database                      │
│             Port: 27017                         │
├─────────────────────────────────────────────────┤
│  Collections:                                   │
│  • users         (Admin, Teacher, Student)      │
│  • questions     (Question Bank)                │
│  • examtemplates (Exam Blueprints)              │
│  • attempts      (Student Submissions)          │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.30
- **State Management**: React Query (TanStack Query)
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 3.4
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 23.6
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password Hashing**: bcryptjs 3.0
- **Environment**: dotenv
- **CORS**: CORS middleware
- **PDF Generation**: PDFKit

### AI Integration
- **Model**: Mistral 7B Instruct
- **Provider**: OpenRouter API
- **Use Case**: Automated question generation

---

## 📁 Project Structure

### Main Files & Their Purpose

```
exam-genie/
│
├── 📂 backend/                      # Backend server
│   ├── 📂 src/
│   │   ├── 📂 config/
│   │   │   └── database.js          # MongoDB connection setup
│   │   │
│   │   ├── 📂 models/               # Database schemas
│   │   │   ├── User.js              # User model (Admin/Teacher/Student)
│   │   │   ├── Question.js          # Question bank model
│   │   │   ├── ExamTemplate.js      # Exam blueprint model
│   │   │   └── Attempt.js           # Student exam attempt model
│   │   │
│   │   ├── 📂 middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   │
│   │   ├── 📂 routes/               # API endpoints
│   │   │   ├── auth.routes.js       # Authentication (login/register)
│   │   │   ├── admin.routes.js      # Admin API (9 endpoints)
│   │   │   ├── teacher.routes.js    # Teacher API (11 endpoints)
│   │   │   ├── student.routes.js    # Student API (5 endpoints)
│   │   │   ├── ai.routes.js         # AI question generation
│   │   │   ├── exam.routes.js       # PDF generation
│   │   │   └── health.routes.js     # Health check
│   │   │
│   │   ├── 📂 scripts/
│   │   │   └── seed.js              # Database seeding script
│   │   │
│   │   ├── app.js                   # Express app configuration
│   │   └── server.js                # Server entry point
│   │
│   ├── .env                         # Environment variables (NOT in repo)
│   ├── .env.example                 # Environment template
│   └── package.json                 # Backend dependencies
│
├── 📂 src/                          # Frontend source
│   ├── 📂 components/
│   │   ├── ProtectedRoute.jsx       # Route protection component
│   │   ├── 📂 ui/                   # Reusable UI components (Radix)
│   │   └── 📂 exam/                 # Exam-related components
│   │       ├── ExamGenerator.jsx    # Exam creation form
│   │       ├── ExamPreview.jsx      # Exam preview display
│   │       └── AIQuestionGenerator.jsx  # AI question UI
│   │
│   ├── 📂 pages/                    # Page components
│   │   ├── Auth.jsx                 # Login/Signup page
│   │   ├── Home.jsx                 # Landing page
│   │   ├── 📂 dashboard/
│   │   │   ├── AdminDashboard.jsx   # Admin panel (complete)
│   │   │   ├── Dashboard.jsx        # Teacher panel (needs migration)
│   │   │   └── StudentDashboard.jsx # Student panel (needs migration)
│   │   └── ExamAttempt.jsx          # Exam taking interface
│   │
│   ├── 📂 lib/
│   │   ├── api.js                   # Axios instance + interceptors
│   │   └── apiService.js            # All API endpoints (25 methods)
│   │
│   ├── 📂 context/
│   │   └── QuestionBankContext.jsx  # Global state for questions
│   │
│   ├── App.jsx                      # Main app + routing
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles
│
├── vite.config.js                   # Vite configuration (port 8080)
├── tailwind.config.js               # Tailwind CSS config
├── package.json                     # Frontend dependencies
└── README.md                        # This file
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | MongoDB URI, JWT secret, API keys |
| `vite.config.js` | Frontend dev server (port 8080) |
| `backend/src/app.js` | Express middleware & route registration |
| `src/App.jsx` | Frontend routing & protected routes |
| `src/lib/apiService.js` | Centralized API calls (25 endpoints) |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ (v23.6.1 recommended)
- MongoDB 5+ (local or Atlas)
- Git
- npm or yarn

### Step 1: Clone Repository
```bash
git clone https://github.com/AllenLenoy/examgenerator.git
cd examgenerator
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ..  # Back to root
npm install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/exam-genie
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam-genie

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=24h

# Server
PORT=5000
NODE_ENV=development

# AI API (Optional - for question generation)
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Frontend Configuration

Frontend uses Vite with port **8080** (configured in `vite.config.js`).

---

## 🎮 Usage

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
# In project root
npm run dev
```
Frontend runs on `http://localhost:8080`

### Create First Admin User

**Option A: Seed Database**
```bash
cd backend
node src/scripts/seed.js
```
Creates test users and sample questions.

**Option B: Register via UI**
1. Go to `http://localhost:8080/auth`
2. Click "Sign Up"
3. Create admin account
4. Login and start using the system

### Default Seed Credentials

If you ran the seed script:
- **Admin**: admin@examgenie.com / admin123
- **Teacher**: teacher@examgenie.com / teacher123
- **Student**: student@examgenie.com / student123

---

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register      # Create new user
POST   /api/auth/login         # Login (returns JWT token)
GET    /api/auth/me            # Get current user
POST   /api/auth/logout        # Logout (client-side)
```

### Admin Endpoints (Requires admin role)

```
GET    /api/admin/dashboard           # System statistics
GET    /api/admin/users               # List all users
POST   /api/admin/users               # Create user
PUT    /api/admin/users/:id           # Update user
DELETE /api/admin/users/:id           # Soft delete user
POST   /api/admin/users/:id/toggle-status  # Activate/deactivate
POST   /api/admin/assign-students     # Assign students to teacher
GET    /api/admin/questions/stats     # Question bank stats
GET    /api/admin/exams/stats         # Exam stats
```

### Teacher Endpoints (Requires teacher role)

```
GET    /api/teacher/questions         # View own questions
POST   /api/teacher/questions         # Create question
PUT    /api/teacher/questions/:id     # Update question
DELETE /api/teacher/questions/:id     # Delete question
GET    /api/teacher/exams             # View own exams
POST   /api/teacher/exams             # Create exam
PUT    /api/teacher/exams/:id         # Update exam
DELETE /api/teacher/exams/:id         # Delete exam
GET    /api/teacher/students          # View assigned students
GET    /api/teacher/results           # All results
GET    /api/teacher/results/:examId   # Specific exam results
```

### Student Endpoints (Requires student role)

```
GET    /api/student/exams                    # Assigned exams
GET    /api/student/attempts                 # Attempt history
GET    /api/student/attempts/:attemptId     # Specific attempt
POST   /api/student/attempts/:examId/start  # Start exam
POST   /api/student/attempts/:attemptId/submit  # Submit answers
```

---

## 🔮 Future Enhancements

### Planned Features

#### 🎯 Phase 1 (Q1 2025)
- [ ] **Email Verification**: Send verification emails on signup
- [ ] **Password Reset**: Forgot password flow
- [ ] **User Profile**: Edit profile, change password
- [ ] **Student Assignment UI**: Admin interface for assigning students
- [ ] **User Edit Modal**: Edit existing users in admin panel
- [ ] **Export Results**: CSV/Excel export for analytics
- [ ] **Dark Mode**: Theme switcher

#### 🚀 Phase 2 (Q2 2025)
- [ ] **Advanced Analytics**: Charts, graphs, trend analysis
- [ ] **Exam Scheduling**: Schedule exams for future dates
- [ ] **Timed Exams**: Auto-submit on time expiry
- [ ] **Question Pool**: Share questions between teachers
- [ ] **Multi-language Support**: i18n implementation
- [ ] **File Uploads**: Support image questions
- [ ] **Notifications**: Real-time alerts for assignments

#### 💎 Phase 3 (Q3 2025)
- [ ] **Video Proctoring**: AI-based exam monitoring
- [ ] **Plagiarism Detection**: Answer similarity checking
- [ ] **Mobile App**: React Native companion app
- [ ] **LMS Integration**: Moodle, Canvas integration
- [ ] **Advanced Question Types**: Essay, fill-in-blank, matching
- [ ] **Adaptive Testing**: Difficulty adjusts based on performance
- [ ] **Blockchain Certificates**: Immutable exam certificates

### Upcoming Capabilities

| Feature | Description | Priority |
|---------|-------------|----------|
| **Real-time Collaboration** | Multiple teachers co-create exams | Medium |
| **Gamification** | Badges, leaderboards for students | Low |
| **Offline Mode** | PWA with offline capabilities | High |
| **Question Versioning** | Track question edit history | Medium |
| **Bulk Import** | Import questions from CSV/Excel | High |
| **Custom Themes** | Institutional branding | Low |
| **API Webhooks** | Integration with external systems | Medium |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Allen Lenoy**
- GitHub: [@AllenLenoy](https://github.com/AllenLenoy)
- Repository: [examgenerator](https://github.com/AllenLenoy/examgenerator)

---

## 🙏 Acknowledgments

- React Team for amazing framework
- MongoDB for flexible database
- OpenRouter for AI API access
- Radix UI for accessible components
- Tailwind CSS for utility-first styling

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoints above

---

**Built with ❤️ using MERN Stack**
