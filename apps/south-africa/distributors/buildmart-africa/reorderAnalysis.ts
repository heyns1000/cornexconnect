
import { TransactionRecord } from './types.ts';

const OPENING_WINDOW_DAYS = 30;

export interface ReorderStats {
  code: string;
  reorderFreq: number;      // How many reorder GRVs contain this SKU
  totalFreq: number;         // Total GRV appearances (incl. opening)
  reorderVolume: number;     // Total boxes in reorder GRVs
  openingVolume: number;     // Total boxes in opening GRVs
  reorderValue: number;      // Total ZAR in reorder GRVs
  isReordered: boolean;      // Has this SKU ever been reordered?
}

/**
 * Separates opening order GRVs from reorder GRVs.
 *
 * Logic: The first N days of GRV history (from the earliest GRV date)
 * represent the opening order window where BuildMart was stocking all SKUs.
 * Everything after that window = reorders = true demand signal.
 */
export function splitOpeningVsReorders(
  history: TransactionRecord[],
  windowDays: number = OPENING_WINDOW_DAYS
): { opening: TransactionRecord[]; reorders: TransactionRecord[] } {
  if (history.length === 0) return { opening: [], reorders: [] };

  const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
  const firstDate = sorted[0].timestamp;
  const cutoff = firstDate + windowDays * 24 * 60 * 60 * 1000;

  const opening: TransactionRecord[] = [];
  const reorders: TransactionRecord[] = [];

  sorted.forEach(txn => {
    if (txn.timestamp <= cutoff) {
      opening.push(txn);
    } else {
      reorders.push(txn);
    }
  });

  return { opening, reorders };
}

/**
 * Calculates reorder-based velocity for each SKU.
 *
 * Fast movers = SKUs that appear most frequently in REORDER GRVs.
 * The opening order is excluded because every SKU gets bought once
 * when a store first stocks up - that doesn't indicate demand.
 *
 * A SKU reordered 8 times (even in small qty) = fast mover
 * A SKU bought once in bulk opening but never reordered = dead stock
 */
export function getReorderVelocity(history: TransactionRecord[]): Record<string, ReorderStats> {
  const { opening, reorders } = splitOpeningVsReorders(history);
  const stats: Record<string, ReorderStats> = {};

  // Count opening order volumes
  opening.forEach(txn => {
    txn.items.forEach(item => {
      if (!stats[item.code]) {
        stats[item.code] = {
          code: item.code,
          reorderFreq: 0,
          totalFreq: 0,
          reorderVolume: 0,
          openingVolume: 0,
          reorderValue: 0,
          isReordered: false,
        };
      }
      stats[item.code].totalFreq += 1;
      stats[item.code].openingVolume += item.quantity;
    });
  });

  // Count reorder volumes - THIS is the real demand signal
  reorders.forEach(txn => {
    txn.items.forEach(item => {
      if (!stats[item.code]) {
        stats[item.code] = {
          code: item.code,
          reorderFreq: 0,
          totalFreq: 0,
          reorderVolume: 0,
          openingVolume: 0,
          reorderValue: 0,
          isReordered: false,
        };
      }
      stats[item.code].reorderFreq += 1;
      stats[item.code].totalFreq += 1;
      stats[item.code].reorderVolume += item.quantity;
      stats[item.code].reorderValue += item.value;
      stats[item.code].isReordered = true;
    });
  });

  return stats;
}

/**
 * Returns SKU codes ranked by reorder frequency (true fast movers).
 * Sorted by: reorder frequency DESC, then reorder volume DESC.
 */
export function getRankedFastMovers(history: TransactionRecord[]): ReorderStats[] {
  const stats = getReorderVelocity(history);
  return Object.values(stats)
    .filter(s => s.isReordered)
    .sort((a, b) => b.reorderFreq - a.reorderFreq || b.reorderVolume - a.reorderVolume);
}
