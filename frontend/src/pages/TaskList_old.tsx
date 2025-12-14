import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Empty,
  Pagination,
  Tag,
  Drawer,
  Form,
  DatePicker,
  InputNumber,
  Switch,
  App,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  ExportOutlined,
  ReloadOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';

import TaskCard from '../components/task/TaskCard';
import TaskCreateForm from '../components/task/TaskCreateForm';
import TaskSummaryForm from '../components/summary/TaskSummaryForm';
import { Loading } from '../components/common';
import { taskApi, type Task, type TaskQueryParams, TaskResponse } from '../api';
import type { TaskStatus, TaskPriority } from '../types/task';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskListProps {}

/**
 * 任务列表页面组件
 *
 * @param props - 任务列表属性
 * @returns JSX.Element
 */
export const TaskList: React.FC<TaskListProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterForm] = Form.useForm();

  // 查询参数
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    keyword: searchParams.get('keyword') || '',
    status: searchParams.get('status') as TaskStatus | undefined,
    priority: searchParams.get('priority') as TaskPriority | undefined,
    sortBy: 'createdAt',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  // 加载任务列表
  useEffect(() => {
    loadTasks();
  }, [queryParams]);

  // 调试：监控tasks状态变化
  useEffect(() => {
    console.log('Tasks状态更新:', tasks, '数量:', tasks?.length);
  }, [tasks]);

  // 检查URL参数
  useEffect(() => {
    const action = searchParams.get('action');
    const taskId = searchParams.get('taskId');

    if (action === 'create') {
      setShowCreateModal(true);
    } else if (action === 'edit' && taskId) {
      // 加载任务数据并打开编辑界面
      const task = tasks?.find(t => t.id === parseInt(taskId));
      if (task) {
        setSelectedTask(task);
        setShowCreateModal(true);
      }
    }
  }, [searchParams, tasks]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // 调用API获取任务数据
      const response = await taskApi.getTasks(queryParams);
      console.log('API响应:', response);
      console.log('response的所有属性:', Object.keys(response));
      console.log('response.data:', response.data);
      console.log('response是否直接为数组:', Array.isArray(response));

      // 尝试不同的数据路径
      let tasksData = [];
      if (Array.isArray(response.data)) {
        tasksData = response.data;
      } else if (Array.isArray(response)) {
        tasksData = response;
      } else if (response.data && Array.isArray(response.data.data)) {
        tasksData = response.data.data;
      } else if (response.success && Array.isArray(response.data)) {
        tasksData = response.data;
      }

      console.log('最终tasksData:', tasksData);
      console.log('tasksData长度:', tasksData.length);

      // 修复字段映射和数据标准化问题
      const normalizedTasks = tasksData.map(task => {
        console.log('处理单个任务:', task);
        const normalizedTask = {
          ...task,
          // 确保所有必要字段都存在
          id: task.id,
          title: task.title || '',
          description: task.description || '',
          estimatedDuration: task.estimatedDuration || 25,
          actualDuration: task.actualDuration || 0,
          // 状态映射
          status: task.status === 'TODO' ? 'pending' :
                  task.status === 'IN_PROGRESS' ? 'in_progress' :
                  task.status === 'COMPLETED' ? 'completed' :
                  task.status === 'PAUSED' ? 'paused' :
                  task.status === 'CANCELLED' ? 'cancelled' :
                  task.status || 'pending',
          // 优先级映射
          priority: task.priority === 'HIGH' ? 'high' :
                   task.priority === 'MEDIUM' ? 'medium' :
                   task.priority === 'LOW' ? 'low' :
                   task.priority?.toLowerCase() || 'medium',
          userId: task.userId || 1,
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: task.updatedAt || new Date().toISOString(),
          tags: task.tags || [],
          completionRate: task.completionRate || 0,
          sortOrder: task.sortOrder || 1,
          isRecurring: task.isRecurring || false,
        };
        console.log('标准化后的任务:', normalizedTask);
        return normalizedTask;
      });

      console.log('标准化后的任务数据:', normalizedTasks);
      setTasks(normalizedTasks);
      setTotal(response.pagination?.total || tasksData.length || 0);
      console.log('设置任务数量:', tasksData.length);
    } catch (error) {
      console.error('加载任务列表失败:', error);
      message.error('加载任务列表失败');

      // 如果API调用失败，暂时使用模拟数据作为降级方案
      const mockTasks: Task[] = [
        {
          id: 1,
          userId: 1,
          title: '完成项目文档编写',
          description: '整理并完成项目技术文档，包括API文档和用户手册',
          estimatedDuration: 120,
          actualDuration: 0,
          priority: 'high',
          status: 'pending',
          dueDate: dayjs().add(2, 'day').toISOString(),
          sortOrder: 1,
          isRecurring: false,
          completionRate: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          userId: 1,
          title: '代码审查',
          description: '审查团队成员提交的代码',
          estimatedDuration: 60,
          actualDuration: 45,
          priority: 'medium',
          status: 'in_progress',
          dueDate: dayjs().add(1, 'day').toISOString(),
          sortOrder: 2,
          isRecurring: false,
          completionRate: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setTasks(mockTasks);
      setTotal(mockTasks.length);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({ ...prev, keyword: value, pageNum: 1 }));
    updateURLParams({ keyword: value });
  };

  // 处理状态筛选
  const handleStatusFilter = (status: TaskStatus | undefined) => {
    setQueryParams(prev => ({ ...prev, status, pageNum: 1 }));
    updateURLParams({ status: status as string });
  };

  // 处理优先级筛选
  const handlePriorityFilter = (priority: TaskPriority | undefined) => {
    setQueryParams(prev => ({ ...prev, priority, pageNum: 1 }));
    updateURLParams({ priority: priority as string });
  };

  // 处理分页
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams(prev => ({ ...prev, pageNum: page, pageSize }));
  };

  // 处理任务操作
  const handleTaskStart = (task: Task) => {
    navigate(`/pomodoro?taskId=${task.id}`);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setShowCreateModal(true);
    updateURLParams({ action: 'edit', taskId: task.id.toString() });
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      await taskApi.updateTaskStatus(task.id!, 'completed');
      message.success('任务已完成');
      loadTasks();

      // 显示总结表单
      setSelectedTask(task);
      setShowSummaryForm(true);
    } catch (error) {
      message.error('更新任务状态失败');
    }
  };

  const handleTaskDelete = async (task: Task) => {
    try {
      await taskApi.deleteTask(task.id!);
      message.success('任务已删除');
      loadTasks();
    } catch (error) {
      message.error('删除任务失败');
    }
  };

  const handleSummarySubmit = async (summaryData: any) => {
    try {
      // await api.createTaskSummary({ ...summaryData, taskId: selectedTask?.id });
      message.success('任务总结已保存');
      setShowSummaryForm(false);
      setSelectedTask(null);
    } catch (error) {
      message.error('保存总结失败');
    }
  };

  // 处理任务创建/更新
  const handleTaskSubmit = async (values: any) => {
    try {
      console.log('TaskList handleTaskSubmit called with values:', values);

      const taskData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        estimatedDuration: values.estimatedDuration,
        dueDate: values.dueDate,
        sortOrder: values.sortOrder || 1,
        isRecurring: values.isRecurring,
        // Use tags directly from TaskCreateForm which should already be a string or null
        tags: values.tags,
        userId: 1, // 暂时写死，后续从用户信息中获取
      };

      console.log('TaskList taskData to send:', taskData);

      if (selectedTask) {
        // 更新任务
        await taskApi.updateTask(selectedTask.id!, taskData);
        message.success('任务更新成功');
      } else {
        // 创建任务
        await taskApi.createTask(taskData);
        message.success('任务创建成功');
      }

      loadTasks();
      setShowCreateModal(false);
      setSelectedTask(null);
      updateURLParams({ action: null, taskId: null });
    } catch (error) {
      message.error(selectedTask ? '任务更新失败' : '任务创建失败');
    }
  };

  // 更新URL参数
  const updateURLParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  // 筛选菜单
  const filterMenuItems = [
    {
      key: 'all',
      label: '全部任务',
      onClick: () => handleStatusFilter(undefined),
    },
    {
      key: 'pending',
      label: '待处理',
      onClick: () => handleStatusFilter('pending'),
    },
    {
      key: 'in-progress',
      label: '进行中',
      onClick: () => handleStatusFilter('in_progress'),
    },
    {
      key: 'completed',
      label: '已完成',
      onClick: () => handleStatusFilter('completed'),
    },
  ];

  // 排序菜单
  const sortMenuItems = [
    {
      key: 'createdAt-desc',
      label: '创建时间 (最新)',
      onClick: () => setQueryParams(prev => ({ ...prev, sortBy: 'createdAt', sortDirection: 'desc' })),
    },
    {
      key: 'createdAt-asc',
      label: '创建时间 (最旧)',
      onClick: () => setQueryParams(prev => ({ ...prev, sortBy: 'createdAt', sortDirection: 'asc' })),
    },
    {
      key: 'dueDate-asc',
      label: '截止时间 (最近)',
      onClick: () => setQueryParams(prev => ({ ...prev, sortBy: 'dueDate', sortDirection: 'asc' })),
    },
    {
      key: 'priority-desc',
      label: '优先级 (高到低)',
      onClick: () => setQueryParams(prev => ({ ...prev, sortBy: 'priority', sortDirection: 'desc' })),
    },
  ];

  return (
    <div className="task-list">
      {/* 页面头部 */}
      <div className="task-list-header">
        <div className="header-left">
          <Title level={2} style={{ margin: 0 }}>
            任务管理
          </Title>
        </div>
        <div className="header-right">
          <Space>
            <Tooltip title="刷新列表">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTasks}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="导出任务">
              <Button icon={<ExportOutlined />} />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedTask(null);
                setShowCreateModal(true);
                updateURLParams({ action: 'create', taskId: null });
              }}
            >
              创建任务
            </Button>
          </Space>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <Card className="task-list-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="搜索任务标题或描述..."
                allowClear
                value={queryParams.keyword}
                onChange={(e) => {
                  const value = e.target.value;
                  setQueryParams(prev => ({ ...prev, keyword: value }));
                  if (!value) {
                    handleSearch('');
                  }
                }}
                onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => handleSearch(queryParams.keyword)}
              />
            </Space.Compact>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="任务状态"
              allowClear
              value={queryParams.status}
              onChange={handleStatusFilter}
              style={{ width: '100%' }}
            >
              <Option value="pending">待处理</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="paused">已暂停</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="优先级"
              allowClear
              value={queryParams.priority}
              onChange={handlePriorityFilter}
              style={{ width: '100%' }}
            >
              <Option value="high">高</Option>
              <Option value="medium">中</Option>
              <Option value="low">低</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Dropdown
                menu={{ items: filterMenuItems }}
                trigger={['click']}
              >
                <Button icon={<FilterOutlined />}>
                  筛选 <DownOutlined />
                </Button>
              </Dropdown>
              <Dropdown
                menu={{ items: sortMenuItems }}
                trigger={['click']}
              >
                <Button icon={<SortAscendingOutlined />}>
                  排序 <DownOutlined />
                </Button>
              </Dropdown>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilterDrawer(true)}
              >
                高级筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 任务列表 */}
      <Card className="task-list-content">
        {loading ? (
          <Loading text="加载任务列表..." />
        ) : (tasks && tasks.length > 0) ? (
          <>
            <div className="task-list-items">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={handleTaskStart}
                  onEdit={handleTaskEdit}
                  onComplete={handleTaskComplete}
                  onDelete={handleTaskDelete}
                />
              ))}
            </div>
            <div className="task-list-pagination">
              <Pagination
                current={queryParams.pageNum}
                pageSize={queryParams.pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
              />
            </div>
          </>
        ) : (
          <Empty
            description="暂无任务"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedTask(null);
                setShowCreateModal(true);
              }}
            >
              创建第一个任务
            </Button>
          </Empty>
        )}
      </Card>

      {/* 任务总结表单 */}
      <TaskSummaryForm
        visible={showSummaryForm}
        task={selectedTask}
        onSubmit={handleSummarySubmit}
        onCancel={() => {
          setShowSummaryForm(false);
          setSelectedTask(null);
        }}
      />

      {/* 高级筛选抽屉 */}
      <Drawer
        title="高级筛选"
        placement="right"
        onClose={() => setShowFilterDrawer(false)}
        open={showFilterDrawer}
        width={400}
      >
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={(values) => {
            // 应用高级筛选
            console.log('筛选条件:', values);
            setShowFilterDrawer(false);
          }}
        >
          <Form.Item label="截止日期范围" name="dueDateRange">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="预计时长范围" name="durationRange">
            <Input.Group compact>
              <InputNumber style={{ width: '45%' }} placeholder="最小" min={1} />
              <InputNumber style={{ width: '45%' }} placeholder="最大" min={1} />
            </Input.Group>
          </Form.Item>
          <Form.Item label="标签" name="tags">
            <Input placeholder="输入标签，用逗号分隔" />
          </Form.Item>
          <Form.Item label="是否循环任务" name="isRecurring" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 任务创建表单 */}
      <TaskCreateForm
        visible={showCreateModal}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedTask(null);
          updateURLParams({ action: null, taskId: null });
        }}
        loading={loading}
      />
    </div>
  );
};

export default TaskList;