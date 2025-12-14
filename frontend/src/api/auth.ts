import { Request } from './request';

// 用户登录接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 用户注册接口
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  nickname?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  refreshToken: string;
  userId: number;
  username: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
  tokenType?: string;
  timezone?: string;
  language?: string;
  theme?: string;
  lastLoginAt?: string;
  expiresAt?: string;
}

// 重置密码请求接口
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  verificationCode: string;
}

// 修改密码请求接口
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authApi = {
  // 用户登录
  login: (data: LoginRequest) => {
    return Request.post<LoginResponse>('/auth/login', data);
  },

  // 用户注册
  register: (data: RegisterRequest) => {
    return Request.post<UserInfo>('/auth/register', data);
  },

  // 用户退出登录
  logout: () => {
    return Request.post('/auth/logout');
  },

  // 刷新token
  refreshToken: (refreshToken: string) => {
    return Request.post<{ token: string; expiresIn: number }>('/auth/refresh', {
      refreshToken,
    });
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return Request.get<UserInfo>('/auth/me');
  },

  // 更新用户信息
  updateUserInfo: (data: Partial<UserInfo>) => {
    return Request.put<UserInfo>('/auth/profile', data);
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest) => {
    return Request.post('/auth/change-password', data);
  },

  // 发送验证码
  sendVerificationCode: (email: string) => {
    return Request.post('/auth/send-verification-code', { email });
  },

  // 重置密码
  resetPassword: (data: ResetPasswordRequest) => {
    return Request.post('/auth/reset-password', data);
  },

  // 验证token有效性
  verifyToken: (token: string) => {
    return Request.post<{ valid: boolean }>('/auth/verify', { token });
  },
};