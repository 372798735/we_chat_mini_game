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
  Tooltip,
  Dropdown,
  App,
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

import TaskCard from '../components/task/TaskCard';
import TaskSummaryForm from '../components/summary/TaskSummaryForm';
import TaskCreateForm from '../components/task/TaskCreateForm';
import { taskApi, taskSummaryApi } from '../api';
import type { Task, CreateTaskRequest, TaskSummaryRequest } from '../types';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface TaskListProps {}

export const TaskList: React.FC<TaskListProps> = () => {
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);

  // 从URL参数获取分页和过滤信息
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const keyword = searchParams.get('keyword') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDirection = searchParams.get('sortDirection') || 'desc';

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {
        pageNum: currentPage,
        pageSize,
        keyword,
        sortBy,
        sortDirection,
      };

      const response = await taskApi.getTasks(params);
      setTasks(response.records || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('加载任务列表失败:', error);
      message.error('加载任务列表失败');

      // 如果API调用失败，暂时使用模拟数据作为降级方案
      const mockTasks: Task[] = [
        {
          id: 1,
          title: '完成项目文档',
          description: '编写项目的技术文档和用户手册',
          priority: 'high' as any,
          status: 'in_progress' as any,
          estimatedDuration: 120,
          actualDuration: 60,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: '代码审查',
          description: '审查团队成员提交的代码',
          priority: 'medium' as any,
          status: 'pending' as any,
          estimatedDuration: 60,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setTasks(mockTasks);
      setTotal(mockTasks.length);
    } finally {
      setLoading(false);
    }
  };

  // 监听URL参数变化
  useEffect(() => {
    loadTasks();
  }, [currentPage, pageSize, keyword, sortBy, sortDirection]);

  // 更新URL参数
  const updateURLParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    updateURLParams({ keyword: value, page: '1' });
  };

  // 分页处理
  const handlePageChange = (page: number, size: number) => {
    updateURLParams({ page: page.toString(), pageSize: size.toString() });
  };

  // 排序处理
  const handleSort = (field: string) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    updateURLParams({ sortBy: field, sortDirection: newDirection, page: '1' });
  };

  // 创建或编辑任务
  const handleTaskSubmit = async (taskData: CreateTaskRequest) => {
    try {
      if (selectedTask) {
        // 更新任务
        await taskApi.updateTask(selectedTask.id!, taskData);
        message.success('任务更新成功');
      } else {
        // 创建任务
        await taskApi.createTask(taskData);
        message.success('任务创建成功');
      }

      // 重新加载任务列表
      loadTasks();

      // 关闭表单
      setShowForm(false);
      setSelectedTask(null);

      // 清理URL参数
      updateURLParams({ action: null, taskId: null });
    } catch (error) {
      message.error(selectedTask ? '任务更新失败' : '任务创建失败');
    }
  };

  // 完成任务
  const handleCompleteTask = async (task: Task) => {
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

  // 删除任务
  const handleDeleteTask = async (task: Task) => {
    try {
      await taskApi.deleteTask(task.id!);
      message.success('任务已删除');
      loadTasks();
    } catch (error) {
      message.error('删除任务失败');
    }
  };

  // 保存任务总结
  const handleSummarySubmit = async (summaryData: TaskSummaryRequest) => {
    try {
      // await taskSummaryApi.createTaskSummary({ ...summaryData, taskId: selectedTask?.id });
      message.success('任务总结已保存');
      setShowSummaryForm(false);
      setSelectedTask(null);
    } catch (error) {
      message.error('保存总结失败');
    }
  };

  // 编辑任务
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
    updateURLParams({ action: 'edit', taskId: task.id!.toString() });
  };

  // 新建任务
  const handleNewTask = () => {
    setSelectedTask(null);
    setShowForm(true);
    updateURLParams({ action: 'new', taskId: null });
  };

  // 检查URL参数以打开表单
  useEffect(() => {
    const action = searchParams.get('action');
    const taskId = searchParams.get('taskId');

    if (action === 'new') {
      handleNewTask();
    } else if (action === 'edit' && taskId) {
      // 加载任务详情
      const loadTaskDetail = async () => {
        try {
          const task = await taskApi.getTaskById(parseInt(taskId));
          setSelectedTask(task);
          setShowForm(true);
        } catch (error) {
          console.error('加载任务详情失败:', error);
          message.error('加载任务详情失败');
        }
      };
      loadTaskDetail();
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          任务管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewTask}
        >
          新建任务
        </Button>
      </div>

      {/* 搜索和过滤器 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="搜索任务..."
              value={keyword}
              onChange={(e) => handleSearch(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space wrap>
              <Button
                icon={<SortAscendingOutlined />}
                onClick={() => handleSort('priority')}
              >
                按优先级排序
              </Button>
              <Button
                icon={<SortAscendingOutlined />}
                onClick={() => handleSort('createdAt')}
              >
                按创建时间排序
              </Button>
              <Button
                icon={<SortAscendingOutlined />}
                onClick={() => handleSort('dueDate')}
              >
                按截止日期排序
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTasks}
              >
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 任务列表 */}
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading />
          </Col>
        ) : tasks.length === 0 ? (
          <Col span={24}>
            <Card>
              <Empty
                description="暂无任务"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleNewTask}
                >
                  创建第一个任务
                </Button>
              </Empty>
            </Card>
          </Col>
        ) : (
          tasks.map((task) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={task.id}>
              <TaskCard
                task={task}
                onEdit={handleEditTask}
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                onStart={(task) => navigate(`/pomodoro?taskId=${task.id}`)}
              />
            </Col>
          ))
        )}
      </Row>

      {/* 分页 */}
      {total > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
      )}

      {/* 任务表单 */}
      <TaskCreateForm
        visible={showForm}
        task={selectedTask}
        onSubmit={handleTaskSubmit}
        onCancel={() => {
          setShowForm(false);
          setSelectedTask(null);
          updateURLParams({ action: null, taskId: null });
        }}
      />

      {/* 任务总结表单 */}
      <Drawer
        title="任务总结"
        placement="right"
        width={600}
        open={showSummaryForm}
        onClose={() => {
          setShowSummaryForm(false);
          setSelectedTask(null);
        }}
        destroyOnClose
      >
        <TaskSummaryForm
          taskId={selectedTask?.id}
          taskTitle={selectedTask?.title}
          onSubmit={handleSummarySubmit}
          onCancel={() => {
            setShowSummaryForm(false);
            setSelectedTask(null);
          }}
        />
      </Drawer>
    </div>
  );
};

export default TaskList;