import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Typography,
  Space,
  theme,
  Tooltip,
  Modal,
  message,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutUser } from '@/store/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * 主界面布局组件
 *
 * @param props - 布局属性
 * @returns JSX.Element
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: '概览',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
    },
    {
      key: '/pomodoro',
      icon: <ClockCircleOutlined />,
      label: '专注计时',
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
  ];

  // 处理用户退出
  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(logoutUser()).unwrap();
          message.success('退出登录成功');
          navigate('/login');
        } catch (error) {
          message.error('退出登录失败，请稍后重试');
        }
      },
    });
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <ProfileOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 通知下拉菜单
  const notificationMenuItems = [
    {
      key: 'notification-1',
      label: (
        <div>
          <Text strong>任务提醒</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              您有3个任务即将到期
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: 'notification-2',
      label: (
        <div>
          <Text strong>番茄钟提醒</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              记得休息一下，喝杯水
            </Text>
          </div>
        </div>
      ),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'all',
      label: '查看所有通知',
    },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理用户菜单点击（保留用于兼容性）
  const handleUserMenuClick = ({ key }: { key: string }) => {
    // 这个函数现在主要用于菜单项的兼容性
    // 实际的点击处理已经在userMenuItems中定义了onClick
    console.log('用户菜单点击:', key);
  };

  // 处理通知菜单点击
  const handleNotificationMenuClick = ({ key }: { key: string }) => {
    if (key === 'all') {
      navigate('/notifications');
    } else {
      // 处理单个通知点击
      console.log('点击通知:', key);
    }
  };

  // 模拟通知数据
  useEffect(() => {
    // 这里可以从API获取通知数量
    setNotifications(3);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="main-sider"
        width={200}
        style={{
          background: colorBgContainer,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        {/* Logo区域 */}
        <div className="main-logo">
          <div className="logo-content">
            <div className="logo-icon">🍅</div>
            {!collapsed && (
              <div className="logo-text">
                <Text strong style={{ fontSize: 18, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                  番茄闹钟
                </Text>
                <Text style={{ fontSize: 13, color: '#f0f3f7', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>专注时间管理</Text>
              </div>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', flex: 1 }}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout className="main-content-layout">
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 40,
                height: 40,
              }}
            />
          </div>

          <div className="header-right">
            <Space size={16}>
              {/* 通知铃铛 */}
              <Dropdown
                menu={{
                  items: notificationMenuItems,
                  onClick: handleNotificationMenuClick,
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Tooltip title="通知">
                  <Button
                    type="text"
                    icon={
                      <Badge count={notifications} size="small">
                        <BellOutlined />
                      </Badge>
                    }
                    style={{ fontSize: '16px' }}
                  />
                </Tooltip>
              </Dropdown>

              {/* 用户头像 */}
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <div className="user-profile" style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Avatar
                    size="small"
                    src={user?.avatar}
                    icon={!user?.avatar ? <UserOutlined /> : undefined}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: user?.avatar ? 'transparent' : '#1890ff'
                    }}
                  />
                  <span className="user-name" style={{
                    marginLeft: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#262626'
                  }}>
                    {user?.nickname || user?.username || '用户'}
                  </span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: colorBgContainer,
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
