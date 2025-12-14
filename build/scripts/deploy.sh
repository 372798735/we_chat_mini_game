#!/bin/bash

echo "=========================================="
echo "番茄闹钟待办清单 - 部署脚本"
echo "=========================================="

# 设置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_ROOT/../dist"
DEPLOY_DIR="/opt/tomato-todo"
BACKUP_DIR="/opt/backups/tomato-todo"
SERVICE_NAME="tomato-todo"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        echo "请使用: sudo $0"
        exit 1
    fi
}

# 检查构建文件是否存在
check_build_files() {
    if [ ! -d "$DIST_DIR" ]; then
        log_error "构建目录不存在: $DIST_DIR"
        log_info "请先运行构建脚本: ./build.sh"
        exit 1
    fi

    if [ ! -f "$DIST_DIR/backend"/*.jar ]; then
        log_error "后端 JAR 文件不存在"
        exit 1
    fi

    log_success "构建文件检查通过"
}

# 创建备份
create_backup() {
    log_info "创建当前部署备份..."

    if [ -d "$DEPLOY_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="$SERVICE_NAME_backup_$TIMESTAMP"
        cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME"

        # 保留最近5个备份
        cd "$BACKUP_DIR"
        ls -t | grep "$SERVICE_NAME_backup_" | tail -n +6 | xargs -r rm -rf

        log_success "备份创建完成: $BACKUP_DIR/$BACKUP_NAME"
    else
        log_warning "当前部署目录不存在，跳过备份"
    fi
}

# 停止现有服务
stop_service() {
    log_info "停止现有服务..."

    # 检查服务是否存在
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        systemctl stop "$SERVICE_NAME"
        log_info "服务已停止"
    elif pgrep -f "tomato-todo" > /dev/null; then
        # 手动停止进程
        pkill -f "tomato-todo"
        sleep 3
        log_info "进程已停止"
    else
        log_warning "未找到运行中的服务"
    fi
}

# 部署应用文件
deploy_files() {
    log_info "部署应用文件..."

    # 创建部署目录
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$DEPLOY_DIR/logs"
    mkdir -p "$DEPLOY_DIR/config"

    # 复制应用文件
    cp -r "$DIST_DIR/backend"/* "$DEPLOY_DIR/"
    cp -r "$DIST_DIR/frontend" "$DEPLOY_DIR/" 2>/dev/null || true
    cp -r "$DIST_DIR/database" "$DEPLOY_DIR/" 2>/dev/null || true

    # 设置权限
    chown -R tomato-todo:tomato-todo "$DEPLOY_DIR" 2>/dev/null || chown -R $USER:$USER "$DEPLOY_DIR"
    chmod +x "$DEPLOY_DIR"/*.jar

    log_success "应用文件部署完成"
}

# 创建systemd服务文件
create_systemd_service() {
    log_info "创建 systemd 服务文件..."

    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Tomato Todo Backend Service
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=tomato-todo
Group=tomato-todo
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/bin/java -Xms512m -Xmx2g -server -Dspring.profiles.active=prod -jar $DEPLOY_DIR/$(ls $DEPLOY_DIR/*.jar | xargs -n 1 basename)
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=m
Restart=always
RestartSec=10

Environment=JAVA_HOME=/usr/lib/jvm/default-java
Environment=SPRING_PROFILES_ACTIVE=prod

# 日志配置
StandardOutput=append:$DEPLOY_DIR/logs/application.log
StandardError=append:$DEPLOY_DIR/logs/error.log
SyslogIdentifier=$SERVICE_NAME

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_DIR/logs $DEPLOY_DIR/config

[Install]
WantedBy=multi-user.target
EOF

    # 重新加载 systemd
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"

    log_success "systemd 服务文件创建完成"
}

# 配置Nginx（如果需要）
configure_nginx() {
    if command -v nginx &> /dev/null; then
        log_info "配置 Nginx..."

        cat > "/etc/nginx/sites-available/tomato-todo" << 'EOF'
server {
    listen 80;
    server_name _;
    root /opt/tomato-todo/frontend;
    index index.html;

    # 前端静态文件
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # API 代理到后端
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
EOF

        # 启用站点
        ln -sf "/etc/nginx/sites-available/tomato-todo" "/etc/nginx/sites-enabled/"
        nginx -t && systemctl reload nginx

        log_success "Nginx 配置完成"
    else
        log_warning "Nginx 未安装，跳过 Nginx 配置"
    fi
}

# 启动服务
start_service() {
    log_info "启动服务..."

    systemctl start "$SERVICE_NAME"
    sleep 5

    # 检查服务状态
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "服务启动成功"
        systemctl status "$SERVICE_NAME" --no-pager
    else
        log_error "服务启动失败"
        systemctl status "$SERVICE_NAME" --no-pager
        journalctl -u "$SERVICE_NAME" --no-pager -n 20
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."

    # 检查服务端口
    if netstat -tuln | grep -q ":8080 "; then
        log_success "后端服务端口 8080 正常监听"
    else
        log_error "后端服务端口 8080 未监听"
        return 1
    fi

    # 检查API健康状态
    sleep 10
    if curl -f -s "http://localhost:8080/api/health" > /dev/null 2>&1; then
        log_success "API 健康检查通过"
    else
        log_warning "API 健康检查失败，服务可能仍在启动中"
    fi

    return 0
}

# 设置用户和权限
setup_user() {
    if ! id "tomato-todo" &>/dev/null; then
        log_info "创建应用用户..."
        useradd -r -s /bin/false -d "$DEPLOY_DIR" "tomato-todo"
        log_success "用户 tomato-todo 创建完成"
    fi

    chown -R tomato-todo:tomato-todo "$DEPLOY_DIR" 2>/dev/null || true
}

# 主函数
main() {
    local start_time=$(date +%s)

    echo "开始部署番茄闹钟待办清单..."
    echo "部署目标: $DEPLOY_DIR"
    echo "部署时间: $(date)"
    echo ""

    # 检查权限
    check_root
    echo ""

    # 检查构建文件
    check_build_files
    echo ""

    # 创建备份
    if [ "$1" != "--no-backup" ]; then
        create_backup
        echo ""
    fi

    # 停止服务
    stop_service
    echo ""

    # 部署文件
    deploy_files
    echo ""

    # 设置用户
    setup_user
    echo ""

    # 创建服务文件
    create_systemd_service
    echo ""

    # 配置Nginx
    configure_nginx
    echo ""

    # 启动服务
    start_service
    echo ""

    # 健康检查
    if health_check; then
        echo ""
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))

        echo "=========================================="
        log_success "部署完成！"
        log_info "部署用时: ${duration}秒"
        log_info "服务地址: http://localhost"
        log_info "API地址: http://localhost/api"
        echo ""
        echo "服务管理:"
        echo "  启动: systemctl start $SERVICE_NAME"
        echo "  停止: systemctl stop $SERVICE_NAME"
        echo "  重启: systemctl restart $SERVICE_NAME"
        echo "  状态: systemctl status $SERVICE_NAME"
        echo "  日志: journalctl -u $SERVICE_NAME -f"
        echo "=========================================="
    else
        log_error "部署后健康检查失败，请检查服务状态"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --no-backup  跳过备份现有部署"
    echo "  --help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 正常部署（包含备份）"
    echo "  $0 --no-backup  # 部署但不备份"
}

# 脚本入口
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
            main "$@"
        fi
        ;;
esac