// API测试脚本
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

// 测试函数
async function testAPI() {
    console.log('🧪 开始测试维权助手统计API...\n');

    try {
        // 1. 测试健康检查
        console.log('1. 测试健康检查...');
        await makeRequest('/health', 'GET');

        // 2. 测试记录点击
        console.log('\n2. 测试记录功能点击...');
        const clickData = {
            featureName: '测试功能-农民工讨薪',
            featureType: 'problem-selection'
        };
        await makeRequest('/track-click', 'POST', clickData);

        // 3. 再次记录点击
        console.log('\n3. 再次记录同一功能点击...');
        await makeRequest('/track-click', 'POST', clickData);

        // 4. 测试获取统计数据
        console.log('\n4. 测试获取统计数据...');
        await makeRequest('/stats?limit=10', 'GET');

        // 5. 测试获取热门功能
        console.log('\n5. 测试获取热门功能...');
        await makeRequest('/popular-features?limit=5', 'GET');

        // 6. 测试获取总点击次数
        console.log('\n6. 测试获取总点击次数...');
        await makeRequest('/total-clicks', 'GET');

        console.log('\n✅ 所有API测试完成！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 发送HTTP请求
function makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = API_BASE + endpoint;
        const parsedUrl = new URL(url);
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (method === 'POST' && data) {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    console.log(`   ✅ ${method} ${endpoint} - 状态码: ${res.statusCode}`);
                    console.log(`   📊 响应:`, JSON.stringify(result, null, 2));
                    resolve(result);
                } catch (error) {
                    console.log(`   ✅ ${method} ${endpoint} - 状态码: ${res.statusCode}`);
                    console.log(`   📄 原始响应:`, responseData);
                    resolve(responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`   ❌ ${method} ${endpoint} - 错误:`, error.message);
            reject(error);
        });

        if (method === 'POST' && data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// 运行测试
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };