import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import csvParser from 'csv-parser';
import { db } from '../db';
import { skus, customers, orders, importHistory } from '../db/schema';
import { z } from 'zod';
import { Readable } from 'stream';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Zod validation schemas
const skuSchema = z.object({
  sku_code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  unit_price: z.number().or(z.string().transform(Number)),
  currency: z.string().default('ZAR'),
  stock_quantity: z.number().or(z.string().transform(Number)).optional(),
  reorder_level: z.number().or(z.string().transform(Number)).optional(),
});

const customerSchema = z.object({
  customer_code: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  preferred_currency: z.string().default('ZAR'),
});

// Import SKUs from CSV/Excel
router.post('/skus', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let data: any[] = [];
    const fileType = req.file.mimetype.includes('csv') ? 'csv' : 'xlsx';

    if (fileType === 'xlsx') {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      // Parse CSV
      const stream = Readable.from(req.file.buffer.toString());
      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (row) => data.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const row of data) {
      try {
        const validatedData = skuSchema.parse(row);
        // @ts-ignore
        await db.insert(skus).values(validatedData).onConflictDoUpdate({
          target: skus.sku_code,
          // @ts-ignore
          // @ts-ignore
          set: { ...validatedData, updated_at: new Date() },
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Log import
    await db.insert(importHistory).values({
      filename: req.file.originalname,
      file_type: fileType,
      records_total: results.total,
      records_successful: results.successful,
      records_failed: results.failed,
      error_log: results.errors,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Import customers from CSV/Excel
router.post('/customers', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let data: any[] = [];
    const fileType = req.file.mimetype.includes('csv') ? 'csv' : 'xlsx';

    if (fileType === 'xlsx') {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      const stream = Readable.from(req.file.buffer.toString());
      await new Promise((resolve, reject) => {
        stream
          .pipe(csvParser())
          .on('data', (row) => data.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const row of data) {
      try {
        const validatedData = customerSchema.parse(row);
        // @ts-ignore
        await db.insert(customers).values(validatedData).onConflictDoUpdate({
          target: customers.customer_code,
          // @ts-ignore
          set: { ...validatedData, updated_at: new Date() },
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Log import
    await db.insert(importHistory).values({
      filename: req.file.originalname,
      file_type: fileType,
      records_total: results.total,
      records_successful: results.successful,
      records_failed: results.failed,
      error_log: results.errors,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Get import history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await db.select().from(importHistory);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import history' });
  }
});

export default router;
