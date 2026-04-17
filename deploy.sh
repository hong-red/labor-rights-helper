#!/bin/bash

# 劳动维权帮助助手部署脚本
# 适用于腾讯云、阿里云等云服务器部署

echo "🚀 开始部署劳动维权帮助助手..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 创建数据库文件（如果不存在）
if [ ! -f "stats.db" ]; then
    echo "🗄️ 初始化数据库..."
    node -e "
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('stats.db');
    db.serialize(() => {
        db.run(\`CREATE TABLE IF NOT EXISTS feature_clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feature_name TEXT NOT NULL,
            feature_type TEXT NOT NULL,
            click_count INTEGER DEFAULT 1,
            last_clicked DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )\`);
        db.run(\`CREATE INDEX IF NOT EXISTS idx_feature_name ON feature_clicks(feature_name)\\`);
        db.run(\`CREATE INDEX IF NOT EXISTS idx_feature_type ON feature_clicks(feature_type)\\`);
    });
    db.close();
    "
fi

# 设置环境变量
export PORT=${PORT:-3000}
export NODE_ENV=production

echo "✅ 部署准备完成"
echo "📊 应用信息："
echo "   - 端口: $PORT"
echo "   - 环境: $NODE_ENV"
echo "   - 数据库: stats.db"
echo ""
echo "🎯 启动命令："
echo "   npm start"
echo ""
echo "🌐 访问地址："
echo "   http://localhost:$PORT"
echo ""
echo "📱 功能页面："
echo "   - 主页面: http://localhost:$PORT"
echo "   - 统计页面: http://localhost:$PORT/stats.html"
echo ""
echo "✅ 部署脚本执行完毕！"