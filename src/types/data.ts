// src/types/data.ts

// 对应 Swift: struct ProfitResult
export interface ProfitResult {
    absolute: number; // 绝对收益 (市值 - 成本)
    annualized: number; // 年化收益率 (简化处理)
}

// 对应 Swift: struct FundHolding
export interface FundHolding {
    id: string; // UUID
    clientName: string;
    clientID: string;
    fundCode: string;
    purchaseAmount: number;
    purchaseShares: number;
    purchaseDate: string; // ISO string
    remarks: string;
    fundName: string;
    currentNav: number;
    navDate: string;
    isValid: boolean;
    isPinned: boolean;
    pinnedTimestamp?: string;
}

// 对应 Swift: struct ClientGroup
export interface ClientGroup {
    id: string;             // 客户ID (clientID)
    clientName: string;
    totalAUM: number;       // 组内总资产
    totalProfit: number;    // 组内总收益（绝对收益）
    holdings: FundHolding[]; // 该客户下的所有持仓
    isPinned: boolean;
    pinnedTimestamp?: string;
}