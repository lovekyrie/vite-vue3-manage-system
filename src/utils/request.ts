import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { showMessage } from './utils'

// 创建 axios 实例
const service = axios.create({
  baseURL: '', // API 的基础URL
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 对请求错误做些什么
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data

    // 这里可以根据后端的响应结构定制
    if (res.code !== 200) {
      showMessage(res.message || '请求失败', 'error')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error: AxiosError) => {
    console.error('Response error:', error)

    // 处理 HTTP 状态码错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          showMessage('没有权限访问该资源', 'error')
          break
        case 404:
          showMessage('请求的资源不存在', 'error')
          break
        case 500:
          showMessage('服务器错误', 'error')
          break
        default:
          showMessage('网络错误', 'error')
      }
    }
    else if (error.request) {
      showMessage('网络连接失败，请检查网络', 'error')
    }
    else {
      showMessage('请求配置错误', 'error')
    }

    return Promise.reject(error)
  },
)

// 封装 GET 请求
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, { params, ...config })
}

// 封装 POST 请求
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config)
}

// 封装 PUT 请求
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config)
}

// 封装 DELETE 请求
export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config)
}

// 封装 DELETE 请求（别名）
export function deleteRequest<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, config)
}

// 封装上传文件请求
export function upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  })
}

// 创建一个封装的对象用于导出
const request = {
  get,
  post,
  put,
  delete: deleteRequest,
  upload,
  deleteRequest,
  del,
}

// 导出 axios 实例，以便需要时可以直接使用
export default request
export { service }
