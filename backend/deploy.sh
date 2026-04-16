#!/bin/bash

# 部署脚本 - 适用于云服务器

echo "开始部署维权助手后端服务..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 创建环境配置文件
if [ ! -f .env ]; then
    echo "创建环境配置文件..."
    cp .env.example .env
    echo "请编辑 .env 文件配置您的服务器设置"
fi

# 使用PM2启动应用（如果已安装）
if command -v pm2 &> /dev/null; then
    echo "使用PM2启动服务..."
    pm2 start server.js --name "维权助手统计服务"
    pm2 save
    pm2 startup
else
    echo "PM2未安装，使用node直接启动..."
    echo "建议安装PM2: npm install -g pm2"
    nohup node server.js > app.log 2>&1 &
    echo "服务已启动，日志输出到 app.log"
fi

echo "部署完成！"
echo "服务运行在: http://localhost:3000"
echo "统计页面: http://localhost:3000/stats.html"
echo "API文档: http://localhost:3000/api/health"