class CameraZoomPopup extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    this.setupEvents();
  }

  open(buildingId, buildingName) {
    const overlay = this.querySelector('.zoom-popup-overlay');
    const container = this.querySelector('.zoom-popup-container');
    const title = this.querySelector('.zoom-popup-title');
    const timestamp = this.querySelector('.zoom-popup-timestamp');
    
    // 現在の時刻を取得して直近の30秒単位に切り捨てる (30秒ローリング)
    const now = new Date();
    const seconds = now.getSeconds();
    const rolledSeconds = seconds < 30 ? 0 : 30;
    now.setSeconds(rolledSeconds);
    now.setMilliseconds(0);
    const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    title.textContent = `${buildingName} 監視カメラ`;
    if (timestamp) {
      timestamp.textContent = `撮影日時：${timeStr}`;
    }
    
    overlay.style.display = 'block';
    container.style.display = 'flex';
  }

  close() {
    const overlay = this.querySelector('.zoom-popup-overlay');
    const container = this.querySelector('.zoom-popup-container');
    overlay.style.display = 'none';
    container.style.display = 'none';
  }

  setupEvents() {
    const closeBtn = this.querySelector('.zoom-popup-close-btn');
    const overlay = this.querySelector('.zoom-popup-overlay');

    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', () => this.close());
  }

  render() {
    this.innerHTML = `
      <style>
        .zoom-popup-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 999;
          backdrop-filter: blur(4px);
        }

        .zoom-popup-container {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 1100px;
          height: auto;
          max-height: 85vh;
          background-color: var(--bg-color-main);
          z-index: 1000;
          flex-direction: column;
          overflow: hidden;
          border-radius: var(--border-radius-large);
          border: 1.5px solid var(--color-cyan);
          box-shadow: 0 8px 48px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 210, 255, 0.08);
          animation: popupFadeIn 0.2s ease-out;
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

        .zoom-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(0, 210, 255, 0.15);
          background-color: var(--bg-color-card);
        }

        .zoom-popup-title-area {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .zoom-popup-title {
          font-size: 18px;
          font-weight: bold;
          color: var(--text-color-cyan);
          letter-spacing: 0.05em;
        }

        .zoom-popup-timestamp {
          font-size: 14px;
          color: var(--text-color-secondary);
          font-weight: normal;
          letter-spacing: 0.02em;
        }

        /* 他のモーダルと統一した赤い閉じるボタン */
        .zoom-popup-close-btn {
          background-color: var(--color-status-red);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: var(--border-radius-small);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(255, 77, 77, 0.2);
        }

        .zoom-popup-close-btn:hover {
          background-color: #ff3333;
          box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
        }

        /* 監視カメラ映像のシミュレーション領域 */
        .zoom-popup-content {
          flex: 1;
          background-color: var(--bg-color-camera);
          position: relative;
          display: block;
          overflow: hidden;
        }

        .zoom-popup-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      </style>

      <div class="zoom-popup-overlay"></div>
      <div class="zoom-popup-container">
        <div class="zoom-popup-header">
          <div class="zoom-popup-title-area">
            <div class="zoom-popup-title">1号棟 監視カメラ</div>
            <div class="zoom-popup-timestamp">撮影日時：-</div>
          </div>
          <button class="zoom-popup-close-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="zoom-popup-content">
          <img src="images/theater_snapshot.jpg" alt="監視カメラ映像" class="zoom-popup-img">
        </div>
      </div>
    `;
  }
}

customElements.define('camera-zoom-popup', CameraZoomPopup);
