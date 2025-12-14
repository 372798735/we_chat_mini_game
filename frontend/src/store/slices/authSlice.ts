import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi, UserInfo, LoginRequest, RegisterRequest } from '@/api/auth'

interface AuthState {
  user: UserInfo | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  loginLoading: boolean
  registerLoading: boolean
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  loginLoading: false,
  registerLoading: false,
}

// 异步thunk：用户登录
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // Request类已经处理了ApiResponse包装，直接返回data部分
      const responseData = await authApi.login(credentials)

      // 处理字段名映射：后端返回accessToken，前端需要token
      const token = responseData.accessToken || responseData.token
      const refreshToken = responseData.refreshToken

      if (!token) {
        throw new Error('登录响应中缺少token')
      }

      // 构造用户信息对象
      const user = {
        id: responseData.userId,
        username: responseData.username,
        email: responseData.email,
        nickname: responseData.nickname,
        avatar: responseData.avatarUrl,
        phone: responseData.phone,
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString()
      }

      // 保存到localStorage
      localStorage.setItem('token', token)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userId', responseData.userId?.toString() || user.id.toString())

      // 返回前端期望的格式
      return {
        token,
        refreshToken,
        userId: responseData.userId,
        username: responseData.username,
        email: responseData.email,
        user
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return rejectWithValue(error.response?.data?.message || error.message || '登录失败')
    }
  }
)

// 异步thunk：用户注册
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '注册失败')
    }
  }
)

// 异步thunk：用户退出
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()

      // 清除localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')

      return true
    } catch (error: any) {
      // 即使API调用失败，也要清除本地数据
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')

      return rejectWithValue(error.response?.data?.message || '退出失败')
    }
  }
)

// 异步thunk：获取当前用户信息
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser()

      // 更新localStorage中的用户信息
      localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('userId', user.id.toString())

      return user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败')
    }
  }
)

// 异步thunk：刷新token
export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState }
      const refreshToken = state.auth.refreshToken

      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authApi.refreshToken(refreshToken)

      // 更新localStorage中的token
      localStorage.setItem('token', response.token)

      return response
    } catch (error: any) {
      // 刷新失败，清除认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('userId')

      return rejectWithValue(error.response?.data?.message || 'Token刷新失败')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },

    // 初始化认证状态（从localStorage恢复）
    initializeAuth: (state) => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      const userStr = localStorage.getItem('user')

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          state.token = token
          state.refreshToken = refreshToken
          state.user = user
          state.isAuthenticated = true
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error)
          // 清除无效数据
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }
      }
    },

    // 更新用户信息
    updateUser: (state, action: PayloadAction<Partial<UserInfo>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
        localStorage.setItem('userId', state.user.id.toString())
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })

      // 注册
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false
        state.error = action.payload as string
      })

      // 退出
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.error = action.payload as string
      })

      // 获取当前用户信息
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })

      // 刷新token
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.refreshToken = null
      })
  },
})

export const { clearError, initializeAuth, updateUser } = authSlice.actions

export default authSlice.reducer