#!/bin/bash

# 劳动维权帮助助手 - 腾讯云后端部署脚本
# 服务器IP: 81.70.191.44
# 使用方法: ./deploy-backend.sh

set -e

echo "🚀 开始部署后端到腾讯云服务器 (81.70.191.44)..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 服务器配置
SERVER_IP="81.70.191.44"
SERVER_USER="ubuntu"  # 或 root，根据你的服务器配置
REMOTE_DIR="/home/ubuntu/weiquan-helper"

# 检查本地环境
echo "📋 检查本地环境..."

if [ ! -f "server-4000.js" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 本地文件检查通过${NC}"

# 创建部署包
echo ""
echo "📦 创建部署包..."

# 创建临时目录
DEPLOY_DIR=$(mktemp -d)
mkdir -p $DEPLOY_DIR/weiquan-helper

# 复制必要文件
cp server-4000.js $DEPLOY_DIR/weiquan-helper/
cp package.json $DEPLOY_DIR/weiquan-helper/
cp -r backend $DEPLOY_DIR/weiquan-helper/ 2>/dev/null || mkdir -p $DEPLOY_DIR/weiquan-helper/backend
cp Dockerfile $DEPLOY_DIR/weiquan-helper/ 2>/dev/null || true
cp docker-compose.yml $DEPLOY_DIR/weiquan-helper/ 2>/dev/null || true
cp nginx.conf $DEPLOY_DIR/weiquan-helper/ 2>/dev/null || true

# 创建启动脚本
cat > $DEPLOY_DIR/weiquan-helper/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# 安装依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装依赖..."
    cd backend && npm install && cd ..
fi

# 使用PM2启动
if command -v pm2 &> /dev/null; then
    echo "🚀 使用PM2启动..."
    pm2 stop weiquan-backend 2>/dev/null || true
    pm2 delete weiquan-backend 2>/dev/null || true
    pm2 start server-4000.js --name "weiquan-backend"
    pm2 save
else
    echo "🚀 直接启动..."
    nohup node server-4000.js > app.log 2>&1 &
fi

echo "✅ 后端启动完成"
echo "🌐 API地址: http://81.70.191.44:4000"
EOF

chmod +x $DEPLOY_DIR/weiquan-helper/start.sh

# 压缩部署包
cd $DEPLOY_DIR
tar -czf weiquan-backend.tar.gz weiquan-helper
cd -

echo -e "${GREEN}✅ 部署包创建完成${NC}"

# 上传到服务器
echo ""
echo "📤 上传到服务器..."
echo -e "${YELLOW}提示: 首次连接需要输入服务器密码${NC}"

scp $DEPLOY_DIR/weiquan-backend.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 上传失败，请检查:${NC}"
    echo "   1. 服务器IP是否正确: $SERVER_IP"
    echo "   2. 用户名是否正确: $SERVER_USER"
    echo "   3. 服务器是否开启SSH"
    echo "   4. 本地是否有SSH密钥或密码"
    rm -rf $DEPLOY_DIR
    exit 1
fi

echo -e "${GREEN}✅ 上传成功${NC}"

# 在服务器上解压并启动
echo ""
echo "🚀 在服务器上部署..."

ssh $SERVER_USER@$SERVER_IP << EOF
    # 创建目录
    mkdir -p $REMOTE_DIR
    
    # 备份旧数据
    if [ -f "$REMOTE_DIR/backend/stats.db" ]; then
        echo "💾 备份数据库..."
        cp $REMOTE_DIR/backend/stats.db /tmp/stats.db.backup
    fi
    
    # 解压新代码
    cd /tmp
    tar -xzf weiquan-backend.tar.gz
    
    # 复制文件
    cp -r weiquan-helper/* $REMOTE_DIR/
    
    # 恢复数据库
    if [ -f "/tmp/stats.db.backup" ]; then
        echo "💾 恢复数据库..."
        cp /tmp/stats.db.backup $REMOTE_DIR/backend/stats.db
    fi
    
    # 启动服务
    cd $REMOTE_DIR
    chmod +x start.sh
    ./start.sh
    
    # 清理
    rm -f /tmp/weiquan-backend.tar.gz
    rm -f /tmp/stats.db.backup
    
    echo "✅ 部署完成"
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 服务器部署失败${NC}"
    rm -rf $DEPLOY_DIR
    exit 1
fi

# 清理本地临时文件
rm -rf $DEPLOY_DIR

echo ""
echo -e "${GREEN}🎉 后端部署成功！${NC}"
echo ""
echo "📊 部署信息："
echo "   - 服务器IP: $SERVER_IP"
echo "   - API端口: 4000"
echo "   - 部署目录: $REMOTE_DIR"
echo ""
echo "🌐 访问地址："
echo "   - API健康检查: http://$SERVER_IP:4000/api/health"
echo "   - 统计API: http://$SERVER_IP:4000/api/stats"
echo ""
echo "🔧 常用命令（在服务器上执行）："
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   cd $REMOTE_DIR"
echo "   pm2 logs weiquan-backend    # 查看日志"
echo "   pm2 restart weiquan-backend # 重启服务"
echo ""
echo -e "${GREEN}✅ 后端部署完成！${NC}"
