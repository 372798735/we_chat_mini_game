import React from 'react';
import {
  Card,
  Tag,
  Rate,
  Tooltip,
  Button,
  Space,
  Typography,
  Avatar,
} from 'antd';
import {
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import { Card as CustomCard } from '../common';
import type { TaskSummaryWithTask } from '../../types/summary';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Text, Paragraph } = Typography;

interface TaskSummaryCardProps {
  summary: TaskSummaryWithTask;
  onEdit?: (summary: TaskSummaryWithTask) => void;
  onDelete?: (summary: TaskSummaryWithTask) => void;
  loading?: boolean;
}

/**
 * 任务总结卡片组件
 *
 * @param props - 卡片属性
 * @returns JSX.Element
 */
export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
  summary,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const getRatingValue = (rating: string): number => {
    switch (rating) {
      case 'EXCELLENT': return 5;
      case 'GOOD': return 4;
      case 'AVERAGE': return 3;
      case 'POOR': return 2;
      default: return 3;
    }
  };

  const getMoodEmoji = (mood: string): string => {
    switch (mood) {
      case 'VERY_HAPPY': return '😊';
      case 'HAPPY': return '🙂';
      case 'NEUTRAL': return '😐';
      case 'UNHAPPY': return '😕';
      case 'VERY_UNHAPPY': return '😞';
      default: return '😐';
    }
  };

  const getMoodText = (mood: string): string => {
    switch (mood) {
      case 'VERY_HAPPY': return '非常愉快';
      case 'HAPPY': return '愉快';
      case 'NEUTRAL': return '一般';
      case 'UNHAPPY': return '不愉快';
      case 'VERY_UNHAPPY': return '很不愉快';
      default: return '一般';
    }
  };

  const getDifficultyStars = (difficulty: string): number => {
    switch (difficulty) {
      case 'VERY_EASY': return 1;
      case 'EASY': return 2;
      case 'MEDIUM': return 3;
      case 'HARD': return 4;
      case 'VERY_HARD': return 5;
      default: return 3;
    }
  };

  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'VERY_EASY': return '很容易';
      case 'EASY': return '容易';
      case 'MEDIUM': return '适中';
      case 'HARD': return '困难';
      case 'VERY_HARD': return '很困难';
      default: return '适中';
    }
  };

  const getFocusLevelText = (focusLevel: string): string => {
    switch (focusLevel) {
      case 'VERY_FOCUSED': return '非常专注';
      case 'FOCUSED': return '专注';
      case 'NORMAL': return '一般';
      case 'DISTRACTED': return '容易分心';
      case 'VERY_DISTRACTED': return '很分心';
      default: return '一般';
    }
  };

  const getFocusLevelColor = (focusLevel: string): string => {
    switch (focusLevel) {
      case 'VERY_FOCUSED': return '#52c41a';
      case 'FOCUSED': return '#1890ff';
      case 'NORMAL': return '#faad14';
      case 'DISTRACTED': return '#fa8c16';
      case 'VERY_DISTRACTED': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  return (
    <CustomCard className="summary-card">
      <div className="summary-card-header">
        <div className="summary-card-title">
          <h3>{summary.task.title}</h3>
          <div className="summary-card-meta">
            <CalendarOutlined />
            <span>{dayjs(summary.createdAt).format('YYYY-MM-DD HH:mm')}</span>
            <Text type="secondary">({dayjs(summary.createdAt).fromNow()})</Text>
          </div>
        </div>

        <div className="summary-card-actions">
          <Space>
            <Tooltip title="编辑总结">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(summary)}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="删除总结">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete?.(summary)}
                loading={loading}
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      <div className="summary-card-rating">
        <div className="rating-item">
          <Text strong>完成度评价：</Text>
          <Rate
            disabled
            value={getRatingValue(summary.rating)}
            character={<StarOutlined />}
            style={{ marginLeft: 8 }}
          />
          <Text style={{ marginLeft: 8 }} type="secondary">
            {summary.rating === 'EXCELLENT' ? '优秀' :
             summary.rating === 'GOOD' ? '良好' :
             summary.rating === 'AVERAGE' ? '一般' : '较差'}
          </Text>
        </div>
      </div>

      <div className="summary-card-metrics">
        <div className="metric-row">
          <div className="metric-item">
            <Avatar size="small" style={{ backgroundColor: '#f0f0f0', color: '#666' }}>
              {getMoodEmoji(summary.mood)}
            </Avatar>
            <Text style={{ marginLeft: 8 }}>{getMoodText(summary.mood)}</Text>
          </div>

          <div className="metric-item">
            <Text type="secondary">难度：</Text>
            <Rate
              disabled
              count={5}
              value={getDifficultyStars(summary.difficulty)}
              style={{ marginLeft: 4 }}
            />
            <Text style={{ marginLeft: 8 }} type="secondary">
              {getDifficultyText(summary.difficulty)}
            </Text>
          </div>
        </div>

        <div className="metric-item">
          <Text type="secondary">专注度：</Text>
          <Tag
            color={getFocusLevelColor(summary.focusLevel)}
            style={{ marginLeft: 8 }}
          >
            {getFocusLevelText(summary.focusLevel)}
          </Tag>
        </div>
      </div>

      <div className="summary-card-content">
        <Paragraph
          ellipsis={{ rows: 3, expandable: true }}
          style={{ marginBottom: 12 }}
        >
          {summary.summary}
        </Paragraph>
      </div>

      {summary.tags && (
        <div className="summary-card-tags">
          {summary.tags.split(',').map((tag, index) => (
            <Tag key={index} size="small">
              {tag.trim()}
            </Tag>
          ))}
        </div>
      )}
    </CustomCard>
  );
};

export default TaskSummaryCard;