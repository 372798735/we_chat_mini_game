import { Request } from './request';
import type { Task } from '../types/task';

// 任务相关API

export interface TaskQueryParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  priority?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  dueDateStart?: string;
  dueDateEnd?: string;
  categoryId?: number;
  tags?: string[];
  isRecurring?: boolean;
}

export interface TaskResponse {
  records: Task[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export const taskApi = {
  // 获取任务列表
  getTasks: (params: TaskQueryParams = {}) => {
    return Request.get<TaskResponse>('/tasks', { params });
  },

  // 获取任务详情
  getTask: (id: number) => {
    return Request.get<Task>(`/tasks/${id}`);
  },

  // 创建任务
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    return Request.post<Task>('/tasks', data);
  },

  // 更新任务
  updateTask: (id: number, data: Partial<Task>) => {
    return Request.put<Task>(`/tasks/${id}`, data);
  },

  // 删除任务
  deleteTask: (id: number) => {
    return Request.delete(`/tasks/${id}`);
  },

  // 批量删除任务
  batchDeleteTasks: (ids: number[]) => {
    return Request.delete('/tasks/batch', { data: { ids } });
  },

  // 更新任务状态
  updateTaskStatus: (id: number, status: Task['status']) => {
    return Request.patch(`/tasks/${id}/status`, { status });
  },

  // 批量更新任务状态
  batchUpdateTaskStatus: (ids: number[], status: Task['status']) => {
    return Request.patch('/tasks/batch/status', { ids, status });
  },

  // 获取今日任务
  getTodayTasks: () => {
    return Request.get<Task[]>('/tasks/today');
  },

  // 获取即将到期的任务
  getUpcomingTasks: (days: number = 3) => {
    return Request.get<Task[]>(`/tasks/upcoming?days=${days}`);
  },

  // 获取任务统计
  getTaskStatistics: () => {
    return Request.get('/tasks/statistics');
  },

  // 搜索任务
  searchTasks: (keyword: string, limit: number = 10) => {
    return Request.get<Task[]>('/tasks/search', {
      params: { keyword, limit }
    });
  },
};

// 导出类型
export type { Task as TaskType };