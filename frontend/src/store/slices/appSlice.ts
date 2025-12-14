import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  isLoading: boolean
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean
  notificationCount: number
  version: string
}

const initialState: AppState = {
  isLoading: false,
  theme: 'light',
  language: 'zh-CN',
  sidebarCollapsed: false,
  notificationCount: 0,
  version: '1.0.0',
}

// 异步thunk：初始化应用
export const initializeApp = createAsyncThunk(
  'app/initialize',
  async () => {
    // 这里可以添加应用初始化逻辑，比如获取用户配置等
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟加载

    // 从localStorage恢复设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    const savedLanguage = localStorage.getItem('language') as 'zh-CN' | 'en-US' || 'zh-CN'
    const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'

    return {
      theme: savedTheme,
      language: savedLanguage,
      sidebarCollapsed: savedSidebarCollapsed,
    }
  }
)

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      localStorage.setItem('theme', action.payload)
    },
    setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString())
    },
    setNotificationCount: (state, action: PayloadAction<number>) => {
      state.notificationCount = action.payload
    },
    incrementNotificationCount: (state) => {
      state.notificationCount += 1
    },
    clearNotifications: (state) => {
      state.notificationCount = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeApp.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.isLoading = false
        state.theme = action.payload.theme
        state.language = action.payload.language
        state.sidebarCollapsed = action.payload.sidebarCollapsed
      })
      .addCase(initializeApp.rejected, (state) => {
        state.isLoading = false
      })
  },
})

export const {
  setLoading,
  setTheme,
  setLanguage,
  toggleSidebar,
  setNotificationCount,
  incrementNotificationCount,
  clearNotifications,
} = appSlice.actions

export default appSlice.reducer