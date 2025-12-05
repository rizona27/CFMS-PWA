// src/types/data.ts

// 对应 Swift: struct ProfitResult
export interface ProfitResult {
    absolute: number; // 绝对收益 (市值 - 成本)
    annualized: number; // 年化收益率 (简化处理)
}

// 对应 Swift: struct FundHolding - 保持原有兼容性
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

// 持仓数据类型定义 - 更完整的类型定义
export interface Holding {
    id: string;
    client_name: string;
    client_id: string;
    fund_code: string;
    fund_name: string;
    purchase_date: string;
    purchase_amount: number;
    purchase_shares: number;
    current_nav: number;
    nav_date: string;
    is_pinned: boolean;
    pinned_timestamp: string | null;
    remarks: string;
    created_at: string;
    updated_at: string;
}

// 持仓搜索参数
export interface HoldingSearchParams {
    client_name?: string;
    client_id?: string;
    fund_code?: string;
    fund_name?: string;
    purchase_date_start?: string;
    purchase_date_end?: string;
    min_amount?: number;
    max_amount?: number;
    is_pinned?: boolean;
}

// 持仓导入结果
export interface ImportResult {
    success: number;
    failed: number;
    skipped: number;
    total: number;
    errors: Array<{
        line: number;
        field: string;
        message: string;
        value: string;
    }>;
    successItems: Array<{
        client_name: string;
        client_id: string;
        fund_code: string;
        purchase_amount: number;
    }>;
}

// 持仓导出参数
export interface ExportParams {
    format: 'csv' | 'excel' | 'json';
    fields: string[];
    filters: HoldingSearchParams;
    options: {
        includeCalculations: boolean;
        includeFundInfo: boolean;
        compressFile: boolean;
        includeTimestamps: boolean;
    };
}

// 基金信息
export interface FundInfo {
    code: string;
    name: string;
    current_nav: number;
    nav_date: string;
    nav_return_1m?: number;
    nav_return_3m?: number;
    nav_return_6m?: number;
    nav_return_1y?: number;
}

// 类型转换助手函数
export const convertFundHoldingToHolding = (fundHolding: FundHolding): Holding => {
    return {
        id: fundHolding.id,
        client_name: fundHolding.clientName,
        client_id: fundHolding.clientID,
        fund_code: fundHolding.fundCode,
        fund_name: fundHolding.fundName,
        purchase_date: fundHolding.purchaseDate,
        purchase_amount: fundHolding.purchaseAmount,
        purchase_shares: fundHolding.purchaseShares,
        current_nav: fundHolding.currentNav,
        nav_date: fundHolding.navDate,
        is_pinned: fundHolding.isPinned,
        pinned_timestamp: fundHolding.pinnedTimestamp || null,
        remarks: fundHolding.remarks,
        created_at: new Date().toISOString(), // 如果没有创建时间，使用当前时间
        updated_at: new Date().toISOString(), // 如果没有更新时间，使用当前时间
    };
};

export const convertHoldingToFundHolding = (holding: Holding): FundHolding => {
    return {
        id: holding.id,
        clientName: holding.client_name,
        clientID: holding.client_id,
        fundCode: holding.fund_code,
        fundName: holding.fund_name,
        purchaseDate: holding.purchase_date,
        purchaseAmount: holding.purchase_amount,
        purchaseShares: holding.purchase_shares,
        currentNav: holding.current_nav,
        navDate: holding.nav_date,
        isValid: true, // 从Holding无法获取此字段，设为true
        isPinned: holding.is_pinned,
        pinnedTimestamp: holding.pinned_timestamp || undefined,
        remarks: holding.remarks,
    };
};