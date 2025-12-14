import React from 'react';
import { Card as AntCard, CardProps as AntCardProps } from 'antd';
import './Card.css';

interface CardProps extends AntCardProps {
  variant?: 'default' | 'outlined' | 'shadowed';
  padding?: 'small' | 'medium' | 'large' | 'none';
  hoverable?: boolean;
  children?: React.ReactNode;
}

/**
 * 通用卡片组件
 *
 * @param props - 卡片属性
 * @returns JSX.Element
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  children,
  className,
  ...restProps
}) => {
  const getClassName = () => {
    const baseClass = 'custom-card';
    const variantClass = `custom-card-${variant}`;
    const paddingClass = padding !== 'none' ? `custom-card-padding-${padding}` : '';
    const hoverableClass = hoverable ? 'custom-card-hoverable' : '';

    return [baseClass, variantClass, paddingClass, hoverableClass, className]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <AntCard
      className={getClassName()}
      variant={variant === 'outlined' ? 'outlined' : variant === 'shadowed' ? 'shadow' : undefined}
      hoverable={hoverable}
      {...restProps}
    >
      {children}
    </AntCard>
  );
};

/**
 * 卡片头部组件
 */
export const CardHeader: React.FC<{
  title?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}> = ({ title, extra, className }) => (
  <div className={`custom-card-header ${className || ''}`}>
    {title && <div className="custom-card-header-title">{title}</div>}
    {extra && <div className="custom-card-header-extra">{extra}</div>}
  </div>
);

/**
 * 卡片内容组件
 */
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`custom-card-content ${className || ''}`}>
    {children}
  </div>
);

/**
 * 卡片底部组件
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`custom-card-footer ${className || ''}`}>
    {children}
  </div>
);

export default Card;