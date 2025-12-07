// 基金持仓数据模型
export class FundHolding {
  id: string
  clientName: string
  clientID: string
  fundCode: string
  purchaseAmount: number
  purchaseShares: number
  purchaseDate: Date
  remarks: string
  fundName: string
  currentNav: number
  navDate: Date
  isPinned: boolean
  pinnedTimestamp: Date | null
  isValid: boolean
  navReturn1m: number | null
  navReturn3m: number | null
  navReturn6m: number | null
  navReturn1y: number | null

  constructor(data: Partial<FundHolding> = {}) {
    this.id = data.id || crypto.randomUUID()
    this.clientName = data.clientName || ''
    this.clientID = data.clientID || ''
    this.fundCode = data.fundCode || ''
    this.purchaseAmount = data.purchaseAmount || 0
    this.purchaseShares = data.purchaseShares || 0
    this.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date()
    this.remarks = data.remarks || ''
    this.fundName = data.fundName || ''
    this.currentNav = data.currentNav || 0
    this.navDate = data.navDate ? new Date(data.navDate) : new Date()
    this.isPinned = data.isPinned || false
    this.pinnedTimestamp = data.pinnedTimestamp ? new Date(data.pinnedTimestamp) : null
    this.isValid = data.isValid !== undefined ? data.isValid : true
    this.navReturn1m = data.navReturn1m || null
    this.navReturn3m = data.navReturn3m || null
    this.navReturn6m = data.navReturn6m || null
    this.navReturn1y = data.navReturn1y || null
  }

  // 计算总价值
  get totalValue(): number {
    return this.currentNav * this.purchaseShares
  }

  // 验证持仓数据是否有效
  get isValidHolding(): boolean {
    return (
      this.clientName.trim() !== '' &&
      this.clientID.trim() !== '' &&
      this.fundCode.trim() !== '' &&
      this.purchaseAmount > 0 &&
      this.purchaseShares > 0
    )
  }

  // 创建去重键
  createDeduplicationKey(): string {
    const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const purchaseDateString = dateFormatter.format(this.purchaseDate)
    
    return `${this.clientName}-${this.fundCode}-${this.purchaseAmount.toFixed(2)}-${this.purchaseShares.toFixed(2)}-${purchaseDateString}-${this.clientID}-${this.remarks}`
  }

  // 转换为JSON可序列化对象
  toJSON(): object {
    return {
      id: this.id,
      clientName: this.clientName,
      clientID: this.clientID,
      fundCode: this.fundCode,
      purchaseAmount: this.purchaseAmount,
      purchaseShares: this.purchaseShares,
      purchaseDate: this.purchaseDate.toISOString(),
      remarks: this.remarks,
      fundName: this.fundName,
      currentNav: this.currentNav,
      navDate: this.navDate.toISOString(),
      isPinned: this.isPinned,
      pinnedTimestamp: this.pinnedTimestamp ? this.pinnedTimestamp.toISOString() : null,
      isValid: this.isValid,
      navReturn1m: this.navReturn1m,
      navReturn3m: this.navReturn3m,
      navReturn6m: this.navReturn6m,
      navReturn1y: this.navReturn1y
    }
  }
}

// 收益结果
export interface ProfitResult {
  absolute: number
  annualized: number
}

// 用户类型枚举 - 必须在类外面定义
export enum UserType {
  FREE = 'free',
  SUBSCRIBED = 'subscribed',
  VIP = 'vip'
}

// 主题模式
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}
