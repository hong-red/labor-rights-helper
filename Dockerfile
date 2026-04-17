# 劳动维权帮助助手 - Docker镜像
# 适用于腾讯云、阿里云等云服务器部署

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的系统工具
RUN apk add --no-cache curl

# 复制package.json
COPY package.json ./

# 安装依赖
RUN npm install --production

# 复制应用文件
COPY . .

# 创建数据目录
RUN mkdir -p /app/backend/data

# 暴露端口
EXPOSE 4000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=4000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# 启动命令
CMD ["node", "server-4000.js"]
