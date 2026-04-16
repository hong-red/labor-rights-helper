# 维权助手 - 功能使用统计系统

一个专为劳动者维权设计的全栈网页应用，提供问题咨询、流程指导和功能使用统计分析。

![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Express](https://img.shields.io/badge/express-5.x-blue.svg)
![SQLite](https://img.shields.io/badge/sqlite-3.x-blue.svg)

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
POST /api/track-click     # 记录功能点击
GET  /api/stats           # 获取统计数据
GET  /api/popular-features # 获取热门功能
GET  /api/total-clicks    # 获取总点击次数
GET  /api/health          # 健康检查
```

## 快速开始

### 环境要求
- Node.js ≥ 18.0.0
- npm 或 yarn

### 本地开发
```bash
# 克隆项目
git clone https://github.com/your-username/weiquan-helper.git
cd weiquan-helper

# 安装依赖
cd backend
npm install

# 启动服务
npm start

# 访问应用
# 主应用: http://localhost:3000
# 统计页面: http://localhost:3000/stats.html
# 测试页面: http://localhost:3000/test-stats.html
```

### 云服务器部署
```bash
# 使用一键部署脚本
cd backend
chmod +x deploy.sh
./deploy.sh
```

## 项目结构

```
weiquan-helper/
├── 📄 index.html              # 主页面
├── 📄 stats.html              # 统计展示页面
├── 📄 test-stats.html         # 测试统计功能
├── 📄 role.html               # 角色选择页面
├── 📁 backend/                # 后端服务
│   ├── 📄 server.js          # Express服务器
│   ├── 📄 package.json       # 依赖配置
│   ├── 📄 stats.db           # SQLite数据库（自动生成）
│   ├── 📄 deploy.sh          # 部署脚本
│   └── 📄 .env.example       # 环境变量模板
├── 📁 js/                    # 前端JavaScript
│   ├── 📄 stats.js           # 统计追踪模块
│   └── 📄 script.js          # 主应用逻辑
├── 📁 css/                   # 样式文件
└── 📄 README.md              # 项目说明
```

##  界面预览

### 主页面
![主页面](https://via.placeholder.com/800x400/1e40af/ffffff?text=维权助手主页面)

### 统计页面
![统计页面](https://via.placeholder.com/800x400/28a745/ffffff?text=功能使用统计)

### 测试页面
![测试页面](https://via.placeholder.com/800x400/ffc107/ffffff?text=统计功能测试)

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
- **PM2** - 进程管理器
- **Nginx** - 反向代理
- **Let's Encrypt** - SSL证书

## 数据统计示例

当前数据库中的示例数据：
```json
[
  {
    "feature_name": "农民工讨薪流程",
    "feature_type": "problem-selection",
    "click_count": 156,
    "last_clicked": "2024-01-15 14:30:00"
  },
  {
    "feature_name": "大学生兼职被骗",
    "feature_type": "problem-selection", 
    "click_count": 89,
    "last_clicked": "2024-01-15 13:45:00"
  }
]
```

## 部署选项   

### 本地开发
```bash
npm run dev
```

### 生产部署
```bash
npm run start
```

### Docker部署（可选）
```bash
docker build -t weiquan-helper .
docker run -p 3000:3000 weiquan-helper
```

## 安全特性

- **输入验证** - 防止SQL注入
- **CORS配置** - 安全的跨域访问
- **数据备份** - 自动数据库备份脚本
- **HTTPS支持** - SSL/TLS加密


