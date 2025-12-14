import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface PomodoroSession {
  id: number
  taskId: number
  type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'
  plannedDuration: number
  actualDuration?: number
  startedAt: string
  completedAt?: string
  isCompleted: boolean
  interruptionCount: number
  notes?: string
}

interface PomodoroState {
  currentSession: PomodoroSession | null
  timeRemaining: number
  isRunning: boolean
  isPaused: boolean
  sessions: PomodoroSession[]
  settings: {
    focusDuration: number // 专注时间（分钟）
    shortBreakDuration: number // 短休息时间（分钟）
    longBreakDuration: number // 长休息时间（分钟）
    longBreakInterval: number // 长休息间隔（几个专注时间后）
    autoStartBreak: boolean // 自动开始休息
    autoStartFocus: boolean // 自动开始专注
    notificationEnabled: boolean // 是否启用通知
  }
  statistics: {
    todayFocusTime: number // 今日专注时间（分钟）
    completedSessions: number // 完成的番茄钟数量
    interruptionCount: number // 中断次数
  }
}

const initialState: PomodoroState = {
  currentSession: null,
  timeRemaining: 25 * 60, // 默认25分钟
  isRunning: false,
  isPaused: false,
  sessions: [],
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartFocus: false,
    notificationEnabled: true,
  },
  statistics: {
    todayFocusTime: 0,
    completedSessions: 0,
    interruptionCount: 0,
  },
}

// 异步thunk：开始番茄钟
export const startPomodoro = createAsyncThunk(
  'pomodoro/start',
  async (data: {
    taskId: number
    type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'
    plannedDuration: number
    notes?: string
  }) => {
    // 这里添加API调用逻辑
    const session: PomodoroSession = {
      id: Date.now(),
      taskId: data.taskId,
      type: data.type,
      plannedDuration: data.plannedDuration,
      startedAt: new Date().toISOString(),
      isCompleted: false,
      interruptionCount: 0,
      notes: data.notes,
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    return session
  }
)

// 异步thunk：完成番茄钟
export const completePomodoro = createAsyncThunk(
  'pomodoro/complete',
  async (sessionId: number) => {
    // 这里添加API调用逻辑
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      sessionId,
      completedAt: new Date().toISOString(),
    }
  }
)

// 异步thunk：获取今日统计
export const fetchTodayStatistics = createAsyncThunk(
  'pomodoro/fetchTodayStatistics',
  async () => {
    // 这里添加API调用逻辑
    // 暂时返回模拟数据
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      todayFocusTime: 125, // 2小时5分钟
      completedSessions: 5,
      interruptionCount: 2,
    }
  }
)

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload
    },
    setIsPaused: (state, action: PayloadAction<boolean>) => {
      state.isPaused = action.payload
    },
    updateSettings: (state, action: PayloadAction<Partial<PomodoroState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    incrementInterruption: (state) => {
      if (state.currentSession) {
        state.currentSession.interruptionCount += 1
        state.statistics.interruptionCount += 1
      }
    },
    stopPomodoro: (state) => {
      if (state.currentSession) {
        state.currentSession.actualDuration =
          state.currentSession.plannedDuration * 60 - state.timeRemaining

        // 更新统计
        if (state.currentSession.type === 'WORK' && state.currentSession.isCompleted) {
          state.statistics.completedSessions += 1
          state.statistics.todayFocusTime += Math.floor(
            (state.currentSession.actualDuration || 0) / 60
          )
        }
      }

      state.currentSession = null
      state.isRunning = false
      state.isPaused = false
      state.timeRemaining = state.settings.focusDuration * 60
    },
    resetTimer: (state) => {
      state.timeRemaining = state.settings.focusDuration * 60
      state.isRunning = false
      state.isPaused = false
    },
  },
  extraReducers: (builder) => {
    builder
      // startPomodoro
      .addCase(startPomodoro.fulfilled, (state, action) => {
        state.currentSession = action.payload
        state.timeRemaining = action.payload.plannedDuration * 60
        state.isRunning = true
        state.isPaused = false
      })
      // completePomodoro
      .addCase(completePomodoro.fulfilled, (state, action) => {
        if (state.currentSession && state.currentSession.id === action.payload.sessionId) {
          state.currentSession.isCompleted = true
          state.currentSession.completedAt = action.payload.completedAt
          state.currentSession.actualDuration =
            state.currentSession.plannedDuration * 60 - state.timeRemaining

          // 更新统计
          if (state.currentSession.type === 'WORK') {
            state.statistics.completedSessions += 1
            state.statistics.todayFocusTime += Math.floor(
              (state.currentSession.actualDuration || 0) / 60
            )
          }

          // 添加到历史记录
          state.sessions.push({ ...state.currentSession })

          // 停止当前会话
          state.currentSession = null
          state.isRunning = false
          state.isPaused = false
        }
      })
      // fetchTodayStatistics
      .addCase(fetchTodayStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
  },
})

export const {
  setTimeRemaining,
  setIsRunning,
  setIsPaused,
  updateSettings,
  incrementInterruption,
  stopPomodoro,
  resetTimer,
} = pomodoroSlice.actions

export default pomodoroSlice.reducer