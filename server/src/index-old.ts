import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import skuRoutes from './routes/skus';
import currencyRoutes from './routes/currencies';
import orderRoutes from './routes/orders';
import customerRoutes from './routes/customers';
import logisticsRoutes from './routes/logistics';
import forecastRoutes from './routes/forecasts';
import importRoutes from './routes/import';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/skus', skuRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/import', importRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'CornexConnect™ v2.6 API is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CornexConnect™ Server running on port ${PORT}`);
});

export default app;
