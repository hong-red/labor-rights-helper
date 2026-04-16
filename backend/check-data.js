const sqlite3 = require('sqlite3').verbose();

// 连接数据库
const db = new sqlite3.Database('stats.db');

console.log('📊 检查数据库中的统计数据...\n');

// 检查表是否存在
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='feature_clicks'", (err, row) => {
    if (err) {
        console.error('❌ 检查表时出错:', err.message);
        return;
    }
    
    if (!row) {
        console.log('⚠️  feature_clicks 表不存在，需要初始化');
        return;
    }
    
    console.log('✅ feature_clicks 表已存在');
    
    // 查看所有数据
    db.all("SELECT * FROM feature_clicks ORDER BY click_count DESC", (err, rows) => {
        if (err) {
            console.error('❌ 查询数据时出错:', err.message);
            return;
        }
        
        console.log(`📈 找到 ${rows.length} 条记录:\n`);
        
        if (rows.length === 0) {
            console.log('📝 暂无数据，请先点击一些功能来生成统计数据');
        } else {
            rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.feature_name}`);
                console.log(`   类型: ${row.feature_type}`);
                console.log(`   点击次数: ${row.click_count}`);
                console.log(`   最后点击: ${row.last_clicked}`);
                console.log('');
            });
        }
        
        // 查看总点击次数
        db.get("SELECT SUM(click_count) as total FROM feature_clicks", (err, result) => {
            if (err) {
                console.error('❌ 查询总数时出错:', err.message);
            } else {
                console.log(`🎯 总点击次数: ${result.total || 0}`);
            }
            
            db.close();
        });
    });
});