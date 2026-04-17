class StatsTracker {
    constructor() {
        console.log('📊 StatsTracker 初始化');

        // 环境判断 - 配置API地址
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // 本地开发环境
            this.apiBaseUrl = 'http://localhost:4000/api';
        } else if (hostname.includes('github.io') || hostname.includes('githubusercontent.com')) {
            // GitHub Pages环境 - 使用腾讯云后端
            this.apiBaseUrl = 'http://81.70.191.44:4000/api';
        } else {
            // 其他环境（包括腾讯云服务器本身）
            this.apiBaseUrl = '/api';
        }
        
        console.log('🌐 API地址:', this.apiBaseUrl);

        // 防重复监听
        this._listenersBound = false;

        // 点击防抖（防止短时间重复点击）
        this._lastClickTime = 0;

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.bindGlobalClick();
        
        if (window.location.pathname.includes('stats.html')) {
            this.loadStats();
        }
    }

    // ✅ 全局点击监听（事件委托）
    bindGlobalClick() {
        if (this._listenersBound) return;
        this._listenersBound = true;

        console.log('🔗 绑定全局点击监听');

        document.addEventListener('click', (e) => {
            const el = e.target.closest('[data-track], a[href]');
            if (!el) return;

            let featureName = el.getAttribute('data-track') || el.textContent || '';
            let featureType = el.getAttribute('data-track-type') || 'navigation';

            featureName = this.normalizeName(featureName);

            // ❌ 过滤垃圾数据
            if (!featureName || this.isInvalidFeature(featureName)) return;

            // ⏱ 防止疯狂点击
            const now = Date.now();
            if (now - this._lastClickTime < 800) return;
            this._lastClickTime = now;

            this.trackFeatureClick(featureName, featureType);
        });

        console.log('✅ 监听已稳定运行');
    }

    // ✅ 名称统一处理
    normalizeName(name) {
        return name
            .replace(/\s+/g, '')
            .replace(/[\/]/g, '-')
            .trim();
    }

    // ❌ 过滤无效数据（放宽条件）
    isInvalidFeature(name) {
        return (
            !name || // 只过滤空值
            name.length < 1 // 允许单字符
        );
    }

    // ✅ 点击上报（带重试）
    async trackFeatureClick(featureName, featureType = 'general', retry = 0) {
        const maxRetries = 2;

        try {
            // 使用最简单的fetch配置，移除可能导致问题的signal
            const res = await fetch(`${this.apiBaseUrl}/track-click`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    featureName,
                    featureType
                })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            console.log(`📈 记录成功: ${featureName}`);
        } catch (err) {
            if (retry < maxRetries) {
                setTimeout(() => {
                    this.trackFeatureClick(featureName, featureType, retry + 1);
                }, 1000);
            } else {
                // ✅ 静默失败
                console.warn('⚠️ 统计失败（已忽略）:', featureName);
            }
        }
    }

    // ✅ 获取统计数据
    async getStats() {
        try {
            const res = await fetch(`${this.apiBaseUrl}/stats`);
            const data = await res.json();
            return data.stats || [];
        } catch {
            return [];
        }
    }

    async getTotalClicks() {
        try {
            const res = await fetch(`${this.apiBaseUrl}/total-clicks`);
            const data = await res.json();
            return data.totalClicks || 0;
        } catch {
            return 0;
        }
    }

    // ✅ 加载统计
    async loadStats() {
        const stats = await this.getStats();
        const total = await this.getTotalClicks();
        this.renderStats(stats, total);
    }

    // ✅ 渲染（时间稳定版）
    renderStats(stats, total) {
        const container = document.getElementById('stats-container');
        if (!container) return;

        if (!stats.length) {
            container.innerHTML = `<p style="text-align:center;">暂无数据</p>`;
            return;
        }

        let html = `
            <h2 style="text-align:center;">总点击次数：${total}</h2>
            <p style="text-align:center;">${new Date().toLocaleString()}</p>
        `;

       stats.forEach((item, i) => {
        const raw = item.last_clicked || item.timestamp;
  
        const time = new Date(
        typeof raw === 'string' && !raw.includes('T')
            ? raw.replace(' ', 'T') + 'Z'
            : raw
    ).toLocaleString('zh-CN', {
        hour12: false,
        timeZone: 'Asia/Shanghai'
    });
            html += `
                <div style="display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #eee;">
                    <span>${i + 1}. ${item.feature_name}</span>
                    <span>${item.click_count}次</span>
                    <span style="color:#888;">${time}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }
}

// 初始化
const statsTracker = new StatsTracker();

// 全局调用
window.trackFeature = (name, type) => {
    statsTracker.trackFeatureClick(name, type);
};
