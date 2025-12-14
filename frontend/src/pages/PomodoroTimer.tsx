import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Select,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  List,
  Avatar,
  Tag,
  Divider,
  Modal,
  App,
  Tooltip,
  Empty,
  Spin,
  Input,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  ForwardOutlined,
  CoffeeOutlined,
  FireOutlined,
  TrophyOutlined,
  SettingOutlined,
  SearchOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

import { Loading } from '../components/common';
import type { Task } from '../types/task';
import './PomodoroTimer.css';
import { taskApi } from '../api';
import { pomodoroApi, type PomodoroStatistics, type PomodoroSession } from '../api/pomodoro';

dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;

interface PomodoroTimerProps {}

/**
 * 番茄钟计时器页面组件
 *
 * @param props - 计时器属性
 * @returns JSX.Element
 */
export const PomodoroTimer: React.FC<PomodoroTimerProps> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(25 * 60); // 默认25分钟
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [pomodoroType, setPomodoroType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [todayStats, setTodayStats] = useState<PomodoroStatistics | null>(null);
  const [todaySessions, setTodaySessions] = useState<PomodoroSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTaskSelect, setShowTaskSelect] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // 用于触发动画

  // 计时器设置
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartWork: false,
    soundEnabled: true,
    notificationEnabled: true,
  });

  // 定时器引用
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    // 检查URL参数中的任务ID
    const taskId = searchParams.get('taskId');
    if (taskId) {
      loadTask(parseInt(taskId));
    }

    // 加载今日统计和会话记录
    loadTodayData();

    // 清理定时器
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 加载今日数据
  const loadTodayData = async () => {
    try {
      const [statsRes, sessionsRes] = await Promise.all([
        pomodoroApi.getTodayStatistics(),
        pomodoroApi.getTodaySessions()
      ]);

      setTodayStats(statsRes);
      setTodaySessions(sessionsRes.reverse()); // 最新的在前面
    } catch (error) {
      console.error('加载今日数据失败:', error);
      // 设置默认数据
      setTodayStats({
        todayFocusTime: 0,
        completedSessions: 0,
        totalSessions: 0,
        interruptionCount: 0,
        currentStreak: 0,
        weeklySessions: [],
        dailyAverage: 0,
        completionRate: 0,
      });
      setTodaySessions([]);
    }
  };

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            // 计时结束
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
        // 触发动画帧更新
        setAnimationKey(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

    // 加载任务
  const loadTask = async (taskId: number) => {
    setLoading(true);
    try {
      const task = await taskApi.getTask(taskId);
      setCurrentTask(task);
      
      // 根据任务预估时长设置计时器（如果任务时长大于0，使用任务时长，否则使用默认25分钟）
      if (task.estimatedDuration && task.estimatedDuration > 0) {
        const taskDuration = Math.min(task.estimatedDuration, 120); // 限制最大2小时
        setTotalTime(taskDuration * 60);
        setCurrentTime(taskDuration * 60);
      }
      
      setLoading(false);
    } catch (error) {
      message.error('加载任务失败');
      setLoading(false);
    }
  };

  
  // 开始计时
  const handleStart = async () => {
    if (!currentTask && pomodoroType === 'work') {
      setShowTaskSelect(true);
      return;
    }

    try {
      // 修正类型映射：使用后端期望的大写枚举值
      const sessionType = pomodoroType === 'work' ? 'WORK' :
                         pomodoroType === 'shortBreak' ? 'SHORT_BREAK' : 'LONG_BREAK';

      // 对于非工作类型，使用默认任务ID 1；工作类型必须有任务
      const taskId = currentTask?.id || 1;

      const sessionData = {
        taskId: taskId,
        type: sessionType,
        plannedDuration: Math.floor(totalTime / 60),
        notes: currentTask ? `专注任务: ${currentTask.title}` :
                pomodoroType === 'work' ? '工作时间' :
                pomodoroType === 'shortBreak' ? '短休息' : '长休息'
      };

      const session = await pomodoroApi.startSession(sessionData);
      setCurrentSessionId(session.id);
      setIsRunning(true);
      setIsPaused(false);
      message.success('番茄钟已开始');
    } catch (error) {
      console.error('开始番茄钟失败:', error);
      message.error('开始番茄钟失败');
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  // 暂停计时
  const handlePause = () => {
    setIsPaused(true);
  };

  // 继续计时
  const handleResume = () => {
    setIsPaused(false);
  };

  // 停止计时
  const handleStop = () => {
    Modal.confirm({
      title: '确认停止',
      content: '确定要停止当前计时吗？本次计时将不会被记录。',
      onOk: () => {
        setIsRunning(false);
        setIsPaused(false);
        setCurrentTime(totalTime);
      },
    });
  };

  // 跳过当前阶段
  const handleSkip = () => {
    Modal.confirm({
      title: '确认跳过',
      content: '确定要跳过当前阶段吗？',
      onOk: () => {
        moveToNextPhase();
      },
    });
  };

  // 计时完成处理
  const handleTimerComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);

    // 播放提示音
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    // 发送通知
    if (settings.notificationEnabled) {
      sendNotification();
    }

    // 完成番茄钟会话
    if (currentSessionId) {
      try {
        const actualDuration = totalTime - currentTime;
        await pomodoroApi.completeSession(currentSessionId, {
          actualDuration: Math.floor(actualDuration / 60),
          notes: currentTask ? `完成任务: ${currentTask.title}` : undefined
        });

        // 重新加载今日数据
        await loadTodayData();

        if (pomodoroType === 'work') {
          message.success('番茄钟完成！任务进度已更新');
          setSessionCount(prev => prev + 1);
        } else {
          message.success(`${getPhaseTitle()}时间结束！`);
        }
      } catch (error) {
        console.error('完成番茄钟失败:', error);
        message.error('记录番茄钟失败');
      }
      setCurrentSessionId(null);
    }

    // 自动进入下一阶段
    if ((pomodoroType === 'work' && settings.autoStartBreak) ||
        (pomodoroType !== 'work' && settings.autoStartWork)) {
      setTimeout(() => moveToNextPhase(), 2000);
    }
  };

  // 移动到下一阶段
  const moveToNextPhase = () => {
    let nextType: 'work' | 'shortBreak' | 'longBreak';
    let nextDuration: number;

    if (pomodoroType === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      if (newCount % settings.longBreakInterval === 0) {
        nextType = 'longBreak';
        nextDuration = settings.longBreakDuration;
      } else {
        nextType = 'shortBreak';
        nextDuration = settings.shortBreakDuration;
      }
    } else {
      nextType = 'work';
      nextDuration = settings.workDuration;
    }

    setPomodoroType(nextType);
    setTotalTime(nextDuration * 60);
    setCurrentTime(nextDuration * 60);
  };

  // 选择任务
  const handleTaskSelect = (task: Task) => {
    setCurrentTask(task);
    setShowTaskSelect(false);
  };

  // 切换番茄钟类型
  const handleTypeChange = (type: 'work' | 'shortBreak' | 'longBreak') => {
    if (isRunning) {
      message.warning('请先停止当前计时');
      return;
    }

    setPomodoroType(type);
    const duration = type === 'work' ? settings.workDuration :
                    type === 'shortBreak' ? settings.shortBreakDuration :
                    settings.longBreakDuration;
    setTotalTime(duration * 60);
    setCurrentTime(duration * 60);
  };

  // 获取阶段标题
  const getPhaseTitle = () => {
    switch (pomodoroType) {
      case 'work': return '专注工作';
      case 'shortBreak': return '短休息';
      case 'longBreak': return '长休息';
      default: return '';
    }
  };

  // 获取阶段图标
  const getPhaseIcon = () => {
    switch (pomodoroType) {
      case 'work': return <FireOutlined style={{ color: '#ff4d4f' }} />;
      case 'shortBreak': return <CoffeeOutlined style={{ color: '#52c41a' }} />;
      case 'longBreak': return <TrophyOutlined style={{ color: '#faad14' }} />;
      default: return null;
    }
  };

  // 播放提示音
  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  // 发送系统通知
  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('番茄闹钟', {
        body: `${getPhaseTitle()}时间结束！`,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 计算动画相关值
  const totalSeconds = totalTime;
  const completedSeconds = totalTime - currentTime;
  const progress = (completedSeconds / totalSeconds) * 100;
  const isLastMinute = currentTime <= 60 && currentTime > 0;
  const pulseKey = Math.floor(currentTime / 10); // 每10秒触发一次脉冲
  const isPulsing = isLastMinute && pulseKey % 2 === 0; // 最后分钟每20秒脉冲一次

  if (loading) {
    return <Loading fullscreen text="加载计时器..." />;
  }

  return (
    <div className="pomodoro-timer">
      <Row gutter={[24, 24]}>
        {/* 计时器主体 */}
        <Col xs={24} lg={16}>
          <Card className="timer-main-card">
            <div className="timer-header">
              <div className="phase-info">
                <Space size={12}>
                  {getPhaseIcon()}
                  <Title level={3} style={{ margin: 0 }}>
                    {getPhaseTitle()}
                  </Title>
                </Space>
              </div>
              <div className="timer-actions">
                <Space>
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setShowSettings(true)}
                  >
                    设置
                  </Button>
                  <Select
                    value={pomodoroType}
                    onChange={handleTypeChange}
                    disabled={isRunning}
                    style={{ width: 120 }}
                  >
                    <Option value="work">专注工作</Option>
                    <Option value="shortBreak">短休息</Option>
                    <Option value="longBreak">长休息</Option>
                  </Select>
                </Space>
              </div>
            </div>

            <Divider />

            <div className="timer-display">
              <div className={`time-circle ${isRunning ? 'running' : ''} ${isPulsing ? 'pulsing' : ''} ${isLastMinute ? 'last-minute' : ''}`}>
                <div className="time-background" />
                <Progress
                  type="circle"
                  percent={progress}
                  format={() => (
                    <div className="timer-text">
                      <div className="time-value" key={animationKey}>
                        {formatTime(currentTime)}
                      </div>
                      <div className="time-label">
                        {currentTask ? currentTask.title : '选择一个任务'}
                      </div>
                      {isRunning && (
                        <div className="pulse-indicator" />
                      )}
                    </div>
                  )}
                  size={280}
                  strokeColor={{
                    '0%': pomodoroType === 'work' ? '#ff7875' :
                           pomodoroType === 'shortBreak' ? '#95de64' : '#ffd666',
                    '100%': pomodoroType === 'work' ? '#ff4d4f' :
                            pomodoroType === 'shortBreak' ? '#52c41a' : '#faad14',
                  }}
                  trailColor="rgba(255, 255, 255, 0.1)"
                  strokeWidth={8}
                />
              </div>
            </div>

            <div className="timer-controls">
              <Space size={16}>
                {!isRunning ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleStart}
                  >
                    开始
                  </Button>
                ) : isPaused ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={handleResume}
                  >
                    继续
                  </Button>
                ) : (
                  <Button
                    danger
                    size="large"
                    icon={<PauseCircleOutlined />}
                    onClick={handlePause}
                  >
                    暂停
                  </Button>
                )}
                <Button
                  size="large"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                  disabled={!isRunning && !isPaused}
                >
                  停止
                </Button>
                <Button
                  size="large"
                  icon={<ForwardOutlined />}
                  onClick={handleSkip}
                  disabled={!isRunning}
                >
                  跳过
                </Button>
              </Space>
            </div>

            {currentTask && (
              <div className="current-task-info">
                <div style={{ marginBottom: '12px' }}>
                  <Text strong>当前任务：</Text>
                  <Tag color="blue">{currentTask.title}</Tag>
                  <Text type="secondary">
                    预计时长：{currentTask.estimatedDuration}分钟
                  </Text>
                </div>
                {currentTask.description && (
                  <div className="task-description-display">
                    <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
                      {currentTask.description}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* 侧边栏信息 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* 今日统计 */}
            <Card title="今日统计" size="small">
              {todayStats && (
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{todayStats.completedSessions || 0}</div>
                    <div className="stat-label">完成番茄</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{Math.floor(todayStats.todayFocusTime)}min</div>
                    <div className="stat-label">专注时长</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{todayStats.totalSessions || 0}</div>
                    <div className="stat-label">总会话</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{todayStats.interruptionCount || 0}</div>
                    <div className="stat-label">中断次数</div>
                  </div>
                </div>
              )}
            </Card>

            {/* 会话记录 */}
            <Card title="今日记录" size="small">
              {todaySessions.length > 0 ? (
                <List
                  dataSource={todaySessions.slice(0, 5)} // 只显示最近5条
                  style={{ maxHeight: '200px', overflow: 'auto' }}
                  renderItem={(session) => {
                    const typeLabel = session.type === 'WORK' ? '专注' :
                                     session.type === 'SHORT_BREAK' ? '短休息' : '长休息';
                    const typeColor = session.type === 'WORK' ? '#1890ff' :
                                     session.type === 'SHORT_BREAK' ? '#52c41a' : '#faad14';

                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size="small"
                              style={{ backgroundColor: typeColor }}
                            >
                              {session.plannedDuration}min
                            </Avatar>
                          }
                          title={
                            <Space wrap>
                              <Text>{session.taskTitle || typeLabel}</Text>
                              {session.isCompleted && (
                                <Tag color="green" size="small">完成</Tag>
                              )}
                            </Space>
                          }
                          description={
                            <Space split={<span>|</span>}>
                              <span type="secondary">
                                {dayjs(session.startedAt).format('HH:mm')}
                              </span>
                              {session.completedAt && (
                                <span type="secondary">
                                  {dayjs(session.completedAt).format('HH:mm')}
                                </span>
                              )}
                              <span type="secondary">
                                {session.actualDuration ? `${session.actualDuration}分钟` : `${session.plannedDuration}分钟`}
                              </span>
                              {session.interruptionCount > 0 && (
                                <Tag color="orange" size="small">
                                  中断{session.interruptionCount}次
                                </Tag>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Empty
                    description="今日还没有记录"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>

      {/* 任务选择模态框 */}
      <Modal
        title="选择任务"
        open={showTaskSelect}
        onCancel={() => setShowTaskSelect(false)}
        footer={null}
        width={800}
        className="task-select-modal"
      >
        <TaskSelectModal onSelect={handleTaskSelect} navigate={navigate} onClose={() => setShowTaskSelect(false)} />
      </Modal>

      {/* 设置模态框 */}
      <Modal
        title="计时器设置"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        onOk={() => setShowSettings(false)}
        width={600}
      >
        <TimerSettingsModal
          settings={settings}
          onChange={setSettings}
        />
      </Modal>
    </div>
  );
};

// 任务选择组件
const TaskSelectModal: React.FC<{ onSelect: (task: Task) => void; navigate: any; onClose: () => void }> = ({ onSelect, navigate, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    // 动态加载待办任务
    const loadTasks = async () => {
      setLoading(true);
      try {
        // 获取所有任务，不过滤状态（避免参数格式问题）
        const response = await taskApi.getTasks({
          pageSize: 50,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        });

        if (response && response.records && Array.isArray(response.records)) {
          // 过滤出未完成的任务（待处理、进行中、已暂停）
          const incompleteTasks = response.records.filter((task: Task) =>
            task.status === 'pending' ||
            task.status === 'in_progress' ||
            task.status === 'paused'
          );

          setTasks(incompleteTasks);
          setFilteredTasks(incompleteTasks);
        } else {
          setTasks([]);
          setFilteredTasks([]);
        }
      } catch (error) {
        console.error('加载任务列表失败:', error);
        message.error('加载任务列表失败');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // 搜索和筛选任务
  useEffect(() => {
    let filtered = tasks;

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }

    // 按状态筛选
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchKeyword, selectedStatus]);

  if (loading) {
    return (
      <div className="task-select-loading">
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>加载任务列表中...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '400px' }}>
      {/* 搜索和筛选区域 */}
      <div className="task-select-filters">
        <Row gutter={[12, 12]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="搜索任务标题或描述..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: 120 }}
              placeholder="状态"
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="pending">待处理</Select.Option>
              <Select.Option value="in_progress">进行中</Select.Option>
              <Select.Option value="paused">已暂停</Select.Option>
            </Select>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                navigate('/tasks?action=create');
                onClose();
              }}
            >
              新建任务
            </Button>
          </Col>
        </Row>
      </div>

      {/* 任务统计 */}
      <div className="task-select-stats">
        <Space split={<Divider type="vertical" />}>
          <span>
            <strong>{filteredTasks.length}</strong> 个任务
            {searchKeyword && ` (搜索: "${searchKeyword}")`}
          </span>
          {selectedStatus !== 'all' && (
            <span>
              状态: <Tag size="small">
                {selectedStatus === 'pending' ? '待处理' :
                 selectedStatus === 'in_progress' ? '进行中' : '已暂停'}
              </Tag>
            </span>
          )}
        </Space>
      </div>

      {/* 任务列表 */}
      {filteredTasks.length === 0 ? (
        <div className="task-select-empty">
          <Empty
            description={
              searchKeyword || selectedStatus !== 'all'
                ? "没有找到匹配的任务"
                : "暂无可选任务"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
          {!searchKeyword && selectedStatus === 'all' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                navigate('/tasks?action=create');
                onClose();
              }}
            >
              创建第一个任务
            </Button>
          )}
          </Empty>
        </div>
      ) : (
        <div className="task-select-list">
          <List
            dataSource={filteredTasks}
            renderItem={(task) => (
            <List.Item
              onClick={() => onSelect(task)}
              style={{
                cursor: 'pointer',
                padding: '16px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
                transition: 'all 0.2s ease'
              }}
              className="task-select-item"
              actions={[
                <Button
                  type="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(task);
                  }}
                  style={{ borderRadius: '4px' }}
                >
                  选择
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size="large"
                    className={`priority-${task.priority}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#fff'
                    }}
                  >
                    {task.estimatedDuration || 25}
                  </Avatar>
                }
                title={
                  <div style={{ marginBottom: 4 }}>
                    <Space wrap>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{task.title}</span>
                      {task.status === 'in_progress' && (
                        <Tag color="blue" size="small">进行中</Tag>
                      )}
                      {task.status === 'paused' && (
                        <Tag color="orange" size="small">已暂停</Tag>
                      )}
                      {task.priority === 'high' && (
                        <Tag color="red" size="small">高优先级</Tag>
                      )}
                      {task.priority === 'low' && (
                        <Tag color="green" size="small">低优先级</Tag>
                      )}
                    </Space>
                  </div>
                }
                description={
                  <div>
                    <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                      <span style={{ color: '#666' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {task.estimatedDuration}分钟
                      </span>
                      <span style={{ color: '#666' }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(task.createdAt).format('MM-DD 创建')}
                      </span>
                      {task.dueDate && (
                        <span style={{
                          color: dayjs(task.dueDate).isBefore(dayjs()) ? '#ff4d4f' : '#666',
                          fontWeight: dayjs(task.dueDate).isBefore(dayjs()) ? 'bold' : 'normal'
                        }}>
                          <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                          截止: {dayjs(task.dueDate).format('MM-DD HH:mm')}
                        </span>
                      )}
                    </Space>
                    {task.description && (
                      <div style={{
                        marginTop: 6,
                        color: '#999',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
        </div>
      )}
    </div>
  );
};

// 设置组件
const TimerSettingsModal: React.FC<{
  settings: any;
  onChange: (settings: any) => void;
}> = ({ settings, onChange }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <div>
        <Text strong>工作时长（分钟）</Text>
        <input
          type="number"
          value={settings.workDuration}
          onChange={(e) => onChange({ ...settings, workDuration: parseInt(e.target.value) })}
          min={1}
          max={60}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div>
        <Text strong>短休息时长（分钟）</Text>
        <input
          type="number"
          value={settings.shortBreakDuration}
          onChange={(e) => onChange({ ...settings, shortBreakDuration: parseInt(e.target.value) })}
          min={1}
          max={30}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div>
        <Text strong>长休息时长（分钟）</Text>
        <input
          type="number"
          value={settings.longBreakDuration}
          onChange={(e) => onChange({ ...settings, longBreakDuration: parseInt(e.target.value) })}
          min={1}
          max={60}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div>
        <Text strong>长休息间隔（几个番茄钟后）</Text>
        <input
          type="number"
          value={settings.longBreakInterval}
          onChange={(e) => onChange({ ...settings, longBreakInterval: parseInt(e.target.value) })}
          min={2}
          max={10}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
    </Space>
  );
};

export default PomodoroTimer;