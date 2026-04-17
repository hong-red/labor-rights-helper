console.log('开始启动服务器...');

// 尝试加载模块
try {
    const express = require('./backend/node_modules/express');
    const cors = require('./backend/node_modules/cors');
    const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
    const path = require('path');
    
    console.log('✅ 模块加载成功');
    
    const app = express();
    const PORT = 3000;
    
    // 中间件
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname)));
    
    // 简单的健康检查
    app.get('/api/health', (req, res) => {
        console.log('收到健康检查请求');
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 启动服务器
    const server = app.listen(PORT, () => {
        console.log(`🚀 服务器成功运行在端口 ${PORT}`);
        console.log(`🌐 访问 http://localhost:${PORT}/stats.html 测试统计页面`);
        console.log('服务器将保持运行，按 Ctrl+C 停止');
    });
    
    // 保持服务器运行
    server.keepAliveTimeout = 0;
    
    // 处理错误
    server.on('error', (err) => {
        console.error('服务器错误:', err);
    });
    
} catch (error) {
    console.error('❌ 启动服务器失败:', error.message);
    console.error('错误堆栈:', error.stack);
}