import { Router, Request, Response } from 'express';
import { db } from '../db';
import { customers } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const allCustomers = await db.select().from(customers);
    res.json(allCustomers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await db.select().from(customers)// @ts-ignore
      .where(eq(customers.id, req.params.id));
    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    const newCustomer = await db.insert(customers).values(req.body).returning();
    res.status(201).json(newCustomer[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedCustomer = await db
      .update(customers)
      .set({ ...req.body, updated_at: new Date() })
      // @ts-ignore
      .where(eq(customers.id, req.params.id))
      .returning();
    
    if (updatedCustomer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(updatedCustomer[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

export default router;
