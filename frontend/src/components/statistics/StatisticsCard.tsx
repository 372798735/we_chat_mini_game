import React from 'react';
import { Card, Button, Tooltip } from 'antd';
import { CardContent } from '../common';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Card as CustomCard } from '../common';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    text?: string;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  loading?: boolean;
  tooltip?: string;
  actions?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 统计卡片组件
 *
 * @param props - 统计卡片属性
 * @returns JSX.Element
 */
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
  loading = false,
  tooltip,
  actions,
  className,
  onClick,
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'success':
        return 'statistics-card-success';
      case 'warning':
        return 'statistics-card-warning';
      case 'danger':
        return 'statistics-card-danger';
      case 'info':
        return 'statistics-card-info';
      default:
        return 'statistics-card-primary';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'danger':
        return '#ff4d4f';
      case 'info':
        return '#1890ff';
      default:
        return '#1890ff';
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const renderTrend = () => {
    if (!trend) return null;

    const TrendIcon = trend.isPositive ? ArrowUpOutlined : ArrowDownOutlined;
    const trendColor = trend.isPositive ? '#52c41a' : '#ff4d4f';

    return (
      <div className="statistics-card-trend">
        <TrendIcon style={{ color: trendColor, marginRight: 4 }} />
        <span style={{ color: trendColor }}>
          {Math.abs(trend.value)}%
        </span>
        {trend.text && (
          <span className="statistics-card-trend-text">{trend.text}</span>
        )}
      </div>
    );
  };

  return (
    <CustomCard
      className={`statistics-card ${getColorClass()} ${className || ''}`}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <CardContent>
        <div className="statistics-card-header">
          <div className="statistics-card-title">
            {title}
            {tooltip && (
              <Tooltip title={tooltip}>
                <InfoCircleOutlined className="statistics-card-tooltip" />
              </Tooltip>
            )}
          </div>
          {icon && (
            <div
              className="statistics-card-icon"
              style={{ color: getIconColor() }}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="statistics-card-content">
          <div className="statistics-card-value">
            {loading ? (
              <span className="statistics-card-loading">--</span>
            ) : (
              formatValue(value)
            )}
          </div>

          {subtitle && (
            <div className="statistics-card-subtitle">
              {subtitle}
            </div>
          )}

          {renderTrend()}
        </div>

        {actions && (
          <div className="statistics-card-actions">
            {actions}
          </div>
        )}
      </CardContent>
    </CustomCard>
  );
};

/**
 * 统计卡片网格组件
 */
export const StatisticsCardGrid: React.FC<{
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}> = ({
  children,
  columns = 4,
  gap = 16,
  className,
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
  };

  return (
    <div
      className={`statistics-card-grid ${className || ''}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

export default StatisticsCard;