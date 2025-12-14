#!/bin/bash

echo "========================================"
echo "番茄闹钟待办清单 - 开发环境设置"
echo "========================================"
echo

# 检查 Node.js
echo "[1/5] 检查 Node.js 版本..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js 版本: $node_version"

    # 检查版本是否满足要求
    node_major=$(node --version | cut -d' ' -f2 | cut -d'.' -f1)
    if [ "$node_major" -lt 16 ]; then
        echo "❌ 错误: Node.js 版本过低，需要 16+ 版本"
        echo "请升级 Node.js: https://nodejs.org/"
        exit 1
    fi
else
    echo "❌ 错误: 未找到 Node.js"
    echo "请安装 Node.js 16+ 版本: https://nodejs.org/"
    exit 1
fi

echo

# 检查 Java
echo "[2/5] 检查 Java 版本..."
if command -v java &> /dev/null; then
    java_version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
    echo "✅ Java 版本: $java_version"

    # 检查版本是否满足要求
    java_major=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$java_major" -lt 17 ]; then
        echo "❌ 错误: Java 版本过低，需要 17+ 版本"
        echo "请升级 Java: https://adoptium.net/"
        exit 1
    fi
else
    echo "❌ 错误: 未找到 Java"
    echo "请安装 Java 17+ 版本: https://adoptium.net/"
    exit 1
fi

echo

# 检查 Maven
echo "[3/5] 检查 Maven 版本..."
if command -v mvn &> /dev/null; then
    maven_version=$(mvn -version | head -n 1 | awk -F ' ' '{print $3}')
    echo "✅ Maven 版本: $maven_version"

    # 检查版本是否满足要求
    maven_major=$(echo $maven_version | cut -d'.' -f1)
    if [ "$maven_major" -lt 3 ]; then
        echo "❌ 错误: Maven 版本过低，需要 3.8+ 版本"
        echo "请升级 Maven: https://maven.apache.org/"
        exit 1
    fi
else
    echo "❌ 错误: 未找到 Maven"
    echo "请安装 Maven 3.8+ 版本: https://maven.apache.org/"
    exit 1
fi

echo

# 创建开发数据库
echo "[4/5] 创建开发数据库..."
echo "请确保 MySQL 服务正在运行"
echo

# 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tomato_todo_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
if [ $? -neq 0 ]; then
    echo "❌ 错误: 数据库创建失败，请检查 MySQL 配置"
    echo "确保 MySQL 服务已启动，并且 root 用户有足够权限"
    exit 1
fi

# 创建用户并授权
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'tomato_todo'@'localhost' IDENTIFIED BY 'password';" 2>/dev/null
mysql -u root -p -e "GRANT ALL PRIVILEGES ON tomato_todo_dev.* TO 'tomato_todo'@'localhost';" 2>/dev/null
mysql -u root -p -e "FLUSH PRIVILEGES;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库配置完成"
else
    echo "❌ 数据库配置失败"
    exit 1
fi

echo

# 安装项目依赖
echo "[5/5] 安装项目依赖..."
echo

# 安装前端依赖
echo "安装前端依赖..."
cd "$(dirname "$0")/../frontend"
npm install
if [ $? -neq 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 安装后端依赖
echo
echo "安装后端依赖..."
cd "$(dirname "$0")/../backend"
mvn clean install -DskipTests
if [ $? -neq 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

echo
echo "========================================"
echo "✅ 开发环境配置完成！"
echo "========================================"
echo
echo "🎉 下一步操作："
echo "1. 启动后端服务:"
echo "   cd backend && mvn spring-boot:run"
echo ""
echo "2. 启动前端开发服务器:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. 访问应用: http://localhost:5173"
echo "4. API文档: http://localhost:8080/api/swagger-ui.html"
echo

read -p "按回车键继续..."