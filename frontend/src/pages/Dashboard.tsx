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
import WeeklyChart from '../components/statistics/WeeklyChart';
import { taskApi } from '../api/task';
import { statisticsApi } from '../api/statistics';
import { Loading } from '../components/common';
import type { Task } from '../types/task';
import type { DashboardStatistics } from '../api/statistics';
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
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  // 加载仪表板数据
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // 并行加载任务数据和统计数据
        const [tasksResponse, statisticsResponse] = await Promise.all([
          taskApi.getTasks({ pageSize: 5 }),
          statisticsApi.getDashboardStatistics(),
        ]);

        // 设置任务数据
        if (tasksResponse && tasksResponse.records && Array.isArray(tasksResponse.records)) {
          setTasks(tasksResponse.records);
        }

        // 设置统计数据
        if (statisticsResponse) {
          setStatistics(statisticsResponse);
        }
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

  const handleTaskDelete = async (task: Task) => {
    try {
      await taskApi.deleteTask(task.id);
      message.success('任务删除成功');
      // 重新加载任务列表
      const response = await taskApi.getTasks({ pageSize: 5 });
      if (response && response.records && Array.isArray(response.records)) {
        setTasks(response.records);
      }
    } catch (error) {
      console.error('删除任务失败:', error);
      message.error('删除任务失败，请重试');
    }
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
        await taskApi.updateTask(selectedTask.id, values);
        message.success('任务更新成功');
        // 重新加载任务列表
        const response = await taskApi.getTasks({ pageSize: 5 });
        if (response && response.records && Array.isArray(response.records)) {
          setTasks(response.records);
        }
      } else {
        // 创建任务
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
        <Text type="secondary">今天也是充满活力的一天，让我们开始专注工作吧！</Text>
      </div>

      {/* 统计卡片 */}
      <DashboardStats loading={loading} statistics={statistics} />

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* 待办任务列表 */}
        <Col xs={24} lg={14}>
          <div className="dashboard-tasks-section">
            <div className="dashboard-section-header">
              <Title level={4} style={{ margin: 0 }}>
                待办任务
              </Title>
              <Button type="text" icon={<PlusOutlined />} onClick={() => navigate('/tasks')}>
                查看全部
              </Button>
            </div>
            {tasks.length > 0 ? (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                {tasks.slice(0, 6).map(task => (
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
                <Empty description="暂无待办任务" image={Empty.PRESENTED_IMAGE_SIMPLE}>
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
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        完成率
                      </Text>
                      <Progress
                        percent={Math.round(statistics?.today?.completionRate || 0)}
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
              <WeeklyChart data={statistics?.weekly || []} loading={loading} title="本周数据统计" />
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 快速操作区域 */}
      <Card title="快速操作" style={{ marginTop: 24 }} className="dashboard-actions-card">
        <Space size={16} wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
            创建任务
          </Button>
          <Button icon={<ClockCircleOutlined />} onClick={() => navigate('/timer')}>
            开始专注
          </Button>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/statistics')}>
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
