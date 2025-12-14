import React, { useEffect } from 'react'
import { Card, Row, Col, Typography, Select, DatePicker, Space, Statistic } from 'antd'
import { TrophyOutlined, ClockCircleOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import {
  fetchTaskStatistics,
  fetchDailyStatistics,
  fetchCategoryStatistics,
  setTimeRange,
} from '@/store/slices/statisticsSlice'
// 暂时移除图表库依赖，后续可添加 @ant-design/plots

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const Statistics: React.FC = () => {
  const dispatch = useAppDispatch()
  const { taskStats, dailyStats, categoryStats, timeRange, isLoading } = useAppSelector(
    state => state.statistics
  )

  useEffect(() => {
    // 获取统计数据
    dispatch(fetchTaskStatistics())
    dispatch(fetchDailyStatistics(timeRange))
    dispatch(fetchCategoryStatistics())
  }, [dispatch, timeRange])

  // 处理时间范围变化
  const handleTimeRangeChange = (value: 'week' | 'month' | 'quarter' | 'year') => {
    dispatch(setTimeRange(value))
    dispatch(fetchDailyStatistics(value))
  }

  // 暂时使用简单的列表显示，后续可集成图表库

  return (
    <div className="statistics-page" style={{ padding: '24px' }}>
      {/* 页面标题和控制器 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>数据统计</Title>
        </Col>
        <Col>
          <Space>
            <Text>时间范围：</Text>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              style={{ width: 120 }}
            >
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="quarter">本季度</Option>
              <Option value="year">本年</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={taskStats.total}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              loading={isLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成任务"
              value={taskStats.completed}
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              loading={isLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中任务"
              value={taskStats.inProgress}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              loading={isLoading}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="逾期任务"
              value={taskStats.overdue}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 专注时间趋势 */}
        <Col xs={24} lg={14}>
          <Card title="专注时间趋势" loading={isLoading}>
            <div style={{ height: '300px', overflow: 'auto' }}>
              {dailyStats.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {dailyStats.slice(-7).map((item, index) => (
                    <Row key={index} justify="space-between" align="middle">
                      <Col>{item.date}</Col>
                      <Col>
                        <Space>
                          <Text>{Math.floor(item.focusTime / 60)}h{item.focusTime % 60}m</Text>
                          <Text type="secondary">{item.pomodoroSessions}个番茄钟</Text>
                        </Space>
                      </Col>
                    </Row>
                  ))}
                </Space>
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text type="secondary">暂无数据</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* 分类统计 */}
        <Col xs={24} lg={10}>
          <Card title="分类专注时间分布" loading={isLoading}>
            <div style={{ height: '300px', overflow: 'auto' }}>
              {categoryStats.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {categoryStats.map(category => (
                    <Row key={category.categoryId} justify="space-between" align="middle">
                      <Col>
                        <Text strong>{category.categoryName}</Text>
                      </Col>
                      <Col>
                        <Text>{Math.floor(category.focusTime / 60)}h{category.focusTime % 60}m</Text>
                      </Col>
                    </Row>
                  ))}
                </Space>
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text type="secondary">暂无数据</Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 详细统计表格 */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="分类详情" loading={isLoading}>
            {categoryStats.length > 0 ? (
              <Row gutter={[16, 16]}>
                {categoryStats.map(category => (
                  <Col xs={24} sm={12} lg={8} key={category.categoryId}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Text strong>{category.categoryName}</Text>
                        </div>
                        <div>
                          <Text type="secondary">任务数：{category.taskCount}</Text>
                        </div>
                        <div>
                          <Text type="secondary">已完成：{category.completedCount}</Text>
                        </div>
                        <div>
                          <Text type="secondary">专注时间：{Math.floor(category.focusTime / 60)}小时{category.focusTime % 60}分钟</Text>
                        </div>
                        <div>
                          <Text type="secondary">完成率：{category.taskCount > 0 ? Math.round((category.completedCount / category.taskCount) * 100) : 0}%</Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Text type="secondary">暂无分类数据</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Statistics