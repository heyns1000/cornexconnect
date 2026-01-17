import { Router, Request, Response } from 'express';
import { db } from '../db';
import { forecasts } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all forecasts
router.get('/', async (req: Request, res: Response) => {
  try {
    const allForecasts = await db.select().from(forecasts);
    res.json(allForecasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

// Get forecasts for a specific SKU
router.get('/sku/:skuId', async (req: Request, res: Response) => {
  try {
    const skuForecasts = await db.select().from(forecasts).where(eq(forecasts.sku_id, req.params.skuId));
    res.json(skuForecasts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecasts for SKU' });
  }
});

// Create forecast (AI-generated)
router.post('/', async (req: Request, res: Response) => {
  try {
    const newForecast = await db.insert(forecasts).values(req.body).returning();
    res.status(201).json(newForecast[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create forecast' });
  }
});

// Generate AI forecast for SKU
router.post('/generate/:skuId', async (req: Request, res: Response) => {
  try {
    // Simplified AI forecasting logic
    // In production, this would call a machine learning model
    const { forecast_date } = req.body;
    const predicted_demand = Math.floor(Math.random() * 100) + 50; // Mock prediction
    const confidence_level = (Math.random() * 20 + 75).toFixed(2); // 75-95% confidence
    
    const newForecast = await db.insert(forecasts).values({
      sku_id: req.params.skuId,
      forecast_date: new Date(forecast_date),
      predicted_demand,
      confidence_level,
      model_version: 'v1.0-mock',
    }).returning();
    
    res.status(201).json(newForecast[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

export default router;
