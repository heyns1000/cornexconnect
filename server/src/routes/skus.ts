import { Router, Request, Response } from 'express';
import { db } from '../db';
import { skus } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all SKUs
router.get('/', async (req: Request, res: Response) => {
  try {
    const allSkus = await db.select().from(skus);
    res.json(allSkus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SKUs' });
  }
});

// Get single SKU
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sku = await db.select().from(skus).where(eq(skus.id, req.params.id));
    if (sku.length === 0) {
      return res.status(404).json({ error: 'SKU not found' });
    }
    res.json(sku[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SKU' });
  }
});

// Create SKU
router.post('/', async (req: Request, res: Response) => {
  try {
    const newSku = await db.insert(skus).values(req.body).returning();
    res.status(201).json(newSku[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create SKU' });
  }
});

// Update SKU
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedSku = await db
      .update(skus)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(skus.id, req.params.id))
      .returning();
    
    if (updatedSku.length === 0) {
      return res.status(404).json({ error: 'SKU not found' });
    }
    res.json(updatedSku[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update SKU' });
  }
});

// Delete SKU
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db.delete(skus).where(eq(skus.id, req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete SKU' });
  }
});

export default router;
