class MovieDetailPopup extends HTMLElement {
  constructor() {
    super();
    this.movie = null;
    this.categories = [];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  open(movie, categories) {
    this.movie = movie;
    this.categories = categories;
    this.render();
    this.style.display = 'block';
    document.body.style.overflow = 'hidden';
    this.setupDragAndDrop();
    this.setupSuggestions();
    this.updateBuildingNames();
    this.initSyncSitesCheckboxes();
    this.initThumbnailUI();
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
        (e.target.classList.contains('btn-cancel') && !e.target.closest('.btn-play-preview'))
      ) {
        this.close();
      }

      if (e.target.classList.contains('btn-submit')) {
        this.submitForm();
      }

      if (e.target.classList.contains('btn-delete')) {
        this.deleteMovie();
      }

      if (e.target.closest('.btn-play-preview')) {
        const playerModal = this.querySelector('#videoPlayerModal');
        if (playerModal) {
          playerModal.style.display = 'flex';
        }
      }

      if (e.target.closest('#videoPlayerCloseBtn') || e.target.closest('#videoPlayerOverlay')) {
        const playerModal = this.querySelector('#videoPlayerModal');
        if (playerModal) {
          playerModal.style.display = 'none';
        }
      }
    });
  }

  initThumbnailUI() {
    if (this.movie && this.movie.thumbnailData) {
      this.updateThumbnailUI(this.movie.thumbnailData);
    } else {
      // 初期状態で候補1を設定するシミュレーション
      const defaultCandidate = this.querySelector('.suggestion-box[data-index="0"] img');
      if (defaultCandidate) {
        this.updateThumbnailUI(defaultCandidate.src);
      }
    }
  }

  initSyncSitesCheckboxes() {
    const checkBoxes = this.querySelectorAll('input[name="syncSites"]');
    checkBoxes.forEach(cb => {
      const buildingId = cb.value;
      const storedMovie = localStorage.getItem(`adeliae_building_movie_${buildingId}`);
      if (storedMovie && storedMovie === this.movie.title) {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    });
  }

  updateBuildingNames() {
    const siteNames = this.querySelectorAll('.site-name');
    siteNames.forEach(span => {
      const id = span.getAttribute('data-id');
      const storedName = localStorage.getItem(`adeliae_building_name_${id}`);
      if (storedName) {
        span.textContent = storedName;
      }

      // 重複表示防止のため、既存の注意書きを削除
      const existingNote = span.parentElement.querySelector('.sync-site-note');
      if (existingNote) {
        existingNote.remove();
      }

      // 他の現場と配信コンテンツを同じにしているかをチェック
      const syncSourceKey = `adeliae_sync_source_building_${id}`;
      const syncSourceVal = localStorage.getItem(syncSourceKey) || 'none';

      const checkbox = span.parentElement.querySelector('input[name="syncSites"]');
      if (syncSourceVal !== 'none' && checkbox) {
        checkbox.disabled = true;
        checkbox.checked = false; // 同期中現場はチェック無効化
        span.parentElement.style.opacity = '0.5';
        span.parentElement.style.pointerEvents = 'none';

        const targetName = localStorage.getItem(`adeliae_building_name_${syncSourceVal}`) || `${syncSourceVal}号棟`;
        const noteSpan = document.createElement('span');
        noteSpan.className = 'sync-site-note';
        noteSpan.textContent = ` （${targetName}の配信コンテンツと同じにしています）`;
        noteSpan.style.color = 'var(--text-color-secondary)';
        noteSpan.style.fontSize = '12px';
        noteSpan.style.marginLeft = '8px';
        span.parentElement.appendChild(noteSpan);
      } else if (checkbox) {
        checkbox.disabled = false;
        span.parentElement.style.opacity = '1';
        span.parentElement.style.pointerEvents = 'auto';
      }
    });
  }

  setupSuggestions() {
    const suggestions = this.querySelectorAll('.suggestion-box');
    suggestions.forEach(box => {
      box.addEventListener('click', () => {
        suggestions.forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        
        const img = box.querySelector('.suggestion-img');
        if (img) {
          this.updateThumbnailUI(img.src);
        }
      });
    });
  }

  setupDragAndDrop() {
    const dropZone = this.querySelector('#thumbnailUploadBox');
    const fileInput = this.querySelector('#thumbnailUploadInput');
    const inlineBtn = this.querySelector('#inlineFileSelectBtn');
    const changeBtn = this.querySelector('#changeImageBtn');

    if (!dropZone || !fileInput) return;

    const openFileDialog = () => fileInput.click();
    
    if (inlineBtn) inlineBtn.addEventListener('click', openFileDialog);
    if (changeBtn) changeBtn.addEventListener('click', openFileDialog);

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        this.handleImageFile(file);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleImageFile(e.target.files[0]);
      }
    });
  }

  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      this.updateThumbnailUI(imgDataUrl);
    };
    reader.readAsDataURL(file);
  }

  updateThumbnailUI(imgSrc) {
    const dropZone = this.querySelector('#thumbnailUploadBox');
    const placeholder = this.querySelector('#uploadPlaceholder');
    const previewContainer = this.querySelector('#thumbnailPreviewContainer');
    const imgElement = this.querySelector('#registerThumbnailImg');

    if (dropZone && placeholder && previewContainer && imgElement) {
      imgElement.src = imgSrc;
      dropZone.classList.add('has-image');
      placeholder.style.display = 'none';
      previewContainer.style.display = 'block';

      const suggestions = this.querySelectorAll('.suggestion-box');
      suggestions.forEach(box => {
        const simg = box.querySelector('.suggestion-img');
        if (simg && simg.src === imgSrc) {
          box.classList.add('selected');
        } else {
          box.classList.remove('selected');
        }
      });
    }
  }

  resetThumbnailUI() {
    const dropZone = this.querySelector('#thumbnailUploadBox');
    const placeholder = this.querySelector('#uploadPlaceholder');
    const previewContainer = this.querySelector('#thumbnailPreviewContainer');
    const imgElement = this.querySelector('#registerThumbnailImg');
    const fileInput = this.querySelector('#thumbnailUploadInput');

    if (dropZone && placeholder && previewContainer && imgElement) {
      imgElement.src = '';
      dropZone.classList.remove('has-image');
      placeholder.style.display = 'flex';
      previewContainer.style.display = 'none';
      if (fileInput) fileInput.value = '';
    }
  }

  submitForm() {
    const titleInput = this.querySelector('#movieTitle');
    const descInput = this.querySelector('#movieDesc');
    const typeSelect = this.querySelector('#movieType');
    const categorySelect = this.querySelector('#movieCategory');
    const imgElement = this.querySelector('#registerThumbnailImg');

    const title = titleInput ? titleInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '';
    const categoryId = categorySelect ? categorySelect.value : '';
    const thumbnailData = (imgElement && imgElement.src.startsWith('data:')) ? imgElement.src : null;
    const checkedSites = Array.from(this.querySelectorAll('input[name="syncSites"]:checked')).map(cb => cb.value);

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
        thumbnailData,
        syncBuildingIds: checkedSites
      },
      bubbles: true,
      composed: true
    }));

    this.close();
  }

  deleteMovie() {
    if (confirm(`コンテンツ「${this.movie.title}」を削除してもよろしいですか？`)) {
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
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-large);
          box-shadow: 0 8px 48px rgba(0, 0, 0, 0.75), 0 0 20px rgba(0, 210, 255, 0.08);
          overflow: hidden;
          z-index: 2;
          display: flex;
          flex-direction: column;
          animation: editPopupFadeIn 0.25s ease-out;
          padding: 0;
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
        }

        .popup-close-btn:hover {
          background-color: #ff2222;
          box-shadow: 0 0 8px rgba(255, 77, 77, 0.4);
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
          overflow-y: scroll;
        }

        .popup-content::-webkit-scrollbar {
          width: 8px;
        }

        .popup-content::-webkit-scrollbar-track {
          background: rgba(0, 210, 255, 0.02);
          border-radius: var(--border-radius-small);
        }

        .popup-content::-webkit-scrollbar-thumb {
          background: rgba(0, 210, 255, 0.2);
          border-radius: var(--border-radius-small);
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .popup-content::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 210, 255, 0.4);
          border: 2px solid transparent;
          background-clip: padding-box;
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
          .popup-footer-actions {
            margin-left: -20px;
            margin-right: -20px;
            margin-bottom: -20px;
            padding: 24px 20px;
            width: calc(100% + 40px);
          }
        }

        /* 左カラム: アップロード関係 */
        .upload-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          justify-content: flex-start;
        }

        .thumbnail-upload-box {
          aspect-ratio: 16 / 9;
          width: 100%;
          height: auto;
          box-sizing: border-box;
          background-color: transparent;
          border: 1.5px dashed rgba(143, 160, 192, 0.5);
          border-radius: var(--border-radius-medium);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: border-color 0.2s, background-color 0.2s;
        }

        .thumbnail-upload-box.drag-over {
          background-color: rgba(0, 210, 255, 0.05);
          border-color: var(--color-cyan);
        }

        .thumbnail-upload-box.has-image {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-small);
          overflow: hidden;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
          padding: 20px;
        }

        .upload-placeholder-title {
          color: var(--text-color-cyan);
          font-size: 14px;
        }

        .upload-placeholder-text {
          color: var(--text-color-primary);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .upload-placeholder-action {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .or-text {
          color: var(--text-color-secondary);
          font-size: 13px;
        }

        .inline-file-select-btn {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 6px 12px;
          border-radius: var(--border-radius-small);
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.1s ease;
          box-shadow: 0 3px 0 #0088b3, 0 4px 8px rgba(0, 0, 0, 0.4);
          transform: translateY(0);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .inline-file-select-btn:hover {
          background-color: #1a2333;
          box-shadow: 0 3px 0 #0088b3, 0 6px 12px rgba(0, 0, 0, 0.6);
        }

        .inline-file-select-btn:active {
          transform: translateY(3px);
          box-shadow: 0 0px 0 #0088b3, 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .thumbnail-preview-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .thumbnail-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background-color: #0d1b2a;
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-small);
          padding: 4px 10px;
          font-size: 12px;
          font-weight: bold;
          color: var(--text-color-cyan);
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .thumbnail-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background-color: var(--color-cyan);
          border-radius: 50%;
          box-shadow: 0 0 4px var(--color-cyan-glow);
        }


        /* サムネイル候補画像 */
        .thumbnail-suggestions-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          margin-top: 10px;
        }

        .suggestions-label {
          color: var(--text-color-cyan);
          font-size: 14px;
          font-weight: bold;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .suggestion-box {
          aspect-ratio: 16 / 9;
          border: 1.5px solid rgba(0, 210, 255, 0.25);
          border-radius: var(--border-radius-small);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
          background-color: var(--bg-color-main);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .suggestion-box:hover {
          border-color: var(--color-cyan);
          box-shadow: 0 0 8px var(--color-cyan-glow);
          transform: translateY(-2px);
        }

        .suggestion-box.selected {
          border-color: var(--color-cyan);
          box-shadow: 0 0 10px var(--color-cyan-glow);
        }

        .suggestion-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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

        .form-input, .form-textarea {
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
          outline: none;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          max-height: 350px;
          height: 140px;
        }

        /* テキストエリアのドラッグハンドルをシアン色の細い2本線でカスタム装飾 */
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

        /* プルダウン矢印のカスタム表現 */
        .form-select {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 10px 40px 10px 16px;
          font-size: 15px;
          font-weight: bold;
          border-radius: var(--border-radius-medium);
          cursor: pointer;
          transition: all 0.1s ease;
          box-shadow: 0 4px 0 #0088b3, 0 6px 12px rgba(0, 0, 0, 0.4);
          transform: translateY(0);
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300d2ff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          box-sizing: border-box;
          width: 100%;
        }

        .form-select:hover {
          background-color: #1a2333;
          box-shadow: 0 4px 0 #0088b3, 0 8px 16px rgba(0, 0, 0, 0.6);
        }

        .form-select:active {
          transform: translateY(4px);
          box-shadow: 0 0px 0 #0088b3, 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .form-select option {
          background-color: var(--bg-color-card);
          color: var(--text-color-primary);
        }

        /* 配信コンテンツに反映 */
        .sync-sites-group {
          margin-top: 20px;
        }

        .sync-sites-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: var(--bg-color-main);
          border: 1px solid rgba(0, 210, 255, 0.25);
          border-radius: var(--border-radius-medium);
          padding: 16px 20px;
          box-sizing: border-box;
          margin-top: 8px;
        }

        .sync-site-item {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: var(--text-color-primary);
          font-size: 14px;
          user-select: none;
          transition: color 0.2s;
        }

        .sync-site-item:hover {
          color: var(--color-cyan);
        }

        .sync-site-item input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkbox-custom {
          position: relative;
          height: 18px;
          width: 18px;
          background-color: var(--bg-color-card);
          border: 1.5px solid rgba(0, 210, 255, 0.4);
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .sync-site-item:hover .checkbox-custom {
          border-color: var(--color-cyan);
        }

        .sync-site-item input:checked ~ .checkbox-custom {
          background-color: var(--color-cyan);
          border-color: var(--color-cyan);
          box-shadow: 0 0 6px var(--color-cyan-glow);
        }

        .checkbox-custom::after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid var(--bg-color-main);
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .sync-site-item input:checked ~ .checkbox-custom::after {
          display: block;
        }

        /* 下部アクションエリア（コンテンツ内に配置するためスクロール可能に） */
        .popup-footer-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          border-top: 1px solid rgba(0, 210, 255, 0.15);
          margin-top: 40px;
          margin-left: -40px;
          margin-right: -40px;
          margin-bottom: -40px;
          padding: 24px 40px;
          box-sizing: border-box;
          width: calc(100% + 80px);
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
          transition: all 0.1s ease;
          min-width: 180px;
          text-align: center;
        }

        .action-btn.btn-cancel {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-cyan);
          color: var(--color-cyan);
          box-shadow: 0 4px 0 #0088b3, 0 6px 12px rgba(0, 0, 0, 0.4);
          transform: translateY(0);
        }

        .action-btn.btn-cancel:hover {
          background-color: #1a2333;
          box-shadow: 0 4px 0 #0088b3, 0 8px 16px rgba(0, 0, 0, 0.6);
        }

        .action-btn.btn-submit {
          background: linear-gradient(180deg, #00d2ff, #00aadd);
          border: none;
          color: var(--bg-color-main);
          box-shadow: 0 4px 0 #0088b3, 0 6px 12px rgba(0, 210, 255, 0.4);
          transform: translateY(0);
        }

        .action-btn.btn-submit:hover {
          background: linear-gradient(180deg, #33dbff, #1abfff);
          box-shadow: 0 4px 0 #0088b3, 0 8px 16px rgba(0, 210, 255, 0.6);
        }

        .action-btn.btn-delete {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-status-red);
          color: var(--color-status-red);
          box-shadow: 0 4px 0 #cc3333, 0 6px 12px rgba(0, 0, 0, 0.4);
          transform: translateY(0);
        }

        .action-btn.btn-delete:hover {
          background-color: #2b1a1a;
          box-shadow: 0 4px 0 #cc3333, 0 8px 16px rgba(255, 77, 77, 0.4);
        }

        .action-btn:active {
          transform: translateY(4px);
          box-shadow: 0 0px 0 #0088b3, 0 2px 4px rgba(0, 210, 255, 0.4);
        }

        .action-btn.btn-delete:active {
          transform: translateY(4px);
          box-shadow: 0 0px 0 #cc3333, 0 2px 4px rgba(255, 77, 77, 0.2);
        }

        .btn-play-preview {
          margin: 16px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: fit-content;
          min-width: 0;
          padding: 8px 16px;
          align-self: center;
        }

        /* コンテンツプレイヤー子モーダル */
        .video-player-modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-player-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
        }

        .video-player-wrapper {
          position: relative;
          z-index: 2001;
          width: 90%;
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
          animation: popupFadeIn 0.2s ease-out;
        }

        .video-player-close {
          width: 36px;
          height: 36px;
        }
      </style>

      <div class="popup-overlay"></div>
      <div class="popup-wrapper">
        <!-- 上部ヘッダータイトル -->
        <div class="popup-header">
          <span class="popup-title">コンテンツの編集</span>
          <button class="vmodal-close-btn popup-close-btn"></button>
        </div>

        <div class="popup-content">
          <div class="register-grid" id="registerGrid">
            <!-- 左カラム: サムネイル関係 -->
            <div class="upload-column">
              <div class="thumbnail-upload-box" id="thumbnailUploadBox">
                <!-- 未設定時の表示 -->
                <div class="upload-placeholder" id="uploadPlaceholder">
                  <div class="upload-placeholder-title">サムネイル画像</div>
                  <div class="upload-placeholder-text">
                    <span>ファイルをドラッグ＆ドロップしてください</span>
                    <div class="upload-placeholder-action">
                      <span class="or-text">または</span>
                      <button class="inline-file-select-btn" id="inlineFileSelectBtn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        画像を選択
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 画像反映時の表示 -->
                <div class="thumbnail-preview-container" id="thumbnailPreviewContainer" style="display: none;">
                  <div class="thumbnail-badge">サムネイル画像</div>
                  <img id="registerThumbnailImg" src="" alt="サムネイル" class="thumbnail-img">
                  <button class="btn-change-image" id="changeImageBtn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    画像を変更
                  </button>
                </div>

                <input type="file" id="thumbnailUploadInput" accept="image/*" style="display: none;">
              </div>

              <!-- サムネイル候補画像エリア -->
              <div class="thumbnail-suggestions-section" id="thumbnailSuggestionsSection">
                <div class="suggestions-label">サムネイル候補画像</div>
                <div class="suggestions-grid">
                  <div class="suggestion-box" data-index="0">
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='%23005f73'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='12'>候補 1</text></svg>" class="suggestion-img">
                  </div>
                  <div class="suggestion-box" data-index="1">
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='%230a9396'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='12'>候補 2</text></svg>" class="suggestion-img">
                  </div>
                  <div class="suggestion-box" data-index="2">
                    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='100%' height='100%' fill='%2394d2bd'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='12'>候補 3</text></svg>" class="suggestion-img">
                  </div>
                </div>
              </div>

              <!-- コンテンツを再生して確認ボタン -->
              <button class="action-btn btn-cancel btn-play-preview" id="playPreviewBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                コンテンツを確認する
              </button>
            </div>

            <!-- 右カラム: フォーム -->
            <div class="form-column">
              <div class="form-group">
                <label class="form-label" for="movieTitle">タイトル</label>
                <input type="text" id="movieTitle" class="form-input" value="${this.movie.title}" placeholder="タイトルを入力">
              </div>

              <div class="form-group">
                <label class="form-label" for="movieDesc">説明</label>
                <textarea id="movieDesc" class="form-textarea" placeholder="コンテンツの説明を入力">${this.movie.desc || ''}</textarea>
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

              <!-- 配信コンテンツに反映セクション -->
              <div class="form-group sync-sites-group">
                <label class="form-label">配信コンテンツに反映</label>
                <div class="sync-sites-list">
                  <label class="sync-site-item">
                    <input type="checkbox" name="syncSites" value="1">
                    <span class="checkbox-custom"></span>
                    <span class="site-name" data-id="1">1号棟</span>
                  </label>
                  <label class="sync-site-item">
                    <input type="checkbox" name="syncSites" value="2">
                    <span class="checkbox-custom"></span>
                    <span class="site-name" data-id="2">2号棟</span>
                  </label>
                  <label class="sync-site-item">
                    <input type="checkbox" name="syncSites" value="3">
                    <span class="checkbox-custom"></span>
                    <span class="site-name" data-id="3">3号棟</span>
                  </label>
                  <label class="sync-site-item">
                    <input type="checkbox" name="syncSites" value="4">
                    <span class="checkbox-custom"></span>
                    <span class="site-name" data-id="4">4号棟</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 下部ボタンをコンテンツエリアの最下部に移動し、スクロール可能に -->
          <div class="popup-footer-actions">
            <button class="action-btn btn-delete">削除</button>
            <div class="spacer"></div>
            <button class="action-btn btn-cancel">キャンセル</button>
            <button class="action-btn btn-submit">確定</button>
          </div>
        </div>
      </div>

      <!-- コンテンツプレイヤー用子モーダル -->
      <div class="video-player-modal" id="videoPlayerModal" style="display: none;">
        <div class="video-player-overlay" id="videoPlayerOverlay"></div>
        <div class="video-player-wrapper">
          <button class="vmodal-close-btn video-player-close" id="videoPlayerCloseBtn"></button>
          <div class="dummy-video-frame" style="width: 100%; aspect-ratio: 16/9; background: #000; border-radius: var(--border-radius-medium); border: 2px solid var(--color-cyan); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--color-cyan)" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span style="color: var(--color-cyan); font-size: 16px; font-weight: bold; letter-spacing: 1px;">コンテンツプレビュー表示枠</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('movie-detail-popup', MovieDetailPopup);
