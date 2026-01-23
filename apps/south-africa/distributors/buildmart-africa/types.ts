
export enum TierLevel {
  NONE = 0,
  FACTORY_BULK = 1,
  TRADE_WHOLESALE = 2,
  STANDARD_RETAIL = 3
}

export interface PricingItem {
  code: string;
  name: string;
  category: string;
  dimensions: string;
  boxMeterage: number;
  packsPerBox: number;
  tier1Price: number;
  tier2Price: number;
  tier3Price: number;
  isPremium?: boolean;
  isRaw?: boolean;
}

export interface OrderItem {
  code: string;
  quantity: number; // Number of boxes
  item: PricingItem;
  value: number;
  pieces: number;
  packs: number;
  isVerified: boolean;
  statusMsg: string;
}

export interface OrderSummary {
  totalBoxes: number;
  totalPieces: number;
  totalPacks: number;
  totalValue: number;
  isAuthorized: boolean;
  failureCount: number;
  activeItems: OrderItem[];
}

export interface TransactionRecord {
  id: string;
  timestamp: number;
  items: OrderItem[];
  totalValue: number;
  tier: TierLevel;
}

export interface CategoryMetrics {
  category: string;
  totalSpent: number;
  totalBoxes: number;
  percentageOfTotal: number;
}
