import React from 'react'
import { Card, Form, Input, Switch, Button, Select, Divider, Typography, Space, message, Row, Col } from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { updateSettings } from '@/store/slices/pomodoroSlice'
import { setTheme, setLanguage } from '@/store/slices/appSlice'

const { Title, Text } = Typography
const { Option } = Select

const Settings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { settings } = useAppSelector(state => state.pomodoro)
  const { theme, language } = useAppSelector(state => state.app)

  const [form] = Form.useForm()

  // 保存设置
  const handleSave = async (values: any) => {
    try {
      // 更新番茄钟设置
      dispatch(updateSettings({
        focusDuration: values.focusDuration,
        shortBreakDuration: values.shortBreakDuration,
        longBreakDuration: values.longBreakDuration,
        longBreakInterval: values.longBreakInterval,
        autoStartBreak: values.autoStartBreak,
        autoStartFocus: values.autoStartFocus,
        notificationEnabled: values.notificationEnabled,
      }))

      // 更新主题设置
      dispatch(setTheme(values.theme))

      // 更新语言设置
      dispatch(setLanguage(values.language))

      message.success('设置保存成功')
    } catch (error) {
      message.error('设置保存失败')
    }
  }

  // 重置设置
  const handleReset = () => {
    form.setFieldsValue({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreak: false,
      autoStartFocus: false,
      notificationEnabled: true,
      theme: 'light',
      language: 'zh-CN',
    })
    message.info('设置已重置')
  }

  return (
    <div className="settings-page" style={{ padding: '24px' }}>
      <Title level={2}>设置</Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          focusDuration: settings.focusDuration,
          shortBreakDuration: settings.shortBreakDuration,
          longBreakDuration: settings.longBreakDuration,
          longBreakInterval: settings.longBreakInterval,
          autoStartBreak: settings.autoStartBreak,
          autoStartFocus: settings.autoStartFocus,
          notificationEnabled: settings.notificationEnabled,
          theme,
          language,
        }}
        onFinish={handleSave}
      >
        <Row gutter={[24, 24]}>
          {/* 番茄钟设置 */}
          <Col xs={24} lg={12}>
            <Card title="番茄钟设置">
              <Form.Item
                label="专注时长（分钟）"
                name="focusDuration"
                rules={[{ required: true, message: '请输入专注时长' }]}
              >
                <Input type="number" min={1} max={60} />
              </Form.Item>

              <Form.Item
                label="短休息时长（分钟）"
                name="shortBreakDuration"
                rules={[{ required: true, message: '请输入短休息时长' }]}
              >
                <Input type="number" min={1} max={30} />
              </Form.Item>

              <Form.Item
                label="长休息时长（分钟）"
                name="longBreakDuration"
                rules={[{ required: true, message: '请输入长休息时长' }]}
              >
                <Input type="number" min={1} max={60} />
              </Form.Item>

              <Form.Item
                label="长休息间隔（几个专注时间后）"
                name="longBreakInterval"
                rules={[{ required: true, message: '请输入长休息间隔' }]}
              >
                <Input type="number" min={2} max={10} />
              </Form.Item>

              <Divider />

              <Form.Item
                label="自动开始休息"
                name="autoStartBreak"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="自动开始专注"
                name="autoStartFocus"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="启用通知"
                name="notificationEnabled"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>

          {/* 应用设置 */}
          <Col xs={24} lg={12}>
            <Card title="应用设置">
              <Form.Item
                label="主题"
                name="theme"
                rules={[{ required: true, message: '请选择主题' }]}
              >
                <Select>
                  <Option value="light">浅色主题</Option>
                  <Option value="dark">深色主题</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="语言"
                name="language"
                rules={[{ required: true, message: '请选择语言' }]}
              >
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>

              <Divider />

              <Form.Item label="数据管理">
                <Space direction="vertical">
                  <Button type="default" block>
                    导出数据
                  </Button>
                  <Button type="default" block>
                    导入数据
                  </Button>
                  <Button type="default" block>
                    清除缓存
                  </Button>
                </Space>
              </Form.Item>

              <Divider />

              <Form.Item label="关于">
                <Space direction="vertical">
                  <div>
                    <Text strong>番茄闹钟待办清单</Text>
                  </div>
                  <div>
                    <Text type="secondary">版本：1.0.0</Text>
                  </div>
                  <div>
                    <Text type="secondary">基于番茄工作法的时间管理工具</Text>
                  </div>
                </Space>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              保存设置
            </Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置默认
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  )
}

export default Settings