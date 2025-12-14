import React from 'react'
import { Layout, Menu, Avatar, Badge, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useAppSelector } from '@/hooks/redux'

const { Sider } = Layout

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, notificationCount } = useAppSelector(state => state.app)

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
    },
    {
      key: '/timer',
      icon: <ClockCircleOutlined />,
      label: '番茄钟',
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计分析',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      theme="light"
      width={240}
      collapsedWidth={80}
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo 区域 */}
      <div style={{
        height: '64px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '16px',
      }}>
        {!sidebarCollapsed ? (
          <Space>
            <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
              <UserOutlined />
            </Avatar>
            <div>
              <div style={{ fontWeight: 'bold' }}>番茄 Todo</div>
              <div style={{ fontSize: '12px', color: '#666' }}>专注时间管理</div>
            </div>
          </Space>
        ) : (
          <Avatar size="large" style={{ backgroundColor: '#1890ff' }}>
            <UserOutlined />
          </Avatar>
        )}
      </div>

      {/* 菜单容器 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </div>

      {/* 底部用户信息 */}
      <div style={{
        flexShrink: 0,
        padding: '16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
      }}>
        {!sidebarCollapsed ? (
          <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ fontSize: '14px' }}>用户</span>
            </Space>
            <Badge count={notificationCount} size="small">
              <BellOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
            </Badge>
          </Space>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Badge count={notificationCount} size="small">
              <BellOutlined style={{ fontSize: '16px', cursor: 'pointer' }} />
            </Badge>
          </div>
        )}
      </div>
    </Sider>
  )
}

export default Sidebar