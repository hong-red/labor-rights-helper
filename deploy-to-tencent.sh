#!/bin/bash

# 劳动维权帮助助手 - 腾讯云一键部署脚本
# 使用方法: ./deploy-to-tencent.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署劳动维权帮助助手到腾讯云..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -f "server-4000.js" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️ Node.js未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "${GREEN}✅ Node.js版本: $(node -v)${NC}"
echo -e "${GREEN}✅ npm版本: $(npm -v)${NC}"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 创建必要的目录
echo ""
echo "📁 创建数据目录..."
mkdir -p backend/data

# 检查PM2
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 安装PM2..."
    sudo npm install -g pm2
fi

# 停止旧的服务（如果存在）
echo ""
echo "🛑 停止旧服务..."
pm2 stop weiquan-helper 2>/dev/null || true
pm2 delete weiquan-helper 2>/dev/null || true

# 启动服务
echo ""
echo "🚀 启动服务..."
pm2 start server-4000.js --name "weiquan-helper"

# 保存PM2配置
echo ""
echo "💾 保存PM2配置..."
pm2 save

# 设置开机自启
echo ""
echo "⚙️ 设置开机自启..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "📊 应用信息："
echo "   - 名称: weiquan-helper"
echo "   - 端口: 4000"
echo "   - 状态: $(pm2 status weiquan-helper | grep weiquan-helper | awk '{print $10}')"
echo ""
echo "🌐 访问地址："
echo "   - 本地: http://localhost:4000"
echo "   - 公网: http://$(curl -s ifconfig.me):4000"
echo ""
echo "📱 功能页面："
echo "   - 维权助手: http://$(curl -s ifconfig.me):4000/plaintiff.html"
echo "   - 统计页面: http://$(curl -s ifconfig.me):4000/stats.html"
echo ""
echo "🔧 常用命令："
echo "   - 查看日志: pm2 logs weiquan-helper"
echo "   - 重启服务: pm2 restart weiquan-helper"
echo "   - 停止服务: pm2 stop weiquan-helper"
echo ""
echo -e "${GREEN}🎉 部署成功！${NC}"
