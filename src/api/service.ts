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

// 新增管理记录
export function addService(data: Service): Promise<ApiResponse<void>> {
  return request.post('/api/services', data)
}

// 编辑管理记录
export function editService(data: Service): Promise<ApiResponse<void>> {
  return request.patch(`/api/services/${data.id}`, data)
}

// 删除管理记录
export function deleteService(id: number): Promise<ApiResponse<void>> {
  return request.delete(`/api/services/${id}`)
}

// 批量删除管理记录
export function batchDeleteService(ids: number[]): Promise<ApiResponse<void>> {
  return request.delete(`/api/services/batch/delete`, {
    data: { ids },
  })
}
// 获取管理记录详情
export function getServiceById(id: number): Promise<ApiResponse<Service>> {
  return request.get(`/api/services/${id}`)
}
