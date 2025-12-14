import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Button,
  Space,
  Typography,
  Empty,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import DashboardStats from '../components/statistics/DashboardStats';
import TaskCard from '../components/task/TaskCard';
import TaskCreateForm from '../components/task/TaskCreateForm';
import { taskApi } from '../api/task';
import { Loading } from '../components/common';
import type { Task } from '../types/task';
import './Dashboard.css';

const { Title, Text } = Typography;


interface DashboardProps {}

/**
 * 仪表板页面组件
 *
 * @param props - 仪表板属性
 * @returns JSX.Element
 */
export const Dashboard: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 调用API获取任务数据
        const tasksResponse = await taskApi.getTasks({ pageSize: 5 });

        if (tasksResponse && tasksResponse.records && Array.isArray(tasksResponse.records)) {
          setTasks(tasksResponse.records);
        }

        // TODO: 添加统计API调用
        // const statisticsResponse = await api.getDashboardStatistics();

        // 临时统计数据
        setStatistics({
          today: {
            totalTasks: tasksResponse && tasksResponse.records ? tasksResponse.records.length : 0,
            completedTasks: tasksResponse && tasksResponse.records ? tasksResponse.records.filter((task: Task) => task.status === 'completed').length : 0,
            totalPomodoros: 12,
            totalFocusTime: 180,
            completionRate: tasksResponse && tasksResponse.records && tasksResponse.records.length > 0
              ? Math.round((tasksResponse.records.filter((task: Task) => task.status === 'completed').length / tasksResponse.records.length) * 100 * 10) / 10
              : 0,
          },
          weekly: [
            { date: '2024-01-15', completedTasks: 5, totalPomodoros: 8 },
            { date: '2024-01-16', completedTasks: 3, totalPomodoros: 6 },
          ],
        });

      } catch (error) {
        console.error('加载仪表板数据失败:', error);
        message.error('加载数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 处理任务操作
  const handleTaskStart = (task: Task) => {
    navigate(`/pomodoro?taskId=${task.id}`);
  };

  const handleTaskEdit = (task: Task) => {
    navigate(`/tasks?action=edit&taskId=${task.id}`);
  };

  const handleTaskDelete = (task: Task) => {
    // 处理删除逻辑
    console.log('删除任务:', task);
  };

  // 处理创建任务
  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowCreateModal(true);
  };

  // 处理任务创建/更新
  const handleTaskSubmit = async (values: any) => {
    setCreateLoading(true);
    try {
      if (selectedTask) {
        // 更新任务
        console.log('更新任务:', { ...values, id: selectedTask.id });
        await taskApi.updateTask(selectedTask.id, values);
        message.success('任务更新成功');
        // 重新加载任务列表
        const response = await taskApi.getTasks({ pageSize: 5 });
        if (response && response.records && Array.isArray(response.records)) {
          setTasks(response.records);
        }
      } else {
        // 创建任务
        console.log('创建任务:', values);
        const response = await taskApi.createTask(values);
        if (response) {
          setTasks(prev => [response, ...prev]);
          message.success('任务创建成功');
        }
      }
      setShowCreateModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('任务操作失败:', error);
      message.error(selectedTask ? '任务更新失败' : '任务创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  
  if (loading) {
    return <Loading fullscreen text="加载仪表板数据..." />;
  }

  return (
    <div className="dashboard">
      {/* 页面标题 */}
      <div className="dashboard-header">
        <Title level={2} style={{ margin: 0 }}>
          欢迎回来！
        </Title>
        <Text type="secondary">
          今天也是充满活力的一天，让我们开始专注工作吧！
        </Text>
      </div>

      {/* 统计卡片 */}
      <DashboardStats
        loading={loading}
        statistics={statistics}
      />

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 待办任务列表 */}
        <Col xs={24} lg={14}>
          <div className="dashboard-tasks-section">
            <div className="dashboard-section-header">
              <Title level={4} style={{ margin: 0 }}>待办任务</Title>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => navigate('/tasks')}
              >
                查看全部
              </Button>
            </div>
            {tasks.length > 0 ? (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {tasks.slice(0, 6).map((task) => (
                  <Col xs={24} sm={12} lg={12} xl={8} key={task.id}>
                    <TaskCard
                      task={task}
                      onStart={handleTaskStart}
                      onEdit={handleTaskEdit}
                      onDelete={handleTaskDelete}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Card style={{ marginTop: 16 }}>
                <Empty
                  description="暂无待办任务"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/tasks?action=create')}
                  >
                    创建第一个任务
                  </Button>
                </Empty>
              </Card>
            )}
          </div>
        </Col>

        {/* 数据统计区域 */}
        <Col xs={24} lg={10}>
          <Row gutter={[16, 16]}>
            {/* 今日概览 */}
            <Col xs={24}>
              <Card title="今日概览" className="dashboard-overview-card">
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Statistic
                      title="总任务"
                      value={statistics?.today?.totalTasks || 0}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="已完成"
                      value={statistics?.today?.completedTasks || 0}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="专注时长"
                      value={statistics?.today?.totalFocusTime || 0}
                      suffix="分钟"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                  <Col xs={12}>
                    <div style={{ textAlign: 'center' }}>
                      <Text type="secondary" style={{ fontSize: '14px' }}>完成率</Text>
                      <Progress
                        percent={statistics?.today?.completionRate || 0}
                        size="small"
                        style={{ marginTop: '8px' }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* 数据统计 */}
            <Col xs={24}>
              <Card title="本周数据统计" className="dashboard-stats-card">
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <Text type="secondary">
                    暂无数据统计图表，敬请期待...
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 快速操作区域 */}
      <Card
        title="快速操作"
        style={{ marginTop: 24 }}
        className="dashboard-actions-card"
      >
        <Space size={16} wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
          >
            创建任务
          </Button>
          <Button
            icon={<ClockCircleOutlined />}
            onClick={() => navigate('/timer')}
          >
            开始专注
          </Button>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => navigate('/statistics')}
          >
            查看统计
          </Button>
        </Space>
      </Card>

      {/* 任务创建表单 */}
      <TaskCreateForm
        visible={showCreateModal}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedTask(null);
        }}
        loading={createLoading}
      />
    </div>
  );
};

export default Dashboard;