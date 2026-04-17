# 云服务器部署指南

## 📋 分离部署架构

```
┌─────────────────────────────────────┐         ┌─────────────────────────┐
│         GitHub Pages                │         │   腾讯云服务器          │
│   https://hong-red.github.io/       │  ────▶  │   81.70.191.44:4000    │
│   /labor-rights-helper/             │   API   │   (后端API + 数据库)    │
│   (前端静态页面)                     │         │                         │
└─────────────────────────────────────┘         └─────────────────────────┘
```

---

## 部署步骤（先前端后后端） 

### ✅ 第一步：部署前端到 GitHub Pages

#### 1. 推送代码到 GitHub

```bash
# 克隆仓库
git clone https://github.com/hong-red/labor-rights-helper.git
cd labor-rights-helper

# 推送代码
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/hong-red/labor-rights-helper.git
git push -u origin main
```

#### 2. 启用 GitHub Pages

1. 打开 https://github.com/hong-red/labor-rights-helper
2. 点击 **Settings** → **Pages**
3. **Source** 选择 **GitHub Actions**
4. 等待自动部署完成

#### 3. 验证前端

访问：https://hong-red.github.io/labor-rights-helper/

---

### ✅ 第二步：部署后端到腾讯云 (81.70.191.44)

#### 方法一：使用部署脚本（推荐）

```bash
# 在项目根目录执行
./deploy-backend.sh
```

#### 方法二：手动部署

```bash
# 1. 登录腾讯云服务器
ssh ubuntu@81.70.191.44

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 上传项目（本地执行）
scp -r . ubuntu@81.70.191.44:/home/ubuntu/labor-rights-helper

# 4. 在服务器上安装依赖并启动
cd /home/ubuntu/labor-rights-helper
npm install

# 5. 使用PM2启动
sudo npm install -g pm2
pm2 start server-4000.js --name "labor-rights-backend"
pm2 save
pm2 startup
```

#### 验证后端

```bash
curl http://81.70.191.44:4000/api/health
# 应返回: {"status":"OK","timestamp":"..."}
```

---

## 🔧 服务器配置

### 配置安全组

在腾讯云控制台配置安全组规则：

| 端口 | 协议 | 来源 | 说明 |
|------|------|------|------|
| 22 | TCP | 0.0.0.0/0 | SSH远程连接 |
| 4000 | TCP | 0.0.0.0/0 | 后端API端口 |
| 80 | TCP | 0.0.0.0/0 | HTTP（可选） |
| 443 | TCP | 0.0.0.0/0 | HTTPS（可选） |

### 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 4000
sudo ufw allow 22
sudo ufw enable

# CentOS
sudo firewall-cmd --permanent --add-port=4000/tcp
sudo firewall-cmd --reload
```

---

## 🐳 Docker部署

### 使用Docker Compose

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独使用Docker

```bash
# 构建镜像
docker build -t labor-rights-helper .

# 运行容器
docker run -d \
  --name labor-rights-backend \
  -p 4000:4000 \
  -v $(pwd)/backend/stats.db:/app/backend/stats.db \
  --restart unless-stopped \
  labor-rights-helper
```

---

## 🌐 域名和HTTPS配置

### Nginx反向代理

```bash
# 安装Nginx
sudo apt install nginx -y

# 创建配置文件
sudo nano /etc/nginx/sites-available/labor-rights-helper
```

配置内容：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/labor-rights-helper /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### SSL证书（Let's Encrypt）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 📊 监控和维护

### PM2监控

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs labor-rights-backend

# 监控资源
pm2 monit

# 重启应用
pm2 restart labor-rights-backend
```

### 系统监控

```bash
# 安装监控工具
sudo apt install htop

# 查看系统资源
htop

# 查看磁盘空间
df -h

# 查看内存使用
free -h
```

---

## 💾 备份和恢复

### 数据库备份

```bash
# 手动备份
ssh ubuntu@81.70.191.44
cp /home/ubuntu/labor-rights-helper/backend/stats.db /backup/stats.db.$(date +%Y%m%d)

# 自动备份（添加到crontab）
0 2 * * * cp /home/ubuntu/labor-rights-helper/backend/stats.db /backup/stats.db.$(date +\%Y\%m\%d)
```

### 应用备份

```bash
# 备份整个项目
tar -czf labor-rights-helper-backup-$(date +%Y%m%d).tar.gz labor-rights-helper/
```

---

## 🆘 故障排除

### 常见问题

1. **端口被占用**
```bash
netstat -tulpn | grep 4000
kill -9 <PID>
```

2. **应用无法启动**
```bash
# 检查依赖
cd /home/ubuntu/labor-rights-helper && npm install

# 查看错误日志
pm2 logs labor-rights-backend
```

3. **CORS错误**
- 检查 `server-4000.js` 中的CORS配置
- 确保 `origin: true` 或添加GitHub Pages域名

4. **数据库权限错误**
```bash
chmod 755 /home/ubuntu/labor-rights-helper/backend
```

---

