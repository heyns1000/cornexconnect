import { Router, Request, Response } from 'express';
import { db } from '../db';
import { logistics } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all logistics records
router.get('/', async (req: Request, res: Response) => {
  try {
    const allLogistics = await db.select().from(logistics);
    res.json(allLogistics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logistics' });
  }
});

// Get logistics by order
router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const logisticsData = await db.select().from(logistics).where(eq(logistics.order_id, req.params.orderId));
    res.json(logisticsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logistics data' });
  }
});

// Create logistics entry (RouteMesh™ or Unitrans)
router.post('/', async (req: Request, res: Response) => {
  try {
    const newLogistics = await db.insert(logistics).values(req.body).returning();
    res.status(201).json(newLogistics[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create logistics entry' });
  }
});

// Update logistics status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, actual_delivery } = req.body;
    const updated = await db
      .update(logistics)
      .set({ status, actual_delivery, updated_at: new Date() })
      .where(eq(logistics.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Logistics entry not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update logistics status' });
  }
});

// Track shipment
router.get('/track/:trackingNumber', async (req: Request, res: Response) => {
  try {
    const shipment = await db.select().from(logistics).where(eq(logistics.tracking_number, req.params.trackingNumber));
    if (shipment.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    res.json(shipment[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

export default router;
