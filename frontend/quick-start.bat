@echo off
echo 快速启动前端应用（端口3000）

cd /d "%~dp0"

echo 尝试使用端口3000启动前端...
set PORT=3000
npm run dev:vite

pause