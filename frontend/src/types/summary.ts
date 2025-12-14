/**
 * 任务总结相关类型定义
 */

export enum TaskSummaryRating {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  POOR = 'POOR',
}

export enum TaskSummaryMood {
  VERY_HAPPY = 'VERY_HAPPY',
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  UNHAPPY = 'UNHAPPY',
  VERY_UNHAPPY = 'VERY_UNHAPPY',
}

export enum TaskSummaryDifficulty {
  VERY_EASY = 'VERY_EASY',
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
}

export enum TaskSummaryFocusLevel {
  VERY_FOCUSED = 'VERY_FOCUSED',
  FOCUSED = 'FOCUSED',
  NORMAL = 'NORMAL',
  DISTRACTED = 'DISTRACTED',
  VERY_DISTRACTED = 'VERY_DISTRACTED',
}

export interface TaskSummary {
  id: number;
  taskId: number;
  userId: number;
  rating: TaskSummaryRating;
  summary: string;
  tags?: string;
  mood: TaskSummaryMood;
  difficulty: TaskSummaryDifficulty;
  focusLevel: TaskSummaryFocusLevel;
  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
}

export interface TaskSummaryCreateRequest {
  taskId: number;
  rating: TaskSummaryRating;
  summary: string;
  tags?: string;
  mood: TaskSummaryMood;
  difficulty: TaskSummaryDifficulty;
  focusLevel: TaskSummaryFocusLevel;
}

export interface TaskSummaryUpdateRequest {
  rating?: TaskSummaryRating;
  summary?: string;
  tags?: string;
  mood?: TaskSummaryMood;
  difficulty?: TaskSummaryDifficulty;
  focusLevel?: TaskSummaryFocusLevel;
}

export interface TaskSummaryQueryRequest {
  pageNum?: number;
  pageSize?: number;
  rating?: TaskSummaryRating;
  mood?: TaskSummaryMood;
  difficulty?: TaskSummaryDifficulty;
  focusLevel?: TaskSummaryFocusLevel;
  taskId?: number;
  startDate?: string; // ISO 8601 格式
  endDate?: string; // ISO 8601 格式
  tags?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating';
  sortDirection?: 'asc' | 'desc';
}

export interface TaskSummaryResponse extends TaskSummary {}

export interface TaskSummaryStatistics {
  totalCount: number;
  averageRating: number;
  ratingDistribution: Array<{
    rating: TaskSummaryRating;
    count: number;
    percentage: number;
  }>;
  moodDistribution: Array<{
    mood: TaskSummaryMood;
    count: number;
    percentage: number;
  }>;
  difficultyDistribution: Array<{
    difficulty: TaskSummaryDifficulty;
    count: number;
    percentage: number;
  }>;
  focusLevelDistribution: Array<{
    focusLevel: TaskSummaryFocusLevel;
    count: number;
    percentage: number;
  }>;
  tagDistribution: Array<{
    tag: string;
    count: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    avgRating: number;
  }>;
}

export interface TaskSummaryWithTask extends TaskSummary {
  task: {
    id: number;
    title: string;
    description?: string;
  };
}