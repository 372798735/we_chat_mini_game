import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Checkbox,
  App,
  Divider,
  Alert,
  Row,
  Col,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginUser, registerUser, clearError } from '@/store/slices/authSlice';
import type { LoginRequest, RegisterRequest } from '@/api/auth';

const { Title, Text } = Typography;

interface LoginProps {}

/**
 * 登录/注册页面组件
 */
export const Login: React.FC<LoginProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { message } = App.useApp();

  const {
    loginLoading,
    registerLoading,
    error,
    isAuthenticated,
  } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // 处理登录
  const handleLogin = async (values: LoginRequest) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      message.success('登录成功！');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  // 处理注册
  const handleRegister = async (values: RegisterRequest) => {
    try {
      await dispatch(registerUser(values)).unwrap();
      message.success('注册成功！请登录');
      setIsLogin(true);
      form.resetFields();
    } catch (error) {
      message.error('注册失败，请稍后重试');
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (isLogin) {
      await handleLogin(values as LoginRequest);
    } else {
      await handleRegister(values as RegisterRequest);
    }
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLogin(!isLogin);
    form.resetFields();
    dispatch(clearError());
  };

  return (
    <Row justify="center" align="middle" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card
          style={{
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
          styles={{ body: { padding: '40px' } }}
        >
          {/* Logo和标题 */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍅</div>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              番茄闹钟
            </Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {isLogin ? '欢迎回来！' : '创建新账户'}
            </Text>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => dispatch(clearError())}
              style={{ marginBottom: '24px' }}
            />
          )}

          {/* 表单 */}
          <Form
            form={form}
            name="auth"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            {!isLogin && (
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="邮箱地址"
                  autoComplete="email"
                />
              </Form.Item>
            )}

            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
                { max: 20, message: '用户名最多20个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                autoComplete={isLogin ? "current-password" : "new-password"}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {!isLogin && (
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                  autoComplete="new-password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            )}

            {isLogin && (
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住我</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password" style={{ color: '#1890ff' }}>
                    忘记密码？
                  </Link>
                </div>
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading || registerLoading}
                block
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                }}
              >
                {isLogin ? '登录' : '注册'}
              </Button>
            </Form.Item>

            </Form>

          <Divider>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {isLogin ? '还没有账号？' : '已有账号？'}
            </Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="link"
              onClick={toggleMode}
              style={{ fontSize: '14px' }}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;