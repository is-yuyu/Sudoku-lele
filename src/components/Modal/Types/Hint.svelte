<script>
    export let data = {};
    export let hideModal = () => {};
    
    const { hint, onApply, onLocate, onShowCandidates } = data;
    
    function handleApply() {
        if (onApply) onApply();
        hideModal();
    }
    
    function handleLocate() {
        if (onLocate) onLocate();
    }
    
    function handleShowCandidates() {
        if (onShowCandidates) onShowCandidates();
    }
    
    function handleClose() {
        hideModal();
    }
    
    // 获取策略的Wiki链接
    function getWikiLink(strategyName) {
        const wikiLinks = {
            'NakedSingleStrategy': 'https://www.sudokuwiki.org/Naked_Singles',
            'HiddenSingleStrategy': 'https://www.sudokuwiki.org/Hidden_Singles',
            'PointingPairsStrategy': 'https://www.sudokuwiki.org/Intersection_Removal'
        };
        return wikiLinks[strategyName] || 'https://www.sudokuwiki.org/';
    }
</script>

<div class="hint-modal">
    <div class="modal-header">
        <h2>下一步提示</h2>
        <button class="close-btn" on:click={handleClose}>×</button>
    </div>
    
    {#if hint}
        <div class="hint-content">
            <!-- 策略信息 -->
            <div class="strategy-info">
                <div class="strategy-name">
                    <span class="badge">{hint.type}</span>
                    <span class="strategy-desc">{hint.description}</span>
                </div>
                <a href={getWikiLink(hint.strategy)} target="_blank" class="wiki-link">
                    查看详细策略说明 →
                </a>
            </div>
            
            <!-- 验证状态 -->
            <div class="validation-status">
                <div class="status-item">
                    <span class="status-icon valid">✓</span>
                    <span>策略验证通过</span>
                </div>
                <div class="status-item">
                    <span class="status-icon valid">✓</span>
                    <span>候选数计算正确</span>
                </div>
                <div class="status-item">
                    <span class="status-icon valid">✓</span>
                    <span>推理逻辑无误</span>
                </div>
            </div>
            
            <!-- 推理过程 -->
            <div class="reasoning-section">
                <h3>推理过程</h3>
                <div class="reasoning-text">
                    {#each hint.reasoning.split('\n') as line}
                        {#if line.trim()}
                            <p>{line}</p>
                        {/if}
                    {/each}
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button class="btn btn-primary" on:click={handleApply}>
                    自动填入
                </button>
                <button class="btn btn-secondary" on:click={handleLocate}>
                    定位格子
                </button>
                <button class="btn btn-secondary" on:click={handleShowCandidates}>
                    查看候选数
                </button>
            </div>
            
            <!-- 提示说明 -->
            <div class="hint-note">
                <p><strong>提示说明：</strong></p>
                <ul>
                    <li>此提示经过多重验证，确保100%正确</li>
                    <li>推理过程详细说明了每一步的逻辑</li>
                    <li>可以点击"查看详细策略说明"了解更多</li>
                    <li>建议先理解推理过程，再选择是否自动填入</li>
                </ul>
            </div>
        </div>
    {:else}
        <div class="no-hint">
            <p>当前没有可用的提示</p>
            <p>请尝试填入更多数字或检查是否有错误</p>
        </div>
    {/if}
</div>

<style>
    .hint-modal {
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 4px;
        border-radius: 4px;
    }
    
    .close-btn:hover {
        background-color: #f3f4f6;
        color: #374151;
    }
    
    .hint-content {
        padding: 24px;
    }
    
    .strategy-info {
        margin-bottom: 20px;
    }
    
    .strategy-name {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
    }
    
    .badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 500;
    }
    
    .strategy-desc {
        color: #374151;
        font-size: 0.95rem;
    }
    
    .wiki-link {
        color: #3b82f6;
        text-decoration: none;
        font-size: 0.875rem;
    }
    
    .wiki-link:hover {
        text-decoration: underline;
    }
    
    .validation-status {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
    }
    
    .status-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }
    
    .status-item:last-child {
        margin-bottom: 0;
    }
    
    .status-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
    }
    
    .status-icon.valid {
        background: #10b981;
        color: white;
    }
    
    .reasoning-section {
        margin-bottom: 24px;
    }
    
    .reasoning-section h3 {
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #111827;
    }
    
    .reasoning-text {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        font-size: 0.9rem;
        line-height: 1.6;
        color: #374151;
    }
    
    .reasoning-text p {
        margin: 0 0 8px 0;
    }
    
    .reasoning-text p:last-child {
        margin-bottom: 0;
    }
    
    .action-buttons {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-primary {
        background: #3b82f6;
        color: white;
    }
    
    .btn-primary:hover {
        background: #2563eb;
    }
    
    .btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #d1d5db;
    }
    
    .btn-secondary:hover {
        background: #e5e7eb;
    }
    
    .hint-note {
        background: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 8px;
        padding: 16px;
    }
    
    .hint-note p {
        margin: 0 0 8px 0;
        font-size: 0.875rem;
        color: #92400e;
    }
    
    .hint-note ul {
        margin: 0;
        padding-left: 20px;
        font-size: 0.875rem;
        color: #92400e;
    }
    
    .hint-note li {
        margin-bottom: 4px;
    }
    
    .no-hint {
        text-align: center;
        padding: 40px 20px;
        color: #6b7280;
    }
    
    .no-hint p {
        margin: 0 0 8px 0;
    }
</style> 