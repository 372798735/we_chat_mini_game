import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Task, TaskStatus, TaskPriority } from '@/types/task'

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  filters: {
    status: TaskStatus | 'all'
    priority: TaskPriority | 'all'
    categoryId: number | 'all'
    searchQuery: string
  }
  isLoading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  filters: {
    status: 'all',
    priority: 'all',
    categoryId: 'all',
    searchQuery: '',
  },
  isLoading: false,
  error: null,
}

// 异步thunk：获取任务列表
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters?: Partial<TaskState['filters']>) => {
    // 这里添加API调用逻辑
    // 暂时返回模拟数据
    const mockTasks: Task[] = [
      {
        id: 1,
        title: '完成项目报告',
        description: '完成Q4季度项目总结报告',
        status: 'pending',
        priority: 'high',
        categoryId: 1,
        dueDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDuration: 120,
        actualDuration: 0,
        tags: ['工作', '报告'],
      },
      {
        id: 2,
        title: '学习React',
        description: '学习React Hooks和性能优化',
        status: 'in_progress',
        priority: 'medium',
        categoryId: 2,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDuration: 60,
        actualDuration: 30,
        tags: ['学习', '前端'],
      },
    ]

    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    return mockTasks
  }
)

// 异步thunk：创建任务
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    // 这里添加API调用逻辑
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await new Promise(resolve => setTimeout(resolve, 300))
    return newTask
  }
)

// 异步thunk：更新任务
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: number; taskData: Partial<Task> }) => {
    // 这里添加API调用逻辑
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      id,
      taskData,
      updatedAt: new Date().toISOString(),
    }
  }
)

// 异步thunk：删除任务
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: number) => {
    // 这里添加API调用逻辑
    await new Promise(resolve => setTimeout(resolve, 300))
    return id
  }
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    },
    // 同步更新任务状态（用于 optimistic updates）
    updateTaskStatus: (state, action: PayloadAction<{ id: number; status: TaskStatus }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id)
      if (task) {
        task.status = action.payload.status
        task.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || '获取任务失败'
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload)
      })
      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, taskData, updatedAt } = action.payload
        const index = state.tasks.findIndex(task => task.id === id)
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...taskData,
            updatedAt,
          }
        }
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload)
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null
        }
      })
  },
})

export const {
  setSelectedTask,
  setFilters,
  clearFilters,
  clearError,
  updateTaskStatus,
} = taskSlice.actions

export default taskSlice.reducer