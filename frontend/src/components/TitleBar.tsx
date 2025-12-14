import React from 'react'
import { Layout, Typography, Space, Button } from 'antd'
import {
  MinusOutlined,
  BorderOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
// import '@/types/electron'
import { toggleSidebar } from '@/store/slices/appSlice'

const { Header } = Layout
const { Title } = Typography

const TitleBar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector(state => state.app)

  // 处理窗口控制
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow()
    }
  }

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow()
    }
  }

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow()
    }
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  return (
    <Header
      style={{
        padding: '0 16px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {/* 左侧区域 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleToggleSidebar}
          style={{ marginRight: '16px' }}
        />
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          番茄闹钟待办清单
        </Title>
      </div>

      {/* 右侧区域 */}
      <Space>
        {/* 窗口控制按钮 */}
        {window.electronAPI && (
          <Space size={0}>
            <Button
              type="text"
              icon={<MinusOutlined />}
              onClick={handleMinimize}
              style={{ width: '40px', height: '40px' }}
              title="最小化"
            />
            <Button
              type="text"
              icon={<BorderOutlined />}
              onClick={handleMaximize}
              style={{ width: '40px', height: '40px' }}
              title="最大化"
            />
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={handleClose}
              style={{ width: '40px', height: '40px' }}
              title="关闭"
              className="close-button"
            />
          </Space>
        )}
      </Space>

      <style jsx>{`
        .close-button:hover {
          background-color: #ff4d4f !important;
          color: white !important;
        }
      `}</style>
    </Header>
  )
}

export default TitleBar