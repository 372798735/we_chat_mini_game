import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Progress,
  Space,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  WechatOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { Loading } from '../components/common';

const { Title, Text } = Typography;

interface RegisterProps {}

/**
 * 注册页面组件
 */
export const Register: React.FC<RegisterProps> = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 密码强度检查
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 5);
  };

  // 获取密码强度文本和颜色
  const getPasswordStrengthInfo = (strength: number) => {
    const colors = ['#ff4d4f', '#faad14', '#fadb14', '#52c41a', '#389e0d'];
    const texts = ['很弱', '弱', '中等', '强', '很强'];
    return {
      text: texts[strength - 1] || '',
      color: colors[strength - 1] || '#ff4d4f',
      percent: (strength / 5) * 100,
    };
  };

  // 处理注册
  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        nickname: values.nickname || values.username,
      });

      message.success('注册成功！请登录您的账户');
      navigate('/login');
    } catch (error: any) {
      console.error('注册失败:', error);
      message.error(error.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 微信注册（示例）
  const handleWechatRegister = () => {
    message.info('微信注册功能暂未开放');
  };

  const password = Form.useWatch('password', form);
  const passwordStrength = password ? checkPasswordStrength(password) : 0;
  const strengthInfo = getPasswordStrengthInfo(passwordStrength);

  if (loading) {
    return <Loading fullscreen text="注册中..." />;
  }

  return (
    <div className="register-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 450,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        bodyStyle={{ padding: '40px 32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            创建账户
          </Title>
          <Text type="secondary">
            加入番茄待办，开始高效管理
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          size="large"
          layout="vertical"
          scrollToFirstError
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱地址"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="nickname"
            rules={[
              { max: 50, message: '昵称不能超过50个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="昵称（可选）"
              autoComplete="nickname"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 50, message: '密码长度为6-50个字符' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const strength = checkPasswordStrength(value);
                  if (strength < 2) {
                    return Promise.reject(new Error('密码强度太弱，请使用包含大小写字母、数字和特殊字符的密码'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="new-password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          {/* 密码强度指示器 */}
          {password && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>密码强度：</Text>
                <Text style={{ fontSize: '12px', color: strengthInfo.color, fontWeight: 'bold' }}>
                  {strengthInfo.text}
                </Text>
              </div>
              <Progress
                percent={strengthInfo.percent}
                strokeColor={strengthInfo.color}
                showInfo={false}
                size="small"
                style={{ height: '4px' }}
              />
            </div>
          )}

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) => {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              autoComplete="new-password"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              创建账户
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              注册即表示您同意我们的
            </Text>
            <Space>
              <Link to="/terms" style={{ fontSize: '12px', color: '#1890ff' }}>
                服务条款
              </Link>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                和
              </Text>
              <Link to="/privacy" style={{ fontSize: '12px', color: '#1890ff' }}>
                隐私政策
              </Link>
            </Space>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              已有账户？
            </Text>
            <Link to="/login" style={{ fontWeight: 'bold', color: '#1890ff', marginLeft: '4px' }}>
              立即登录
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;