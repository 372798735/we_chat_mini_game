import React, { useState, useMemo } from 'react';
import { Card, Button, Tag, Tooltip, Dropdown, Space, Modal } from 'antd';
import { CardContent } from '../common';
import {
  MoreOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import { Card as CustomCard, Button as CustomButton } from '../common';
import type { Task, TaskPriority, TaskStatus } from '../../types/task';
import type { Tag as TagType } from '../../types/dict';
import dictApi from '../../api/dict';
import './TaskCard.css';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface TaskCardProps {
  task: Task;
  onStart?: (task: Task) => void;
  onPause?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

/**
 * 任务卡片组件
 *
 * @param props - 任务卡片属性
 * @returns JSX.Element
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStart,
  onPause,
  onComplete,
  onEdit,
  onDelete,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allTags, setAllTags] = useState<TagType[]>([]);

  // 加载标签数据
  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await dictApi.getTags();
        setAllTags(tags);
      } catch (error) {
        console.error('加载标签失败:', error);
      }
    };
    loadTags();
  }, []);

  // 获取标签颜色
  const getTagColor = (tagName: string) => {
    const tag = allTags.find(t => t.name === tagName.trim());
    return tag?.color || '#108ee9'; // 默认颜色
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return '#ff4d4f';
      case 'medium':
        return '#faad14';
      case 'low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
      case 'in_progress':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'paused':
        return <PauseCircleOutlined style={{ color: '#faad14' }} />;
      case 'cancelled':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'in_progress':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'paused':
        return '已暂停';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
    }
    return `${mins}分钟`;
  };

  const isOverdue =
    task.dueDate && dayjs(task.dueDate).isBefore(dayjs()) && task.status !== 'completed';

  const getActionButtons = () => {
    const buttons = [];

    // 根据状态添加主要操作按钮
    switch (task.status) {
      case 'pending':
        buttons.push(
          <CustomButton
            key="start"
            variant="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => onStart?.(task)}
          >
            开始
          </CustomButton>
        );
        break;
      case 'in_progress':
        buttons.push(
          <CustomButton
            key="pause"
            variant="warning"
            size="small"
            icon={<PauseCircleOutlined />}
            onClick={() => onPause?.(task)}
          >
            暂停
          </CustomButton>,
          <CustomButton
            key="complete"
            variant="success"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => onComplete?.(task)}
          >
            完成
          </CustomButton>
        );
        break;
      case 'paused':
        buttons.push(
          <CustomButton
            key="continue"
            variant="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => onStart?.(task)}
          >
            继续
          </CustomButton>
        );
        break;
      default:
        break;
    }

    // 已完成的任务不能重新开始番茄钟
    // 如果任务取消，可以重新开始按钮
    if (task.status === 'cancelled') {
      buttons.push(
        <CustomButton
          key="restart"
          variant="secondary"
          size="small"
          icon={<PlayCircleOutlined />}
          onClick={() => onStart?.(task)}
        >
          重新开始
        </CustomButton>
      );
    }

    // 始终添加编辑按钮
    buttons.push(
      <CustomButton key="edit" variant="secondary" size="small" onClick={() => onEdit?.(task)}>
        编辑
      </CustomButton>
    );

    return <Space size="small">{buttons}</Space>;
  };

  const getDropdownItems = () => [
    {
      key: 'duplicate',
      label: '复制任务',
      onClick: () => {
        // 复制任务功能
        const duplicatedTask = {
          ...task,
          id: Date.now(), // 临时ID
          title: `${task.title} (副本)`,
          status: 'pending' as TaskStatus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // 这里可以调用API创建任务副本
        console.log('复制任务:', duplicatedTask);
      },
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除任务',
      danger: true,
      onClick: () => setShowDeleteModal(true),
    },
  ];

  return (
    <>
      <CustomCard
        className="task-card"
        hoverable={task.status === 'pending'}
        variant={task.status === 'completed' ? 'outlined' : 'default'}
      >
        <CardContent>
          <div className="task-card-header">
            <div className="task-card-title-section">
              <div className="task-card-title">
                {getStatusIcon(task.status)}
                <Tooltip title={task.title} placement="top">
                  <span
                    className={`task-title-text ${task.status === 'completed' ? 'completed-title' : ''}`}
                  >
                    {task.title}
                  </span>
                </Tooltip>
              </div>
              <div className="task-card-meta">
                <Tag color={getPriorityColor(task.priority)}>
                  {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
                </Tag>
                <span className="task-status">{getStatusText(task.status)}</span>
                {task.tags && (
                  <Space size={4} style={{ marginLeft: 8 }}>
                    {(Array.isArray(task.tags) ? task.tags : task.tags.split(','))
                      .filter(tag => tag && tag.trim() !== '')
                      .slice(0, 3)
                      .map((tag, index) => (
                        <Tag
                          key={index}
                          color={getTagColor(tag)}
                          style={{
                            border: `1px solid ${getTagColor(tag)}20`,
                            backgroundColor: `${getTagColor(tag)}10`,
                            color: getTagColor(tag),
                            fontWeight: 500,
                            marginBottom: 0,
                          }}
                        >
                          {tag.trim()}
                        </Tag>
                      ))}
                  </Space>
                )}
              </div>
            </div>
            <Dropdown
              menu={{ items: getDropdownItems() }}
              trigger={['click']}
              placement="bottomRight"
            >
              <CustomButton
                variant="text"
                size="small"
                icon={<MoreOutlined />}
                className="task-card-menu"
              />
            </Dropdown>
          </div>

          {task.description && (
            <div className="task-card-description">
              <Tooltip title={task.description} placement="top">
                <div className="task-description-text">{task.description}</div>
              </Tooltip>
            </div>
          )}

          <div className="task-card-info">
            <div className="task-duration">
              <ClockCircleOutlined />
              <span>预计: {formatDuration(task.estimatedDuration)}</span>
              {task.actualDuration > 0 && (
                <span className="actual-duration">
                  / 实际: {formatDuration(task.actualDuration)}
                </span>
              )}
            </div>

            {task.dueDate && (
              <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
                <ClockCircleOutlined />
                <span>
                  {isOverdue && (
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                  )}
                  截止: {dayjs(task.dueDate).format('MM-DD HH:mm')}
                  <span className="relative-time">({dayjs(task.dueDate).fromNow()})</span>
                </span>
              </div>
            )}
          </div>

          <div className="task-card-footer">{getActionButtons()}</div>
        </CardContent>
      </CustomCard>

      <Modal
        title="确认删除"
        open={showDeleteModal}
        onOk={() => {
          onDelete?.(task);
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除任务 "{task.title}" 吗？此操作不可恢复。</p>
      </Modal>
    </>
  );
};

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  .task-title-text {
    display: inline-block;
    max-width: calc(100% - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }

  .task-description-text {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
  }

  .task-description-text:hover {
    white-space: normal;
    word-break: break-all;
  }

  .task-tags {
    margin: 8px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .task-tags .ant-tag {
    margin: 0;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 1.2;
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: default;
  }

  .task-tags .ant-tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .completed-title {
    text-decoration: line-through;
    color: #8c8c8c;
  }
`;

// 确保样式只添加一次
if (!document.getElementById('task-card-styles')) {
  style.id = 'task-card-styles';
  document.head.appendChild(style);
}

export default TaskCard;
