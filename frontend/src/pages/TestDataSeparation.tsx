import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import TestDataSeparation from '@/utils/testDataSeparation';
import { useAppSelector } from '@/hooks/redux';
import { taskApi } from '@/api/task';

const { Title, Text } = Typography;

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  expected: string;
  actual: string;
}

const TestDataSeparationPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [sampleTasks, setSampleTasks] = useState<any[]>([]);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // 页面加载时显示当前认证状态
    TestDataSeparation.showDataSeparationStatus();
  }, []);

  const runTests = async () => {
    setIsRunningTests(true);
    const results = await TestDataSeparation.runAllTests();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const loadCurrentUserData = async () => {
    try {
      const tasks = await taskApi.getTasks({ pageSize: 10 });
      setSampleTasks(tasks.records || []);

      // 测试API响应数据
      const userId = localStorage.getItem('userId');
      if (userId) {
        TestDataSeparation.testApiResponseUserData(tasks.records, userId);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const columns = [
    {
      title: '测试名称',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: '状态',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed: boolean) => (
        <Tag color={passed ? 'success' : 'error'} icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {passed ? '通过' : '失败'}
        </Tag>
      ),
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => details || <Text type="secondary">-</Text>,
    },
    {
      title: '期望',
      dataIndex: 'expected',
      key: 'expected',
      ellipsis: true,
    },
    {
      title: '实际',
      dataIndex: 'actual',
      key: 'actual',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>用户数据隔离测试</Title>
      <Text type="secondary">
        此页面用于验证系统是否正确隔离了不同用户的数据，确保用户只能访问自己的数据。
      </Text>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {/* 当前用户信息 */}
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="当前登录用户"
              value={user?.username || '未登录'}
              prefix={<UserOutlined />}
            />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>用户ID:</Text> <Text>{user?.id || '-'}</Text>
              </div>
              <div>
                <Text strong>邮箱:</Text> <Text>{user?.email || '-'}</Text>
              </div>
              <div>
                <Text strong>认证状态:</Text>
                <Tag color={user ? 'success' : 'default'}>
                  {user ? '已登录' : '未登录'}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 测试统计 */}
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="测试通过率"
              value={successRate}
              suffix="%"
              precision={0}
              valueStyle={{ color: successRate >= 80 ? '#3f8600' : '#cf1322' }}
            />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>通过测试:</Text> <Text>{passedTests}</Text>
              </div>
              <div>
                <Text strong>总测试数:</Text> <Text>{totalTests}</Text>
              </div>
              <div>
                <Text strong>样本数据:</Text> <Text>{sampleTasks.length} 条</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 数据隔离状态 */}
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="数据隔离状态"
              value={passedTests === totalTests && totalTests > 0 ? '正常' : '需要检查'}
              prefix={<DatabaseOutlined />}
              valueStyle={{
                color: passedTests === totalTests && totalTests > 0 ? '#3f8600' : '#faad14'
              }}
            />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>认证拦截器:</Text> <Tag color="green">已启用</Tag>
              </div>
              <div>
                <Text strong>请求头验证:</Text> <Tag color="green">X-User-Id</Tag>
              </div>
              <div>
                <Text strong>数据过滤:</Text> <Tag color="green">按用户ID</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 测试控制 */}
      <Card style={{ marginTop: '24px' }}>
        <Title level={4}>测试控制</Title>
        <Space>
          <Button
            type="primary"
            onClick={runTests}
            loading={isRunningTests}
            icon={<CheckCircleOutlined />}
          >
            运行数据隔离测试
          </Button>
          <Button
            onClick={loadCurrentUserData}
            icon={<DatabaseOutlined />}
          >
            加载当前用户数据
          </Button>
          <Button
            onClick={() => TestDataSeparation.showDataSeparationStatus()}
            icon={<InfoCircleOutlined />}
          >
            显示认证状态
          </Button>
        </Space>

        {successRate < 100 && totalTests > 0 && (
          <Alert
            message="数据隔离测试未完全通过"
            description="请检查测试失败项，确保用户数据正确隔离。"
            type="warning"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      {/* 测试结果表格 */}
      {testResults.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>测试结果详情</Title>
          <Table
            columns={columns}
            dataSource={testResults}
            rowKey="testName"
            pagination={false}
            size="middle"
          />
        </Card>
      )}

      {/* 当前用户样本数据 */}
      {sampleTasks.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <Title level={4}>当前用户任务样本 (前10条)</Title>
          <Table
            dataSource={sampleTasks}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 60,
              },
              {
                title: '用户ID',
                dataIndex: 'userId',
                key: 'userId',
                width: 80,
              },
              {
                title: '标题',
                dataIndex: 'title',
                key: 'title',
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color="blue">{status}</Tag>
                ),
              },
              {
                title: '优先级',
                dataIndex: 'priority',
                key: 'priority',
                render: (priority: string) => (
                  <Tag color={priority === 'high' ? 'red' : priority === 'low' ? 'green' : 'orange'}>
                    {priority}
                  </Tag>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};

export default TestDataSeparationPage;