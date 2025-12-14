import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { initializeAuth } from '@/store/slices/authSlice'

// 页面组件
import Dashboard from './pages/Dashboard'
import TaskList from './pages/TaskList'
import PomodoroTimer from './pages/PomodoroTimer'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Profile from './pages/Profile'
import TestDataSeparation from './pages/TestDataSeparation'
import MainLayout from './pages/MainLayout'

// 组件
import { Loading } from './components/common'

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return <Loading fullscreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const [appLoading, setAppLoading] = React.useState(true)
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // 应用初始化
    const initApp = async () => {
      try {
        // 初始化认证状态（从localStorage恢复）
        dispatch(initializeAuth())

        console.log('应用初始化完成')
      } catch (error) {
        console.error('应用初始化失败:', error)
      } finally {
        setAppLoading(false)
      }
    }

    initApp()
  }, [dispatch])  // 移除 token 依赖，避免无限循环

  if (appLoading) {
    return <Loading fullscreen />
  }

  return (
    <Routes>
      {/* 登录页面 */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* 受保护的路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <MainLayout><TaskList /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pomodoro"
        element={
          <ProtectedRoute>
            <MainLayout><PomodoroTimer /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <MainLayout><Statistics /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout><Settings /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-data-separation"
        element={
          <ProtectedRoute>
            <MainLayout><TestDataSeparation /></MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App