import { Router, Request, Response } from 'express';
import { db } from '../db';
import { currencies } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all currencies
router.get('/', async (req: Request, res: Response) => {
  try {
    const allCurrencies = await db.select().from(currencies);
    res.json(allCurrencies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// Get single currency
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const currency = await db.select().from(currencies).where(eq(currencies.code, req.params.code));
    if (currency.length === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    res.json(currency[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currency' });
  }
});

// Create or update currency (upsert)
router.post('/', async (req: Request, res: Response) => {
  try {
    const newCurrency = await db.insert(currencies).values(req.body).returning();
    res.status(201).json(newCurrency[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create currency' });
  }
});

// Update exchange rate
router.patch('/:code/rate', async (req: Request, res: Response) => {
  try {
    const { exchange_rate } = req.body;
    const updated = await db
      .update(currencies)
      .set({ exchange_rate, updated_at: new Date() })
      .where(eq(currencies.code, req.params.code))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Currency not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exchange rate' });
  }
});

export default router;
