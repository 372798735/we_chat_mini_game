import React from 'react'
import { Card, Row, Col, Typography, Button, Progress, Space } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import {
  setTimeRemaining,
  setIsRunning,
  setIsPaused,
  incrementInterruption,
  stopPomodoro,
  updateSettings,
} from '@/store/slices/pomodoroSlice'
import { startPomodoro, completePomodoro } from '@/store/slices/pomodoroSlice'

const { Title, Text } = Typography

const Timer: React.FC = () => {
  const dispatch = useAppDispatch()
  const {
    currentSession,
    timeRemaining,
    isRunning,
    isPaused,
    settings,
    statistics,
  } = useAppSelector(state => state.pomodoro)

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 开始/暂停计时
  const handleToggleTimer = () => {
    if (!currentSession) {
      // 如果没有当前会话，需要先选择任务
      return
    }

    if (isRunning) {
      dispatch(setIsPaused(!isPaused))
    } else {
      dispatch(setIsRunning(true))
      dispatch(setIsPaused(false))
    }
  }

  // 停止计时
  const handleStop = () => {
    dispatch(stopPomodoro())
  }

  // 完成番茄钟
  const handleComplete = async () => {
    if (currentSession) {
      await dispatch(completePomodoro(currentSession.id)).unwrap()
    }
  }

  // 记录中断
  const handleInterruption = () => {
    dispatch(incrementInterruption())
  }

  // 获取会话类型标题
  const getSessionTitle = () => {
    if (!currentSession) return '准备开始'

    switch (currentSession.type) {
      case 'focus':
        return '专注时间'
      case 'short_break':
        return '短休息'
      case 'long_break':
        return '长休息'
      default:
        return '准备开始'
    }
  }

  // 获取进度百分比
  const getProgressPercent = () => {
    if (!currentSession) return 0
    const totalSeconds = currentSession.plannedDuration * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  return (
    <div className="timer-page" style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* 计时器卡片 */}
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={3} style={{ marginBottom: '16px' }}>
                {getSessionTitle()}
              </Title>

              {/* 时间显示 */}
              <div style={{ fontSize: '72px', fontWeight: 'bold', margin: '24px 0', fontFamily: 'monospace' }}>
                {formatTime(timeRemaining)}
              </div>

              {/* 进度条 */}
              <div style={{ margin: '24px 0' }}>
                <Progress
                  percent={getProgressPercent()}
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={8}
                />
              </div>

              {/* 控制按钮 */}
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={isRunning && !isPaused ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  onClick={handleToggleTimer}
                  disabled={!currentSession}
                  style={{ width: '120px', height: '50px' }}
                >
                  {isRunning && !isPaused ? '暂停' : '开始'}
                </Button>

                <Button
                  size="large"
                  icon={<StopOutlined />}
                  onClick={handleStop}
                  disabled={!currentSession}
                  style={{ width: '120px', height: '50px' }}
                >
                  停止
                </Button>

                <Button
                  size="large"
                  onClick={handleInterruption}
                  disabled={!currentSession || !isRunning}
                >
                  中断
                </Button>

                <Button
                  type="default"
                  size="large"
                  onClick={handleComplete}
                  disabled={!currentSession || timeRemaining > 0}
                >
                  完成
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* 统计信息卡片 */}
        <Col xs={24} lg={8}>
          <Card title="今日统计" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">专注时间</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {Math.floor(statistics.todayFocusTime / 60)}小时{statistics.todayFocusTime % 60}分钟
                </div>
              </div>

              <div>
                <Text type="secondary">完成番茄钟</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {statistics.completedSessions}个
                </div>
              </div>

              <div>
                <Text type="secondary">中断次数</Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {statistics.interruptionCount}次
                </div>
              </div>
            </Space>
          </Card>

          <Card title="当前会话信息">
            {currentSession ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">任务ID</Text>
                  <div>{currentSession.taskId}</div>
                </div>

                <div>
                  <Text type="secondary">计划时长</Text>
                  <div>{currentSession.plannedDuration}分钟</div>
                </div>

                <div>
                  <Text type="secondary">已用时长</Text>
                  <div>{Math.floor((currentSession.plannedDuration * 60 - timeRemaining) / 60)}分钟</div>
                </div>

                <div>
                  <Text type="secondary">中断次数</Text>
                  <div>{currentSession.interruptionCount}次</div>
                </div>
              </Space>
            ) : (
              <Text type="secondary">暂无进行中的会话</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Timer