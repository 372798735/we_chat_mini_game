import React from 'react';
import { Card, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';

interface DashboardStatsProps {
  loading?: boolean;
  statistics?: any;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  loading = false
}) => {
  return (
    <Card
      loading={loading}
      style={{
        textAlign: 'center',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      styles={{ body: { padding: '24px' } }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            fontSize: '32px',
            color: color,
            marginBottom: '8px',
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          {title}
        </div>
        <Statistic
          value={value}
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: color,
          }}
        />
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </Card>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  loading = false,
  statistics
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '32px',
    }}>
      <StatCard
        title="今日任务"
        value={statistics?.today?.totalTasks || 0}
        subtitle="总计"
        icon={<CheckCircleOutlined />}
        color="#1890ff"
        loading={loading}
      />
      <StatCard
        title="已完成"
        value={statistics?.today?.completedTasks || 0}
        subtitle="任务"
        icon={<TrophyOutlined />}
        color="#52c41a"
        loading={loading}
      />
      <StatCard
        title="专注时间"
        value={statistics?.today?.totalFocusTime || 0}
        subtitle="分钟"
        icon={<ClockCircleOutlined />}
        color="#faad14"
        loading={loading}
      />
      <StatCard
        title="完成率"
        value={statistics?.today?.completionRate || 0}
        subtitle="%"
        icon={<FireOutlined />}
        color="#722ed1"
        loading={loading}
      />
    </div>
  );
};

export default DashboardStats;