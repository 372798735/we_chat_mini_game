import React from 'react'
import { Switch, Tooltip, Space } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { setTheme } from '@/store/slices/appSlice'
import './ThemeToggle.css'

const ThemeToggle: React.FC<{ size?: 'small' | 'default' }> = ({ size = 'default' }) => {
  const dispatch = useAppDispatch()
  const { theme } = useAppSelector((state) => state.app)

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    dispatch(setTheme(newTheme))
  }

  const isDark = theme === 'dark'

  return (
    <div className="theme-toggle">
      <Space align="center" size={size === 'small' ? 'small' : 'middle'}>
        <Tooltip title="浅色主题">
          <SunOutlined
            className={`theme-icon ${!isDark ? 'active' : 'inactive'}`}
            style={{ fontSize: size === 'small' ? 14 : 16 }}
          />
        </Tooltip>

        <Switch
          checked={isDark}
          onChange={handleThemeChange}
          size={size === 'small' ? 'small' : 'default'}
          className="theme-switch"
        />

        <Tooltip title="深色主题">
          <MoonOutlined
            className={`theme-icon ${isDark ? 'active' : 'inactive'}`}
            style={{ fontSize: size === 'small' ? 14 : 16 }}
          />
        </Tooltip>
      </Space>
    </div>
  )
}

export default ThemeToggle