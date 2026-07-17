class CategoryPopup extends HTMLElement {
  constructor() {
    super();
    this._isOpen = false;
    this.categories = [];
    this.draggedIndex = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  open(categories) {
    this._isOpen = true;
    // ディープコピーしてポップアップ内の一時編集状態を作る
    this.categories = JSON.parse(JSON.stringify(categories));
    this.render();
    this.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.attachListEvents();
  }

  close(save = false) {
    this._isOpen = false;
    this.style.display = 'none';
    document.body.style.overflow = '';
    
    if (save) {
      this.dispatchEvent(new CustomEvent('category-save', {
        detail: { categories: this.categories },
        bubbles: true,
        composed: true
      }));
    }
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.classList.contains('popup-overlay') || e.target.classList.contains('popup-close-btn') || e.target.classList.contains('btn-cancel')) {
        this.close(false);
      }
      
      if (e.target.classList.contains('btn-save')) {
        this.close(true);
      }

      if (e.target.classList.contains('btn-add-cat')) {
        this.addCategory();
      }
    });

    // Enterキー入力で追加できるようにする
    this.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.classList.contains('new-cat-input')) {
        this.addCategory();
      }
    });
  }

  addCategory() {
    const input = this.querySelector('.new-cat-input');
    const name = input ? input.value.trim() : '';
    if (!name) return;

    // 重複チェック
    if (this.categories.some(cat => cat.name === name)) {
      alert('同名のカテゴリが既に存在します。');
      return;
    }

    const newId = 'cat_' + Date.now();
    this.categories.push({ id: newId, name: name, movies: [] });
    
    if (input) input.value = '';
    this.renderListOnly();
  }

  deleteCategory(index) {
    const cat = this.categories[index];
    const confirmMessage = `カテゴリ「${cat.name}」を削除しますか？\n(カテゴリ内の動画は削除されず、「未分類」に移動します)`;
    if (confirm(confirmMessage)) {
      this.categories.splice(index, 1);
      this.renderListOnly();
    }
  }

  startEdit(index, itemElement) {
    const nameText = itemElement.querySelector('.cat-name-text');
    const editInput = itemElement.querySelector('.cat-name-input');
    const editBtn = itemElement.querySelector('.action-icon.edit-icon');
    const checkBtn = itemElement.querySelector('.action-icon.check-icon');

    nameText.style.display = 'none';
    editInput.style.display = 'block';
    editBtn.style.display = 'none';
    checkBtn.style.display = 'block';

    editInput.focus();
    editInput.select();

    // 編集確定のハンドリング
    const saveEdit = () => {
      const newName = editInput.value.trim();
      if (newName && newName !== this.categories[index].name) {
        this.categories[index].name = newName;
      }
      this.renderListOnly();
    };

    editInput.onblur = saveEdit;
    editInput.onkeypress = (e) => {
      if (e.key === 'Enter') saveEdit();
    };
  }

  // ドラッグ＆ドロップのイベントをリストアイテムにアタッチ
  attachListEvents() {
    const items = this.querySelectorAll('.cat-item');
    items.forEach((item, index) => {
      // ドラッグ開始
      item.addEventListener('dragstart', (e) => {
        this.draggedIndex = index;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      // ドラッグ終了
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        this.draggedIndex = null;
        
        // ドラッグ終了時にプレースホルダーなどをクリーンアップ
        const placeholders = this.querySelectorAll('.cat-item');
        placeholders.forEach(p => p.classList.remove('drag-over'));
      });

      // ドラッグ中（要素の上を通過）
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-over');
      });

      // 要素からドラッグが離れたとき
      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      // ドロップ時
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        
        if (this.draggedIndex !== null && this.draggedIndex !== index) {
          // 配列要素の順序を入れ替える
          const draggedItem = this.categories[this.draggedIndex];
          this.categories.splice(this.draggedIndex, 1);
          this.categories.splice(index, 0, draggedItem);
          this.renderListOnly();
        }
      });

      // インライン編集ボタン
      const editBtn = item.querySelector('.edit-icon');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.startEdit(index, item));
      }

      // 削除ボタン
      const deleteBtn = item.querySelector('.delete-icon');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.deleteCategory(index));
      }
    });
  }

  renderListOnly() {
    const listContainer = this.querySelector('.cat-list-container');
    if (!listContainer) return;

    if (this.categories.length === 0) {
      listContainer.innerHTML = `<div class="empty-list">カテゴリが登録されていません。</div>`;
      return;
    }

    listContainer.innerHTML = this.categories.map((cat, index) => `
      <div class="cat-item" draggable="true" data-index="${index}">
        <div class="cat-drag-handle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="5" r="1"/>
            <circle cx="9" cy="12" r="1"/>
            <circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/>
            <circle cx="15" cy="12" r="1"/>
            <circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        
        <div class="cat-name-wrapper">
          <span class="cat-name-text">${cat.name}</span>
          <input type="text" class="cat-name-input" value="${cat.name}" style="display: none;">
        </div>

        <div class="cat-item-actions">
          <!-- 編集ボタン -->
          <button class="action-icon edit-icon" title="名前を変更">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          
          <!-- チェック（編集保存用、初期状態非表示） -->
          <button class="action-icon check-icon" title="保存" style="display: none; color: var(--color-status-green);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>

          <!-- 削除ボタン -->
          <button class="action-icon delete-icon" title="削除">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    this.attachListEvents();
  }

  render() {
    this.innerHTML = `
      <style>
        category-popup {
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
          max-width: 500px;
          background-color: var(--bg-color-card);
          border: 2px solid var(--color-cyan);
          border-radius: var(--border-radius-large);
          box-shadow: 0 0 30px rgba(0, 210, 255, 0.3);
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

        /* 新規追加セクション */
        .new-cat-section {
          display: flex;
          gap: 12px;
          width: 100%;
        }

        .new-cat-input {
          flex: 1;
          background-color: var(--bg-color-camera);
          border: 1px solid rgba(0, 210, 255, 0.3);
          border-radius: var(--border-radius-medium);
          padding: 10px 16px;
          color: var(--text-color-primary);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }

        .new-cat-input:focus {
          border-color: var(--color-cyan);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }

        .btn-add-cat {
          background-color: var(--color-cyan);
          border: 1.5px solid var(--color-cyan);
          color: var(--bg-color-main);
          padding: 10px 20px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-cat:hover {
          background-color: var(--color-cyan);
          box-shadow: 0 0 10px var(--color-cyan-glow);
        }

        /* カテゴリリスト */
        .cat-list-container {
          max-height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 4px;
        }

        /* スクロールバー装飾 */
        .cat-list-container::-webkit-scrollbar {
          width: 6px;
        }
        .cat-list-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .cat-list-container::-webkit-scrollbar-thumb {
          background: rgba(0, 210, 255, 0.3);
          border-radius: 3px;
        }

        .empty-list {
          text-align: center;
          color: var(--text-color-secondary);
          padding: 20px;
          font-size: 15px;
        }

        /* 個別カテゴリの行 */
        .cat-item {
          display: flex;
          align-items: center;
          background-color: var(--bg-color-camera);
          border: 1px solid rgba(143, 160, 192, 0.15);
          border-radius: var(--border-radius-medium);
          padding: 10px 16px;
          gap: 12px;
          cursor: grab;
          transition: background-color 0.2s, border-color 0.2s;
        }

        .cat-item.dragging {
          opacity: 0.4;
          cursor: grabbing;
          background-color: rgba(0, 210, 255, 0.05);
          border: 1px dashed var(--color-cyan);
        }

        .cat-item.drag-over {
          border-color: var(--color-cyan);
          background-color: rgba(0, 210, 255, 0.08);
          box-shadow: 0 0 8px var(--color-cyan-glow);
        }

        .cat-drag-handle {
          color: var(--text-color-secondary);
          cursor: grab;
          display: flex;
          align-items: center;
          opacity: 0.6;
          user-select: none;
        }

        .cat-drag-handle:hover {
          opacity: 1;
          color: var(--text-color-cyan);
        }

        .cat-name-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .cat-name-text {
          font-size: 15px;
          color: var(--text-color-primary);
          font-weight: 500;
        }

        .cat-name-input {
          background-color: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--color-cyan);
          border-radius: var(--border-radius-small);
          padding: 4px 8px;
          color: var(--text-color-primary);
          font-size: 15px;
          width: 100%;
          outline: none;
        }

        .cat-item-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .action-icon {
          background: none;
          border: none;
          color: var(--text-color-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--border-radius-small);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-icon:hover {
          color: var(--text-color-primary);
          background-color: rgba(255, 255, 255, 0.05);
        }

        /* 削除アイコンはホバー時に赤にする */
        .action-icon.delete-icon:hover {
          color: var(--color-status-red);
          background-color: var(--color-status-red-bg);
          box-shadow: 0 0 6px rgba(255, 77, 77, 0.2);
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

        .popup-btn.btn-save {
          background-color: var(--color-cyan);
          border: 1.5px solid var(--color-cyan);
          color: var(--bg-color-main);
        }

        .popup-btn.btn-save:hover {
          background-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
        }
      </style>

      <div class="popup-overlay"></div>
      <div class="popup-wrapper">
        <div class="popup-header">
          <span class="popup-title">カテゴリ管理設定</span>
          <button class="popup-close-btn"></button>
        </div>
        <div class="popup-content">
          <!-- 新規追加フォーム -->
          <div class="new-cat-section">
            <input type="text" class="new-cat-input" placeholder="新しいカテゴリ名を入力">
            <button class="btn-add-cat">＋ 追加</button>
          </div>

          <!-- ドラッグ並び替え対応リスト -->
          <div class="cat-list-container">
            <!-- 動的挿入 -->
          </div>
        </div>

        <!-- 保存ボタンエリア -->
        <div class="popup-footer-actions">
          <button class="popup-btn btn-cancel">キャンセル</button>
          <button class="popup-btn btn-save">変更を適用</button>
        </div>
      </div>
    `;
  }
}

customElements.define('category-popup', CategoryPopup);
