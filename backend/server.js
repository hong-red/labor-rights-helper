const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// 创建数据库连接
const db = new sqlite3.Database('stats.db');

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

    // 创建索引优化查询
    db.run(`CREATE INDEX IF NOT EXISTS idx_feature_name ON feature_clicks(feature_name)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_feature_type ON feature_clicks(feature_type)`);
});

// 记录功能点击
app.post('/api/track-click', (req, res) => {
    const { featureName, featureType } = req.body;
    
    if (!featureName || !featureType) {
        return res.status(400).json({ error: 'featureName and featureType are required' });
    }

    const query = `
        INSERT INTO feature_clicks (feature_name, feature_type, click_count) 
        VALUES (?, ?, 1)
        ON CONFLICT(feature_name) DO UPDATE SET 
            click_count = click_count + 1,
            last_clicked = CURRENT_TIMESTAMP
    `;

    // 检查是否已存在该功能
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
                res.json({ message: 'Click recorded successfully', clickCount: this.changes });
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

// 获取功能点击统计（按点击次数排序）
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

// 获取热门功能
app.get('/api/popular-features', (req, res) => {
    const { limit = 10 } = req.query;
    
    const query = `
        SELECT feature_name, feature_type, click_count, last_clicked
        FROM feature_clicks
        ORDER BY click_count DESC
        LIMIT ?
    `;

    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ popularFeatures: rows });
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
    console.log(`访问 http://localhost:${PORT} 查看应用`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭数据库连接...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('数据库连接已关闭');
        }
        process.exit(0);
    });
});

module.exports = app;