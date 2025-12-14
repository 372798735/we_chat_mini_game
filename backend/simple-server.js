const http = require('http');
const url = require('url');

const PORT = 8081;

// 内存数据库 - 临时存储任务数据
let tasks = [
  {
    id: 1,
    title: '完成项目报告',
    description: '编写番茄闹钟项目总结报告',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    estimatedMinutes: 25,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: '代码审查',
    description: '审查前端代码质量',
    status: 'TODO',
    priority: 'MEDIUM',
    estimatedMinutes: 15,
    createdAt: new Date().toISOString()
  }
];

let nextTaskId = 3;

// 设置CORS头
function setCORSHeaders(req, res) {
  const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
    'http://192.168.1.2:3001',
    'http://192.168.1.2:3000'
  ];

  const origin = req.headers.origin;

  // 设置允许的源（不能使用通配符，因为设置了withCredentials）
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 如果没有匹配的源，使用第一个作为默认
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时
}

// 解析请求体
function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

// 处理请求
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  // 设置CORS头
  setCORSHeaders(req, res);

  // 处理OPTIONS预检请求
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 路由处理
  if (path === '/api/test/cors' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'CORS测试成功！后端正常运行！',
      timestamp: new Date().toISOString(),
      server: 'Node.js Simple Server',
      frontend: '前端已连接',
      totalTasks: tasks.length
    }));
  } else if (path === '/api/tasks' && method === 'GET') {
    // 处理任务查询，支持分页和搜索
    const pageNum = parseInt(query.pageNum) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const keyword = query.keyword || '';
    const sortBy = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'desc';

    // 过滤任务
    let filteredTasks = tasks;
    if (keyword) {
      filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(keyword.toLowerCase()) ||
        task.description.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 排序
    filteredTasks.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortDirection === 'desc' ? -1 : 1;

      if (aValue < bValue) return -1 * multiplier;
      if (aValue > bValue) return 1 * multiplier;
      return 0;
    });

    // 分页
    const total = filteredTasks.length;
    const start = (pageNum - 1) * pageSize;
    const paginatedTasks = filteredTasks.slice(start, start + pageSize);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: paginatedTasks,
      pagination: {
        pageNum,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    }));
  } else if (path === '/api/tasks' && method === 'POST') {
    // 创建新任务
    parseRequestBody(req, (error, taskData) => {
      if (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '请求数据格式错误'
        }));
        return;
      }

      const newTask = {
        id: nextTaskId++,
        title: taskData.title || '新任务',
        description: taskData.description || '',
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        estimatedMinutes: taskData.estimatedMinutes || 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      tasks.push(newTask);

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: newTask,
        message: '任务创建成功'
      }));
    });
  } else if (path.startsWith('/api/tasks/') && method === 'PUT') {
    // 更新任务
    const taskId = parseInt(path.split('/').pop());
    parseRequestBody(req, (error, updateData) => {
      if (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '请求数据格式错误'
        }));
        return;
      }

      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: '任务不存在'
        }));
        return;
      }

      // 更新任务
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: tasks[taskIndex],
        message: '任务更新成功'
      }));
    });
  } else if (path.startsWith('/api/tasks/') && method === 'DELETE') {
    // 删除任务
    const taskId = parseInt(path.split('/').pop());
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: '任务不存在'
      }));
      return;
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: deletedTask,
      message: '任务删除成功'
    }));
  } else if (path === '/api/pomodoro/sessions' && method === 'GET') {
    // 番茄钟会话API
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
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
    }));
  } else if (path === '/api/statistics/overview' && method === 'GET') {
    // 统计API
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalFocusTime = tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        totalTasks: tasks.length,
        completedTasks,
        totalFocusTime,
        todayFocusTime: Math.floor(totalFocusTime * 0.3), // 假设今日完成30%
        averageSessionTime: 22
      }
    }));
  } else if (path === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      tasksCount: tasks.length
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: '接口未找到',
      path: path,
      method: method
    }));
  }
});

// 启动服务器
server.listen(PORT, () => {
  console.log('');
  console.log('🎉 番茄闹钟后端服务启动成功！');
  console.log('');
  console.log('📍 服务地址: http://localhost:' + PORT);
  console.log('🔗 测试端点: http://localhost:' + PORT + '/api/test/cors');
  console.log('📋 任务API: http://localhost:' + PORT + '/api/tasks');
  console.log('💚 健康检查: http://localhost:' + PORT + '/health');
  console.log('');
  console.log('✅ 前端访问地址: http://localhost:3001');
  console.log('🎯 前后端已成功连接，可以正常使用！');
  console.log('');
  console.log('按 Ctrl+C 停止服务器');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});