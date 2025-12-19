import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { taskApi } from '@/api/task'
import { pomodoroApi } from '@/api/pomodoro'
import { statisticsApi } from '@/api/statistics'

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
      // 使用仪表板API获取综合统计数据
      const dashboardStats = await statisticsApi.getDashboardStatistics()

      // 从total和today数据中提取任务统计信息
      const totalStats = dashboardStats.total;
      const todayStats = dashboardStats.today;

      // 计算进行中和待处理任务数
      const inProgress = totalStats.total_tasks - totalStats.completed_tasks;
      const pending = Math.max(0, inProgress); // 简化处理
      const overdue = 0; // 后续可以添加逾期逻辑

      return {
        total: totalStats.total_tasks || 0,
        completed: totalStats.completed_tasks || 0,
        pending: pending || 0,
        inProgress: inProgress || 0,
        overdue: overdue || 0,
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
      let statsData: DailyStatistics[] = [];

      // 根据时间范围选择相应的API
      switch (timeRange) {
        case 'week':
          const weeklyStats = await statisticsApi.getWeeklyStatistics();
          statsData = weeklyStats.map(stat => ({
            date: stat.statDate || new Date().toISOString().split('T')[0],
            completedTasks: stat.completedTasks || 0,
            focusTime: stat.totalFocusTime || 0,
            totalTasks: stat.totalTasks || 0,
            totalPomodoros: stat.totalPomodoros || 0,
            averageFocusTime: stat.averageFocusTime || 0,
            completionRate: stat.completionRate || 0,
          }));
          break;
        case 'month':
          const monthlyStats = await statisticsApi.getMonthlyStatistics();
          statsData = monthlyStats.map(stat => ({
            date: stat.statDate || new Date().toISOString().split('T')[0],
            completedTasks: stat.completedTasks || 0,
            focusTime: stat.totalFocusTime || 0,
            totalTasks: stat.totalTasks || 0,
            totalPomodoros: stat.totalPomodoros || 0,
            averageFocusTime: stat.averageFocusTime || 0,
            completionRate: stat.completionRate || 0,
          }));
          break;
        default:
          // 默认使用周数据
          const defaultStats = await statisticsApi.getWeeklyStatistics();
          statsData = defaultStats.map(stat => ({
            date: stat.statDate || new Date().toISOString().split('T')[0],
            completedTasks: stat.completedTasks || 0,
            focusTime: stat.totalFocusTime || 0,
            totalTasks: stat.totalTasks || 0,
            totalPomodoros: stat.totalPomodoros || 0,
            averageFocusTime: stat.averageFocusTime || 0,
            completionRate: stat.completionRate || 0,
          }));
      }

      return statsData;
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
      // 使用优先级分布统计API获取分类数据
      const priorityStats = await statisticsApi.getPriorityDistribution()

      // 将API数据转换为组件需要的格式
      const categoryStats: CategoryStatistics[] = priorityStats.map(stat => ({
        categoryId: 0, // 暂时使用固定值，后续可以根据优先级映射
        categoryName: stat.priority === 'high' ? '高优先级' :
                      stat.priority === 'medium' ? '中优先级' : '低优先级',
        taskCount: stat.total_count || 0,
        completedCount: stat.completed_count || 0,
        focusTime: 0, // 后续可以从其他API获取专注时间数据
      }))

      return categoryStats
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