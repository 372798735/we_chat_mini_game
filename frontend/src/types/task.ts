/**
 * 任务相关类型定义
 */

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export interface Task {
  id: number;
  userId?: number;
  categoryId?: number;
  title: string;
  description?: string;
  estimatedDuration: number; // 分钟
  actualDuration: number; // 分钟
  priority: TaskPriority | 'low' | 'medium' | 'high';
  status: TaskStatus | 'pending' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  dueDate?: string; // ISO 8601 格式
  reminderTime?: string; // ISO 8601 格式
  tags?: string[]; // 标签数组
  sortOrder?: number;
  parentTaskId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  completionRate?: number; // 0-100
  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
  completedAt?: string; // ISO 8601 格式
}

export interface TaskCreateRequest {
  title: string;
  description?: string;
  estimatedDuration: number;
  categoryId?: number;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  reminderTime?: string;
  tags?: string;
  sortOrder?: number;
  parentTaskId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  categoryId?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  reminderTime?: string;
  tags?: string;
  sortOrder?: number;
  parentTaskId?: number;
  isRecurring?: boolean;
  recurrenceRule?: string;
  completionRate?: number;
}

export interface TaskQueryRequest {
  pageNum?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: number;
  parentTaskId?: number;
  keyword?: string;
  todayOnly?: boolean;
  overdueOnly?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'sortOrder';
  sortDirection?: 'asc' | 'desc';
}

export interface TaskStatistics {
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  totalPaused: number;
  totalCancelled: number;
  totalTodayDue: number;
  totalOverdue: number;
}

export interface TaskResponse extends Task {}