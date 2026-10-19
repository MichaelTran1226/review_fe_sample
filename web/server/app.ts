import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import leadsRoutes from './routes/leads.routes';
import supportingRoutes from './routes/supporting.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount versioned REST API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadsRoutes);
app.use('/api/v1', supportingRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
