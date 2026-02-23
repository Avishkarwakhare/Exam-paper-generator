import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import questionRoutes from "./routes/question.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import examRoutes from "./routes/exam.routes.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Exam Generator API is running' });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exams", examRoutes);

// 404 Handler - must be after all routes
app.use(notFoundHandler);

// Error Handler - must be last
app.use(errorHandler);

export default app;
