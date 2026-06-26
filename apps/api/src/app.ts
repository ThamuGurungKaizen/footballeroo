import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { generalLimiter } from './middleware/rate-limiter';
import { healthRouter } from './routes/health';
import { fixturesRouter } from './routes/fixtures';
import { menuRouter } from './routes/menu';
import { ordersRouter } from './routes/orders';
import { profileRouter } from './routes/profile';
import { voiceRouter } from './routes/voice';
import { adminRouter } from './routes/admin';
import { simulateRouter } from './routes/simulate';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

// --- Routes ---
app.use('/api', healthRouter);
app.use('/api/fixtures', fixturesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/profile', profileRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/admin', adminRouter);
app.use('/api/simulate', simulateRouter);

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
