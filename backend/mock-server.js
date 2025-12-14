const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true
}));
app.use(express.json());

// 测试端点
app.get('/api/test/cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS测试成功！',
    timestamp: new Date().toISOString(),
    server: 'Node.js Mock Server'
  });
});

// 任务相关API
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: '完成项目报告',
        description: '编写番茄闹钟项目总结报告',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        estimatedMinutes: 25,
        createdAt: '2025-12-10T04:50:00.000Z'
      },
      {
        id: 2,
        title: '代码审查',
        description: '审查前端代码质量',
        status: 'TODO',
        priority: 'MEDIUM',
        estimatedMinutes: 15,
        createdAt: '2025-12-10T04:50:00.000Z'
      }
    ],
    total: 2
  });
});

app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  res.json({
    success: true,
    data: newTask,
    message: '任务创建成功'
  });
});

// 番茄钟API
app.get('/api/pomodoro/sessions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        taskId: 1,
        startTime: '2025-12-10T04:00:00.000Z',
        endTime: '2025-12-10T04:25:00.000Z',
        duration: 25,
        status: 'COMPLETED',
        type: 'FOCUS'
      }
    ]
  });
});

// 统计API
app.get('/api/statistics/overview', (req, res) => {
  res.json({
    success: true,
    data: {
      totalTasks: 10,
      completedTasks: 7,
      totalFocusTime: 175, // 分钟
      todayFocusTime: 45,
      averageSessionTime: 22
    }
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Mock后端服务器已启动！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔗 CORS测试: http://localhost:${PORT}/api/test/cors`);
  console.log(`📋 任务API: http://localhost:${PORT}/api/tasks`);
  console.log(`🍅 番茄钟API: http://localhost:${PORT}/api/pomodoro/sessions`);
  console.log(`📊 统计API: http://localhost:${PORT}/api/statistics/overview`);
  console.log(`\n✅ 服务器运行中，按 Ctrl+C 停止`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  process.exit(0);
});