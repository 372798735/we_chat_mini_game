import React from 'react';
import { Spin as AntSpin, SpinProps as AntSpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './Loading.css';

interface LoadingProps extends Omit<AntSpinProps, 'indicator'> {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullscreen?: boolean;
  overlay?: boolean;
}

/**
 * 通用加载组件
 *
 * @param props - 加载属性
 * @returns JSX.Element
 */
export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'spinner',
  text,
  fullscreen = false,
  overlay = false,
  spinning = true,
  children,
  ...restProps
}) => {
  const getIndicator = () => {
    const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;

    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="loading-dot"
                style={{
                  width: iconSize / 2,
                  height: iconSize / 2,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div className="loading-pulse">
            <div
              className="loading-pulse-circle"
              style={{ width: iconSize, height: iconSize }}
            />
          </div>
        );
      case 'spinner':
      default:
        return <LoadingOutlined style={{ fontSize: iconSize }} spin />;
    }
  };

  const getSize = (): AntSpinProps['size'] => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'default';
    }
  };

  const getClassName = () => {
    const baseClass = 'custom-loading';
    const variantClass = `custom-loading-${variant}`;
    const sizeClass = `custom-loading-${size}`;
    const fullscreenClass = fullscreen ? 'custom-loading-fullscreen' : '';
    const overlayClass = overlay ? 'custom-loading-overlay' : '';

    return [baseClass, variantClass, sizeClass, fullscreenClass, overlayClass]
      .filter(Boolean)
      .join(' ');
  };

  if (fullscreen) {
    return (
      <div className={getClassName()}>
        <div className="custom-loading-content">
          <div className="custom-loading-spinner">
            {getIndicator()}
          </div>
          {text && <div className="custom-loading-text">{text}</div>}
        </div>
      </div>
    );
  }

  if (overlay && children) {
    return (
      <div className="custom-loading-container">
        {children}
        {spinning && (
          <div className={getClassName()}>
            <div className="custom-loading-content">
              <div className="custom-loading-spinner">
                {getIndicator()}
              </div>
              {text && <div className="custom-loading-text">{text}</div>}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AntSpin
      className={getClassName()}
      indicator={getIndicator()}
      size={getSize()}
      spinning={spinning}
      {...restProps}
    >
      {text && <div className="custom-loading-text">{text}</div>}
      {children}
    </AntSpin>
  );
};

/**
 * 页面级加载组件
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = '加载中...' }) => (
  <Loading size="large" variant="spinner" text={text} fullscreen />
);

/**
 * 按钮加载组件
 */
export const ButtonLoading: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'small' }) => (
  <Loading size={size} variant="dots" />
);

/**
 * 表格加载组件
 */
export const TableLoading: React.FC<{ text?: string }> = ({ text = '数据加载中...' }) => (
  <div className="table-loading-container">
    <Loading size="large" text={text} />
  </div>
);

export default Loading;