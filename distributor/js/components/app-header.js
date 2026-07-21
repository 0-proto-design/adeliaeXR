class AppHeader extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['active-tab', 'alert-count', 'page-title', 'breadcrumbs', 'building-id'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const activeTab = this.getAttribute('active-tab') || 'monitoring';
    const alertCount = this.getAttribute('alert-count') || '1';
    const pageTitle = this.getAttribute('page-title') || '設置現場 監視';
    const breadcrumbsAttr = this.getAttribute('breadcrumbs');
    const buildingId = this.getAttribute('building-id');
    const hideTitle = this.getAttribute('hide-title') === 'true';

    let breadcrumbsHTML = '';
    if (breadcrumbsAttr) {
      try {
        const items = JSON.parse(breadcrumbsAttr);
        breadcrumbsHTML = items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          if (isLast) {
            return `<span class="breadcrumbs-current">${item.name}</span>`;
          } else {
            return `<a href="${item.url}" class="breadcrumbs-item">${item.name}</a><span class="breadcrumbs-separator">&gt;</span>`;
          }
        }).join('');
      } catch (e) {
        console.error('Error parsing breadcrumbs attribute:', e);
      }
    }

    this.innerHTML = `
      <style>
        .app-header-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          font-family: var(--font-family);
        }

        /* メインのヘッダー行（ロゴ、タブ、アラートバッジ） */
        .header-main-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          width: 100%;
          padding: 8px 4px 16px 4px;
          border-bottom: 1px solid rgba(0, 210, 255, 0.15);
        }

        /* 左端：ブランドロゴ */
        .header-brand {
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }

        .header-brand .brand-logo {
          color: var(--text-color-cyan);
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 0.05em;
        }

        /* 中央：タブエリア */
        .header-tabs-container {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .tab-btn {
          background: transparent;
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 10px 32px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 210, 255, 0.05);
        }

        .tab-btn:hover {
          background-color: rgba(0, 210, 255, 0.08);
          box-shadow: 0 0 8px var(--color-cyan-glow);
          color: var(--color-cyan);
        }

        .tab-btn.active {
          border: 1.5px solid var(--color-cyan);
          background-color: var(--color-cyan);
          color: var(--bg-color-main);
          box-shadow: 0 0 10px var(--color-cyan-glow);
        }

        /* 右端：アクションエリア（アラート、アカウント） */
        .header-right-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
        }

        .header-alert-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 13px;
          font-weight: bold;
          border-radius: var(--border-radius-small);
          color: var(--text-color-primary);
          background-color: var(--color-status-red-bg);
          border: 1px solid var(--color-status-red);
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .header-alert-badge svg {
          color: var(--color-status-red);
          flex-shrink: 0;
          display: block;
        }

        .header-alert-count {
          color: var(--text-color-primary);
          font-weight: 900;
          font-size: 14px;
          line-height: 1;
        }

        /* アカウント情報ボタン */
        .header-account-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-color-primary);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: var(--border-radius-medium);
          transition: background-color 0.2s;
        }

        .header-account-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .header-account-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: rgba(0, 210, 255, 0.15);
          color: var(--text-color-cyan);
          border: 1px solid var(--color-cyan);
        }

        .header-account-name {
          font-size: 14px;
          font-weight: 500;
        }

        /* ヘッダー下：ページタイトルエリア */
        .page-title-area {
          padding: 12px 4px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }

        .page-title-area .page-title {
          color: var(--text-color-cyan);
          font-size: 18px;
          letter-spacing: 0.06em;
          font-weight: bold;
          line-height: 1.2;
          display: flex;
          align-items: center;
        }

        .page-title-line {
          display: inline-block;
          width: 4px;
          height: 18px;
          background-color: var(--color-cyan);
          margin-right: 12px;
          flex-shrink: 0;
        }

        /* パンくずリストスタイル */
        .breadcrumbs-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-color-secondary);
          margin-top: 4px;
          padding-left: 16px; /* タイトルの左線ズレにアライン */
        }

        .breadcrumbs-item {
          color: var(--text-color-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumbs-item:hover {
          color: var(--color-cyan);
        }

        .breadcrumbs-separator {
          color: rgba(146, 154, 166, 0.4);
          user-select: none;
        }

        .breadcrumbs-current {
          color: var(--text-color-primary);
          font-weight: 500;
        }

        .header-title-select {
          background-color: rgba(0, 210, 255, 0.05);
          border: 1px solid var(--color-cyan);
          color: var(--text-color-cyan);
          font-size: 15px;
          font-weight: bold;
          font-family: inherit;
          cursor: pointer;
          outline: none;
          padding: 6px 28px 6px 12px;
          border-radius: var(--border-radius-small);
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2300D2FF%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>');
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 10px;
          margin: 0;
          transition: all 0.2s;
          box-shadow: 0 0 4px var(--color-cyan-glow);
        }

        .header-title-select:hover {
          background-color: rgba(0, 210, 255, 0.12);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }
      </style>

      <div class="app-header-container">
        <div class="header-main-row">
          <!-- 左：ブランドロゴ -->
          <div class="header-brand">
            <span class="brand-logo">adeliaeXR</span>
          </div>

          <!-- 中央：タブメニュー -->
          <div class="header-tabs-container">
            <a href="index.html" class="tab-btn ${activeTab === 'monitoring' ? 'active' : ''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: block;">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              設置現場 監視
            </a>
            <a href="movies.html" class="tab-btn ${activeTab === 'contents' ? 'active' : ''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; display: block;">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/>
              </svg>
              動画マスター管理
            </a>
          </div>
          
          <!-- 右：アクションエリア（アラートバッジ ＆ アカウント） -->
          <div class="header-right-actions">
            <div class="header-alert-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              通信エラー：<span class="header-alert-count">${alertCount}</span>
            </div>
            
            <a href="account.html" class="header-account-btn">
              <div class="header-account-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span class="header-account-name">管理者ユーザー</span>
            </a>
          </div>
        </div>

        ${!hideTitle ? `
        <!-- ヘッダー下：ページタイトルエリア -->
        <div class="page-title-area">
          <div class="page-title">
            <span class="page-title-line"></span>
            ${buildingId ? `
              <select class="header-title-select" id="headerTitleSelect" style="margin-right: 8px;">
                <option value="1" ${buildingId === '1' ? 'selected' : ''} style="background: var(--bg-color-main); color: var(--text-color-primary);">1号棟</option>
                <option value="2" ${buildingId === '2' ? 'selected' : ''} style="background: var(--bg-color-main); color: var(--text-color-primary);">2号棟</option>
                <option value="3" ${buildingId === '3' ? 'selected' : ''} style="background: var(--bg-color-main); color: var(--text-color-primary);">3号棟</option>
              </select>
            ` : ''}
            <span class="page-title-text" style="color: var(--text-color-cyan); font-size: 18px; font-weight: bold;">
              ${buildingId ? pageTitle.replace(/^[0-9]+号棟/, '').replace(localStorage.getItem(`adeliae_building_name_${buildingId}`) || '', '').trim() : pageTitle}
            </span>
          </div>
          ${breadcrumbsHTML ? `<div class="breadcrumbs-container">${breadcrumbsHTML}</div>` : ''}
        </div>
        ` : ''}
      </div>
    `;

    // オプション名のカスタム現場名適用
    const options = this.querySelectorAll('#headerTitleSelect option');
    options.forEach(opt => {
      const storedName = localStorage.getItem(`adeliae_building_name_${opt.value}`);
      if (storedName) {
        opt.textContent = storedName;
      }
    });

    // イベントリスナーのバインド
    const titleSelect = this.querySelector('#headerTitleSelect');
    if (titleSelect) {
      titleSelect.addEventListener('change', () => {
        const newId = titleSelect.value;
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('id', newId);
        window.location.href = currentUrl.toString();
      });
    }
  }
}

customElements.define('app-header', AppHeader);
