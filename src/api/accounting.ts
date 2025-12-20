import type { ApiResponse, ListResponseData } from '@/api/index'
import type { AccountingRecord, CreateAccountingInput } from '@/utils/types/accounting'
import request from '@/utils/request'
/**
 * 记账管理相关API
 */

// 获取记账记录列表
export function queryAccountingList(params: Record<string, any> = {}): Promise<ApiResponse<ListResponseData<AccountingRecord>>> {
  return request.get('/api/accounting', params)
}

// 创建记账记录
export function createAccounting(data: Partial<CreateAccountingInput>): Promise<ApiResponse<AccountingRecord>> {
  return request.post('/api/accounting', data)
}

// 更新记账记录
export function updateAccounting(id: number | string, data: Partial<CreateAccountingInput>): Promise<ApiResponse<AccountingRecord>> {
  return request.patch(`/api/accounting/${id}`, data)
}

// 删除记账记录
export function deleteAccounting(id: number | string): Promise<ApiResponse<void>> {
  return request.delete(`/api/accounting/${id}`)
}

// 获取记账统计信息
export function getAccountingStats(params: Record<string, any> = {}): Promise<ApiResponse<any>> {
  return request.get('/api/accounting/stats', params)
}
