# 维权助手后端统计服务

这是一个为维权助手网站提供功能使用统计的后端服务。

## 功能特性

- ✅ 记录功能点击次数
- ✅ 按点击次数排序统计
- ✅ 实时数据更新
- ✅ 支持按功能类型筛选
- ✅ 轻量级SQLite数据库
- ✅ RESTful API接口

## API接口

### 记录功能点击
```http
POST /api/track-click
Content-Type: application/json

{
  "featureName": "功能名称",
  "featureType": "功能类型"
}
```

### 获取统计数据
```http
GET /api/stats?type=功能类型&limit=数量
```

### 获取热门功能
```http
GET /api/popular-features?limit=10
```

### 获取总点击次数
```http
GET /api/total-clicks
```

### 健康检查
```http
GET /api/health
```

## 快速开始

### 本地开发

1. 安装依赖：
```bash
cd backend
npm install
```

2. 启动服务：
```bash
npm start
```

3. 访问服务：
- 主应用: http://localhost:3000
- 统计页面: http://localhost:3000/stats.html

### 云服务器部署

1. 上传代码到服务器
2. 运行部署脚本：
```bash
chmod +x deploy.sh
./deploy.sh
```

3. 配置反向代理（Nginx示例）：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 数据结构

### 功能点击表 (feature_clicks)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| feature_name | TEXT | 功能名称 |
| feature_type | TEXT | 功能类型 |
| click_count | INTEGER | 点击次数 |
| last_clicked | DATETIME | 最后点击时间 |
| created_at | DATETIME | 创建时间 |

## 前端集成

在HTML中添加统计追踪：

```html
<!-- 添加统计脚本 -->
<script src="js/stats.js"></script>

<!-- 为元素添加追踪属性 -->
<a href="page.html" data-track="功能名称" data-track-type="功能类型">链接</a>

<!-- 手动记录点击 -->
<script>
// 记录任意点击
trackFeature('自定义功能名', '自定义类型');

// 获取统计数据
getStats('功能类型', 10).then(stats => {
    console.log('热门功能:', stats);
});
</script>
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

## 技术栈

- **后端**: Node.js + Express
- **数据库**: SQLite3
- **跨域**: CORS
- **部署**: PM2 (推荐)

## 注意事项

1. 数据库文件 `stats.db` 会自动创建
2. 首次启动时会自动创建所需的表结构
3. 建议在生产环境使用PM2进行进程管理
4. 定期备份数据库文件以防数据丢失