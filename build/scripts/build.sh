#!/bin/bash

echo "=========================================="
echo "番茄闹钟待办清单 - 项目构建脚本"
echo "=========================================="

# 设置变量
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/../frontend"
BACKEND_DIR="$PROJECT_ROOT/../backend"
BUILD_DIR="$PROJECT_ROOT/dist"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查构建依赖..."

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi

    # 检查 Java
    if ! command -v java &> /dev/null; then
        log_error "Java 未安装，请先安装 Java"
        exit 1
    fi

    # 检查 Maven
    if ! command -v mvn &> /dev/null; then
        log_error "Maven 未安装，请先安装 Maven"
        exit 1
    fi

    log_success "所有依赖检查通过"
}

# 清理构建目录
clean_build() {
    log_info "清理构建目录..."

    # 清理前端构建
    if [ -d "$FRONTEND_DIR/dist" ]; then
        rm -rf "$FRONTEND_DIR/dist"
        log_info "已清理前端构建目录"
    fi

    # 清理后端构建
    if [ -d "$BACKEND_DIR/target" ]; then
        rm -rf "$BACKEND_DIR/target"
        log_info "已清理后端构建目录"
    fi

    # 清理最终输出目录
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "已清理输出构建目录"
    fi

    log_success "构建目录清理完成"
}

# 构建前端
build_frontend() {
    log_info "开始构建前端应用..."

    cd "$FRONTEND_DIR"

    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
        log_info "安装前端依赖..."
        npm install
        if [ $? -neq 0 ]; then
            log_error "前端依赖安装失败"
            exit 1
        fi
    fi

    # 运行类型检查
    log_info "运行 TypeScript 类型检查..."
    npm run type-check
    if [ $? -neq 0 ]; then
        log_warning "TypeScript 类型检查有警告，继续构建..."
    fi

    # 运行代码检查
    log_info "运行代码质量检查..."
    npm run lint
    if [ $? -neq 0 ]; then
        log_warning "代码质量检查有警告，继续构建..."
    fi

    # 构建生产版本
    log_info "构建前端生产版本..."
    npm run build
    if [ $? -neq 0 ]; then
        log_error "前端构建失败"
        exit 1
    fi

    log_success "前端构建完成"
}

# 构建后端
build_backend() {
    log_info "开始构建后端应用..."

    cd "$BACKEND_DIR"

    # 运行测试
    log_info "运行后端测试..."
    mvn test
    if [ $? -neq 0 ]; then
        log_warning "测试未完全通过，继续构建..."
    fi

    # 构建应用
    log_info "构建后端 JAR 包..."
    mvn clean package -DskipTests
    if [ $? -neq 0 ]; then
        log_error "后端构建失败"
        exit 1
    fi

    log_success "后端构建完成"
}

# 创建最终发布包
create_release() {
    log_info "创建发布包..."

    # 创建构建目录
    mkdir -p "$BUILD_DIR"

    # 复制前端构建文件
    log_info "复制前端文件..."
    cp -r "$FRONTEND_DIR/dist" "$BUILD_DIR/frontend"

    # 复制后端 JAR 文件
    log_info "复制后端文件..."
    mkdir -p "$BUILD_DIR/backend/lib"
    cp "$BACKEND_DIR/target"/*.jar "$BUILD_DIR/backend/"

    # 复制配置文件
    log_info "复制配置文件..."
    cp "$BACKEND_DIR/src/main/resources/application.yml" "$BUILD_DIR/backend/"
    cp "$BACKEND_DIR/src/main/resources/application-prod.yml" "$BUILD_DIR/backend/" 2>/dev/null || true

    # 复制数据库脚本
    log_info "复制数据库脚本..."
    mkdir -p "$BUILD_DIR/database"
    cp -r "$BACKEND_DIR/src/main/resources/db/migration" "$BUILD_DIR/database/" 2>/dev/null || true

    # 复制构建脚本
    log_info "复制启动脚本..."
    mkdir -p "$BUILD_DIR/scripts"
    cp "$PROJECT_ROOT/scripts/"*.sh "$BUILD_DIR/scripts/" 2>/dev/null || true
    cp "$PROJECT_ROOT/scripts/"*.bat "$BUILD_DIR/scripts/" 2>/dev/null || true

    # 复制文档
    log_info "复制项目文档..."
    mkdir -p "$BUILD_DIR/docs"
    cp -r "$PROJECT_ROOT/../docs"/* "$BUILD_DIR/docs/" 2>/dev/null || true

    # 创建版本信息文件
    cat > "$BUILD_DIR/VERSION" << EOF
番茄闹钟待办清单
构建时间: $(date)
Git 提交: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
构建环境: $(uname -a)
EOF

    log_success "发布包创建完成"
}

# 创建启动脚本
create_start_scripts() {
    log_info "创建启动脚本..."

    # Linux/Mac 启动脚本
    cat > "$BUILD_DIR/start.sh" << 'EOF'
#!/bin/bash

# 番茄闹钟待办清单启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAVA_OPTS="-Xms512m -Xmx2g -server"

echo "启动番茄闹钟后端服务..."
cd "$SCRIPT_DIR/backend"
java $JAVA_OPTS -jar $(ls *.jar | head -1) --spring.config.location=classpath:/application.yml,file:./application-prod.yml &

BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

# 等待后端启动
sleep 10

echo "番茄闹钟待办清单已启动"
echo "后端服务地址: http://localhost:8080/api"
echo "请使用前端应用访问：http://localhost:5173"

# 等待用户输入退出
read -p "按回车键停止服务..."

echo "停止服务..."
kill $BACKEND_PID
wait $BACKEND_PID 2>/dev/null
echo "服务已停止"
EOF

    chmod +x "$BUILD_DIR/start.sh"

    # Windows 启动脚本
    cat > "$BUILD_DIR/start.bat" << 'EOF'
@echo off
chcp 65001 >nul

echo 启动番茄闹钟后端服务...
cd /d "%~dp0backend"
start "Backend Service" java -Xms512m -Xmx2g -server -jar *.jar --spring.config.location=classpath:/application.yml,file:./application-prod.yml

timeout /t 10 >nul
echo 番茄闹钟待办清单已启动
echo 后端服务地址: http://localhost:8080/api
echo 请使用前端应用访问：http://localhost:5173
echo 按任意键停止服务...
pause >nul

taskkill /f /im java.exe >nul 2>&1
echo 服务已停止
EOF

    log_success "启动脚本创建完成"
}

# 生成构建报告
generate_report() {
    log_info "生成构建报告..."

    REPORT_FILE="$BUILD_DIR/build_report.txt"

    cat > "$REPORT_FILE" << EOF
番茄闹钟待办清单 - 构建报告
================================

构建时间: $(date)
构建环境: $(uname -a)
Git 提交: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")

前端信息:
--------
Node.js 版本: $(node --version)
NPM 版本: $(npm --version)
构建大小: $(du -sh "$BUILD_DIR/frontend" | cut -f1)

后端信息:
--------
Java 版本: $(java -version 2>&1 | head -n 1)
Maven 版本: $(mvn -version | head -n 1)
JAR 大小: $(du -sh "$BUILD_DIR/backend"/*.jar | cut -f1)

文件列表:
--------
EOF

    # 添加文件列表
    find "$BUILD_DIR" -type f -name "*.jar" -o -name "*.js" -o -name "*.css" | head -20 >> "$REPORT_FILE"

    log_success "构建报告生成完成: $REPORT_FILE"
}

# 主函数
main() {
    local start_time=$(date +%s)

    echo "开始构建番茄闹钟待办清单..."
    echo "构建时间: $(date)"
    echo "项目根目录: $PROJECT_ROOT"
    echo ""

    # 检查依赖
    check_dependencies
    echo ""

    # 清理构建
    if [ "$1" = "--clean" ]; then
        clean_build
        echo ""
    fi

    # 构建前端
    build_frontend
    echo ""

    # 构建后端
    build_backend
    echo ""

    # 创建发布包
    create_release
    echo ""

    # 创建启动脚本
    create_start_scripts
    echo ""

    # 生成报告
    generate_report
    echo ""

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo "=========================================="
    log_success "构建完成！"
    log_info "构建用时: ${duration}秒"
    log_info "输出目录: $BUILD_DIR"
    echo ""
    echo "启动方式:"
    echo "  Linux/Mac: $BUILD_DIR/start.sh"
    echo "  Windows: $BUILD_DIR/start.bat"
    echo "=========================================="
}

# 脚本入口
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi