/**
 * 字典相关类型定义
 */

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagCreateRequest {
  name: string;
  color?: string;
}

export interface TagUpdateRequest {
  name?: string;
  color?: string;
}

export interface DictionaryType {
  id: number;
  type: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryItem {
  id: number;
  dictTypeId: number;
  key: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}