class RegisterPopup extends HTMLElement {
  constructor() {
    super();
    this.categories = [];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  open(categories) {
    this.categories = categories;
    this.render(); // カテゴリリストを動的にプルダウンへ反映するため再レンダリング
    this.setupDragAndDrop(); // レンダリング後にサムネイルのD&Dイベントを設定
    this.setupVideoUpload(); // レンダリング後に動画のD&Dイベントを設定
    this.setupSuggestions(); // レンダリング後に候補画像の選択イベントを設定
    this.resetVideoUI(); // 最初は動画ファイル未設定状態にする
    this.style.display = 'block';
    document.body.style.overflow = 'hidden';
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
    });
  }

  setupVideoUpload() {
    const dropZone = this.querySelector('#videoUploadBox');
    const fileInput = this.querySelector('#videoFileInput');
    const inlineBtn = this.querySelector('#inlineVideoSelectBtn');
    const changeBtn = this.querySelector('#changeVideoBtn');

    if (!dropZone || !fileInput) return;

    const openFileDialog = () => fileInput.click();

    if (inlineBtn) inlineBtn.addEventListener('click', openFileDialog);
    if (changeBtn) changeBtn.addEventListener('click', openFileDialog);

    // ドラッグ＆ドロップイベント
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
        this.handleVideoFile(file);
      }
    });

    // ファイル選択入力のイベント
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleVideoFile(e.target.files[0]);
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

  handleVideoFile(file) {
    if (!file.type.startsWith('video/')) {
      alert('動画ファイルを選択してください。');
      return;
    }
    this.updateVideoUI(file.name);
    this.setFieldsDisabled(false);

    // 候補画像エリアを表示
    const sugSection = this.querySelector('#thumbnailSuggestionsSection');
    if (sugSection) sugSection.style.display = 'flex';
  }

  updateVideoUI(fileName) {
    const dropZone = this.querySelector('#videoUploadBox');
    const placeholder = this.querySelector('#videoPlaceholder');
    const previewContainer = this.querySelector('#videoPreviewContainer');
    const nameElement = this.querySelector('#selectedVideoFileName');

    if (dropZone && placeholder && previewContainer && nameElement) {
      nameElement.textContent = fileName;
      dropZone.classList.add('has-video');
      placeholder.style.display = 'none';
      previewContainer.style.display = 'flex';
    }
  }

  resetVideoUI() {
    const dropZone = this.querySelector('#videoUploadBox');
    const placeholder = this.querySelector('#videoPlaceholder');
    const previewContainer = this.querySelector('#videoPreviewContainer');
    const nameElement = this.querySelector('#selectedVideoFileName');
    const fileInput = this.querySelector('#videoFileInput');

    if (dropZone && placeholder && previewContainer && nameElement) {
      nameElement.textContent = '';
      dropZone.classList.remove('has-video');
      placeholder.style.display = 'flex';
      previewContainer.style.display = 'none';
      if (fileInput) fileInput.value = '';
    }

    // 候補画像エリアを非表示にし、選択をリセット
    const sugSection = this.querySelector('#thumbnailSuggestionsSection');
    if (sugSection) sugSection.style.display = 'none';
    const suggestions = this.querySelectorAll('.suggestion-box');
    suggestions.forEach(b => b.classList.remove('selected'));

    // フォームリセット
    const titleInput = this.querySelector('#movieTitle');
    const descInput = this.querySelector('#movieDesc');
    const typeSelect = this.querySelector('#movieType');
    const categorySelect = this.querySelector('#movieCategory');

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (typeSelect) typeSelect.value = '';
    if (categorySelect) categorySelect.value = '';

    this.resetThumbnailUI();
    this.setFieldsDisabled(true);
  }

  setFieldsDisabled(disabled) {
    const grid = this.querySelector('#registerGrid');
    if (grid) {
      if (disabled) {
        grid.classList.add('disabled-fields');
      } else {
        grid.classList.remove('disabled-fields');
      }
    }
    const inputs = this.querySelectorAll('#registerGrid input, #registerGrid textarea, #registerGrid select');
    inputs.forEach(input => {
      input.disabled = disabled;
    });
  }

  setupDragAndDrop() {
    const dropZone = this.querySelector('#thumbnailUploadBox');
    const fileInput = this.querySelector('#thumbnailUploadInput');
    const inlineBtn = this.querySelector('#inlineFileSelectBtn');
    const changeBtn = this.querySelector('#changeImageBtn');

    if (!dropZone || !fileInput) return;

    // ファイル選択ダイアログを開く
    const openFileDialog = () => fileInput.click();
    
    if (inlineBtn) inlineBtn.addEventListener('click', openFileDialog);
    if (changeBtn) changeBtn.addEventListener('click', openFileDialog);

    // ドラッグ＆ドロップイベント
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

    // ファイル選択入力のイベント
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

      // 候補画像と一致するsrcであれば、selectedクラスを付与し、それ以外は解除する
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
    const videoInput = this.querySelector('#videoFileInput');
    const titleInput = this.querySelector('#movieTitle');
    const descInput = this.querySelector('#movieDesc');
    const typeSelect = this.querySelector('#movieType');
    const categorySelect = this.querySelector('#movieCategory');
    const imgElement = this.querySelector('#registerThumbnailImg');

    const videoFile = (videoInput && videoInput.files.length > 0) ? videoInput.files[0] : null;
    const title = titleInput ? titleInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '';
    const categoryId = categorySelect ? categorySelect.value : '';
    const thumbnailData = (imgElement && imgElement.src.startsWith('data:')) ? imgElement.src : null;

    if (!videoFile) {
      alert('動画ファイルを選択してください。');
      return;
    }
    if (!title) {
      alert('タイトルを入力してください。');
      return;
    }
    if (!categoryId) {
      alert('カテゴリを選択してください。');
      return;
    }

    // 親（app.js）へ新規登録イベントを発火
    this.dispatchEvent(new CustomEvent('movie-register', {
      detail: {
        title,
        desc,
        type,
        categoryId,
        thumbnailData,
        videoFileName: videoFile.name
      },
      bubbles: true,
      composed: true
    }));

    this.close();
  }

  render() {
    const categoryOptions = this.categories.map(cat => `
      <option value="${cat.id}">${cat.name}</option>
    `).join('');

    this.innerHTML = `
      <style>
        register-popup {
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
          animation: registerPopupFadeIn 0.25s ease-out;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        @keyframes registerPopupFadeIn {
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

        /* 閉じるボタン（赤い四角 ＋ 擬似要素バツマーク） */
        .vmodal-close-btn {
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

        .vmodal-close-btn:hover {
          background-color: #ff2222;
        }

        .vmodal-close-btn::before,
        .vmodal-close-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 2px;
          background-color: #fff;
          border-radius: 1px;
        }

        .vmodal-close-btn::before {
          transform: translate(-50%, -50%) rotate(45deg);
        }

        .vmodal-close-btn::after {
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
          background-color: transparent;
          border: 1px solid var(--color-cyan);
          color: var(--color-cyan);
          padding: 6px 12px;
          border-radius: var(--border-radius-small);
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .inline-file-select-btn:hover {
          background-color: rgba(0, 210, 255, 0.1);
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

        .btn-change-image {
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: #0d1b2a;
          border: 1.5px solid rgba(0, 210, 255, 0.5);
          color: var(--text-color-cyan);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: bold;
          border-radius: var(--border-radius-small);
          cursor: pointer;
          transition: all 0.2s;
          z-index: 2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-change-image:hover {
          background-color: var(--color-cyan);
          color: var(--bg-color-main);
          border-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
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

        /* 項目を横並びにするためのレイアウト行 */
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
          padding: 24px 40px;
          box-sizing: border-box;
          width: calc(100% + 80px);
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

        .action-btn:active {
          transform: scale(0.98);
        }

        /* 動画アップロード関係 */
        .video-upload-section {
          width: 100%;
          margin-bottom: 24px;
          flex-shrink: 0;
        }

        .video-upload-box {
          width: 100%;
          min-height: 120px;
          padding: 20px;
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

        .video-upload-box.drag-over {
          background-color: rgba(0, 210, 255, 0.05);
          border-color: var(--color-cyan);
        }

        .video-upload-box.has-video {
          background-color: var(--bg-color-main);
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-small);
          min-height: auto;
        }

        .video-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        .video-placeholder-title {
          color: var(--text-color-cyan);
          font-size: 14px;
          font-weight: bold;
        }

        .video-placeholder-text {
          color: var(--text-color-primary);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .video-placeholder-action {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .video-attention-text {
          color: var(--color-status-red);
          font-size: 12px;
          font-weight: bold;
          margin-top: 4px;
        }

        .video-preview-container {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          box-sizing: border-box;
          gap: 20px;
        }

        .video-badge {
          background-color: rgba(0, 210, 255, 0.15);
          border: 1.5px solid var(--color-cyan);
          border-radius: var(--border-radius-small);
          padding: 4px 10px;
          font-size: 12px;
          font-weight: bold;
          color: var(--text-color-cyan);
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          flex-shrink: 0;
        }

        .video-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background-color: var(--color-cyan);
          border-radius: 50%;
          box-shadow: 0 0 4px var(--color-cyan-glow);
        }

        .video-info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-color-primary);
          font-weight: 500;
          flex-grow: 1;
        }

        .video-file-name {
          font-size: 15px;
          word-break: break-all;
        }

        .btn-change-video {
          background-color: #0d1b2a;
          border: 1.5px solid rgba(0, 210, 255, 0.5);
          color: var(--text-color-cyan);
          padding: 6px 12px;
          font-size: 12px;
          font-weight: bold;
          border-radius: var(--border-radius-small);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .btn-change-video:hover {
          background-color: var(--color-cyan);
          color: var(--bg-color-main);
          border-color: var(--color-cyan);
          box-shadow: 0 0 12px var(--color-cyan-glow);
        }

        /* 無効化レイアウト */
        .disabled-fields {
          opacity: 0.3;
          pointer-events: none;
          user-select: none;
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
      </style>

      <div class="popup-overlay"></div>
      <div class="popup-wrapper">
        <!-- 上部ヘッダータイトル -->
        <div class="popup-header">
          <span class="popup-title">動画を追加</span>
          <button class="vmodal-close-btn popup-close-btn"></button>
        </div>

        <div class="popup-content">
          <!-- 動画ファイル選択セクション（横幅いっぱい） -->
          <div class="video-upload-section">
            <div class="video-upload-box" id="videoUploadBox">
              <!-- 未設定時の表示 -->
              <div class="video-placeholder" id="videoPlaceholder">
                <div class="video-placeholder-title">動画ファイル</div>
                <div class="video-placeholder-text">
                  <span>ファイルをドラッグ＆ドロップしてください</span>
                  <div class="video-placeholder-action">
                    <span class="or-text">または</span>
                    <button class="inline-file-select-btn" id="inlineVideoSelectBtn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      動画を選択
                    </button>
                  </div>
                </div>
                <div class="video-attention-text">※動画ファイルを選択すると、以降の入力項目が選択・編集可能になります。</div>
              </div>

              <!-- 動画反映時の表示 -->
              <div class="video-preview-container" id="videoPreviewContainer" style="display: none;">
                <div class="video-badge">選択中の動画</div>
                <div class="video-info-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-cyan);">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <span id="selectedVideoFileName" class="video-file-name">動画ファイル名.mp4</span>
                </div>
                <button class="btn-change-video" id="changeVideoBtn">
                  動画を変更
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                  </svg>
                </button>
              </div>

              <input type="file" id="videoFileInput" accept="video/*" style="display: none;">
            </div>
          </div>

          <div class="register-grid disabled-fields" id="registerGrid">
            <!-- 左カラム: 画像アップロード -->
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
                    画像変更
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                  </button>
                </div>

                <input type="file" id="thumbnailUploadInput" accept="image/*" style="display: none;">
            </div>

            <!-- サムネイル候補画像エリア（動画選択後のみ表示） -->
            <div class="thumbnail-suggestions-section" id="thumbnailSuggestionsSection" style="display: none;">
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
          </div>

            <!-- 右カラム: フォーム -->
            <div class="form-column">
              <div class="form-group">
                <label class="form-label" for="movieTitle">タイトル</label>
                <input type="text" id="movieTitle" class="form-input" placeholder="タイトルを入力">
              </div>

              <div class="form-group">
                <label class="form-label" for="movieDesc">説明</label>
                <textarea id="movieDesc" class="form-textarea" placeholder="動画の説明を入力"></textarea>
              </div>

              <!-- ソフトタイプとカテゴリを横並びにする行 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="movieType">ソフトタイプ</label>
                  <select id="movieType" class="form-select">
                    <option value="" disabled selected hidden>ソフトタイプを選択</option>
                    <option value="mp4">動画形式 (.mp4)</option>
                    <option value="3dcg">3DCGコンテンツ</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="movieCategory">カテゴリ</label>
                  <select id="movieCategory" class="form-select">
                    <option value="" disabled selected hidden>カテゴリを選択</option>
                    ${categoryOptions}
                  </select>
                </div>
            </div>
          </div>
        </div>

        <!-- 下部ボタンをコンテンツエリアの最下部に移動し、スクロール可能に -->
        <div class="popup-footer-actions">
          <button class="action-btn btn-cancel">キャンセル</button>
          <button class="action-btn btn-submit">追加する</button>
        </div>
      </div>
    </div>
    `;
  }
}

customElements.define('register-popup', RegisterPopup);
