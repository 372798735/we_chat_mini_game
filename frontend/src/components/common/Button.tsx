import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Button.css';

interface ButtonProps extends Omit<AntButtonProps, 'loading'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * 通用按钮组件
 *
 * @param props - 按钮属性
 * @returns JSX.Element
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className,
  disabled,
  ...restProps
}) => {
  const getButtonType = (): AntButtonProps['type'] => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'danger':
        return 'primary';
      case 'success':
        return 'primary';
      case 'warning':
        return 'primary';
      case 'secondary':
        return 'default';
      case 'text':
        return 'text';
      default:
        return 'primary';
    }
  };

  const getClassName = () => {
    const baseClass = 'custom-button';
    const variantClass = `custom-button-${variant}`;
    const sizeClass = `custom-button-${size}`;
    const widthClass = fullWidth ? 'custom-button-full-width' : '';

    return [baseClass, variantClass, sizeClass, widthClass, className].filter(Boolean).join(' ');
  };

  const getStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};

    // 根据variant设置背景色
    switch (variant) {
      case 'danger':
        style.backgroundColor = '#ff4d4f';
        style.borderColor = '#ff4d4f';
        break;
      case 'success':
        style.backgroundColor = '#52c41a';
        style.borderColor = '#52c41a';
        break;
      case 'warning':
        style.backgroundColor = '#faad14';
        style.borderColor = '#faad14';
        break;
    }

    return style;
  };

  return (
    <AntButton
      type={getButtonType()}
      className={getClassName()}
      style={getStyle()}
      loading={loading}
      disabled={disabled || loading}
      icon={loading ? <LoadingOutlined /> : icon}
      {...restProps}
    >
      {children}
    </AntButton>
  );
};

export default Button;
