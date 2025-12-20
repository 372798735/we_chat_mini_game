# 番茄闹钟 - React + Electron 技术架构文档

## 📋 目录
1. [项目概述](#项目概述)
2. [技术栈详解](#技术栈详解)
3. [项目结构分析](#项目结构分析)
4. [Electron 集成详解](#electron-集成详解)
5. [React 应用架构](#react-应用架构)
6. [状态管理详解](#状态管理详解)
7. [API 集成架构](#api-集成架构)
8. [构建与部署](#构建与部署)
9. [开发指南](#开发指南)
10. [常见问题与解决方案](#常见问题与解决方案)

---

## 🎯 项目概述

番茄闹钟是一款基于 React + Electron 技术栈的桌面应用程序，结合了现代前端技术栈和桌面端开发框架，为用户提供跨平台的待办事项管理和番茄工作法计时功能。

### 核心功能
- 📝 **任务管理** - 创建、编辑、删除和分类任务
- 🍅 **番茄计时** - 番茄工作法计时器
- 📊 **统计分析** - 任务完成情况和时间统计
- ⚙️ **设置管理** - 用户偏好设置
- 🏷️ **标签系统** - 任务标签管理

---

## 🛠️ 技术栈详解

### 前端技术栈
| 技术 | 版本 | 用途 |
|-----|------|------|
| **React** | 18.2.0 | 前端UI框架，组件化开发 |
| **TypeScript** | 5.2.2 | 类型安全的JavaScript超集 |
| **Ant Design** | 5.11.1 | 企业级UI组件库 |
| **React Router** | 6.18.0 | 前端路由管理 |
| **Redux Toolkit** | 1.9.7 | 状态管理 |
| **Axios** | 1.5.1 | HTTP客户端，API请求 |
| **Day.js** | 1.11.19 | 轻量级日期处理库 |
| **Recharts** | 3.6.0 | 数据可视化图表库 |

### Electron 相关
| 技术 | 版本 | 用途 |
|-----|------|------|
| **Electron** | 27.1.2 | 桌面应用框架 |
| **Electron Builder** | 24.6.4 | 应用打包构建工具 |
| **Concurrently** | 8.2.2 | 并发执行开发任务 |
| **Wait-on** | 7.2.0 | 等待服务启动工具 |

### 构建工具
| 技术 | 版本 | 用途 |
|-----|------|------|
| **Vite** | 4.5.0 | 现代前端构建工具 |
| **ESLint** | 8.52.0 | 代码质量检查 |
| **Prettier** | 3.0.3 | 代码格式化工具 |

---

## 📁 项目结构分析

```
frontend/
├── public/                    # 静态资源目录
│   ├── electron.js           # Electron 主进程（开发环境）
│   ├── electron-prod.js      # Electron 主进程（生产环境）
│   ├── electron.js.disabled  # 禁用的旧版本Electron配置
│   ├── icon.ico              # 应用图标
│   └── index.html            # HTML模板
├── src/                      # 源代码目录
│   ├── api/                  # API 接口层
│   │   ├── auth.ts          # 认证相关API
│   │   ├── dict.ts          # 字典API
│   │   ├── index.ts         # API统一导出
│   │   ├── pomodoro.ts      # 番茄钟API
│   │   ├── request.ts       # HTTP请求封装
│   │   ├── statistics.ts    # 统计API
│   │   └── task.ts          # 任务API
│   ├── components/           # 通用组件
│   │   ├── common/          # 基础组件
│   │   ├── statistics/      # 统计相关组件
│   │   ├── summary/         # 摘要组件
│   │   └── task/            # 任务相关组件
│   ├── hooks/               # 自定义Hooks
│   │   └── redux.ts         # Redux Hooks
│   ├── pages/               # 页面组件
│   │   ├── Dashboard.tsx    # 仪表板页面
│   │   ├── TaskList.tsx     # 任务列表页面
│   │   ├── PomodoroTimer.tsx # 番茄钟页面
│   │   ├── Statistics.tsx   # 统计页面
│   │   └── ...
│   ├── store/               # Redux状态管理
│   │   ├── slices/          # Redux Toolkit切片
│   │   └── index.ts         # Store配置
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   ├── App.tsx              # 应用根组件
│   └── main.tsx             # 应用入口
├── scripts/                 # 构建脚本
│   ├── build-simple.js     # 简单打包脚本
│   └── build-no-sign.js    # 无代码签名打包脚本
├── dist/                    # 构建输出目录
├── dist-electron/           # Electron打包输出
├── package.json             # 项目配置
├── vite.config.ts           # Vite配置
└── tsconfig.json           # TypeScript配置
```

### 关键配置文件

#### package.json 核心配置
```json
{
  "name": "tomato-todo-app",
  "version": "1.0.0",
  "main": "public/electron-prod.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:vite\" \"wait-on http://localhost:5173 && npm run dev:electron\"",
    "dev:vite": "vite",
    "dev:electron": "electron .",
    "build": "vite build",
    "build:electron": "npm run build && node scripts/build-simple.js"
  }
}
```

#### Vite 配置 (vite.config.ts)
- **路径别名配置**：支持 `@/` 开头的模块导入
- **开发服务器**：运行在端口3003
- **构建输出**：输出到 `dist` 目录
- **基础路径**：设置为相对路径 `'./'` 适配Electron

---

## ⚡ Electron 集成详解

### Electron 架构概览

Electron 应用采用多进程架构：
1. **主进程 (Main Process)** - 负责应用生命周期、窗口管理、系统API调用
2. **渲染进程 (Renderer Process)** - 负责UI渲染和用户交互

### 主进程配置

#### 开发环境配置 (public/electron.js)
```javascript
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 开发环境：连接开发服务器
if (isDev) {
  mainWindow.loadURL('http://localhost:3003')
  mainWindow.webContents.openDevTools() // 打开开发者工具
} else {
  // 生产环境：加载本地文件
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
}
```

#### 生产环境配置 (public/electron-prod.js)
```javascript
// 生产环境直接加载本地文件，不打开控制台
mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(err => {
  console.error('Failed to load local file:', err)
  mainWindow.loadURL('data:text/html,<h1>Application Error</h1>')
})
```

### Electron 关键特性

1. **环境检测** - 自动识别开发/生产环境
2. **窗口管理** - 1200x800窗口，支持开发者工具
3. **错误处理** - 文件加载失败时显示错误页面
4. **跨平台兼容** - Windows、macOS、Linux支持

### 打包配置

#### electron-builder 配置
```json
"build": {
  "appId": "com.tomato.todo",
  "productName": "番茄闹钟",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "public/electron-prod.js",
    "node_modules/**/*"
  ],
  "win": {
    "target": "dir",
    "icon": "public/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  }
}
```

---

## ⚛️ React 应用架构

### 组件架构设计

应用采用分层组件架构：

```
App (根组件)
├── Router (路由管理)
├── ProtectedRoute (路由守卫)
└── MainLayout (主布局)
    ├── Sidebar (侧边栏)
    └── Content Area
        ├── Dashboard
        ├── TaskList
        ├── PomodoroTimer
        ├── Statistics
        └── Settings
```

### 路由设计

基于 React Router v6 的路由配置：

```typescript
// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) return <Loading fullscreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

### 页面组件结构

#### 1. Dashboard (仪表板)
- **功能**：应用主页，显示任务概览和统计信息
- **组件**：DashboardStats、TaskCard、WeeklyChart
- **状态管理**：集成任务和统计数据

#### 2. TaskList (任务列表)
- **功能**：任务的CRUD操作
- **组件**：TaskCard、TaskCreateForm、TaskFilter
- **交互**：支持拖拽排序、状态切换

#### 3. PomodoroTimer (番茄钟)
- **功能**：番茄工作法计时器
- **特性**：与任务关联、声音提醒、暂停/继续

#### 4. Statistics (统计页面)
- **功能**：数据可视化展示
- **图表**：使用 Recharts 实现多种图表类型

---

## 🔄 状态管理详解

### Redux Toolkit 架构

应用采用 Redux Toolkit 进行状态管理，具有以下优势：
- 📦 **简化配置** - 减少样板代码
- 🚀 **内置Immer** - 不可变数据更新
- 🔧 **DevTools集成** - 开发调试支持

### Store 结构

```typescript
interface RootState {
  auth: AuthState        // 认证状态
  tasks: TaskState       // 任务状态
  pomodoro: PomodoroState // 番茄钟状态
  statistics: StatisticsState // 统计状态
  app: AppState          // 应用全局状态
}
```

### Slice 设计

#### 1. AuthSlice - 认证管理
```typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
}
```

**主要功能：**
- 用户登录/登出
- Token管理
- 认证状态持久化

#### 2. TaskSlice - 任务管理
```typescript
interface TaskState {
  tasks: Task[]
  currentTask: Task | null
  filters: TaskFilters
  pagination: PaginationInfo
  loading: boolean
}
```

**主要功能：**
- 任务CRUD操作
- 任务状态管理
- 分页和过滤

#### 3. PomodoroSlice - 番茄钟状态
```typescript
interface PomodoroState {
  isActive: boolean
  isPaused: boolean
  currentSession: PomodoroSession | null
  settings: PomodoroSettings
}
```

#### 4. StatisticsSlice - 统计数据
```typescript
interface StatisticsState {
  taskStatistics: TaskStatistics
  pomodoroStatistics: PomodoroStatistics
  dashboardData: DashboardData
  loading: boolean
}
```

### 异步操作处理

使用 Redux Toolkit 的 `createAsyncThunk` 处理异步操作：

```typescript
// 示例：获取任务列表
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: TaskQueryParams, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTasks(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)
```

---

## 🌐 API 集成架构

### HTTP 客户端封装

基于 Axios 的 HTTP 客户端，提供统一的API调用接口：

```typescript
// src/api/request.ts
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:18000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器 - 添加认证token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一错误处理
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### API 模块设计

#### 1. 认证API (auth.ts)
```typescript
export const authApi = {
  login: (credentials: LoginRequest) => Request.post('/auth/login', credentials),
  register: (userData: RegisterRequest) => Request.post('/auth/register', userData),
  logout: () => Request.post('/auth/logout'),
  getCurrentUser: () => Request.get('/auth/me'),
  refreshToken: () => Request.post('/auth/refresh')
}
```

#### 2. 任务API (task.ts)
```typescript
export const taskApi = {
  getTasks: (params?: TaskQueryParams) => Request.get<PageResponse<Task>>('/tasks', { params }),
  createTask: (task: TaskCreateRequest) => Request.post<Task>('/tasks', task),
  updateTask: (id: number, task: TaskUpdateRequest) => Request.put<Task>(`/tasks/${id}`, task),
  deleteTask: (id: number) => Request.delete(`/tasks/${id}`),
  updateTaskStatus: (id: number, status: TaskStatus) => Request.patch(`/tasks/${id}/status`, { status })
}
```

#### 3. 统计API (statistics.ts)
```typescript
export const statisticsApi = {
  getDashboardStatistics: () => Request.get<DashboardStatistics>('/statistics/dashboard'),
  getWeeklyStatistics: () => Request.get<DailyStatistics[]>('/statistics/weekly'),
  getMonthlyStatistics: (year: number, month: number) => Request.get<MonthlyStatistics>(`/statistics/monthly/${year}/${month}`),
  getPomodoroStatistics: (timeRange?: string) => Request.get<PomodoroStatistics>('/statistics/pomodoro', { params: { timeRange } })
}
```

### 错误处理策略

1. **统一错误格式** - 后端返回统一的错误响应格式
2. **全局错误处理** - 在 Axios 拦截器中统一处理
3. **页面级错误处理** - 在组件中处理特定错误
4. **用户友好提示** - 使用 Ant Design 的 message 组件显示错误信息

---

## 🔨 构建与部署

### 开发环境启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发环境
npm run dev
```

开发环境会：
- 启动 Vite 开发服务器 (端口3003)
- 启动 Electron 主进程
- 打开开发者工具
- 支持热重载

### 生产环境构建

```bash
# 1. 构建前端应用
npm run build

# 2. 打包 Electron 应用
npm run build:electron
```

### 构建脚本详解

#### build-simple.js
- 使用 electron-builder
- 支持代码签名（可选）
- 生成安装包

#### build-no-sign.js
- 禁用代码签名
- 更快的构建速度
- 适合开发和测试

### 环境配置

#### .env 文件
```env
REACT_APP_API_BASE_URL=http://localhost:18000
REACT_APP_APP_VERSION=1.0.0
```

#### .env.development
```env
REACT_APP_API_BASE_URL=http://localhost:18000
NODE_ENV=development
```

#### .env.production
```env
REACT_APP_API_BASE_URL=http://localhost:18000
NODE_ENV=production
```

---

## 👨‍💻 开发指南

### 代码规范

#### ESLint 配置
- 使用 TypeScript 规则
- React Hooks 规则
- 代码质量检查

#### Prettier 配置
- 统一代码格式
- 2空格缩进
- 单引号字符串

### 组件开发规范

#### 1. 函数组件模板
```typescript
import React from 'react'

interface ComponentProps {
  // 定义组件属性
}

/**
 * 组件描述
 * @param props 组件属性
 * @returns JSX.Element
 */
export const Component: React.FC<ComponentProps> = (props) => {
  return (
    <div>
      {/* 组件内容 */}
    </div>
  )
}

export default Component
```

#### 2. 自定义Hook模板
```typescript
import { useState, useEffect } from 'react'

interface UseHookReturn {
  // 定义返回值类型
}

/**
 * Hook 描述
 * @param param 参数描述
 * @returns Hook返回值
 */
export const useCustomHook = (param: string): UseHookReturn => {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    // 副作用逻辑
  }, [param])

  return { state }
}
```

### 状态管理最佳实践

#### 1. Slice 设计原则
- **单一职责** - 每个Slice只管理相关状态
- **标准化** - 使用统一的命名规范
- **类型安全** - 完整的TypeScript类型定义

#### 2. 异步操作模式
```typescript
// 创建异步 Thunk
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params: Params, { rejectWithValue }) => {
    try {
      const response = await api.getData(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 在 Slice 中处理
extraReducers: (builder) => {
  builder
    .addCase(fetchData.pending, (state) => {
      state.loading = true
    })
    .addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false
      state.data = action.payload
    })
    .addCase(fetchData.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
}
```

### API 调用最佳实践

#### 1. 统一错误处理
```typescript
const handleSubmit = async () => {
  try {
    setLoading(true)
    await api.submitData(formData)
    message.success('提交成功')
  } catch (error) {
    message.error('提交失败：' + error.message)
  } finally {
    setLoading(false)
  }
}
```

#### 2. 请求取消
```typescript
useEffect(() => {
  const controller = new AbortController()

  const fetchData = async () => {
    try {
      const response = await api.getData({ signal: controller.signal })
      setData(response)
    } catch (error) {
      if (error.name !== 'AbortError') {
        message.error('获取数据失败')
      }
    }
  }

  fetchData()

  return () => {
    controller.abort()
  }
}, [])
```

---

## ❓ 常见问题与解决方案

### 1. Electron 开发问题

#### Q: 开发环境白屏怎么办？
**A:** 检查以下几点：
- 确保 Vite 开发服务器已启动（端口3003）
- 检查 `electron.js` 中的URL配置
- 查看控制台是否有错误信息

#### Q: 打包后应用无法启动？
**A:** 常见原因：
- 检查 `package.json` 中的 `main` 字段路径
- 确保 `electron-prod.js` 文件存在
- 检查文件路径是否正确

#### Q: 生产环境控制台自动打开？
**A:** 确保使用 `electron-prod.js` 作为主进程配置，该文件不会自动打开控制台。

### 2. React 开发问题

#### Q: 组件状态不更新？
**A:** 检查：
- Redux状态是否正确更新
- 组件是否正确订阅状态变化
- 是否使用了正确的依赖数组

#### Q: 路由跳转不工作？
**A:** 确认：
- 使用 `react-router-dom` v6 的语法
- 检查路由配置是否正确
- 受保护路由的认证逻辑

### 3. API 集成问题

#### Q: 请求跨域问题？
**A:** 解决方案：
- 开发环境配置 Vite 代理
- 后端配置 CORS
- 使用环境变量区分不同环境的API地址

#### Q: 认证Token过期？
**A:** 处理策略：
- Axios拦截器自动检测401状态码
- 自动跳转登录页面
- 实现Token刷新机制

### 4. 构建问题

#### Q: 构建体积过大？
**A:** 优化策略：
- 使用动态导入（`import()`）
- 配置代码分割
- 优化依赖包大小

#### Q: 打包速度慢？
**A:** 加速方法：
- 使用无代码签名脚本 `build-no-sign.js`
- 配置构建缓存
- 优化依赖分析

---

## 📚 学习资源

### React 相关
- [React 官方文档](https://react.dev/)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Ant Design 组件库](https://ant.design/)

### Electron 相关
- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron Builder 文档](https://www.electron.build/)

### 工具相关
- [Vite 官方文档](https://vitejs.dev/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)

---

## 🎉 总结

本项目展示了现代 React + Electron 桌面应用开发的最佳实践，包括：

### ✅ 技术亮点
- **现代化技术栈** - React 18 + TypeScript + Vite
- **完善的状态管理** - Redux Toolkit 模式
- **组件化架构** - 可维护的代码结构
- **跨平台支持** - Electron 桌面应用
- **类型安全** - 完整的 TypeScript 支持

### 🚀 开发优势
- **开发体验佳** - 热重载、快速构建
- **代码质量高** - ESLint + Prettier
- **调试方便** - 开发者工具集成
- **部署简单** - 一键打包构建

### 📈 扩展性
- **模块化设计** - 易于添加新功能
- **API 抽象** - 后端接口切换友好
- **配置灵活** - 多环境支持
- **组件复用** - 高度可复用的组件库

这个架构为类似桌面应用开发提供了一个可靠的参考实现，开发者可以根据具体需求进行调整和扩展。