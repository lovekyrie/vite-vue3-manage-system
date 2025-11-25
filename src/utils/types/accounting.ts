/**
 * 记账记录类型（从服务器返回）
 */
export interface AccountingRecord {
  id: number | string
  type: 'income' | 'expense'
  amount: string
  category: string
  description?: string
  transaction_date: string
  payment_method: string
  created_at?: string
  updated_at?: string
}

/**
 * 创建/更新记账记录请求类型（amount 为 number）
 */
export interface CreateAccountingInput {
  id?: number | string
  type: 'income' | 'expense'
  amount: number // 创建/更新时需要传数字
  category: string
  description?: string
  transaction_date: string
  payment_method: string
  created_at?: string
  updated_at?: string
}
