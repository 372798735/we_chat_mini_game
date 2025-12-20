import React from 'react';
import {
  Card,
  Empty,
  Typography,
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import type { DailyStatistics } from '@/api/statistics';

const { Title } = Typography;

interface WeeklyChartProps {
  data: DailyStatistics[];
  loading?: boolean;
  title?: string;
}

/**
 * 周统计图表组件
 */
export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  data = [],
  loading = false,
  title = '本周数据统计',
}) => {
  // 格式化数据用于图表显示
  const chartData = data.map(item => ({
    date: new Date(item.statDate).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    }),
    完成任务数: item.completedTasks || 0,
    总任务数: item.totalTasks || 0,
    专注时长: item.totalFocusTime || 0,
    番茄钟数: item.totalPomodoros || 0,
    完成率: Math.round(item.completionRate || 0),
  }));

  if (!data || data.length === 0) {
    return (
      <Card title={title} loading={loading}>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Empty
            description="暂无统计数据"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} loading={loading}>
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          任务完成趋势
        </Title>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [value, name]}
              labelStyle={{ color: '#000' }}
            />
            <Area
              type="monotone"
              dataKey="完成任务数"
              stackId="1"
              stroke="#52c41a"
              fill="#52c41a"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="总任务数"
              stackId="2"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          专注时间统计
        </Title>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                name === '专注时长' ? `${value} 分钟` : value,
                name
              ]}
              labelStyle={{ color: '#000' }}
            />
            <Bar
              dataKey="专注时长"
              fill="#ff7a45"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <Title level={5} style={{ marginBottom: 16 }}>
          完成率趋势
        </Title>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, '完成率']}
              labelStyle={{ color: '#000' }}
            />
            <Line
              type="monotone"
              dataKey="完成率"
              stroke="#722ed1"
              strokeWidth={2}
              dot={{ fill: '#722ed1', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default WeeklyChart;