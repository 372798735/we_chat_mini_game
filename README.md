# 🍅 番茄闹钟待办清单

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java Version](https://img.shields.io/badge/Java-17+-green.svg)](https://openjdk.java.net/)
[![Node.js Version](https://img.shields.io/badge/Node.js-16+-blue.svg)](https://nodejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Electron](https://img.shields.io/badge/Electron-25+-9cf.svg)](https://electronjs.org/)

一款结合番茄工作法的现代化任务管理工具，帮助您高效管理时间、提升工作效率。

## ✨ 特性

- 📋 **强大的任务管理**
  - 创建、编辑、删除任务
  - 多维度筛选和搜索
  - 任务优先级和状态管理
  - 分类和标签系统

- ⏰ **科学的时间管理**
  - 番茄钟计时器
  - 自定义工作和休息时长
  - 专注模式和无干扰模式
  - 智能提醒和通知

- 📊 **详细的数据分析**
  - 任务完成情况统计
  - 专注时长分析
  - 个人效率报告
  - 成长轨迹记录

- 💭 **智能总结系统**
  - 任务完成度评价
  - 心情和专注度记录
  - 难度感受评估
  - 个人成长笔记

- 🎨 **优雅的用户体验**
  - 现代化的界面设计
  - 响应式布局
  - 深色模式支持
  - 快捷键操作

## 🚀 快速开始

### 环境要求

- **Java**: 17+
- **Node.js**: 16+
- **Maven**: 3.8+
- **MySQL**: 8.0+

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/your-username/tomato-todo-app.git
cd tomato-todo-app
```

#### 2. 配置数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 创建用户
mysql -u root -p -e "CREATE USER 'tomato_todo'@'localhost' IDENTIFIED BY 'password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON tomato_todo_dev.* TO 'tomato_todo'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

#### 3. 数据库初始化

```bash
# 如果遇到Flyway迁移问题，请执行以下命令：
cd backend
mysql -u root -proot -e "DROP DATABASE IF EXISTS tomato_todo_dev; CREATE DATABASE tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -proot tomato_todo_dev < src/main/resources/db/migration/V1__Create_initial_tables.sql
```

#### 4. 启动服务

**方法一：使用批处理脚本（推荐）**

```bash
# Windows - 启动后端
cd backend
compile-and-start.bat

# 新终端 - 启动前端
cd frontend
npm run dev
```

**方法二：使用Maven**

```bash
# 启动后端
cd backend
mvn spring-boot:run -Dspring.flyway.enabled=false

# 新终端 - 启动前端
cd frontend
npm run dev
```

#### 5. 访问应用

- 前端界面: <http://localhost:5173>
- API文档: <http://localhost:8080/api/swagger-ui.html>
- 健康检查: <http://localhost:8080/api/health>

## 📖 文档

- [📚 用户手册](docs/用户手册.md)
- [🔧 API文档](docs/API文档.md)
- [🏗️ 开发步骤](docs/01-开发实施步骤.md)
- [📋 技术方案](docs/技术方案.md)
- [🗄️ 数据库设计](docs/数据库设计.md)

## 🛠️ 开发

### 项目结构

```
tomato-todo-app/
├── backend/              # Spring Boot 后端
│   ├── src/main/java/    # Java 源代码
│   ├── src/main/resources/ # 配置文件
│   └── src/test/         # 测试代码
├── frontend/             # React + Electron 前端
│   ├── src/             # 源代码
│   ├── public/          # Electron 主进程
│   └── dist/            # 构建输出
├── build/               # 构建脚本
├── docs/                # 项目文档
└── deployment/          # 部署配置
```

### 技术栈

#### 后端

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **ORM**: MyBatis Plus
- **安全**: Spring Security + JWT
- **缓存**: Caffeine
- **API文档**: SpringDoc OpenAPI

#### 前端

- **框架**: React 18 + TypeScript
- **桌面应用**: Electron 25+
- **状态管理**: Redux Toolkit
- **UI组件**: Ant Design 5
- **图表**: ECharts
- **构建工具**: Vite

### 开发命令

#### 后端

```bash
# 编译
mvn clean compile

# 测试
mvn test

# 打包
mvn clean package

# 运行
mvn spring-boot:run
```

#### 前端

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

## 🚀 部署

### 构建项目

```bash
# 完整构建
./build/scripts/build.sh

# 构建并跳过清理
./build/scripts/build.sh --no-clean
```

### 部署到服务器

#### Linux/Mac

```bash
# 部署
sudo ./build/scripts/deploy.sh

# 部署并跳过备份
sudo ./build/scripts/deploy.sh --no-backup
```

#### Windows

```cmd
# 部署
.\build\scripts\deploy.bat

# 以管理员身份运行
```

### Docker部署（可选）

```bash
# 构建镜像
docker build -t tomato-todo .

# 运行容器
docker run -d -p 8080:8080 -p 5173:5173 tomato-todo
```

## 🧪 测试

### 运行测试

```bash
# 后端单元测试
mvn test

# 前端单元测试
npm run test

# 集成测试
mvn verify

# 端到端测试
npm run test:e2e
```

### 测试覆盖率

```bash
# 后端测试覆盖率
mvn jacoco:report

# 前端测试覆盖率
npm run test:coverage
```

## 📊 性能

### 性能优化

- **前端**: 代码分割、懒加载、资源压缩
- **后端**: 数据库连接池、缓存策略、异步处理
- **数据库**: 索引优化、查询优化

### 性能监控

- **APM**: 集成性能监控
- **日志**: 结构化日志记录
- **指标**: Prometheus 指标收集

## 🔒 安全

### 安全特性

- JWT 认证
- 数据加密存储
- CORS 配置
- SQL 注入防护
- XSS 防护
- CSRF 防护

## 🤝 贡献

我们欢迎各种形式的贡献！请查看 [贡献指南](CONTRIBUTING.md)。

### 贡献步骤

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🌟 致谢

感谢以下开源项目：

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)
- [Electron](https://electronjs.org/)
- [Ant Design](https://ant.design/)
- [ECharts](https://echarts.apache.org/)
- [MyBatis Plus](https://baomidou.com/)

## 📞 联系我们

- **项目主页**: [https://github.com/your-username/tomato-todo-app](https://github.com/your-username/tomato-todo-app)
- **问题反馈**: [Issues](https://github.com/your-username/tomato-todo-app/issues)
- **功能建议**: [Discussions](https://github.com/your-username/tomato-todo-app/discussions)
- **邮箱**: <support@tomatotodo.com>

---

<div align="center">
  <p>⭐ 如果这个项目对您有帮助，请给我们一个 Star！</p>
  <p>🚀 让我们一起变得更高产！</p>
</div>
```

## 技术栈

### 前端

- **框架**: Electron 25+
- **UI框架**: React 18 + TypeScript
- **状态管理**: Redux Toolkit
- **UI组件库**: Ant Design 5
- **图表库**: ECharts
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

### 后端

- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **ORM**: MyBatis Plus
- **安全**: Spring Security + JWT
- **API文档**: SpringDoc OpenAPI
- **缓存**: Caffeine
- **数据迁移**: Flyway

## 开发环境要求

### 系统要求

- Node.js 16+
- Java 17+
- MySQL 8.0+
- Maven 3.8+

### 开发工具

- Visual Studio Code
- IntelliJ IDEA 或 Eclipse
- Git

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd tomato-todo-app
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 配置数据库

```sql
# 创建数据库
CREATE DATABASE tomato_todo_dev;

# 创建用户（可选）
CREATE USER 'tomato_todo'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON tomato_todo_dev.* TO 'tomato_todo'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

### 5. 启动前端开发服务器

```bash
cd frontend
npm run dev
```

## 开发脚本

### 前端脚本

```bash
npm run dev          # 开发模式启动
npm run build        # 构建生产版本
npm run build:electron # 构建Electron应用
npm run lint         # 代码检查
npm run lint:fix     # 自动修复代码格式
```

### 后端脚本

```bash
mvn clean            # 清理构建文件
mvn compile          # 编译项目
mvn spring-boot:run  # 启动应用
mvn test              # 运行测试
mvn package          # 打包应用
```

## 项目功能

### 核心功能

- ✅ 任务管理（增删改查）
- ✅ 番茄钟计时器
- ✅ 任务分类和优先级
- ✅ 数据统计分析
- ✅ 任务完成总结

### 系统功能

- ✅ 用户认证和授权
- ✅ 数据自动备份
- ✅ 系统托盘支持
- ✅ 全局快捷键
- ✅ 桌面通知

## 部署说明

### 开发环境

1. 前端运行在 <http://localhost:5173>
2. 后端API运行在 <http://localhost:8080/api>
3. API文档访问 <http://localhost:8080/api/swagger-ui.html>

### 生产环境

1. 执行前端构建：`npm run build:electron`
2. 执行后端打包：`mvn clean package`
3. 生成的安装包在 `frontend/dist-electron` 目录

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页：[GitHub Repository]
- 问题反馈：[Issues]
- 邮箱：<team@tomatotodo.com>
