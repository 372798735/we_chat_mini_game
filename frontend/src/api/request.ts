import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 配置基础URL - 获取环境变量或使用默认值
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // 如果没有环境变量，使用默认值 - 连接到真正的Spring Boot后端
  return 'http://localhost:8091/api/api';
};

const BASE_URL = getApiBaseUrl();

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持跨域凭证
});

// 添加请求拦截器用于调试
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加用户ID头部（Spring Boot后端需要）
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    } else {
      // 如果没有用户ID，记录警告并设置默认值
      console.warn('未找到用户ID，请确保用户已登录');
      config.headers['X-User-Id'] = '0'; // 设置为0表示未认证用户
    }

    // 添加请求ID用于追踪
    config.headers['X-Request-ID'] = generateRequestId();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    handleApiError(error);
    return Promise.reject(error);
  }
);

// 生成请求ID
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// API错误处理
const handleApiError = (error: any) => {
  if (error.response) {
    // 服务器响应错误
    const { status, data } = error.response;

    switch (status) {
      case 401:
        // 未授权，清除token并跳转到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('登录已过期，请重新登录');
        window.location.href = '/login';
        break;
      case 403:
        console.error('权限不足');
        break;
      case 404:
        console.error('请求的资源不存在');
        break;
      case 500:
        console.error('服务器内部错误');
        break;
      default:
        console.error(data?.message || '请求失败');
    }
  } else if (error.request) {
    // 网络错误
    console.error('网络连接失败，请检查网络设置');
  } else {
    // 其他错误
    console.error('请求配置错误');
  }
};

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
  timestamp: number;
}

// 请求方法封装
class Request {
  // GET请求
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // POST请求
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // PUT请求
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // PATCH请求
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  // DELETE请求
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // 文件上传
  static async upload<T = any>(url: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data.data;
  }

  // 下载文件
  static async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await axiosInstance.get(url, {
      ...config,
      responseType: 'blob',
    });

    // 创建下载链接
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 导出axios实例用于特殊需求
export { axiosInstance };

// 导出Request类
export { Request };

export default Request;