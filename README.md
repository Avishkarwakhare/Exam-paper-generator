# 🎓 ExamGenie - Advanced Exam Management System

A comprehensive full-stack examination management platform with role-based access control, automated grading, AI-powered question generation, and **exam assignment workflow**.

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

## ✨ **NEW:** Complete Exam Assignment System

✅ Teachers can assign exams to students  
✅ Students take exams with real-time interface  
✅ Automatic scoring and instant results  
✅ Full exam lifecycle management  

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Status](#project-status)
- [Contributing](#contributing)

---

## 🎯 Overview

**ExamGenie** is a production-ready, role-based examination management system designed for educational institutions. It supports three distinct user roles (Admin, Teacher, Student) with complete workflows for question bank management, exam creation, **exam assignment**, automated grading, and comprehensive analytics.

### What's New in v2.0

🎉 **Complete Assignment Workflow**
- Teachers assign exams to specific students
- Students view assigned exams in real-time
- Exam attempt page with progress tracking
- Instant scoring and results display
- Assignment history and analytics

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
- **🆕 Exam Assignment**: 
  - Assign exams to specific students
  - Dialog-based assignment interface
  - Track assignment status
- **Student Management**: View assigned students with actions
- **Results Analytics**: 
  - Individual student performance
  - Class-wide statistics
  - Average, highest, and lowest scores
- **AI-Powered**: Generate questions using AI (Mistral 7B via OpenRouter)

### 👨‍🎓 Student Portal
- **🆕 Assigned Exams Dashboard**: View all assigned exams in real-time
- **🆕 Exam Attempt Interface**: 
  - Clean, modern exam-taking interface
  - Progress bar showing answered questions
  - No timer (take as long as needed)
  - Radio button selection for answers
  - One-click submission
- **🆕 Instant Results**: 
  - Score, percentage, and breakdown
  - Correct answers count
  - Results saved in My Results section
- **Results History**: View all completed exam results
- **One-time Attempts**: Prevent re-taking exams

### 🤖 Advanced Features
- **Auto-Grading**: Instant scoring on exam submission
- **Question Randomization**: Unique question sets per student
- **Assignment System**: Complete lifecycle from assignment to results
- **Real-time Updates**: Hot Module Replacement (HMR)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Codebase**: Recently cleaned up (~500 lines of dead code removed)

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
│  🆕 Assignment Features:                        │
│  • AssignTestDialog (Teacher)                   │
│  • ExamAttemptPage (Student)                    │
│  • My Results (Student)                         │
└──────────────────┬──────────────────────────────┘
                   │ REST API  
┌──────────────────▼──────────────────────────────┐
│          Backend (Express.js + Node.js)         │
│                  Port: 5000                     │
├─────────────────────────────────────────────────┤
│  🆕 Assignment Routes:                          │
│  • POST /api/teacher/assignments               │
│  • GET  /api/student/assignments               │
│  • POST /api/student/assignments/:id/start     │
│  • POST /api/student/assignments/:id/submit    │
│  • GET  /api/student/assignments/:id/result    │
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
│  • assignments   🆕 (Assigned Exams)            │
│  • attempts      (Student Submissions)          │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Routing**: React Router DOM 6.30
- **State Management**: React Hooks + Context API
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **HTTP Client**: Fetch API with JWT auth

### Backend
- **Runtime**: Node.js 23.6
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Password Hashing**: bcryptjs 3.0
- **Environment**: dotenv
- **CORS**: CORS middleware

### AI Integration
- **Model**: Mistral 7B Instruct
- **Provider**: OpenRouter API
- **Use Case**: Automated question generation

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ (v23.6.1 recommended)
- MongoDB 5+ (local or Atlas)
- Git
- npm or yarn

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/AllenLenoy/examgenerator.git
cd examgenerator
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Configure Backend Environment**
Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/exam-genie
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
OPENROUTER_API_KEY=your-openrouter-api-key  # Optional
```

4. **Install Frontend Dependencies**
```bash
cd ..  # Back to root
npm install
```

5. **Start Development Servers**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
# In project root
npm run dev
```
✅ Frontend runs on `http://localhost:8080`

6. **Access the Application**
Navigate to `http://localhost:8080`

---

## 🎮 Usage

### First Time Setup

#### Option A: Seed Database (Recommended)
```bash
cd backend
node src/scripts/seed.js
```
Creates test users and sample questions.

**Default Credentials:**
- **Admin**: admin@examgenie.com / admin123
- **Teacher**: teacher@examgenie.com / teacher123
- **Student**: student@examgenie.com / student123

#### Option B: Manual Registration
1. Go to `http://localhost:8080/auth`
2. Click \"Sign Up\"
3. Create accounts for each role

### Typical Workflow

1. **Admin Login**
   - Assign students to teachers
   - Monitor system statistics

2. **Teacher Login**
   - Create questions in Question Bank
   - Generate exam using AI or manual selection
   - Finalize exam template
   - Go to \"My Students\"
   - Click \"Assign Test\" next to a student
   - Select exam and assign

3. **Student Login**
   - View assigned exams in dashboard
   - Click \"Start Exam\"
   - Answer questions
   - Submit exam
   - View instant results
   - Check \"My Results\" for history

---

## 📡 API Documentation

### 🆕 Assignment Endpoints

**Teacher Assignment Routes:**
```
POST   /api/teacher/assignments        # Assign exam to student(s)
GET    /api/teacher/assignments        # View all assignments created
```

**Student Assignment Routes:**
```
GET    /api/student/assignments                # Get all assigned exams
POST   /api/student/assignments/:id/start      # Start exam attempt
POST   /api/student/assignments/:id/submit     # Submit answers
GET    /api/student/assignments/:id/result     # View results
```

### Authentication Endpoints
```
POST   /api/auth/register      # Create new user
POST   /api/auth/login         # Login (returns JWT token)
GET    /api/auth/me            # Get current user
PUT    /api/auth/profile       # Update user profile
```

### Admin Endpoints
```
GET    /api/admin/dashboard           # System statistics
GET    /api/admin/users               # List all users
POST   /api/admin/users               # Create user
PUT    /api/admin/users/:id           # Update user
DELETE /api/admin/users/:id           # Delete user
POST   /api/admin/assign-students     # Assign students to teacher
```

### Teacher Endpoints
```
GET    /api/teacher/questions         # View own questions
POST   /api/teacher/questions         # Create question
PUT    /api/teacher/questions/:id     # Update question
DELETE /api/teacher/questions/:id     # Delete question
GET    /api/teacher/exams             # View own exams
POST   /api/teacher/exams             # Create exam
GET    /api/teacher/students          # View assigned students
POST   /api/ai/generate-questions     # AI question generation
```

---

## 📊 Project Status

### ✅ Completed Features

- [x] User authentication (JWT)
- [x] Role-based access control
- [x] Admin dashboard with user management
- [x] Teacher question bank CRUD
- [x] AI-powered question generation
- [x] Exam template creation
- [x] **Exam assignment system** 🆕
- [x] **Student exam attempt interface** 🆕
- [x] **Instant auto-grading** 🆕
- [x] **Results tracking** 🆕
- [x] Clean, organized codebase

### 🔄 In Progress

- [ ] Timed exams (timer currently removed)
- [ ] Bulk student assignment
- [ ] Enhanced analytics dashboard

### 📋 Planned Features

#### High Priority
- [ ] Email notifications for assignments
- [ ] Exam scheduling with deadlines
- [ ] Export results to CSV/Excel
- [ ] Question review after exam
- [ ] Partial progress saving

#### Medium Priority
- [ ] Dark mode
- [ ] Advanced search/filters
- [ ] Bulk question import
- [ ] User profile editing
- [ ] Password reset flow

#### Future Enhancements
- [ ] Video proctoring
- [ ] Mobile app (React Native)
- [ ] Question versioning
- [ ] Collaborative exam creation
- [ ] Integration with LMS platforms

---

## 🧹 Recent Updates

### Version 2.0 (December 2024)

**✅ Major Features Added:**
- Complete exam assignment workflow
- Student exam attempt interface
- Instant results and scoring
- Assignment history tracking

**✅ Code Cleanup:**
- Removed ~500 lines of dead code
- Deleted obsolete in-memory database files
- Removed duplicate components
- Organized file structure

**✅ Bug Fixes:**
- Fixed navigation routing
- Resolved import errors
- Improved error handling

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Avishkar Wakhare**
- GitHub: [@Avishkarwakhare](https://github.com/Avishkarwakhare)
- Repository: [Exam-paper-generator](https://github.com/Avishkarwakhare/Exam-paper-generator)

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using MERN Stack + Shadcn UI**
