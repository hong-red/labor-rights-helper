// 宝塔面板专用部署脚本
// 使用方法: 在宝塔终端中运行: node deploy-bt.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_NAME = 'labor-rights-helper';
const DEPLOY_DIR = '/www/wwwroot/' + PROJECT_NAME;
const PORT = 4000;

console.log('🚀 开始部署到宝塔面板...\n');

// 检查是否在正确目录
console.log('📋 检查环境...');
if (!fs.existsSync('server-4000.js')) {
    console.error('❌ 错误：请在项目根目录运行此脚本');
    process.exit(1);
}

// 检查是否在宝塔环境
const isBtPanel = fs.existsSync('/www/server/panel') || process.env.BT_PANEL === 'true';
if (!isBtPanel) {
    console.log('⚠️ 警告：未检测到宝塔面板环境');
    console.log('💡 此脚本专为宝塔面板设计\n');
}

console.log('✅ 环境检查通过\n');

// 创建部署目录
console.log('📁 创建部署目录...');
if (!fs.existsSync(DEPLOY_DIR)) {
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
}
console.log('✅ 目录准备完成\n');

// 复制文件
console.log('📦 复制项目文件...');
const filesToCopy = ['server-4000.js', 'package.json', 'Dockerfile', 'docker-compose.yml', 'nginx.conf'];
const dirsToCopy = ['backend', 'js', 'css', 'images', 'assets'];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(DEPLOY_DIR, file));
        console.log(`  ✓ ${file}`);
    }
});

dirsToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDir(dir, path.join(DEPLOY_DIR, dir));
        console.log(`  ✓ ${dir}/`);
    }
});

console.log('✅ 文件复制完成\n');

// 安装依赖
console.log('📦 安装依赖...');
try {
    process.chdir(DEPLOY_DIR);
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖安装完成\n');
} catch (error) {
    console.error('❌ 依赖安装失败');
    process.exit(1);
}

// 安装PM2（如果没有）
console.log('🔧 检查PM2...');
try {
    execSync('pm2 --version', { stdio: 'ignore' });
    console.log('✅ PM2已安装\n');
} catch (error) {
    console.log('📦 安装PM2...');
    try {
        execSync('npm install -g pm2', { stdio: 'inherit' });
        console.log('✅ PM2安装完成\n');
    } catch (e) {
        console.log('⚠️ PM2安装失败，将使用直接启动\n');
    }
}

// 启动服务
console.log('🚀 启动服务...');
try {
    // 停止旧服务
    try {
        execSync('pm2 stop labor-rights-backend', { stdio: 'ignore' });
        execSync('pm2 delete labor-rights-backend', { stdio: 'ignore' });
    } catch (e) {
        // 忽略错误
    }

    // 启动新服务
    execSync(`pm2 start ${DEPLOY_DIR}/server-4000.js --name "labor-rights-backend"`, { stdio: 'inherit' });
    execSync('pm2 save', { stdio: 'ignore' });
    console.log('✅ 服务启动完成\n');
} catch (error) {
    console.log('⚠️ PM2启动失败，尝试直接启动...');
    try {
        execSync(`nohup node ${DEPLOY_DIR}/server-4000.js > ${DEPLOY_DIR}/app.log 2>&1 &`, { stdio: 'ignore' });
        console.log('✅ 服务已后台启动\n');
    } catch (e) {
        console.error('❌ 服务启动失败');
        process.exit(1);
    }
}

// 检查端口
console.log('🔍 检查服务状态...');
try {
    execSync('sleep 2');
    const result = execSync(`curl -s http://localhost:${PORT}/api/health`).toString();
    const health = JSON.parse(result);
    if (health.status === 'OK') {
        console.log('✅ 服务运行正常\n');
    }
} catch (error) {
    console.log('⚠️ 无法确认服务状态，请手动检查\n');
}

console.log('🎉 部署完成！\n');
console.log('📊 部署信息：');
console.log(`   - 项目目录: ${DEPLOY_DIR}`);
console.log(`   - 服务端口: ${PORT}`);
console.log(`   - 进程管理: PM2`);
console.log('');
console.log('🌐 访问地址：');
console.log(`   - API健康检查: http://81.70.191.44:${PORT}/api/health`);
console.log(`   - 统计API: http://81.70.191.44:${PORT}/api/stats`);
console.log('');
console.log('🔧 常用命令：');
console.log('   pm2 logs labor-rights-backend    # 查看日志');
console.log('   pm2 restart labor-rights-backend # 重启服务');
console.log('   pm2 stop labor-rights-backend    # 停止服务');
console.log('');
console.log('⚠️ 重要提醒：');
console.log('   请在宝塔面板 → 安全 → 放行端口 4000');
console.log('');

// 辅助函数
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
