// グローバル変数
let currentPhrases = [];

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// アプリケーション初期化
function initializeApp() {
    console.log('Lyrical Cutup Studio 初期化中...');
}

// イベントリスナー設定
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const generateBtn = document.getElementById('generate-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const downloadBtn = document.getElementById('download-btn');

    console.log('Generate button found:', generateBtn);
    console.log('Copy all button found:', copyAllBtn);
    console.log('Download button found:', downloadBtn);

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            console.log('Generate button clicked!');
            generateCutup();
        });
        console.log('Generate button event listener added');
    } else {
        console.error('Generate button not found!');
    }

    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', copyAllPhrases);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPhrases);
    }
}

// カットアップ生成
async function generateCutup() {
    const count = parseInt(document.getElementById('phrase-count').value) || 50;
    
    if (count < 1 || count > 100) {
        showMessage('フレーズ数は1〜100の間で指定してください', 'error');
        return;
    }

    console.log('Starting phrase generation with count:', count);
    showLoading(true);

    try {
        console.log('Sending request to /api/generate');
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count: count })
        });

        console.log('Response received:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Response data:', result);

        if (result.error) {
            throw new Error(result.error);
        }

        currentPhrases = result.phrases;
        displayPhrasesWithSources(result.phrases);
        showMessage(`${result.count}個のフレーズを生成しました`, 'success');
        
    } catch (error) {
        console.error('Generation error:', error);
        showMessage('生成エラー: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// 由来情報付きフレーズ表示
function displayPhrasesWithSources(phrases) {
    const container = document.getElementById('phrases-container');
    const resultsSection = document.getElementById('results-section');

    if (!container) {
        console.error('Phrases container not found!');
        return;
    }

    if (!resultsSection) {
        console.error('Results section not found!');
        return;
    }

    container.innerHTML = phrases.map((phraseObj, index) => {
        const sourceInfo = phraseObj.sources.map(source => 
            `${source.word} (${source.filename})`
        ).join(', ');
        
        return `
            <div class="phrase-item" onclick="copyPhraseText('${phraseObj.text.replace(/'/g, "\\'")}')">
                <div class="phrase-text">${phraseObj.text}</div>
                <div class="phrase-sources" title="${sourceInfo}">
                    <i class="fas fa-info-circle"></i>
                    <span class="source-text">由来を表示</span>
                </div>
            </div>
        `;
    }).join('');

    // ツールチップイベントを設定
    setupTooltipEvents();

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    console.log('Phrases displayed successfully:', phrases.length);
}

// ツールチップイベント設定
function setupTooltipEvents() {
    const phraseItems = document.querySelectorAll('.phrase-item');
    
    phraseItems.forEach((item, index) => {
        const sourcesDiv = item.querySelector('.phrase-sources');
        const phraseObj = currentPhrases[index];
        
        if (sourcesDiv && phraseObj) {
            // PC用：マウスオーバー
            sourcesDiv.addEventListener('mouseenter', (e) => {
                showTooltip(e, phraseObj.sources);
            });
            
            sourcesDiv.addEventListener('mouseleave', hideTooltip);
            
            // モバイル用：タップ
            sourcesDiv.addEventListener('click', (e) => {
                e.stopPropagation(); // フレーズコピーを防ぐ
                toggleMobileTooltip(e, phraseObj.sources);
            });
        }
    });
}

// ツールチップ表示
function showTooltip(event, sources) {
    hideTooltip(); // 既存のツールチップを削除
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = `
        <div class="tooltip-content">
            <h4>フレーズの由来</h4>
            ${sources.map(source => 
                `<div class="source-item">
                    <span class="source-word">${source.word}</span>
                    <span class="source-file">${source.filename}</span>
                </div>`
            ).join('')}
        </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // 位置調整
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    
    // 画面外に出る場合の調整
    if (tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
        tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
    }
    if (tooltip.offsetTop < 0) {
        tooltip.style.top = (rect.bottom + 10) + 'px';
    }
}

// ツールチップ非表示
function hideTooltip() {
    const existingTooltip = document.querySelector('.tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }
}

// モバイル用ツールチップ切り替え
function toggleMobileTooltip(event, sources) {
    const existingTooltip = document.querySelector('.mobile-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
        return;
    }
    
    const tooltip = document.createElement('div');
    tooltip.className = 'mobile-tooltip';
    tooltip.innerHTML = `
        <div class="mobile-tooltip-content">
            <div class="mobile-tooltip-header">
                <h4>フレーズの由来</h4>
                <button class="close-tooltip" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            ${sources.map(source => 
                `<div class="source-item">
                    <span class="source-word">${source.word}</span>
                    <span class="source-file">${source.filename}</span>
                </div>`
            ).join('')}
        </div>
    `;
    
    document.body.appendChild(tooltip);
}

// フレーズテキストコピー
function copyPhraseText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('フレーズをコピーしました', 'info');
    }).catch(err => {
        console.error('Copy error:', err);
        showMessage('コピーに失敗しました', 'error');
    });
}

// 全フレーズコピー
function copyAllPhrases() {
    if (currentPhrases.length === 0) {
        showMessage('コピーするフレーズがありません', 'error');
        return;
    }

    const allText = currentPhrases.map(phrase => phrase.text).join('\n');
    
    navigator.clipboard.writeText(allText).then(() => {
        showMessage('全フレーズをコピーしました', 'success');
    }).catch(err => {
        console.error('Copy error:', err);
        showMessage('コピーに失敗しました', 'error');
    });
}

// フレーズダウンロード
function downloadPhrases() {
    if (currentPhrases.length === 0) {
        showMessage('ダウンロードするフレーズがありません', 'error');
        return;
    }

    const content = currentPhrases.map(phrase => phrase.text).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cutup-phrases-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage('フレーズをダウンロードしました', 'success');
}

// ローディング表示/非表示
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
        console.log('Loading display set to:', show ? 'flex' : 'none');
    } else {
        console.error('Loading element not found!');
    }
}

// メッセージ表示
function showMessage(text, type = 'info') {
    const message = document.getElementById('message');
    if (message) {
        message.textContent = text;
        message.className = `message ${type}`;
        message.classList.add('show');

        setTimeout(() => {
            message.classList.remove('show');
        }, 3000);
        console.log('Message displayed:', text, type);
    } else {
        console.error('Message element not found!');
        // フォールバック: alertを使用
        alert(text);
    }
}

// エラーハンドリング
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    let errorMessage = '予期しないエラーが発生しました';
    if (event.error && event.error.message) {
        errorMessage += ': ' + event.error.message;
    }
    showMessage(errorMessage, 'error');
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    let errorMessage = '通信エラーが発生しました';
    if (event.reason) {
        if (typeof event.reason === 'string') {
            errorMessage += ': ' + event.reason;
        } else if (event.reason.message) {
            errorMessage += ': ' + event.reason.message;
        }
    }
    showMessage(errorMessage, 'error');
});
