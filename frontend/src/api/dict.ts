import Request from './request';
import type { Tag, TagCreateRequest, TagUpdateRequest } from '../types/dict';

// 标签API
export const dictApi = {
  // 获取所有标签
  getTags: () => {
    return Request.get<Tag[]>('/dict/tags');
  },

  // 创建标签
  createTag: (data: TagCreateRequest) => {
    return Request.post<Tag>('/dict/tags', data);
  },

  // 更新标签
  updateTag: (id: number, data: TagUpdateRequest) => {
    return Request.put<Tag>(`/dict/tags/${id}`, data);
  },

  // 删除标签
  deleteTag: (id: number) => {
    return Request.delete(`/dict/tags/${id}`);
  },
};

export default dictApi;