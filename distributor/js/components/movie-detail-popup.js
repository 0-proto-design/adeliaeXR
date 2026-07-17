class MovieDetailPopup extends HTMLElement {
  constructor() {
    super();
    this.movie = null;
    this.categories = [];
    this.selectedThumbIndex = 1; // デフォルトで候補1を選択状態にする
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  open(movie, categories) {
    this.movie = movie;
    this.categories = categories;
    this.selectedThumbIndex = 1; // 起動時に初期化
    this.render();
    this.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.setupThumbSelectionEvents();
  }

  close() {
    this.style.display = 'none';
    document.body.style.overflow = '';
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (
        e.target.classList.contains('popup-overlay') || 
        e.target.classList.contains('popup-close-btn') ||
        e.target.classList.contains('btn-cancel')
      ) {
        this.close();
      }

      if (e.target.classList.contains('btn-submit')) {
        this.submitForm();
      }

      if (e.target.classList.contains('btn-delete')) {
        this.deleteMovie();
      }
    });
  }

  setupThumbSelectionEvents() {
    const candidates = this.querySelectorAll('.thumb-candidate');
    candidates.forEach((cand, idx) => {
      cand.addEventListener('click', () => {
        candidates.forEach(c => c.classList.remove('selected'));
        cand.classList.add('selected');
        this.selectedThumbIndex = idx + 1;
      });
    });
  }

  submitForm() {
    const titleInput = this.querySelector('#movieTitle');
    const descInput = this.querySelector('#movieDesc');
    const typeSelect = this.querySelector('#movieType');
    const categorySelect = this.querySelector('#movieCategory');

    const title = titleInput ? titleInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '';
    const categoryId = categorySelect ? categorySelect.value : '';

    if (!title) {
      alert('タイトルを入力してください。');
      return;
    }
    if (!categoryId) {
      alert('カテゴリを選択してください。');
      return;
    }

    this.dispatchEvent(new CustomEvent('movie-update', {
      detail: {
        movieId: this.movie.id,
        title,
        desc,
        type,
        categoryId,
        selectedThumbIndex: this.selectedThumbIndex
      },
      bubbles: true,
      composed: true
    }));

    this.close();
  }

  deleteMovie() {
    if (confirm(`動画「${this.movie.title}」を削除してもよろしいですか？`)) {
      this.dispatchEvent(new CustomEvent('movie-delete', {
        detail: {
          movieId: this.movie.id
        },
        bubbles: true,
        composed: true
      }));
      this.close();
    }
  }

  render() {
    if (!this.movie) return;

    // 現在所属しているカテゴリIDを取得
    const currentCategoryId = this.movie.categoryId || '';

    const categoryOptions = this.categories.map(cat => `
      <option value="${cat.id}" ${cat.id === currentCategoryId ? 'selected' : ''}>${cat.name}</option>
    `).join('');

    // ソフトタイプの初期選択
    const type = this.movie.type || 'mp4';

    this.innerHTML = `
      <style>
        movie-detail-popup {
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
          width: calc(100% - 40px);
          height: calc(100% - 40px);
          max-width: 1400px;
          background-color: var(--bg-color-card);
          border: 1.5px solid rgba(0, 210, 255, 0.25);
          border-radius: var(--border-radius-large);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          overflow: hidden;
          z-index: 2;
          display: flex;
          flex-direction: column;
          animation: editPopupFadeIn 0.25s ease-out;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        @keyframes editPopupFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
            backdrop-filter: blur(4px);
          }
        }

        /* ヘッダーエリア */
        .popup-header {
          padding: 20px 40px;
          border-bottom: 1px solid rgba(0, 210, 255, 0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .popup-title {
          font-size: 20px;
          font-weight: bold;
          color: var(--text-color-cyan);
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

        /* コンテンツエリア */
        .popup-content {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          flex: 1;
          overflow-y: auto;
        }

        /* 左右カラムレイアウト (上揃え) */
        .register-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 768px) {
          .register-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .popup-content {
            padding: 20px;
          }
          .popup-header {
            padding: 16px 20px;
          }
        }

        /* 左カラム: サムネイル関係 */
        .upload-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          justify-content: flex-start;
        }

        /* サムネイルプレビュー表示 (シアン実線太枠) */
        .thumbnail-preview-box {
          aspect-ratio: 16 / 9;
          width: 100%;
          background-color: var(--bg-color-camera);
          border: 2px solid var(--color-cyan);
          border-radius: var(--border-radius-medium);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px rgba(0, 210, 255, 0.1);
        }

        .thumbnail-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background-color: rgba(0, 210, 255, 0.15);
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-medium);
          padding: 6px 14px;
          font-size: 14px;
          font-weight: bold;
          color: var(--text-color-cyan);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .thumbnail-badge::before {
          content: '';
          width: 8px;
          height: 8px;
          background-color: var(--color-cyan);
          border-radius: 50%;
          box-shadow: 0 0 6px var(--color-cyan-glow);
        }

        .thumbnail-label {
          font-size: 18px;
          color: var(--text-color-secondary);
          letter-spacing: 0.05em;
        }

        .thumbnail-title-overlay {
          position: absolute;
          bottom: 16px;
          left: 20px;
          font-size: 18px;
          font-weight: bold;
          color: var(--text-color-primary);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
        }

        /* サムネ自動生成候補セクション */
        .auto-thumb-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auto-thumb-label {
          color: var(--text-color-secondary);
          font-size: 14px;
          font-weight: 500;
        }

        .thumb-candidates-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .thumb-candidate {
          aspect-ratio: 16 / 9;
          background-color: var(--bg-color-main);
          border: 1.5px solid rgba(143, 160, 192, 0.15);
          border-radius: var(--border-radius-medium);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--text-color-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .thumb-candidate:hover {
          border-color: rgba(0, 210, 255, 0.4);
          color: var(--text-color-primary);
        }

        .thumb-candidate.selected {
          border-color: var(--color-cyan);
          background-color: rgba(0, 210, 255, 0.03);
          color: var(--text-color-cyan);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }

        .candidate-title {
          font-size: 15px;
          font-weight: bold;
        }

        .file-select-btn {
          width: 100%;
          background-color: transparent;
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 14px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          box-shadow: 0 2px 6px rgba(0, 210, 255, 0.05);
        }

        .file-select-btn:hover {
          background-color: rgba(0, 210, 255, 0.08);
          box-shadow: 0 0 8px var(--color-cyan-glow);
          color: var(--color-cyan);
        }

        /* 右カラム: フォーム入力 */
        .form-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: flex-start;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
        }

        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        .form-label {
          color: var(--text-color-cyan);
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 0.05em;
        }

        .form-input, .form-textarea, .form-select {
          background-color: var(--bg-color-main);
          border: 1px solid rgba(0, 210, 255, 0.25);
          border-radius: var(--border-radius-medium);
          padding: 14px 18px;
          color: var(--text-color-primary);
          font-size: 15px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }

        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: var(--color-cyan);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          max-height: 350px;
          height: 140px;
        }

        /* テキストエリアのドラッグハンドル */
        .form-textarea::-webkit-resizer {
          background-image: linear-gradient(135deg, 
            transparent 0%, transparent 72%, 
            var(--color-cyan) 72%, var(--color-cyan) 76%, 
            transparent 76%, transparent 86%, 
            var(--color-cyan) 86%, var(--color-cyan) 90%, 
            transparent 90%
          );
          background-repeat: no-repeat;
          background-position: bottom right;
        }

        /* プルダウン矢印 */
        .form-select {
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2300d2ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }

        .form-select option {
          background-color: var(--bg-color-card);
          color: var(--text-color-primary);
        }

        /* 下部アクションエリア */
        .popup-footer-actions {
          padding: 14px 24px;
          border-top: 1px solid rgba(0, 210, 255, 0.1);
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 16px;
          background-color: var(--bg-color-card);
          box-sizing: border-box;
          width: 100%;
        }

        .popup-footer-actions .spacer {
          flex: 1;
        }

        .action-btn {
          padding: 14px 50px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s;
          min-width: 180px;
          text-align: center;
        }

        .action-btn.btn-cancel {
          background: transparent;
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
        }

        .action-btn.btn-cancel:hover {
          background-color: rgba(0, 210, 255, 0.08);
          box-shadow: 0 0 8px var(--color-cyan-glow);
          color: var(--color-cyan);
        }

        .action-btn.btn-submit {
          background-color: var(--color-cyan);
          border: 1.5px solid var(--color-cyan);
          color: var(--bg-color-main);
          box-shadow: 0 2px 6px rgba(0, 210, 255, 0.2);
        }

        .action-btn.btn-submit:hover {
          background-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
        }

        .action-btn.btn-delete {
          background-color: transparent;
          border: 1.5px solid var(--color-status-red);
          color: var(--color-status-red);
          box-shadow: 0 2px 6px rgba(255, 77, 77, 0.05);
        }

        .action-btn.btn-delete:hover {
          background-color: rgba(255, 77, 77, 0.08);
          box-shadow: 0 0 8px rgba(255, 77, 77, 0.3);
          color: var(--color-status-red);
        }

        .action-btn:active {
          transform: scale(0.98);
        }
      </style>

      <div class="popup-overlay"></div>
      <div class="popup-wrapper">
        <!-- 上部ヘッダータイトル -->
        <div class="popup-header">
          <span class="popup-title">動画の編集</span>
          <button class="popup-close-btn"></button>
        </div>

        <div class="popup-content">
          <div class="register-grid">
            <!-- 左カラム: サムネイル関係 -->
            <div class="upload-column">
              <!-- サムネイルメイン枠 (実線シアン) -->
              <div class="thumbnail-preview-box">
                <div class="thumbnail-badge">サムネイル</div>
                <span class="thumbnail-label">サムネイル画像</span>
                <div class="thumbnail-title-overlay">${this.movie.title}</div>
              </div>
              
              <!-- 自動生成候補を復元 -->
              <div class="auto-thumb-section">
                <div class="thumb-candidates-grid">
                  <div class="thumb-candidate selected" data-index="1">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span class="candidate-title">1</span>
                  </div>
                  <div class="thumb-candidate" data-index="2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span class="candidate-title">2</span>
                  </div>
                  <div class="thumb-candidate" data-index="3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span class="candidate-title">3</span>
                  </div>
                </div>
              </div>
              
              <button class="file-select-btn">📁 サムネアップロード</button>
            </div>

            <!-- 右カラム: フォーム -->
            <div class="form-column">
              <div class="form-group">
                <label class="form-label" for="movieTitle">タイトル</label>
                <input type="text" id="movieTitle" class="form-input" value="${this.movie.title}" placeholder="タイトルを入力">
              </div>

              <div class="form-group">
                <label class="form-label" for="movieDesc">説明</label>
                <textarea id="movieDesc" class="form-textarea" placeholder="動画の説明を入力">${this.movie.desc || ''}</textarea>
              </div>

              <!-- ソフトタイプとカテゴリ横並び -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="movieType">ソフトタイプ</label>
                  <select id="movieType" class="form-select">
                    <option value="mp4" ${type === 'mp4' ? 'selected' : ''}>2D映像表示ソフト</option>
                    <option value="3dcg" ${type === '3dcg' ? 'selected' : ''}>3DCGコンテンツ</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="movieCategory">カテゴリ</label>
                  <select id="movieCategory" class="form-select">
                    ${categoryOptions}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下部ボタン -->
        <div class="popup-footer-actions">
          <button class="action-btn btn-delete">削除</button>
          <div class="spacer"></div>
          <button class="action-btn btn-cancel">キャンセル</button>
          <button class="action-btn btn-submit">確定</button>
        </div>
      </div>
    `;
  }
}

customElements.define('movie-detail-popup', MovieDetailPopup);
