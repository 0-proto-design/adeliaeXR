class BuildingCard extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['id', 'name', 'status', 'app-type', 'content-name'];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    const detailBtn = this.querySelector('.detail-btn');
    if (detailBtn) {
      detailBtn.addEventListener('click', (e) => {
        const id = this.getAttribute('id');
        const defaultName = this.getAttribute('name') || '';
        const name = localStorage.getItem(`adeliae_building_name_${id}`) || defaultName;
        this.dispatchEvent(new CustomEvent('detail-click', {
          detail: {
            id: id,
            name: name,
            status: this.getAttribute('status'),
            appType: this.getAttribute('app-type'),
            contentName: this.getAttribute('content-name')
          },
          bubbles: true,
          composed: true
        }));
      });
    }

    const zoomBtn = this.querySelector('.zoom-btn');
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = this.getAttribute('id');
        const defaultName = this.getAttribute('name') || '';
        const name = localStorage.getItem(`adeliae_building_name_${id}`) || defaultName;
        this.dispatchEvent(new CustomEvent('camera-zoom-click', {
          detail: {
            id: id,
            name: name
          },
          bubbles: true,
          composed: true
        }));
      });
    }
  }

  render() {
    const id = this.getAttribute('id') || '';
    const defaultName = this.getAttribute('name') || '';
    const name = localStorage.getItem(`adeliae_building_name_${id}`) || defaultName;
    const status = this.getAttribute('status') || 'normal';
    const appType = this.getAttribute('app-type') || '—';
    const contentName = this.getAttribute('content-name') || '—';
    
    const isError = status === 'error';
    const cardClass = isError ? 'building-card error' : 'building-card';

    this.innerHTML = `
      <style>
        .building-card {
          background-color: var(--bg-color-card);
          border: 1px solid rgba(0, 210, 255, 0.2);
          border-radius: var(--border-radius-large);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          min-height: 260px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* エラー時の赤枠 */
        .building-card.error {
          border: 2px solid var(--color-status-red);
          background-color: var(--bg-color-card-error);
          box-shadow: 0 0 15px rgba(255, 77, 77, 0.2);
        }

        /* ステータスバッジ */
        .status-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-small);
          color: var(--text-color-primary);
          margin-bottom: 12px;
          margin-right: 240px; /* 右上のカメラプレビューとの重なり防止 */
        }

        .status-badge.status-normal {
          background-color: var(--color-status-green-bg);
          border: 1px solid var(--color-status-green);
        }

        .status-badge.status-normal::before {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--color-status-green);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--color-status-green);
        }

        .status-badge.status-error {
          background-color: var(--color-status-red-bg);
          border: 1px solid var(--color-status-red);
        }

        .status-badge.status-error svg {
          color: var(--color-status-red);
        }

        /* タイトル */
        .card-title {
          font-size: 26px;
          font-weight: bold;
          color: var(--text-color-cyan);
          margin-bottom: 20px;
          letter-spacing: 0.05em;
          margin-right: 280px; /* 右上のカメラプレビューとの重なり防止 */
        }

        /* レイアウト分割 */
        .card-body {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex: 1;
        }

        /* 左側：詳細テキスト */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          margin-right: 280px; /* 右上のカメラプレビューとの重なり防止 */
        }

        .info-row {
          display: flex;
          font-size: 15px;
        }

        .info-label {
          color: var(--text-color-secondary);
          width: 100px;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .info-value {
          color: var(--text-color-primary);
          word-break: break-all;
        }

        /* 右側：監視カメラエリア（右上に絶対配置） */
        .camera-preview-container {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 240px; /* プレビューサイズを少し大きく（220pxから240pxへ） */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .camera-preview {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background-color: var(--bg-color-camera);
          border: 1px solid rgba(143, 160, 192, 0.25);
          border-radius: var(--border-radius-medium);
          overflow: hidden;
        }

        .camera-snapshot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .camera-control-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
        }

        .camera-label {
          font-size: 13px;
          color: var(--text-color-secondary); /* やや薄めのテキスト色 */
          font-weight: normal; /* 細いフォントウェイト */
          letter-spacing: 0.05em;
        }

        .zoom-btn {
          background-color: transparent;
          border: 1px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: bold;
          border-radius: var(--border-radius-small);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 0 4px var(--color-cyan-glow);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          line-height: 1.2;
          flex-shrink: 0;
        }

        .zoom-btn:hover {
          background-color: var(--color-cyan);
          color: var(--bg-color-main);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }

        /* 下部エリア */
        .card-footer {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-top: 16px;
        }



        /* 詳細/管理 ボタン */
        .detail-btn {
          background-color: var(--color-cyan);
          border: 1.5px solid var(--color-cyan);
          color: var(--bg-color-main);
          padding: 8px 28px 8px 36px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 210, 255, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .detail-btn:hover {
          background-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
        }

        .detail-btn:active {
          transform: scale(0.97);
        }
      </style>

      <div class="${cardClass}">
        <!-- ステータスバッジ -->
        ${isError ? `
          <div class="status-badge status-error">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            通信エラー
          </div>
        ` : `
          <div class="status-badge status-normal">
            正常稼働中
          </div>
        `}

        <!-- 建物名 -->
        <div class="card-title">${name}</div>

        <!-- コンテンツ部 -->
        <div class="card-body">
          <div class="info-section">
            <div class="info-row">
              <span class="info-label">再生中ソフト</span>
              <span class="info-value">${appType}</span>
            </div>
            <div class="info-row">
              <span class="info-label">動画名</span>
              <span class="info-value">${contentName}</span>
            </div>
          </div>
          
          <div class="camera-preview-container">
            <div class="camera-preview">
              <img src="images/theater_snapshot.jpg" alt="${name} 監視カメラ" class="camera-snapshot-img">
            </div>
            <div class="camera-control-row">
              <span class="camera-label">監視カメラ</span>
              <button class="zoom-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                拡大表示
              </button>
            </div>
          </div>
        </div>

        <!-- フッター（ボタンと注記） -->
        <div class="card-footer">
          <button class="detail-btn">
            詳細 / 設定
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 6px; display: block;">
              <polygon points="6 2 18 12 6 22"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('building-card', BuildingCard);
