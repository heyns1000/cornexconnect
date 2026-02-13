import { db } from "./db";
import { hardwareStores } from "../shared/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface ExtractedStore {
  storeCode: string;
  storeName: string;
  province: string;
  city: string;
  territory: string;
  address: string;
  ownerName: string;
  contactPerson: string;
  retailGroup: string;
  storeSize: string;
  storeType: string;
  creditRating: string;
  monthlyPotential: number;
  phone: string;
  email: string;
  isActive: boolean;
  salesRep?: string;
}

interface ExtractedData {
  metadata: {
    totalStores: number;
    byProvince: Record<string, number>;
    territories: number;
    cities: number;
    retailGroups: number;
    salesReps: number;
  };
  salesReps: string[];
  retailGroups: string[];
  territories: string[];
  stores: ExtractedStore[];
}

function loadExtractedStores(): ExtractedData | null {
  try {
    const jsonPath = path.join(process.cwd(), "server", "extracted-stores.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load extracted-stores.json:", e);
  }
  return null;
}

// Load normalized client data from all spreadsheets
function loadNormalizedClients(): any[] {
  try {
    const jsonPath = path.join(process.cwd(), "server", "normalized-clients.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const data = JSON.parse(raw);
      return data.records || [];
    }
  } catch (e) {
    console.error("Failed to load normalized-clients.json:", e);
  }
  return [];
}

// Export normalized client data for analytics
export function getNormalizedClientData() {
  try {
    const jsonPath = path.join(process.cwd(), "server", "normalized-clients.json");
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load normalized-clients.json:", e);
  }
  return null;
}

export async function restoreHardwareStores() {
  try {
    console.log("Restoring hardware store database from real client data...");

    const extracted = loadExtractedStores();
    if (!extracted || !extracted.stores.length) {
      console.error("No extracted store data found. Run extract-all-stores.cjs first.");
      return false;
    }

    // Clear existing stores
    await db.delete(hardwareStores);
    console.log("Cleared existing stores");

    const stores = extracted.stores;
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < stores.length; i += batchSize) {
      const batch = stores.slice(i, i + batchSize).map((s) => ({
        storeCode: s.storeCode,
        storeName: s.storeName,
        ownerName: s.ownerName || "Store Owner",
        contactPerson: s.contactPerson || "Manager",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || s.city || "Business District",
        city: s.city || s.territory || "Unknown",
        province: s.province,
        storeSize: s.storeSize || "medium",
        storeType: s.storeType || "independent",
        creditRating: s.creditRating || "B",
        monthlyPotential: String(s.monthlyPotential || 20000),
        isActive: s.isActive !== false,
      }));

      await db.insert(hardwareStores).values(batch);
      inserted += batch.length;

      if (i % 500 === 0) {
        console.log(`Inserted ${inserted}/${stores.length} stores...`);
      }
    }

    console.log(
      `Successfully restored ${inserted} real hardware stores across ${Object.keys(extracted.metadata.byProvince).length} provinces`
    );
    console.log("Province breakdown:", extracted.metadata.byProvince);
    return true;
  } catch (error) {
    console.error("Error restoring hardware stores:", error);
    return false;
  }
}

// Export extracted data for analytics endpoints
export function getExtractedStoreData(): ExtractedData | null {
  return loadExtractedStores();
}
