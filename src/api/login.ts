import type { LoginResponse } from './index'
import request from '../utils/request'

interface LoginParams {
  username: string
  password: string
}

/**
 * 登录API
 */
export function loginApi(params: LoginParams): Promise<LoginResponse> {
  return request.post('/api/auth/login', params)
}

