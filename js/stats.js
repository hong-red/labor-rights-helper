// 统计功能模块
class StatsTracker {
    constructor() {
      this.apiBaseUrl = 'http://81.70.191.44:3000/api';
        this.init();
    }

    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // 为所有可点击的功能元素添加统计
        this.trackClicks();
        
        // 如果当前页面是统计页面，加载统计数据
        if (window.location.pathname.includes('stats.html')) {
            this.loadStats();
        }
    }

    // 记录功能点击
    async trackFeatureClick(featureName, featureType = 'general') {
        try {
            const response = await fetch(`${this.apiBaseUrl}/track-click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    featureName: featureName,
                    featureType: featureType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('点击记录成功:', data);
            return data;
        } catch (error) {
            console.error('记录点击失败:', error);
            // 静默失败，不影响用户体验
            return null;
        }
    }

    // 获取统计数据
    async getStats(type = null, limit = 50) {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (limit) params.append('limit', limit);

            const response = await fetch(`${this.apiBaseUrl}/stats?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.stats;
        } catch (error) {
            console.error('获取统计数据失败:', error);
            return [];
        }
    }

    // 获取热门功能
    async getPopularFeatures(limit = 10) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/popular-features?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.popularFeatures;
        } catch (error) {
            console.error('获取热门功能失败:', error);
            return [];
        }
    }

    // 获取总点击次数
    async getTotalClicks() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/total-clicks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.totalClicks;
        } catch (error) {
            console.error('获取总点击次数失败:', error);
            return 0;
        }
    }

    // 设置点击追踪
    trackClicks() {
        // 为所有带有 data-track 属性的元素添加点击追踪
        const trackableElements = document.querySelectorAll('[data-track]');
        
        trackableElements.forEach(element => {
            element.addEventListener('click', (e) => {
                const featureName = element.getAttribute('data-track');
                const featureType = element.getAttribute('data-track-type') || 'general';
                
                this.trackFeatureClick(featureName, featureType);
            });
        });

        // 为链接添加追踪
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                
                // 根据链接内容生成功能名称
                let featureName = text || href;
                if (href.includes('problem.html')) {
                    const url = new URL(href, window.location.origin);
                    const type = url.searchParams.get('type');
                    featureName = `问题列表-${type}`;
                } else if (href.includes('result.html')) {
                    const url = new URL(href, window.location.origin);
                    const type = url.searchParams.get('type');
                    const problem = url.searchParams.get('problem');
                    featureName = `解决方案-${type}-${problem}`;
                }
                
                this.trackFeatureClick(featureName, 'navigation');
            });
        });
    }

    // 加载并显示统计数据
    async loadStats() {
        try {
            const stats = await this.getStats();
            const totalClicks = await this.getTotalClicks();
            
            this.renderStats(stats, totalClicks);
        } catch (error) {
            console.error('加载统计数据失败:', error);
        }
    }

    // 渲染统计数据
    renderStats(stats, totalClicks) {
        const container = document.getElementById('stats-container');
        if (!container) {
            console.error('统计容器未找到');
            return;
        }

        if (stats.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-chart-bar" style="font-size: 48px; margin-bottom: 20px; color: #1e40af;"></i>
                    <h3>暂无统计数据</h3>
                    <p>请先使用网站功能，数据会自动记录</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px;">
                        返回首页
                    </a>
                </div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e3e9ff); border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 1.5rem;">
                    <i class="fas fa-chart-line"></i> 统计概览
                </h3>
                <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: #1e40af;">${totalClicks}</div>
                        <div style="color: #666; font-size: 0.9rem;">总点击次数</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; color: #1e40af;">${stats.length}</div>
                        <div style="color: #666; font-size: 0.9rem;">功能数量</div>
                    </div>
                </div>
            </div>
            
            <div style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white;">
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600;">排名</th>
                            <th style="padding: 15px 12px; text-align: left; font-weight: 600;">功能名称</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600;">类型</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600;">点击次数</th>
                            <th style="padding: 15px 12px; text-align: center; font-weight: 600;">最后点击</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        stats.forEach((stat, index) => {
            const lastClicked = new Date(stat.last_clicked).toLocaleString('zh-CN');
            const rankColor = index < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][index] : '#666';
            const rankIcon = index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`;
            
            html += `
                <tr style="border-bottom: 1px solid #eee; transition: background-color 0.2s;">
                    <td style="padding: 15px 12px; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 1.2rem;">
                        ${rankIcon}
                    </td>
                    <td style="padding: 15px 12px; font-weight: 500; color: #1e3a8a;">${stat.feature_name}</td>
                    <td style="padding: 15px 12px; text-align: center;">
                        <span style="padding: 6px 12px; background: #e3e9ff; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 500;">
                            ${stat.feature_type}
                        </span>
                    </td>
                    <td style="padding: 15px 12px; text-align: center; font-weight: bold; color: #1e40af; font-size: 1.2rem;">
                        ${stat.click_count}
                    </td>
                    <td style="padding: 15px 12px; text-align: center; color: #666; font-size: 0.9rem;">
                        ${lastClicked}
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 0.9rem;">
                <i class="fas fa-info-circle"></i> 数据每30秒自动更新
            </div>
        `;

        container.innerHTML = html;
    }
}

// 初始化统计追踪器
const statsTracker = new StatsTracker();

// 全局访问方法
window.trackFeature = (featureName, featureType) => {
    return statsTracker.trackFeatureClick(featureName, featureType);
};

window.getStats = (type, limit) => {
    return statsTracker.getStats(type, limit);
};