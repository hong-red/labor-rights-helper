# 劳动维权帮助助手

一个专为劳动者维权设计的全栈网页应用，提供问题咨询、流程指导和功能使用统计分析。

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Express](https://img.shields.io/badge/express-5.x-blue.svg)
![SQLite](https://img.shields.io/badge/sqlite-3.x-blue.svg)

##部署架构

```
┌─────────────────────────────────────┐         ┌─────────────────────────┐
│         GitHub Pages                │         │   腾讯云服务器          │
│   https://hong-red.github.io/       │  ────▶  │   81.70.191.44:4000    │
│   /labor-rights-helper/             │   API   │   (后端API + 数据库)    │
│   (前端静态页面)                     │         │                         │
└─────────────────────────────────────┘         └─────────────────────────┘
```

- **前端**: GitHub Pages 托管（免费、自动部署）
- **后端**: 腾讯云服务器 81.70.191.44（API服务）

## 快速开始

### 环境要求
- Node.js ≥ 18.0.0
- npm 或 yarn
- Git

---

##  分离部署指南（推荐）

### 第一步：部署前端到 GitHub Pages

#### 1. Fork/克隆仓库

```bash
# 克隆仓库到本地
git clone https://github.com/hong-red/labor-rights-helper.git
cd labor-rights-helper
```

#### 2. 推送代码到 GitHub

```bash
# 如果是新项目，初始化并推送
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/hong-red/labor-rights-helper.git
git push -u origin main
```

#### 3. 启用 GitHub Pages

1. 打开 https://github.com/hong-red/labor-rights-helper
2. 点击 **Settings** → **Pages**
3. **Source** 选择 **GitHub Actions**
4. 等待自动部署完成（约2-3分钟）

#### 4. 验证前端部署

访问：https://hong-red.github.io/labor-rights-helper/

---

### 第二步：部署后端到腾讯云

#### 方法A：宝塔面板部署

如果你的服务器有宝塔面板，这是最方便的部署方式：

```bash
# 1. 登录宝塔面板 → 终端
# 2. 进入网站目录
cd /www/wwwroot

# 3. 克隆项目
git clone https://github.com/hong-red/labor-rights-helper.git
cd labor-rights-helper

# 4. 运行宝塔专用部署脚本
node deploy-bt.js
```

部署完成后，在宝塔面板 → 安全 → 放行端口 `4000`

#### 方法B：使用部署脚本（SSH方式）

适用于：有SSH密码，直接部署到腾讯云服务器

**Windows PowerShell:**
```powershell
# 在项目根目录执行
.\deploy-backend.ps1
```

**Git Bash / Linux / Mac:**
```bash
# 在项目根目录执行
./deploy-backend.sh
```

**Node.js (跨平台):**
```bash
# 在项目根目录执行
node deploy.js
```

脚本会自动完成：
- 打包后端文件
- 上传到腾讯云服务器 (81.70.191.44)
- 安装依赖
- 使用PM2启动服务

⚠️ **注意**: 此方法需要服务器SSH密码，如果不知道密码请使用方法A（宝塔部署）

#### 方法C：手动部署

```bash
# 1. 上传项目到服务器
scp -r . ubuntu@81.70.191.44:/home/ubuntu/labor-rights-helper

# 2. SSH连接服务器
ssh ubuntu@81.70.191.44

# 3. 安装依赖并启动
cd /home/ubuntu/labor-rights-helper
npm install

# 4. 安装PM2（如果未安装）
sudo npm install -g pm2

# 5. 使用PM2启动
pm2 start server-4000.js --name "labor-rights-backend"
pm2 save
pm2 startup
```

#### 验证后端部署

```bash
# 测试API是否正常工作
curl http://81.70.191.44:4000/api/health

# 应该返回: {"status":"OK","timestamp":"..."}
```

---

## 访问地址

部署完成后，您可以通过以下地址访问：

| 环境 | 地址 |
|------|------|
| **前端页面** | https://hong-red.github.io/labor-rights-helper/ |
| **统计页面** | https://hong-red.github.io/labor-rights-helper/stats.html |
| **后端API** | http://81.70.191.44:4000/api |
| **健康检查** | http://81.70.191.44:4000/api/health |

---

## 本地开发 

```bash
# 克隆项目
git clone https://github.com/hong-red/labor-rights-helper.git
cd labor-rights-helper

# 安装依赖
npm install

# 启动本地服务器
npm start
# 或
node server-4000.js

# 访问 http://localhost:4000
```

---

## 功能特性

### 前端功能
- **角色选择**: 农民工、大学生、个体户、律师等多角色适配
- **问题分类**: 欠薪、被骗、合同纠纷等场景化导航
- **流程指导**: 一步步教你维权流程
- **实时统计**: 功能使用数据可视化展示

### 后端统计
- **功能点击追踪** - 自动记录每个功能的使用次数
- **实时排行榜** - 按点击次数从高到低排序
- **分类统计** - 按功能类型筛选统计
- **数据持久化** - SQLite数据库存储
- **RESTful API** - 完整的统计接口

### 核心API接口
```http
POST /api/track-click      # 记录功能点击
GET  /api/stats            # 获取统计数据
GET  /api/popular-features # 获取热门功能
GET  /api/total-clicks     # 获取总点击次数
GET  /api/health           # 健康检查
```

---

## 项目结构

```
labor-rights-helper/
├── index.html              # 主页面
├── stats.html              # 统计展示页面
├── plaintiff.html          # 角色选择页面
├── server-4000.js          # Express服务器
├── package.json            # 依赖配置
├── backend/                # 后端数据目录
│   └── stats.db            # SQLite数据库
├── js/                     # 前端JavaScript
│   └── stats.js            # 统计追踪模块
├── css/                    # 样式文件
├── deploy-backend.sh       # 后端部署脚本
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
└── README.md               # 项目说明
```

---

## 常用命令

### 前端更新
```bash
git add .
git commit -m "Update frontend"
git push
# GitHub Actions会自动部署
```

### 后端更新
```bash
# 使用部署脚本
./deploy-backend.sh

# 或手动重启
ssh ubuntu@81.70.191.44
pm2 restart labor-rights-backend
```

### 查看日志
```bash
# 后端日志
ssh ubuntu@81.70.191.44
pm2 logs labor-rights-backend
```

---

## 技术栈

### 前端
- **HTML5** - 语义化结构
- **CSS3** - 响应式设计
- **JavaScript ES6+** - 现代JavaScript特性
- **FontAwesome** - 图标库

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web框架
- **SQLite3** - 轻量级数据库
- **CORS** - 跨域支持

### 部署
- **GitHub Pages** - 前端托管
- **腾讯云** - 后端服务器
- **PM2** - 进程管理器

---

## 安全配置

前端代码已自动识别环境：
```javascript
if (hostname === 'localhost') {
    this.apiBaseUrl = 'http://localhost:4000/api';
} else if (hostname.includes('github.io')) {
    this.apiBaseUrl = 'http://81.70.191.44:4000/api';
}
```

后端CORS已配置为允许GitHub Pages访问。

---

## 技术支持

- GitHub Pages文档: https://pages.github.com/
- 腾讯云文档: https://cloud.tencent.com/document/product
- PM2文档: https://pm2.keymetrics.io/

---

**部署完成！** 

- 前端地址: https://hong-red.github.io/labor-rights-helper/
- 后端地址: http://81.70.191.44:4000
