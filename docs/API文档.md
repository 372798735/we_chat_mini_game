# 番茄闹钟待办清单 - API 文档

## 概述

番茄闹钟待办清单 RESTful API 提供完整的任务管理、番茄钟计时、统计分析等功能。

**基础URL**: `http://localhost:8080/api`

**认证方式**: Header `X-User-Id: <用户ID>`

**响应格式**: JSON

**版本**: v1.0.0

---

## 目录

- [通用响应格式](#通用响应格式)
- [任务管理 API](#任务管理-api)
- [番茄钟 API](#番茄钟-api)
- [统计数据 API](#统计数据-api)
- [任务总结 API](#任务总结-api)
- [错误码说明](#错误码说明)

---

## 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 常见HTTP状态码

- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 任务管理 API

### 1. 创建任务

**POST** `/tasks`

**请求体**:
```json
{
  "title": "任务标题",
  "description": "任务描述（可选）",
  "estimatedDuration": 30,
  "categoryId": 1,
  "priority": "MEDIUM",
  "status": "PENDING",
  "dueDate": "2024-01-15T10:00:00",
  "reminderTime": "2024-01-15T09:00:00",
  "tags": "工作,重要",
  "sortOrder": 1,
  "parentTaskId": null,
  "isRecurring": false,
  "recurrenceRule": null
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1,
    "title": "任务标题",
    "description": "任务描述",
    "estimatedDuration": 30,
    "actualDuration": 0,
    "priority": "MEDIUM",
    "status": "PENDING",
    "dueDate": "2024-01-15T10:00:00",
    "reminderTime": "2024-01-15T09:00:00",
    "tags": "工作,重要",
    "sortOrder": 1,
    "parentTaskId": null,
    "isRecurring": false,
    "recurrenceRule": null,
    "completionRate": 0.0,
    "createdAt": "2024-01-14T08:00:00",
    "updatedAt": "2024-01-14T08:00:00",
    "completedAt": null
  }
}
```

### 2. 更新任务

**PUT** `/tasks/{taskId}`

**请求体**:
```json
{
  "title": "更新后的标题",
  "status": "IN_PROGRESS",
  "actualDuration": 15
}
```

### 3. 删除任务

**DELETE** `/tasks/{taskId}`

### 4. 获取任务详情

**GET** `/tasks/{taskId}`

### 5. 获取任务列表

**GET** `/tasks`

**查询参数**:
- `pageNum`: 页码（默认1）
- `pageSize`: 每页大小（默认20）
- `status`: 任务状态筛选
- `priority`: 优先级筛选
- `categoryId`: 分类筛选
- `keyword`: 搜索关键词
- `sortBy`: 排序字段
- `sortDirection`: 排序方向（asc/desc）

### 6. 按状态查询任务

**GET** `/tasks/status/{status}`

**路径参数**:
- `status`: 任务状态（PENDING, IN_PROGRESS, COMPLETED, PAUSED, CANCELLED）

### 7. 搜索任务

**GET** `/tasks/search`

**查询参数**:
- `keyword`: 搜索关键词

### 8. 获取今日任务

**GET** `/tasks/today-due`

### 9. 获取逾期任务

**GET** `/tasks/overdue`

### 10. 获取任务统计

**GET** `/tasks/statistics`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPending": 5,
    "totalInProgress": 2,
    "totalCompleted": 10,
    "totalPaused": 1,
    "totalCancelled": 0,
    "totalTodayDue": 3,
    "totalOverdue": 1
  }
}
```

---

## 番茄钟 API

### 1. 开始番茄钟

**POST** `/pomodoro/start`

**请求体**:
```json
{
  "taskId": 1,
  "type": "WORK",
  "plannedDuration": 25,
  "startedAt": "2024-01-14T10:00:00",
  "notes": "开始专注工作"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "taskId": 1,
    "userId": 1,
    "type": "WORK",
    "plannedDuration": 25,
    "actualDuration": 0,
    "startedAt": "2024-01-14T10:00:00",
    "endedAt": null,
    "isCompleted": false,
    "interruptionCount": 0,
    "notes": "开始专注工作",
    "createdAt": "2024-01-14T10:00:00"
  }
}
```

### 2. 停止番茄钟

**POST** `/pomodoro/{pomodoroId}/stop`

**请求体**:
```json
{
  "interruptionCount": 2,
  "isCompleted": true,
  "notes": "任务完成"
}
```

### 3. 获取当前活跃番茄钟

**GET** `/pomodoro/active`

### 4. 获取番茄钟记录

**GET** `/pomodoro`

**查询参数**:
- `pageNum`: 页码
- `pageSize`: 每页大小

### 5. 获取任务番茄钟记录

**GET** `/pomodoro/task/{taskId}`

### 6. 获取今日番茄钟

**GET** `/pomodoro/today`

### 7. 获取最近番茄钟记录

**GET** `/pomodoro/recent`

**查询参数**:
- `limit`: 记录数量（默认10）

### 8. 获取指定日期范围番茄钟

**GET** `/pomodoro/range`

**查询参数**:
- `startDate`: 开始日期（yyyy-MM-dd HH:mm:ss）
- `endDate`: 结束日期（yyyy-MM-dd HH:mm:ss）

### 9. 获取今日番茄钟统计

**GET** `/pomodoro/statistics/today`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPomodoros": 8,
    "totalWork": 6,
    "totalShortBreak": 2,
    "totalLongBreak": 0,
    "totalFocusMinutes": 150
  }
}
```

---

## 统计数据 API

### 1. 获取今日统计

**GET** `/statistics/today`

### 2. 获取最近7天统计

**GET** `/statistics/last-7-days`

### 3. 获取最近30天统计

**GET** `/statistics/last-30-days`

### 4. 获取本周统计

**GET** `/statistics/weekly`

### 5. 获取本月统计

**GET** `/statistics/monthly`

### 6. 获取年度统计

**GET** `/statistics/yearly`

### 7. 获取总统计概览

**GET** `/statistics/total`

### 8. 获取分类分布统计

**GET** `/statistics/category-distribution`

### 9. 获取优先级分布统计

**GET** `/statistics/priority-distribution`

### 10. 获取仪表板统计

**GET** `/statistics/dashboard`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "today": { ... },
    "weekly": [ ... ],
    "monthly": [ ... ],
    "total": { ... },
    "categoryDistribution": [ ... ],
    "priorityDistribution": [ ... ],
    "bestFocusHour": 14,
    "averageCompletionRate": 75.5
  }
}
```

### 11. 计算统计数据

**POST** `/statistics/calculate/{date}`

**路径参数**:
- `date`: 日期（yyyy-MM-dd）

### 12. 批量计算历史统计

**POST** `/statistics/calculate-history`

**查询参数**:
- `startDate`: 开始日期
- `endDate`: 结束日期

---

## 任务总结 API

### 1. 创建任务总结

**POST** `/task-summaries`

**请求体**:
```json
{
  "taskId": 1,
  "rating": "EXCELLENT",
  "summary": "任务完成得很好，学到了很多新知识",
  "tags": "学习,成长",
  "mood": "VERY_HAPPY",
  "difficulty": "MEDIUM",
  "focusLevel": "VERY_FOCUSED"
}
```

### 2. 更新任务总结

**PUT** `/task-summaries/{summaryId}`

### 3. 删除任务总结

**DELETE** `/task-summaries/{summaryId}`

### 4. 获取任务总结

**GET** `/task-summaries/{summaryId}`

### 5. 获取任务总结列表

**GET** `/task-summaries`

**查询参数**:
- `pageNum`: 页码
- `pageSize`: 每页大小
- `rating`: 评价筛选
- `mood`: 心情筛选
- `taskId`: 任务ID筛选

### 6. 获取任务总结统计

**GET** `/task-summaries/statistics`

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalCount": 25,
    "averageRating": 4.2,
    "ratingDistribution": [
      { "rating": "EXCELLENT", "count": 10, "percentage": 40.0 },
      { "rating": "GOOD", "count": 12, "percentage": 48.0 }
    ],
    "moodDistribution": [ ... ],
    "difficultyDistribution": [ ... ],
    "focusLevelDistribution": [ ... ],
    "tagDistribution": [ ... ]
  }
}
```

---

## 枚举值说明

### 任务优先级 (Priority)

- `LOW` - 低优先级
- `MEDIUM` - 中优先级
- `HIGH` - 高优先级

### 任务状态 (TaskStatus)

- `PENDING` - 待处理
- `IN_PROGRESS` - 进行中
- `COMPLETED` - 已完成
- `PAUSED` - 已暂停
- `CANCELLED` - 已取消

### 番茄钟类型 (PomodoroType)

- `WORK` - 工作时间
- `SHORT_BREAK` - 短休息
- `LONG_BREAK` - 长休息

### 总结评价 (Rating)

- `EXCELLENT` - 优秀
- `GOOD` - 良好
- `AVERAGE` - 一般
- `POOR` - 较差

### 心情 (Mood)

- `VERY_HAPPY` - 非常愉快
- `HAPPY` - 愉快
- `NEUTRAL` - 一般
- `UNHAPPY` - 不愉快
- `VERY_UNHAPPY` - 很不愉快

### 难度感受 (Difficulty)

- `VERY_EASY` - 很容易
- `EASY` - 容易
- `MEDIUM` - 适中
- `HARD` - 困难
- `VERY_HARD` - 很困难

### 专注度 (FocusLevel)

- `VERY_FOCUSED` - 非常专注
- `FOCUSED` - 专注
- `NORMAL` - 一般
- `DISTRACTED` - 容易分心
- `VERY_DISTRACTED` - 很分心

---

## 错误码说明

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| 1001 | 400 | 请求参数错误 |
| 1002 | 400 | 必填参数缺失 |
| 1003 | 400 | 参数格式错误 |
| 2001 | 401 | 用户未认证 |
| 2002 | 403 | 权限不足 |
| 3001 | 404 | 资源不存在 |
| 3002 | 404 | 任务不存在 |
| 3003 | 404 | 番茄钟记录不存在 |
| 4001 | 409 | 资源冲突 |
| 4002 | 409 | 任务已存在 |
| 5001 | 500 | 服务器内部错误 |
| 5002 | 500 | 数据库操作失败 |
| 5003 | 500 | 第三方服务错误 |

---

## 使用示例

### JavaScript/TypeScript

```javascript
// 创建任务
const createTask = async (taskData) => {
  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '1'
    },
    body: JSON.stringify(taskData)
  });

  const result = await response.json();
  return result.data;
};

// 开始番茄钟
const startPomodoro = async (pomodoroData) => {
  const response = await fetch('http://localhost:8080/api/pomodoro/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': '1'
    },
    body: JSON.stringify(pomodoroData)
  });

  const result = await response.json();
  return result.data;
};
```

### cURL

```bash
# 创建任务
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "title": "学习React",
    "estimatedDuration": 60,
    "priority": "HIGH"
  }'

# 获取任务列表
curl -X GET "http://localhost:8080/api/tasks?pageNum=1&pageSize=10" \
  -H "X-User-Id: 1"

# 开始番茄钟
curl -X POST http://localhost:8080/api/pomodoro/start \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{
    "taskId": 1,
    "type": "WORK",
    "plannedDuration": 25
  }'
```

---

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 完整的任务管理功能
- 番茄钟计时功能
- 统计分析功能
- 任务总结功能

---

## 技术支持

- **项目仓库**: [GitHub链接]
- **问题反馈**: [Issues页面]
- **邮箱**: support@tomatotodo.com
- **API文档更新**: 每次版本发布时同步更新

---

*最后更新: 2024-01-15*