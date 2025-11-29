import type { ApiResponse } from '@/api/index'
import type { Service } from '@/utils/types/service'
import request from '@/utils/request'

/**
 * 登录接口返回类型
 * 在 ApiResponse 的基础上，data 中包含 total 和 list 字段
 */
interface LoginResponseData {
  total: number
  list: Service[]
}
/**
 * 管理列表相关API
 */

// 获取管理记录列表
export function queryServiceList(params: Record<string, any> = {}): Promise<ApiResponse<LoginResponseData>> {
  return request.get('/api/services', params)
}
