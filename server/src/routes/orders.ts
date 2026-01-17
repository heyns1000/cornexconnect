import { Router, Request, Response } from 'express';
import { db } from '../db';
import { orders, orderItems } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders);
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order with items
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await db.select().from(orders)// @ts-ignore
      .where(eq(orders.id, req.params.id));
    if (order.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const items = await db.select().from(orderItems)// @ts-ignore
      .where(eq(orderItems.order_id, req.params.id));
    
    res.json({ ...order[0], items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { items: orderItemsData, ...orderData } = req.body;
    
    const newOrder = await db.insert(orders).values(orderData).returning();
    
    if (orderItemsData && orderItemsData.length > 0) {
      const itemsToInsert = orderItemsData.map((item: any) => ({
        ...item,
        order_id: newOrder[0].id,
      }));
      await db.insert(orderItems).values(itemsToInsert);
    }
    
    res.status(201).json(newOrder[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await db
      .update(orders)
      .set({ status, updated_at: new Date() })
      // @ts-ignore
      .where(eq(orders.id, req.params.id))
      .returning();
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
