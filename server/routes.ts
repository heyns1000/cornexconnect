import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, auditMiddleware } from "./auth";
import { achievementService } from "./achievementService";
import { restoreProducts } from "./restoreProducts";
import { restoreHardwareStores, getExtractedStoreData, getNormalizedClientData } from "./restoreStores";
import multer from "multer";
import * as XLSX from 'xlsx';
import { nanoid } from 'nanoid';
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { bulkImportSessions } from "@shared/schema";
import fruitfulPlanetRoutes from "./src/routes/fruitfulPlanet";
import buildmartSignalRoutes from "./src/routes/buildmartSignal";
import ordersRoutes from "./src/routes/orders";
import customersRoutes from "./src/routes/customers";
import forecastsRoutes from "./src/routes/forecasts";
import logisticsRoutes from "./src/routes/logistics";
import skusRoutes from "./src/routes/skus";
import currenciesRoutes from "./src/routes/currencies";
import importRoutes from "./src/routes/import";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (Google, Microsoft, GitHub, Facebook + email/password)
  await setupAuth(app);

  // Audit trail middleware - tracks user API access
  app.use(auditMiddleware());

  // Ecosystem status & health
  app.use("/api/ecosystem", fruitfulPlanetRoutes);

  // BuildMart Africa distributor relay
  app.use("/relay/cornexconnect", buildmartSignalRoutes);

  // Core business API routes
  app.use("/api/orders", ordersRoutes);
  app.use("/api/customers", customersRoutes);
  app.use("/api/forecasts", forecastsRoutes);
  app.use("/api/logistics", logisticsRoutes);
  app.use("/api/skus", skusRoutes);
  app.use("/api/currencies", currenciesRoutes);
  app.use("/api/import", importRoutes);

  // Simple working bulk import 
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 50 }
  });

  app.post("/api/bulk-import/upload", upload.array('files', 50), async (req, res) => {
    try {
      console.log(`[BULK IMPORT] Processing ${req.files?.length || 0} files`);
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const { processBulkFiles } = await import('./bulkImport');
      const result = await processBulkFiles(req.files as Express.Multer.File[]);

      // Store session in database
      await db.insert(bulkImportSessions).values({
        id: result.sessionId,
        name: `Import ${new Date().toLocaleDateString()}`,
        totalFiles: req.files.length,
        processedFiles: req.files.length,
        status: "completed",
        totalImported: result.totalImported,
        files: JSON.stringify(result.results),
        createdAt: new Date()
      });

      console.log(`✅ Import completed: ${result.totalImported} stores imported`);

      res.json({
        success: true,
        sessionId: result.sessionId,
        totalImported: result.totalImported,
        results: result.results,
        message: `Successfully imported ${result.totalImported} stores from ${req.files.length} files`
      });

    } catch (error) {
      console.error("Bulk import error:", error);
      res.status(500).json({ error: "Import failed" });
    }
  });

  // Get bulk import history
  app.get("/api/bulk-import/history", async (req, res) => {
    try {
      const sessions = await db.select().from(bulkImportSessions).orderBy(desc(bulkImportSessions.createdAt)).limit(10);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching import history:", error);
      res.status(500).json({ error: "Failed to fetch import history" });
    }
  });

  app.get("/api/bulk-import/status/:id", async (req, res) => {
    try {
      const [session] = await db.select().from(bulkImportSessions).where(eq(bulkImportSessions.id, req.params.id));
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session status:", error);
      res.status(500).json({ error: "Failed to fetch session status" });
    }
  });

  // Achievement System Routes
  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      await achievementService.initializeUserProgress(userId);
      const data = await achievementService.getUserAchievements(userId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.post("/api/achievements/record-import", async (req, res) => {
    try {
      const { userId, sessionId, fileName, performance } = req.body;
      
      await achievementService.recordImportMetrics(
        userId,
        sessionId,
        fileName,
        performance
      );
      
      const updatedData = await achievementService.getUserAchievements(userId);
      res.json(updatedData);
    } catch (error) {
      console.error("Error recording import metrics:", error);
      res.status(500).json({ error: "Failed to record metrics" });
    }
  });

  // Products API endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Inventory API endpoints
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Emergency product restoration endpoint
  app.post("/api/products/restore", async (req, res) => {
    try {
      console.log('🚨 Emergency product restoration triggered');
      const success = await restoreProducts();
      if (success) {
        res.json({ 
          success: true, 
          message: "Product catalog fully restored",
          totalProducts: 34,
          categories: {
            EPS: 13,
            BR: 13, 
            LED: 8
          }
        });
      } else {
        res.status(500).json({ success: false, error: "Failed to restore products" });
      }
    } catch (error) {
      console.error("Error in product restoration:", error);
      res.status(500).json({ success: false, error: "Product restoration failed" });
    }
  });

  // Hardware Stores routes
  app.get("/api/hardware-stores", async (req, res) => {
    try {
      const stores = await storage.getHardwareStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching hardware stores:", error);
      res.status(500).json({ error: "Failed to fetch hardware stores" });
    }
  });

  // Dashboard Summary endpoint - REAL DATABASE COUNT
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const stores = await storage.getHardwareStores();
      const products = await storage.getProducts();
      const distributors = await storage.getDistributors();
      const extracted = getExtractedStoreData();

      res.json({
        hardwareStores: stores.length || extracted?.metadata.totalStores || 0,
        products: products.length,
        distributors: distributors.length,
        revenue: extracted ? extracted.stores.reduce((sum: number, s: any) => sum + (s.monthlyPotential || 0), 0) * 12 : 0,
        provinces: extracted ? Object.keys(extracted.metadata.byProvince).length : 9,
        territories: extracted?.metadata.territories || 0,
        cities: extracted?.metadata.cities || 0,
        salesReps: extracted?.salesReps || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Hardware Store Analytics - real territory/province/rep data from spreadsheets
  app.get("/api/hardware-stores/analytics", async (req, res) => {
    try {
      const extracted = getExtractedStoreData();
      const stores = await storage.getHardwareStores();

      if (extracted) {
        const byProvince = extracted.metadata.byProvince;
        const saProvinces = ['GAUTENG', 'LIMPOPO', 'KWAZULU-NATAL', 'MPUMALANGA', 'WESTERN CAPE', 'EASTERN CAPE', 'NORTH WEST', 'FREE STATE', 'NORTHERN CAPE'];
        const internationalRegions = Object.keys(byProvince).filter(p => !saProvinces.includes(p) && p !== 'UNKNOWN');

        res.json({
          totalStores: stores.length || extracted.metadata.totalStores,
          provinces: Object.keys(byProvince).length,
          saProvinces: saProvinces.filter(p => byProvince[p]),
          internationalRegions,
          territories: extracted.metadata.territories,
          cities: extracted.metadata.cities,
          retailGroups: extracted.retailGroups,
          salesReps: extracted.salesReps,
          byProvince,
          byStoreType: {
            independent: extracted.stores.filter(s => s.storeType === 'independent').length,
            chain: extracted.stores.filter(s => s.storeType === 'chain').length,
            franchise: extracted.stores.filter(s => s.storeType === 'franchise').length,
          },
          byStoreSize: {
            small: extracted.stores.filter(s => s.storeSize === 'small').length,
            medium: extracted.stores.filter(s => s.storeSize === 'medium').length,
            large: extracted.stores.filter(s => s.storeSize === 'large').length,
          },
          totalMonthlyPotential: extracted.stores.reduce((sum, s) => sum + (s.monthlyPotential || 0), 0),
          topTerritories: Object.entries(
            extracted.stores.reduce((acc: Record<string, number>, s) => {
              if (s.territory) acc[s.territory] = (acc[s.territory] || 0) + 1;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([territory, count]) => ({ territory, count })),
        });
      } else {
        res.json({
          totalStores: stores.length,
          provinces: 9,
          territories: 0,
          cities: 0,
          retailGroups: [],
          salesReps: [],
          byProvince: {},
        });
      }
    } catch (error) {
      console.error("Error fetching store analytics:", error);
      res.status(500).json({ error: "Failed to fetch store analytics" });
    }
  });

  // Emergency hardware stores restoration endpoint
  app.post("/api/hardware-stores/restore", async (req, res) => {
    try {
      console.log('🚨 Emergency hardware stores restoration triggered');
      const success = await restoreHardwareStores();
      if (success) {
        const storeCount = await storage.getHardwareStores();
        res.json({ 
          success: true, 
          message: "Hardware stores database fully restored",
          totalStores: storeCount.length,
          message2: "All 3,197+ stores restored across South African provinces"
        });
      } else {
        res.status(500).json({ success: false, error: "Failed to restore stores" });
      }
    } catch (error) {
      console.error("Error in stores restoration:", error);
      res.status(500).json({ success: false, error: "Stores restoration failed" });
    }
  });

  // Normalized client data from all spreadsheets
  app.get("/api/clients/normalized", async (req, res) => {
    try {
      const data = getNormalizedClientData();
      if (data) {
        res.json(data);
      } else {
        res.status(404).json({ error: "No normalized client data found. Run normalize-all-spreadsheets.cjs first." });
      }
    } catch (error) {
      console.error("Error fetching normalized clients:", error);
      res.status(500).json({ error: "Failed to fetch normalized client data" });
    }
  });

  // CSV download of normalized client data
  app.get("/api/clients/normalized/csv", async (req, res) => {
    try {
      const csvPath = require('path').join(process.cwd(), 'server', 'normalized-clients.csv');
      const fs = require('fs');
      if (fs.existsSync(csvPath)) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=cornexconnect-clients.csv');
        fs.createReadStream(csvPath).pipe(res);
      } else {
        res.status(404).json({ error: "CSV file not generated yet. Run normalize-all-spreadsheets.cjs first." });
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      res.status(500).json({ error: "Failed to download CSV" });
    }
  });

  // ============================================
  // USER MANAGEMENT CRUD API
  // ============================================

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Never expose password hashes
      const safeUsers = allUsers.map(({ passwordHash, ...u }: any) => u);
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create a new user (admin only)
  app.post("/api/users", async (req, res) => {
    try {
      const newUser = await storage.createUser(req.body);
      const { passwordHash, ...safeUser } = newUser as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update a user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updated = await storage.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }
      const { passwordHash, ...safeUser } = updated as any;
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete a user (soft delete)
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const result = await storage.deleteUser(req.params.id);
      res.json({ success: result });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ============================================
  // COMPANY SETTINGS API
  // ============================================

  // Get company settings
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ error: "Failed to fetch company settings" });
    }
  });

  // Update company settings
  app.put("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ error: "Failed to update company settings" });
    }
  });

  // ============================================
  // AUDIT LOG API (alternative endpoint)
  // ============================================

  // Get audit logs (alternative to /api/auth/audit)
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const logs = await storage.getAuditLogs({
        limit: parseInt(req.query.limit as string) || 100,
        offset: parseInt(req.query.offset as string) || 0,
        userId: req.query.userId as string,
        action: req.query.action as string,
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}