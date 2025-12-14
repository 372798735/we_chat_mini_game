import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { taskApi } from '@/api/task'
import { pomodoroApi } from '@/api/pomodoro'

interface TaskStatistics {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
}

interface DailyStatistics {
  date: string
  completedTasks: number
  focusTime: number // 专注时间（分钟）
  pomodoroSessions: number
}

interface CategoryStatistics {
  categoryId: number
  categoryName: string
  taskCount: number
  completedCount: number
  focusTime: number
}

interface StatisticsState {
  taskStats: TaskStatistics
  dailyStats: DailyStatistics[]
  categoryStats: CategoryStatistics[]
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  isLoading: boolean
  error: string | null
}

const initialState: StatisticsState = {
  taskStats: {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
  },
  dailyStats: [],
  categoryStats: [],
  timeRange: 'week',
  isLoading: false,
  error: null,
}

// 异步thunk：获取任务统计
export const fetchTaskStatistics = createAsyncThunk(
  'statistics/fetchTaskStatistics',
  async (timeRange?: string) => {
    try {
      // 获取任务统计
      const stats = await taskApi.getTaskStatistics()
      return {
        total: stats.total || 0,
        completed: stats.completed || 0,
        pending: stats.pending || 0,
        inProgress: stats.inProgress || 0,
        overdue: stats.overdue || 0,
      }
    } catch (error) {
      console.error('获取任务统计失败:', error)
      // 如果API调用失败，返回默认值
      return {
        total: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        overdue: 0,
      }
    }
  }
)

// 异步thunk：获取每日统计数据
export const fetchDailyStatistics = createAsyncThunk(
  'statistics/fetchDailyStatistics',
  async (timeRange: 'week' | 'month' | 'quarter' | 'year' = 'week') => {
    try {
      // 获取本周统计数据
      const weeklyStats = await pomodoroApi.getWeeklyStatistics()

      // 将API数据转换为组件需要的格式
      const dailyStats: DailyStatistics[] = weeklyStats.weeklySessions.map(session => ({
        date: session.date,
        completedTasks: 0, // API暂时没有这个字段，可以后续添加
        focusTime: session.totalFocusTime,
        pomodoroSessions: session.completedSessions,
      }))

      return dailyStats
    } catch (error) {
      console.error('获取每日统计数据失败:', error)
      // 如果API调用失败，返回空数组
      return []
    }
  }
)

// 异步thunk：获取分类统计数据
export const fetchCategoryStatistics = createAsyncThunk(
  'statistics/fetchCategoryStatistics',
  async () => {
    try {
      // 获取所有任务数据来计算分类统计
      const allTasks = await taskApi.getTasks({ pageSize: 1000 })

      // 按分类分组统计
      const categoryMap = new Map<number, CategoryStatistics>()

      allTasks.records.forEach(task => {
        const categoryId = task.categoryId || 0
        const categoryName = task.categoryName || '未分类'

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            categoryName,
            taskCount: 0,
            completedCount: 0,
            focusTime: 0,
          })
        }

        const stats = categoryMap.get(categoryId)!
        stats.taskCount += 1

        if (task.status === 'completed') {
          stats.completedCount += 1
        }

        // 如果任务有实际专注时间，累加到分类中
        if (task.actualFocusTime) {
          stats.focusTime += Math.floor(task.actualFocusTime / 60) // 转换为分钟
        }
      })

      return Array.from(categoryMap.values())
    } catch (error) {
      console.error('获取分类统计数据失败:', error)
      // 如果API调用失败，返回空数组
      return []
    }
  }
)

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<'week' | 'month' | 'quarter' | 'year'>) => {
      state.timeRange = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    // 本地更新统计数据（用于实时更新）
    updateTaskStats: (state, action: PayloadAction<Partial<TaskStatistics>>) => {
      state.taskStats = { ...state.taskStats, ...action.payload }
    },
    incrementCompletedTasks: (state) => {
      state.taskStats.completed += 1
      state.taskStats.pending = Math.max(0, state.taskStats.pending - 1)
    },
    incrementFocusTime: (state, action: PayloadAction<number>) => {
      // 更新今日的专注时间
      const today = new Date().toISOString().split('T')[0]
      const todayStats = state.dailyStats.find(stat => stat.date === today)

      if (todayStats) {
        todayStats.focusTime += action.payload
      } else {
        state.dailyStats.push({
          date: today,
          completedTasks: 0,
          focusTime: action.payload,
          pomodoroSessions: 0,
        })
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTaskStatistics
      .addCase(fetchTaskStatistics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTaskStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.taskStats = action.payload
      })
      .addCase(fetchTaskStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取任务统计失败'
      })
      // fetchDailyStatistics
      .addCase(fetchDailyStatistics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDailyStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.dailyStats = action.payload
      })
      .addCase(fetchDailyStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取每日统计失败'
      })
      // fetchCategoryStatistics
      .addCase(fetchCategoryStatistics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoryStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.categoryStats = action.payload
      })
      .addCase(fetchCategoryStatistics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取分类统计失败'
      })
  },
})

export const {
  setTimeRange,
  clearError,
  updateTaskStats,
  incrementCompletedTasks,
  incrementFocusTime,
} = statisticsSlice.actions

export default statisticsSlice.reducer