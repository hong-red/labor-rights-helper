// js/script.js - 维权助手公共脚本（优化版）

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.toLowerCase(); // 兼容大小写

    if (path.includes('problem.html')) {
        renderProblemPage();
    } else if (path.includes('result.html')) {
        renderResultPage();
    } else if (path.includes('print.html')) {
        // 延时渲染后再打印，避免内容未加载
        setTimeout(renderPrintPage, 300);
    }
});

function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    if (queryString) {
        queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    }
    return params;
}

function renderProblemPage() {
    const params = getQueryParams();
    const type = params.type || 'nongmingong';
    const container = document.getElementById('problem-list');

    if (!container) return;

    const identity = 维权数据.identities[type];
    if (!identity) {
        container.innerHTML = '<p style="text-align:center; color:red;">未找到该身份类型，请返回首页。</p>';
        return;
    }

    let html = `<h2 style="text-align:center; margin:20px 0;">${identity.label}</h2>`;
    for (const key in identity.problems) {
        const prob = identity.problems[key];
        html += `
            <a href="result.html?type=${type}&problem=${key}" class="card big-btn" style="display:block; margin:16px 0; text-decoration:none;">
                ${prob.title}
            </a>`;
    }
    container.innerHTML = html;
}

function renderResultPage() {
    const params = getQueryParams();
    const type = params.type || 'nongmingong';
    const problemKey = params.problem || 'qianxin';
    const titleEl = document.getElementById('result-title');
    const contentEl = document.getElementById('result-content');

    if (!titleEl || !contentEl) return;

    const identity = 维权数据.identities[type];
    const problem = identity?.problems?.[problemKey];

    if (!identity || !problem) {
        contentEl.innerHTML = '<p style="text-align:center; color:red; padding:40px 0;">未找到相关问题，请返回重试。</p>';
        return;
    }

    titleEl.textContent = `${identity.label} - ${problem.title}`;

    let html = '';

    // 证据（可展开 tip）
    html += '<div class="card"><h2>1. 先收集这些证据（最重要！）</h2><ul class="evidence-list">';
    problem.evidence.forEach(item => {
        html += `<li><details><summary><strong>${item.name}</strong></summary><p>${item.tip}</p></details></li>`;
    });
    html += '</ul></div>';

    // 下一步行动
    if (problem.next_steps?.length) {
        html += '<div class="card"><h2>2. 后续行动建议</h2><ul>';
        problem.next_steps.forEach(s => html += `<li>${s}</li>`);
        html += '</ul></div>';
    }

    // 重要提示
    if (problem.important_tips?.length) {
        html += '<div class="card"><h2>3. 重要提醒</h2><ul>';
        problem.important_tips.forEach(t => html += `<li>${t}</li>`);
        html += '</ul></div>';
    }

    // 常用电话（数组格式处理）
    if (problem.common_phones?.length) {
        html += '<div class="card"><h2>4. 立即拨打这些电话（优先顺序）</h2>';
        problem.common_phones.forEach(str => {
            const [numDesc] = str.split('（'); // 取主要号码部分
            const num = numDesc.match(/\d+/)?.[0] || '';
            const desc = str;
            html += `
                <div class="phone-item">
                    <a href="tel:${num}" class="phone">📞 ${desc}</a>
                    ${num ? `<button class="copy-btn" onclick="copyPhone('${num}')">复制号码</button>` : ''}
                </div>`;
        });
        html += '</div>';
    }

    // 省份选择 + 动态电话（简化，只显示全国 + 省份补充）
    html += `
        <div class="card">
            <h2>5. 省份相关电话（切换查看）</h2>
            <select id="province-select">
                <option value="00">全国通用（推荐）</option>
                ${Object.entries(维权数据.provinces).filter(([k]) => k !== '00').map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
            </select>
            <div id="province-phones"></div>
        </div>`;

    // 法律援助（统一导流12348）
    html += `
        <div class="card">
            <h2>6. 申请法律援助</h2>
            <p>带身份证 + 证据 → 拨打12348咨询就近法律援助中心（农民工讨薪免经济困难证明）</p>
            <p>各地地址变动大，建议直接打12348获取最新指引，或微信搜索“掌上12348”小程序查询。</p>
        </div>`;

    // 行动按钮
    html += `
        <button class="big-btn orange" onclick="goToPrint('${type}', '${problemKey}')">一键打印证据清单</button>
        <button class="big-btn blue" id="copy-all">复制全部内容分享</button>`;

    contentEl.innerHTML = html;

    // 省份切换
    const select = document.getElementById('province-select');
    const phonesDiv = document.getElementById('province-phones');
    function updateProv() {
        const code = select.value;
        const prov = 维权数据.provinces[code] || 维权数据.provinces['00'];
        let pHtml = '<ul>';
        for (const [name, desc] of Object.entries(prov.phones || {})) {
            const num = desc.match(/\d+/)?.[0] || '';
            pHtml += `<li>📞 <a href="tel:${num}">${name}: ${desc}</a></li>`;
        }
        pHtml += '</ul>';
        phonesDiv.innerHTML = pHtml;
    }
    select.addEventListener('change', updateProv);
    updateProv(); // 初始

    // 复制全部
    document.getElementById('copy-all')?.addEventListener('click', () => {
        const text = document.getElementById('result-content').innerText;
        navigator.clipboard.writeText(text).then(() => alert('已复制全部内容！')).catch(() => alert('复制失败，请手动选中文本复制'));
    });
}

function goToPrint(type, problem) {
    window.open(`print.html?type=${type}&problem=${problem}`, '_blank');
}

function copyPhone(num) {
    navigator.clipboard.writeText(num).then(() => alert(`已复制：${num}`)).catch(() => alert('复制失败'));
}

function renderPrintPage() {
    const params = getQueryParams();
    const type = params.type || 'nongmingong';
    const problemKey = params.problem || 'qianxin';
    const contentDiv = document.getElementById('print-content');

    if (!contentDiv) return;

    const identity = 维权数据.identities[type];
    const problem = identity?.problems?.[problemKey];

    if (!identity || !problem) {
        contentDiv.innerHTML = '<p>参数错误，无法加载清单</p>';
        return;
    }

    let html = `<h1>${identity.label} - ${problem.title} 证据清单</h1>
                <h2>1. 需要准备的证据</h2><ul>`;

    problem.evidence.forEach(item => {
        html += `<li><strong>${item.name}</strong><br>${item.tip}</li>`;
    });
    html += '</ul>';

    if (problem.next_steps?.length) {
        html += '<h2>2. 后续行动建议</h2><ul>';
        problem.next_steps.forEach(s => html += `<li>${s}</li>`);
        html += '</ul>';
    }

    if (problem.important_tips?.length) {
        html += '<h2>3. 重要提醒</h2><ul>';
        problem.important_tips.forEach(t => html += `<li>${t}</li>`);
        html += '</ul>';
    }

    if (problem.common_phones?.length) {
        html += '<h2>4. 常用电话</h2><ul>';
        problem.common_phones.forEach(p => html += `<li>${p}</li>`);
        html += '</ul>';
    }

    html += '<h2>5. 法律援助指引</h2><p>拨打12348免费咨询就近中心，农民工讨薪免经济证明。带身份证+证据前往。</p>';

    contentDiv.innerHTML = html;

    // 自动打印（加延时确保渲染完）
    setTimeout(() => {
        if (confirm('内容已加载完成，是否立即打印？')) {
            window.print();
        }
    }, 800);
}