import React from 'react';
import { Card, Statistic, Typography } from 'antd';
import type { StatisticProps } from 'antd/es/statistic';

const { Text } = Typography;

interface SimpleStatisticsCardProps {
  title: React.ReactNode;
  value: number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const colorMap = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  info: '#722ed1',
  error: '#ff4d4f',
};

const SimpleStatisticsCard: React.FC<SimpleStatisticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  loading = false,
  prefix,
  suffix,
}) => {
  return (
    <Card
      loading={loading}
      style={{
        textAlign: 'center',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ marginBottom: '16px' }}>
        {icon && (
          <div
            style={{
              fontSize: '32px',
              color: colorMap[color],
              marginBottom: '8px',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          {title}
        </div>
        <Statistic
          value={value}
          prefix={prefix}
          suffix={suffix}
          valueStyle={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: colorMap[color],
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

// 简化的卡片网格组件
interface StatisticsCardGridProps {
  children: React.ReactNode;
  columns?: number;
  className?: string;
}

const StatisticsCardGrid: React.FC<StatisticsCardGridProps> = ({
  children,
  columns = 4,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {children}
    </div>
  );
};

// 简化的图表组件
interface SimpleStatisticsChartProps {
  data: any;
  type: 'bar' | 'line' | 'area';
  height: number;
  loading?: boolean;
}

const SimpleStatisticsChart: React.FC<SimpleStatisticsChartProps> = ({
  data,
  type,
  height,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>加载中...</div>
      </div>
    );
  }

  if (!data || !data.series) {
    return (
      <div
        style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
        }}
      >
        暂无数据
      </div>
    );
  }

  // 简单的条形图显示
  return (
    <div
      style={{
        height: `${height}px`,
        padding: '16px',
        overflow: 'hidden',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Text strong>{data.series[0]?.name || '数据'}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '8px' }}>
        {data.series[0]?.data?.map((value: number, index: number) => {
          const maxValue = Math.max(...(data.series[0]?.data || [1]));
          const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const color = data.series[0]?.itemStyle?.color || '#1890ff';

          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}%`,
                  backgroundColor: color,
                  borderRadius: '2px',
                  transition: 'height 0.3s',
                }}
              />
              <div
                style={{
                  fontSize: '10px',
                  color: '#666',
                  marginTop: '4px',
                  textAlign: 'center',
                }}
              >
                {data.xAxis?.[index] || index}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SimpleStatisticsCard, SimpleStatisticsChart as StatisticsChart, StatisticsCardGrid };