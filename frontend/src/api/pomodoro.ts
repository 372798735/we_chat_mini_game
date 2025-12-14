import { Request } from './request';

// 番茄钟会话接口
export interface PomodoroSession {
  id: number;
  taskId: number;
  taskTitle?: string;
  type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
  plannedDuration: number;
  actualDuration?: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  interruptionCount: number;
  notes?: string;
  userId: number;
}

// 番茄钟统计接口
export interface PomodoroStatistics {
  todayFocusTime: number; // 今日专注时间（分钟）
  completedSessions: number; // 完成的番茄钟数量
  totalSessions: number; // 总番茄钟数量
  interruptionCount: number; // 中断次数
  currentStreak: number; // 连续天数
  weeklySessions: Array<{
    date: string;
    completedSessions: number;
    totalFocusTime: number;
  }>;
  dailyAverage: number; // 日均专注时间
  completionRate: number; // 完成率
}

// 番茄钟设置接口
export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  notificationEnabled: boolean;
  soundEnabled: boolean;
}

export const pomodoroApi = {
  // 获取今日番茄钟统计
  getTodayStatistics: () => {
    return Request.get<PomodoroStatistics>('/pomodoro/statistics/today');
  },

  // 获取本周统计数据
  getWeeklyStatistics: () => {
    return Request.get<PomodoroStatistics>('/pomodoro/statistics/weekly');
  },

  // 获取今日会话记录
  getTodaySessions: () => {
    return Request.get<PomodoroSession[]>('/pomodoro/today');
  },

  // 开始番茄钟会话
  startSession: (data: {
    taskId: number;
    type: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
    plannedDuration: number;
    notes?: string;
  }) => {
    return Request.post<PomodoroSession>('/pomodoro/start', data);
  },

  // 完成番茄钟会话
  completeSession: (sessionId: number, data: {
    actualDuration: number;
    notes?: string;
  }) => {
    return Request.patch(`/pomodoro/${sessionId}/stop`, data);
  },

  // 停止番茄钟会话
  stopSession: (sessionId: number, data: {
    actualDuration: number;
    reason?: string;
  }) => {
    return Request.patch(`/pomodoro/${sessionId}/stop`, data);
  },

  // 暂停番茄钟会话（暂时不实现）
  pauseSession: (sessionId: number) => {
    return Promise.reject(new Error('暂停功能暂未实现'));
  },

  // 继续番茄钟会话（暂时不实现）
  resumeSession: (sessionId: number) => {
    return Promise.reject(new Error('继续功能暂未实现'));
  },

  // 记录中断（暂时不实现）
  recordInterruption: (sessionId: number, reason?: string) => {
    return Promise.reject(new Error('中断记录功能暂未实现'));
  },

  // 获取番茄钟设置
  getSettings: () => {
    return Request.get<PomodoroSettings>('/pomodoro/settings');
  },

  // 更新番茄钟设置
  updateSettings: (settings: Partial<PomodoroSettings>) => {
    return Request.put('/pomodoro/settings', settings);
  },

  // 获取历史会话记录
  getSessionHistory: (params: {
    pageNum?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    taskId?: number;
    type?: string;
  } = {}) => {
    return Request.get<{
      records: PomodoroSession[];
      total: number;
      current: number;
      pages: number;
    }>('/pomodoro/sessions/history', { params });
  },
};