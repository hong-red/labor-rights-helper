console.log('开始启动服务器（端口4000）...');

// 尝试加载模块
try {
    const express = require('./backend/node_modules/express');
    const cors = require('./backend/node_modules/cors');
    const sqlite3 = require('./backend/node_modules/sqlite3').verbose();
    const path = require('path');
    
    console.log('✅ 模块加载成功');
    
    const app = express();
    const PORT = 4000; // 使用端口4000
    
    // 中间件 - 使用宽松的CORS配置以避免预检请求失败
    app.use(cors({
        origin: true, // 允许所有来源
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
        credentials: true, // 允许凭据
        optionsSuccessStatus: 200
    }));
    
    app.use(express.json());
    app.use(express.static(path.join(__dirname)));
    
    // 创建数据库连接
    const db = new sqlite3.Database('./backend/stats.db');
    
    // 创建统计表
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS feature_clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feature_name TEXT NOT NULL,
            feature_type TEXT NOT NULL,
            click_count INTEGER DEFAULT 1,
            last_clicked DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
    
    // 健康检查
    app.get('/api/health', (req, res) => {
        console.log('收到健康检查请求');
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 记录功能点击
    app.post('/api/track-click', (req, res) => {
        const { featureName, featureType } = req.body;
        
        if (!featureName || !featureType) {
            return res.status(400).json({ error: 'featureName and featureType are required' });
        }

        db.get('SELECT * FROM feature_clicks WHERE feature_name = ?', [featureName], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                // 更新点击次数
                db.run('UPDATE feature_clicks SET click_count = click_count + 1, last_clicked = CURRENT_TIMESTAMP WHERE feature_name = ?', [featureName], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Click recorded successfully', clickCount: row.click_count + 1 });
                });
            } else {
                // 插入新记录
                db.run('INSERT INTO feature_clicks (feature_name, feature_type, click_count) VALUES (?, ?, 1)', [featureName, featureType], function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: 'Click recorded successfully', clickCount: 1 });
                });
            }
        });
    });

    // 获取统计数据
    app.get('/api/stats', (req, res) => {
        const { type, limit = 50 } = req.query;
        
        let query = `
            SELECT feature_name, feature_type, click_count, last_clicked
            FROM feature_clicks
        `;
        
        const params = [];
        
        if (type) {
            query += ' WHERE feature_type = ?';
            params.push(type);
        }
        
        query += ' ORDER BY click_count DESC, last_clicked DESC';
        
        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        db.all(query, params, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ stats: rows });
        });
    });

    // 获取总点击次数
    app.get('/api/total-clicks', (req, res) => {
        db.get('SELECT SUM(click_count) as total FROM feature_clicks', (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ totalClicks: row.total || 0 });
        });
    });
    
    // 启动服务器
    const server = app.listen(PORT, () => {
        console.log(`🚀 服务器成功运行在端口 ${PORT}`);
        console.log(`🌐 统计页面: http://localhost:${PORT}/stats.html`);
        console.log(`🧪 测试页面: http://localhost:${PORT}/test-stats.html`);
        console.log('✅ 筛选器和刷新按钮现在应该可以正常工作了！');
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