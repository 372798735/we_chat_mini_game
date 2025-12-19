import Request from './request';

// 统计数据接口
export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
}

export interface DailyStatistics {
  date: string;
  totalTasks: number;
  completedTasks: number;
  totalPomodoros: number;
  totalFocusTime: number; // 分钟
  averageFocusTime: number; // 分钟
  completionRate: number;
}

export interface CategoryStatistics {
  priority: string;
  total_count: number;
  completed_count: number;
}

export interface DashboardStatistics {
  averageCompletionRate: number;
  total: {
    total_pomodoros: number;
    total_focus_time: number; // 分钟
    total_tasks: number;
    completed_tasks: number;
    total_days: number;
    avg_completion_rate: number;
  };
  priorityDistribution: CategoryStatistics[];
  today: DailyStatistics;
  weekly: DailyStatistics[];
  monthly: DailyStatistics[];
  bestFocusHour: number | null;
  categoryDistribution: any[];
}

export const statisticsApi = {
  // 获取今日统计
  getTodayStatistics: () => {
    return Request.get<DailyStatistics>('/statistics/today');
  },

  // 获取本周统计
  getWeeklyStatistics: () => {
    return Request.get<DailyStatistics[]>('/statistics/weekly');
  },

  // 获取本月统计
  getMonthlyStatistics: () => {
    return Request.get<DailyStatistics[]>('/statistics/monthly');
  },

  // 获取年度统计
  getYearlyStatistics: () => {
    return Request.get<any[]>('/statistics/yearly');
  },

  // 获取总统计概览
  getTotalStatistics: () => {
    return Request.get<any>('/statistics/total');
  },

  // 获取分类分布统计
  getCategoryDistribution: () => {
    return Request.get<CategoryStatistics[]>('/statistics/category-distribution');
  },

  // 获取优先级分布统计
  getPriorityDistribution: () => {
    return Request.get<CategoryStatistics[]>('/statistics/priority-distribution');
  },

  // 获取最佳专注时段
  getBestFocusHour: () => {
    return Request.get<number>('/statistics/best-focus-hour');
  },

  // 获取平均完成率
  getAverageCompletionRate: () => {
    return Request.get<number>('/statistics/average-completion-rate');
  },

  // 获取仪表板统计数据
  getDashboardStatistics: () => {
    return Request.get<DashboardStatistics>('/statistics/dashboard');
  },

  // 获取日期范围统计
  getStatisticsByDateRange: (startDate: string, endDate: string) => {
    return Request.get<DailyStatistics[]>('/statistics/range', {
      params: { startDate, endDate }
    });
  },
};

export default statisticsApi;