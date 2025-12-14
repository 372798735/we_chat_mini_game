import React from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Descriptions,
  Space,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '@/hooks/redux';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Text type="secondary">用户信息加载中...</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>个人资料</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar
                size={100}
                src={user.avatar}
                icon={!user.avatar ? <UserOutlined /> : undefined}
                style={{
                  marginBottom: '16px',
                  backgroundColor: user.avatar ? 'transparent' : '#1890ff'
                }}
              />
              <div>
                <Button
                  icon={<CameraOutlined />}
                  type="primary"
                  ghost
                  size="small"
                  style={{ marginBottom: '8px' }}
                >
                  更换头像
                </Button>
              </div>
              <Title level={4} style={{ margin: '16px 0 8px 0' }}>
                {user.nickname || user.username}
              </Title>
              <Text type="secondary">{user.email}</Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card
            title="基本信息"
            extra={
              <Button icon={<EditOutlined />} type="primary" ghost>
                编辑资料
              </Button>
            }
          >
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="用户名">
                <Text strong>{user.username}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="昵称">
                <Text>{user.nickname || '未设置'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <Space>
                  <MailOutlined />
                  <Text>{user.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                <Text>{user.phone || '未设置'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">
                <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="最后更新">
                <Text>{new Date(user.updatedAt).toLocaleDateString()}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Space>
                <Button>修改密码</Button>
                <Button danger>删除账户</Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;