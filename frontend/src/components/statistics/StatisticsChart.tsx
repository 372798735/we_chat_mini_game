import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Loading } from '../common';

interface StatisticsChartProps {
  data: any;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title?: string;
  height?: number;
  options?: any;
  loading?: boolean;
  className?: string;
}

/**
 * 统计图表组件
 *
 * @param props - 图表属性
 * @returns JSX.Element
 */
export const StatisticsChart: React.FC<StatisticsChartProps> = ({
  data,
  type,
  title,
  height = 300,
  options,
  loading = false,
  className,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstance.current && data && !loading) {
      const chartOptions = getChartOptions(type, data, title, options);
      chartInstance.current.setOption(chartOptions, true);
    }
  }, [data, type, title, options, loading]);

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getChartOptions = (chartType: string, chartData: any, chartTitle?: string, customOptions?: any) => {
    const baseOptions = {
      title: chartTitle ? {
        text: chartTitle,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      } : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'cross' }
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        textStyle: { color: '#666' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: chartTitle ? '15%' : '5%',
        containLabel: true
      }
    };

    switch (chartType) {
      case 'line':
        return {
          ...baseOptions,
          xAxis: {
            type: 'category',
            data: chartData.xAxis || [],
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' },
            splitLine: { lineStyle: { color: '#f0f0f0' } }
          },
          series: chartData.series || []
        };

      case 'bar':
        return {
          ...baseOptions,
          xAxis: {
            type: 'category',
            data: chartData.xAxis || [],
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' },
            splitLine: { lineStyle: { color: '#f0f0f0' } }
          },
          series: chartData.series || []
        };

      case 'area':
        return {
          ...baseOptions,
          xAxis: {
            type: 'category',
            data: chartData.xAxis || [],
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#ddd' } },
            axisLabel: { color: '#666' },
            splitLine: { lineStyle: { color: '#f0f0f0' } }
          },
          series: (chartData.series || []).map((series: any) => ({
            ...series,
            areaStyle: {
              opacity: 0.3,
              color: series.itemStyle?.color || '#1890ff'
            }
          }))
        };

      case 'pie':
        return {
          title: chartTitle ? {
            text: chartTitle,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333'
            }
          } : undefined,
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: '#333',
            textStyle: { color: '#fff' },
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#666' }
          },
          series: [
            {
              name: chartData.seriesName || '数据',
              type: 'pie',
              radius: chartData.radius || ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: '{b}: {c}'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold'
                }
              },
              data: chartData.data || []
            }
          ]
        };

      case 'doughnut':
        return {
          title: chartTitle ? {
            text: chartTitle,
            left: 'center',
            textStyle: {
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333'
            }
          } : undefined,
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(50, 50, 50, 0.9)',
            borderColor: '#333',
            textStyle: { color: '#fff' },
            formatter: '{a} <br/>{b}: {c} ({d}%)'
          },
          legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#666' }
          },
          series: [
            {
              name: chartData.seriesName || '数据',
              type: 'pie',
              radius: ['50%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {c}'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: 'bold'
                }
              },
              data: chartData.data || []
            }
          ]
        };

      default:
        return baseOptions;
    }
  };

  if (loading) {
    return (
      <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading size="large" text="图表加载中..." />
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className={className}
      style={{ height, width: '100%' }}
    />
  );
};

export default StatisticsChart;