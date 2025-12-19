import React, { useState, useEffect, useCallback } from 'react';
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
  Tag as AntTag,
  Drawer,
  App,
  Calendar,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

import { useNavigate, useSearchParams } from 'react-router-dom';

import TaskCard from '../components/task/TaskCard';
import TaskSummaryForm from '../components/summary/TaskSummaryForm';
import TaskCreateForm from '../components/task/TaskCreateForm';
import { taskApi, taskSummaryApi } from '../api';
import dictApi from '../api/dict';
import type { Task, CreateTaskRequest, TaskSummaryRequest } from '../types';
import type { Tag } from '../types/dict';

const { Title } = Typography;
const { Option } = Select;

interface TaskListProps {}

export const TaskList: React.FC<TaskListProps> = () => {
  const { message } = App.useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 从URL参数获取分页和过滤信息
  const currentPage = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const keyword = searchParams.get('keyword') || '';
  const selectedTags = searchParams.get('tags') || '';

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(dayjs().format('YYYY-MM-DD'));
  const [searchValue, setSearchValue] = useState(keyword);

  // 加载标签列表
  const loadTags = async () => {
    try {
      const tags = await dictApi.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  // 按日期分组任务
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {};

    // 如果选择了特定日期，只显示该日期的任务
    const filteredTasks = selectedDate
      ? tasks.filter(task => {
          // 如果任务有截止日期，按截止日期过滤
          if (task.dueDate) {
            return dayjs(task.dueDate).format('YYYY-MM-DD') === selectedDate;
          }
          // 如果没有截止日期，按创建日期过滤
          return dayjs(task.createdAt).format('YYYY-MM-DD') === selectedDate;
        })
      : tasks;

    filteredTasks.forEach(task => {
      // 优先使用截止日期，如果没有截止日期则使用创建日期
      const date = task.dueDate
        ? dayjs(task.dueDate).format('YYYY-MM-DD')
        : dayjs(task.createdAt).format('YYYY-MM-DD');

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });

    // 按日期排序（最新的在前）
    const sortedDates = Object.keys(groups).sort((a, b) =>
      dayjs(b).valueOf() - dayjs(a).valueOf()
    );

    return sortedDates.map(date => ({
      date,
      tasks: groups[date].sort((a, b) =>
        dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      )
    }));
  };

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      // 将字符串形式的selectedTags转换为数组
      const tagIdsArray = selectedTags
        ? selectedTags.split(',').map(id => id.trim()).filter(id => id !== '').map(Number).filter(id => !isNaN(id))
        : [];

      const params = {
        pageNum: currentPage,
        pageSize,
        keyword,
        tags: tagIdsArray,
      };

      console.log('发送给后端的参数:', params);
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

  // 初始化时加载标签列表（只加载一次）
  useEffect(() => {
    loadTags();
  }, []);

  // 同步URL参数到本地状态
  useEffect(() => {
    setSearchValue(keyword);
  }, [keyword]);

  // 监听URL参数变化
  useEffect(() => {
    loadTasks();
  }, [currentPage, pageSize, keyword, selectedTags]);

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
    setSearchValue(value);
  };

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURLParams({ keyword: searchValue.trim(), page: '1' });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // 标签筛选处理
  const handleTagFilter = (tagIds: number[]) => {
    const tagsString = tagIds.join(',');
    updateURLParams({ tags: tagsString, page: '1' });
  };

  // 日历选择处理
  const handleCalendarSelect = (date: any) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');

    // 切换选择状态：如果点击相同日期则取消选择，否则选择新日期
    if (selectedDate === dateStr) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateStr);
    }
  };

  // 获取任务数据用于日历显示
  const getTaskDataForCalendar = () => {
    const taskData: { [key: string]: number } = {};
    tasks.forEach(task => {
      // 优先使用截止日期，如果没有截止日期则使用创建日期
      const date = task.dueDate
        ? dayjs(task.dueDate).format('YYYY-MM-DD')
        : dayjs(task.createdAt).format('YYYY-MM-DD');
      taskData[date] = (taskData[date] || 0) + 1;
    });
    return taskData;
  };

  // 日历单元格渲染
  const cellRender = (value: any) => {
    const dateStr = dayjs(value).format('YYYY-MM-DD');
    const taskData = getTaskDataForCalendar();
    const taskCount = taskData[dateStr] || 0;
    const isSelected = selectedDate === dateStr;

    return (
      <div className={`calendar-date-cell ${isSelected ? 'calendar-date-selected' : ''}`}>
        {taskCount > 0 && (
          <Badge count={taskCount} size="small" />
        )}
      </div>
    );
  };

  // 分页处理
  const handlePageChange = (page: number, size: number) => {
    updateURLParams({ page: page.toString(), pageSize: size.toString() });
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
          const task = await taskApi.getTask(parseInt(taskId));
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

      <Row gutter={[24, 24]}>
        {/* 左侧任务列表 */}
        <Col xs={24} lg={16} xl={18}>
          {/* 搜索和过滤器 */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={8}>
                <Input.Search
                  placeholder="搜索任务..."
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={() => updateURLParams({ keyword: searchValue.trim(), page: '1' })}
                  enterButton
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Select
                  mode="multiple"
                  placeholder="按标签筛选"
                  allowClear
                  style={{ width: '100%' }}
                  value={selectedTags ? selectedTags.split(',').map(Number).filter(id => !isNaN(id)) : []}
                  onChange={handleTagFilter}
                  optionLabelProp="label"
                  maxTagCount={3}
                  maxTagPlaceholder={`已选择 ${selectedTags ? selectedTags.split(',').filter(id => !isNaN(Number(id))).length : 0} 个标签`}
                >
                  {availableTags.map(tag => (
                    <Option key={tag.id} value={tag.id} label={tag.name}>
                      <Space>
                        <AntTag color={tag.color || '#1890ff'} style={{ marginRight: 4, fontSize: '12px' }}>
                          {tag.name}
                        </AntTag>
                        <span>{tag.name}</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} lg={10}>
                <Space wrap size="small">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadTasks}
                    size="middle"
                  >
                    刷新
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* 任务列表 */}
          {loading ? (
            <Card loading />
          ) : tasks.length === 0 ? (
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
          ) : (
            <div>
              {/* 显示筛选状态 */}
              {selectedDate && (
                <Card style={{ marginBottom: '16px' }} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      正在显示日期: <strong>{dayjs(selectedDate).format('YYYY年MM月DD日')}</strong> 的任务
                      {selectedDate === dayjs().format('YYYY-MM-DD') && (
                        <AntTag color="green" style={{ marginLeft: '8px' }}>今天</AntTag>
                      )}
                    </span>
                    <Button
                      size="small"
                      onClick={() => setSelectedDate(null)}
                    >
                      显示全部
                    </Button>
                  </div>
                </Card>
              )}

              {groupTasksByDate(tasks).map((group) => (
                <div key={group.date} id={`date-${group.date}`} style={{ marginBottom: '32px' }}>
                  {/* 日期标题 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                      padding: '8px 0',
                      borderBottom: '2px solid #f0f0f0',
                    }}
                  >
                    <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>
                      {dayjs(group.date).format('YYYY年MM月DD日')}
                      <span style={{
                        marginLeft: '12px',
                        fontSize: '14px',
                        fontWeight: 'normal',
                        color: '#666'
                      }}>
                        {dayjs(group.date).calendar(null, {
                          sameDay: '[今天]',
                          nextDay: '[明天]',
                          nextWeek: '[下]dddd',
                          lastDay: '[昨天]',
                          lastWeek: '[上]dddd',
                          sameElse: 'YYYY-MM-DD'
                        })}
                      </span>
                    </Title>
                    <AntTag color="blue" style={{ marginLeft: '12px' }}>
                      {group.tasks.length} 个任务
                    </AntTag>
                  </div>

                  {/* 该日期的任务 */}
                  <Row gutter={[16, 16]}>
                    {group.tasks.map((task) => (
                      <Col xs={24} sm={12} lg={8} xl={6} key={task.id}>
                        <TaskCard
                          task={task}
                          onEdit={handleEditTask}
                          onComplete={handleCompleteTask}
                          onDelete={handleDeleteTask}
                          onStart={(task) => navigate(`/pomodoro?taskId=${task.id}`)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}

              {/* 如果筛选日期没有任务 */}
              {selectedDate && groupTasksByDate(tasks).length === 0 && (
                <Card>
                  <Empty
                    description={`${dayjs(selectedDate).format('YYYY年MM月DD日')} 暂无任务`}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleNewTask}
                    >
                      创建该日期任务
                    </Button>
                  </Empty>
                </Card>
              )}
            </div>
          )}
        </Col>

        {/* 右侧日历 */}
        <Col xs={24} lg={8} xl={6}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                任务日历
              </div>
            }
            style={{ position: 'sticky', top: '24px' }}
          >
            <Calendar
              cellRender={cellRender}
              onSelect={handleCalendarSelect}
              style={{ border: 'none' }}
            />
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
              <div>• 点击有任务的日期可快速跳转</div>
              <div>• 数字表示该日期的任务数量</div>
            </div>
          </Card>
        </Col>
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
        selectedDate={selectedDate}
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

      {/* 添加日历相关样式 */}
      <style>{`
        .calendar-date-cell {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .calendar-date-selected {
          background-color: #e6f7ff;
          border: 2px solid #1890ff;
          border-radius: 4px;
        }

        .calendar-date-cell:hover {
          background-color: #f5f5f5;
        }

        .calendar-date-selected:hover {
          background-color: #bae7ff;
        }

        /* Ant Design Calendar 样式调整 */
        .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner,
        .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
        .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
          background-color: #1890ff;
          border-color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default TaskList;