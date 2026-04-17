// 劳动维权帮助助手 - 腾讯云后端部署脚本 (Node.js版本)
// 使用方法: node deploy.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_IP = '81.70.191.44';
const SERVER_USER = 'ubuntu';
const REMOTE_DIR = '/home/ubuntu/labor-rights-helper';

console.log('🚀 开始部署后端到腾讯云服务器...\n');

// 检查本地环境
console.log('📋 检查本地环境...');
if (!fs.existsSync('server-4000.js')) {
    console.error('❌ 错误：请在项目根目录运行此脚本');
    process.exit(1);
}
console.log('✅ 本地文件检查通过\n');

// 创建部署包
console.log('📦 创建部署包...');
const deployDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'deploy-'));
const projectDir = path.join(deployDir, 'labor-rights-helper');
fs.mkdirSync(projectDir, { recursive: true });

// 复制文件
const filesToCopy = ['server-4000.js', 'package.json', 'Dockerfile', 'docker-compose.yml', 'nginx.conf'];
const dirsToCopy = ['backend'];

filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(projectDir, file));
    }
});

dirsToCopy.forEach(dir => {
    if (fs.existsSync(dir)) {
        copyDir(dir, path.join(projectDir, dir));
    }
});

// 创建启动脚本
const startScript = `#!/bin/bash
cd "$(dirname "$0")"

# 安装依赖
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装依赖..."
    cd backend && npm install && cd ..
fi

# 使用PM2启动
if command -v pm2 &> /dev/null; then
    echo "🚀 使用PM2启动..."
    pm2 stop labor-rights-backend 2>/dev/null || true
    pm2 delete labor-rights-backend 2>/dev/null || true
    pm2 start server-4000.js --name "labor-rights-backend"
    pm2 save
else
    echo "🚀 直接启动..."
    nohup node server-4000.js > app.log 2>&1 &
fi

echo "✅ 后端启动完成"
echo "🌐 API地址: http://${SERVER_IP}:4000"
`;

fs.writeFileSync(path.join(projectDir, 'start.sh'), startScript);
console.log('✅ 部署包创建完成\n');

// 压缩
console.log('📦 压缩部署包...');
const tarPath = path.join(deployDir, 'labor-rights-backend.tar.gz');
execSync(`tar -czf "${tarPath}" -C "${deployDir}" labor-rights-helper`, { stdio: 'inherit' });
console.log('✅ 压缩完成\n');

// 预先添加主机密钥到known_hosts
console.log('🔑 配置SSH连接...');
try {
    execSync(`ssh-keyscan -H ${SERVER_IP} >> %USERPROFILE%/.ssh/known_hosts 2>nul`, { stdio: 'ignore' });
} catch (e) {
    // 忽略错误
}
console.log('✅ SSH配置完成\n');

// 上传到服务器
console.log('📤 上传到服务器...');
console.log('💡 提示: 需要输入服务器密码\n');

try {
    // 使用StrictHostKeyChecking=no自动接受主机密钥
    execSync(`scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "${tarPath}" ${SERVER_USER}@${SERVER_IP}:/tmp/`, { stdio: 'inherit' });
    console.log('✅ 上传成功\n');
} catch (error) {
    console.error('❌ 上传失败');
    console.log('\n请检查:');
    console.log('   1. 服务器IP是否正确:', SERVER_IP);
    console.log('   2. 用户名是否正确:', SERVER_USER);
    console.log('   3. 服务器是否开启SSH');
    console.log('   4. 是否有SSH密钥或密码');
    console.log('\n或者使用手动部署:');
    console.log('   scp -r . ubuntu@81.70.191.44:/home/ubuntu/labor-rights-helper');
    process.exit(1);
}

// 在服务器上执行部署
console.log('🚀 在服务器上部署...\n');

const remoteCommands = `
    mkdir -p ${REMOTE_DIR}
    
    if [ -f "${REMOTE_DIR}/backend/stats.db" ]; then
        echo "💾 备份数据库..."
        cp ${REMOTE_DIR}/backend/stats.db /tmp/stats.db.backup
    fi
    
    cd /tmp
    tar -xzf labor-rights-backend.tar.gz
    cp -r labor-rights-helper/* ${REMOTE_DIR}/
    
    if [ -f "/tmp/stats.db.backup" ]; then
        echo "💾 恢复数据库..."
        cp /tmp/stats.db.backup ${REMOTE_DIR}/backend/stats.db
    fi
    
    cd ${REMOTE_DIR}
    chmod +x start.sh
    ./start.sh
    
    rm -f /tmp/labor-rights-backend.tar.gz
    rm -f /tmp/stats.db.backup
    
    echo "✅ 部署完成"
`;

try {
    execSync(`ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${SERVER_USER}@${SERVER_IP} "${remoteCommands}"`, { stdio: 'inherit' });
} catch (error) {
    console.error('❌ 服务器部署失败');
    process.exit(1);
}

// 清理
fs.rmSync(deployDir, { recursive: true, force: true });

console.log('\n🎉 后端部署成功！\n');
console.log('📊 部署信息：');
console.log('   - 服务器IP:', SERVER_IP);
console.log('   - API端口: 4000');
console.log('   - 部署目录:', REMOTE_DIR);
console.log('');
console.log('🌐 访问地址：');
console.log('   - API健康检查: http://' + SERVER_IP + ':4000/api/health');
console.log('   - 统计API: http://' + SERVER_IP + ':4000/api/stats');
console.log('');
console.log('🔧 常用命令：');
console.log('   ssh ' + SERVER_USER + '@' + SERVER_IP);
console.log('   cd ' + REMOTE_DIR);
console.log('   pm2 logs labor-rights-backend    # 查看日志');
console.log('   pm2 restart labor-rights-backend # 重启服务');

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
