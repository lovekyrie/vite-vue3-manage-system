import request from '../utils/request'

/**
 * API 响应类型
 */
interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/**
 * 登录接口返回类型
 * 在 ApiResponse 的基础上，data 中包含 access_token 字段
 */
interface LoginResponseData {
  access_token: string
  user: UserInfo
}

/**
 * 登录接口返回类型
 * 在 ApiResponse 的基础上，data 中包含 total 和 list 字段
 */
interface ListResponseData<T> {
  total: number
  list: T[]
}

/**
 * 登录接口响应类型
 */
type LoginResponse = ApiResponse<LoginResponseData>

/**
 * 费用类型
 */
interface ExpenseType {
  id: number | string
  name: string
  description?: string
  code?: string
  parent_id?: number | string
  created_at?: string
  updated_at?: string
}

/**
 * 费用类型管理相关API
 */
export const expenseTypeApi = {
  // 获取费用类型列表
  getExpenseTypeList(params: Record<string, any> = {}): Promise<ApiResponse<ExpenseType[]>> {
    return request.get('/api/expense-types', params)
  },

  // 创建费用类型
  createExpenseType(data: Partial<ExpenseType>): Promise<ApiResponse<ExpenseType>> {
    return request.post('/api/expense-types', data)
  },

  // 更新费用类型
  updateExpenseType(id: number | string, data: Partial<ExpenseType>): Promise<ApiResponse<ExpenseType>> {
    return request.patch(`/api/expense-types/${id}`, data)
  },

  // 删除费用类型
  deleteExpenseType(id: number | string): Promise<ApiResponse<void>> {
    return request.delete(`/api/expense-types/${id}`)
  },
}

/**
 * 用户登录/注册数据类型
 */
interface LoginData {
  username: string
  password: string
}

interface RegisterData extends LoginData {
  email?: string
  phone?: string
}

/**
 * 用户信息
 */
interface UserInfo {
  id: number | string
  username: string
  email?: string
  phone?: string
  avatar?: string
}

/**
 * 用户认证相关API
 */
export const authApi = {
  // 用户登录
  login(data: LoginData): Promise<ApiResponse<{ token: string, user: UserInfo }>> {
    return request.post('/api/auth/login', data)
  },

  // 用户注册
  register(data: RegisterData): Promise<ApiResponse<UserInfo>> {
    return request.post('/api/auth/register', data)
  },

  // 获取用户信息
  getUserInfo(): Promise<ApiResponse<UserInfo>> {
    return request.get('/api/auth/user')
  },

  // 刷新token
  refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return request.post('/api/auth/refresh')
  },

  // 用户登出
  logout(): Promise<ApiResponse<void>> {
    return request.post('/api/auth/logout')
  },
}

/**
 * 文件上传响应
 */
interface UploadResponse {
  url: string
  filename: string
  size: number
}

/**
 * 文件上传相关API
 */
export const uploadApi = {
  // 上传单个文件
  uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.upload('/api/upload', formData)
  },

  // 上传多个文件
  uploadFiles(files: File[]): Promise<ApiResponse<UploadResponse[]>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return request.upload('/api/upload/multiple', formData)
  },
}

// 导出类型
export type { ApiResponse, ExpenseType, ListResponseData, LoginData, LoginResponse, LoginResponseData, RegisterData, UploadResponse, UserInfo }

// 默认导出所有API
export default {
  expenseType: expenseTypeApi,
  auth: authApi,
  upload: uploadApi,
}
