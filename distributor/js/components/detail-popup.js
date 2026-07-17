class DetailPopup extends HTMLElement {
  constructor() {
    super();
    this._isOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 閉じるボタンとオーバーレイをクリックした際の処理
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-overlay') || e.target.classList.contains('popup-close-btn')) {
        this.close();
      }
    });
  }

  open(data) {
    this._isOpen = true;
    this.render(data);
    this.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 背後のスクロールを防止
  }

  close() {
    this._isOpen = false;
    this.style.display = 'none';
    document.body.style.overflow = '';
    this.dispatchEvent(new CustomEvent('popup-close', {
      bubbles: true,
      composed: true
    }));
  }

  render(data = {}) {
    const name = data.name || '号棟詳細';
    const status = data.status || 'normal';
    const appType = data.appType || '—';
    const contentName = data.contentName || '—';
    const id = data.id || '';
    const isError = status === 'error';

    this.innerHTML = `
      <style>
        detail-popup {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          font-family: var(--font-family);
        }

        .popup-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .popup-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          background-color: var(--bg-color-card);
          border: 2px solid ${isError ? 'var(--color-status-red)' : 'var(--color-cyan)'};
          border-radius: var(--border-radius-large);
          box-shadow: 0 0 30px ${isError ? 'rgba(255, 77, 77, 0.3)' : 'rgba(0, 210, 255, 0.3)'};
          overflow: hidden;
          z-index: 2;
          display: flex;
          flex-direction: column;
          animation: popupFadeIn 0.25s ease-out;
        }

        @keyframes popupFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        /* ヘッダー */
        .popup-header {
          padding: 18px 24px;
          border-bottom: 1px solid rgba(0, 210, 255, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .popup-title {
          font-size: 20px;
          font-weight: bold;
          color: var(--text-color-cyan);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .popup-status-badge {
          font-size: 15px;
          font-weight: bold;
          padding: 3px 8px;
          border-radius: var(--border-radius-small);
          color: #fff;
        }

        .popup-status-badge.status-normal {
          background-color: var(--color-status-green-bg);
          border: 1px solid var(--color-status-green);
        }

        .popup-status-badge.status-error {
          background-color: var(--color-status-red-bg);
          border: 1px solid var(--color-status-red);
        }

        .popup-close-btn {
          background-color: var(--color-status-red);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: var(--border-radius-small);
          cursor: pointer;
          position: relative;
          transition: all 0.15s;
          flex-shrink: 0;
          box-sizing: border-box;
          font-size: 0;
          color: transparent;
        }

        .popup-close-btn:hover {
          background-color: #ff2222;
        }

        .popup-close-btn::before,
        .popup-close-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 2px;
          background-color: #fff;
          border-radius: 1px;
        }

        .popup-close-btn::before {
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .popup-close-btn::after {
          transform: translate(-50%, -50%) rotate(-45deg);
        }

        /* コンテンツ */
        .popup-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 130px 1fr;
          row-gap: 16px;
          column-gap: 10px;
          font-size: 15px;
        }

        .info-label {
          color: var(--text-color-secondary);
          font-weight: 500;
        }

        .info-value {
          color: var(--text-color-primary);
        }

        /* エラー詳細用のアラートボックス */
        .error-alert-box {
          background-color: rgba(255, 77, 77, 0.08);
          border: 1px dashed var(--color-status-red);
          border-radius: var(--border-radius-medium);
          padding: 16px;
          display: flex;
          gap: 12px;
          color: var(--text-color-primary);
          font-size: 15px;
        }

        .error-alert-box svg {
          color: var(--color-status-red);
          flex-shrink: 0;
        }

        /* カメラセクション */
        .popup-camera-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .popup-camera-title {
          font-size: 15px;
          color: var(--text-color-secondary);
        }

        .popup-camera-feed {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 16 / 9;
          margin: 0 auto;
          background-color: var(--bg-color-camera);
          border: 1px solid rgba(0, 210, 255, 0.15);
          border-radius: var(--border-radius-medium);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-color-secondary);
          font-size: 15px;
        }

        /* ボタンエリア */
        .popup-footer-actions {
          padding: 14px 24px;
          border-top: 1px solid rgba(0, 210, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          gap: 16px;
          background-color: var(--bg-color-card);
          box-sizing: border-box;
        }

        .popup-btn {
          padding: 10px 24px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s;
        }

        .popup-btn.btn-cancel {
          background: transparent;
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
        }

        .popup-btn.btn-cancel:hover {
          background-color: rgba(0, 210, 255, 0.08);
          box-shadow: 0 0 8px var(--color-cyan-glow);
          color: var(--color-cyan);
        }

        .popup-btn.btn-primary {
          background-color: var(--color-cyan);
          border: 1.5px solid var(--color-cyan);
          color: var(--bg-color-main);
        }

        .popup-btn.btn-primary:hover {
          background-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
        }
      </style>

      <div class="popup-overlay"></div>
      <div class="popup-wrapper">
        <div class="popup-header">
          <div class="popup-title">
            <span>${name} 管理</span>
            <span class="popup-status-badge ${isError ? 'status-error' : 'status-normal'}">
              ${isError ? '通信エラー' : '正常稼働中'}
            </span>
          </div>
          <button class="popup-close-btn"></button>
        </div>
        <div class="popup-content">
          ${isError ? `
            <div class="error-alert-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <strong>警告: 接続タイムアウト</strong><br>
                配信サーバーとの通信が切断されています。ネットワーク接続および表示端末の電源状態を確認してください。
              </div>
            </div>
          ` : ''}

          <div class="info-grid">
            <div class="info-label">設置棟ID</div>
            <div class="info-value">${id}号棟</div>

            <div class="info-label">再生中システム</div>
            <div class="info-value">${appType}</div>

            <div class="info-label">現在再生タイトル</div>
            <div class="info-value">${contentName}</div>
          </div>

          <div class="popup-camera-section">
            <div class="popup-camera-title">監視カメラライブフィード</div>
            <div class="popup-camera-feed">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.5);">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>${isError ? 'カメラ信号オフライン' : 'ライブ配信準備完了 (クリックで再生)'}</span>
            </div>
          </div>
        </div>

        <div class="popup-footer-actions">
          <button class="popup-btn btn-cancel popup-close-btn">閉じる</button>
          <button class="popup-btn btn-primary">システム再起動</button>
        </div>
      </div>
    `;
  }
}

customElements.define('detail-popup', DetailPopup);
