document.addEventListener('DOMContentLoaded', () => {
  // --- 現場名の動的適用処理 ---
  const applyBuildingNames = (selectEl) => {
    if (!selectEl) return;
    Array.from(selectEl.options).forEach(opt => {
      const storedName = localStorage.getItem(`adeliae_building_name_${opt.value}`);
      if (storedName) {
        opt.textContent = storedName;
      }
    });
  };

  // すべての画面で存在するセレクトボックスに名前を適用
  const allSelects = ['buildingSelect', 'syncBuildingSelect', 'autoplayBuildingSelect'];
  allSelects.forEach(id => {
    const el = document.getElementById(id);
    if (el) applyBuildingNames(el);
  });

  // 各現場カードの映画名・アプリタイプをローカルストレージから適用 (同期の維持)
  const buildingIds = ['1', '2', '3', '4'];
  buildingIds.forEach(id => {
    const card = document.getElementById(id);
    if (card) {
      const storedMovie = localStorage.getItem(`adeliae_building_movie_${id}`);
      if (storedMovie) {
        card.setAttribute('content-name', storedMovie);
      }
      const storedApp = localStorage.getItem(`adeliae_building_app_${id}`);
      if (storedApp) {
        card.setAttribute('app-type', storedApp);
      }
    }
  });

  // --- 設置現場監視画面用 (detail-popup 制御 -> 専用画面への遷移に変更) ---
  const popup = document.querySelector('detail-popup');

  // 各号棟カードから詳細クリックを受け取る
  document.addEventListener('detail-click', (e) => {
    const data = e.detail;
    // ポップアップを開くのではなく、詳細管理専用ページへ遷移させる
    window.location.href = `manage.html?id=${data.id}`;
  });

  // 各号棟カードからカメラプレビュー拡大クリックを受け取る
  const cameraZoomPopup = document.querySelector('camera-zoom-popup');
  document.addEventListener('camera-zoom-click', (e) => {
    const data = e.detail;
    if (cameraZoomPopup) {
      cameraZoomPopup.open(data.id, data.name);
    }
  });

  // --- 全体コンテンツ管理画面用 (カテゴリ・コンテンツ 登録・管理・編集 制御) ---
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const newRegisterBtn = document.getElementById('newRegisterBtn');
  const categoryPopup = document.querySelector('category-popup');
  const registerPopup = document.querySelector('register-popup');
  const movieDetailPopup = document.querySelector('movie-detail-popup');
  
  // --- 詳細管理専用画面用 (設定・プレイリスト 制御) ---
  const buildingSelect = document.getElementById('buildingSelect');
  const syncBtn = document.getElementById('syncBtn');
  const autoPlayBtn = document.getElementById('autoPlayBtn');
  const logoSelectBtn = document.getElementById('logoSelectBtn');
  const colorPickerBtn = document.getElementById('colorPickerBtn');

  // --- 同期設定画面用 (左右連動 制御) ---
  const syncBuildingSelect = document.getElementById('syncBuildingSelect');
  const syncCategoryTabs = document.getElementById('syncCategoryTabs');
  const pcMoviesContainer = document.getElementById('pcMoviesContainer');
  const deviceMoviesContainer = document.getElementById('deviceMoviesContainer');
  const syncExecuteBtn = document.getElementById('syncExecuteBtn');
  const devicePanelTitle = document.getElementById('devicePanelTitle');
  const syncSourceSelect = document.getElementById('syncSourceSelect');

  // --- 自動再生設定画面用 (autoplay.html) の描画・制御ロジック ---
  const autoplayBuildingSelect = document.getElementById('autoplayBuildingSelect');
  const backToManageBtn = document.getElementById('backToManageBtn');
  const waitTimeInput = document.getElementById('waitTimeInput');
  const spinUpBtn = document.getElementById('spinUpBtn');
  const spinDownBtn = document.getElementById('spinDownBtn');
  const autoplayToggle = document.getElementById('autoplayToggle');
  const saveAutoplayBtn = document.getElementById('saveAutoplayBtn');
  const slotsContainer = document.getElementById('slotsContainer');
  const slotsPanelTitle = document.getElementById('slotsPanelTitle');

  // モーダル系
  const videoSelectModal = document.getElementById('videoSelectModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalVideoList = document.getElementById('modalVideoList');

  const mainContent = document.querySelector('.main-content');

  // デフォルトデータ定義
  const defaultCategories = [
    {
      id: 'cat_nature',
      name: '自然 / 海洋',
      movies: [
        { id: 'm1', title: '海中探訪 vol.1', desc: '神秘的な海中の中をゆっくりと探検するヒーリング映像。', type: 'mp4' },
        { id: 'm2', title: '深海の神秘', desc: '光の届かない深海に生息する珍しい生物たちの生態に迫る。', type: 'mp4' },
        { id: 'm3', title: '珊瑚礁の世界', desc: '色鮮やかな美しいサンゴ礁と、そこに群がる熱帯魚たち。', type: 'mp4' },
        { id: 'm4', title: '極地の氷海', desc: '氷山が浮かぶ凍てつく海と、その周辺でたくましく生きる動物たち。', type: 'mp4' }
      ]
    },
    {
      id: 'cat_space',
      name: '宇宙',
      movies: [
        { id: 'm5', title: '宇宙遊泳体験', desc: '国際宇宙ステーションから外に出て地球を眺めるかのような体験映像。', type: 'mp4' },
        { id: 'm6', title: '銀河の旅', desc: '遥か遠くの星雲や他の銀河へ向かって飛び去っていくSF調CG。', type: 'mp4' },
        { id: 'm7', title: '太陽系の神秘', desc: '太陽を中心に、水星から海王星までの各惑星をクローズアップ。', type: 'mp4' },
        { id: 'm8', title: 'ブラックホール深淵', desc: '光すら逃げ出せない宇宙の重力深淵ブラックホールのシミュレーション。', type: 'mp4' }
      ]
    },
    {
      id: 'cat_city',
      name: '都市 / 景観',
      movies: [
        { id: 'm9', title: '摩天楼の夜景', desc: '大都市のきらめく夜景と光が流れるタイムラプス映像。', type: 'mp4' },
        { id: 'm10', title: '古都の佇まい', desc: '歴史ある伝統的な街並みと情緒あふれる木造建築。', type: 'mp4' },
        { id: 'm11', title: '未来都市の鼓動', desc: '先進的なテクノロジーとサイバーパンク風の近未来都市CG。', type: 'mp4' }
      ]
    }
  ];

  // ローカルストレージまたはデフォルトからカテゴリデータを取得
  let categories = JSON.parse(localStorage.getItem('adeliae_categories'));
  if (!categories) {
    categories = defaultCategories;
    localStorage.setItem('adeliae_categories', JSON.stringify(categories));
  } else {
    // 既存データのマイグレーション（「テスト」「サンプル」「吉野」カテゴリが存在する場合は「都市 / 景観」に変更し、コンテンツを適切なものに更新）
    let hasMigration = false;
    categories.forEach(cat => {
      if (cat.name === 'テスト' || cat.name === 'サンプル' || cat.name === '吉野') {
        cat.name = '都市 / 景観';
        cat.movies = [
          { id: 'm9', title: '摩天楼の夜景', desc: '大都市のきらめく夜景と光が流れるタイムラプス映像。', type: 'mp4' },
          { id: 'm10', title: '古都の佇まい', desc: '歴史ある伝統的な街並みと情緒あふれる木造建築。', type: 'mp4' },
          { id: 'm11', title: '未来都市の鼓動', desc: '先進的なテクノロジーとサイバーパンク風の近未来都市CG。', type: 'mp4' }
        ];
        hasMigration = true;
      }
    });
    if (hasMigration) {
      localStorage.setItem('adeliae_categories', JSON.stringify(categories));
    }
  }

  // ==========================================
  // 【A】全体コンテンツ管理画面 (movies.html) の描画ロジック
  // ==========================================
  if (addCategoryBtn && categoryPopup && mainContent && !buildingSelect && !syncBuildingSelect && !autoplayBuildingSelect) {
    let activeCategoryFilter = 'all';

    const renderCategories = () => {
      const existingSections = mainContent.querySelectorAll('.movie-category-section');
      existingSections.forEach(sec => sec.remove());
      const existingTabs = mainContent.querySelector('.category-filter-container');
      if (existingTabs) existingTabs.remove();
      const existingEmpty = mainContent.querySelector('.empty-state');
      if (existingEmpty) existingEmpty.remove();

      if (categories.length === 0) {
        const noCategoryMessage = document.createElement('div');
        noCategoryMessage.className = 'movie-category-section empty-state';
        noCategoryMessage.style.cssText = 'text-align: center; padding: 40px; color: var(--text-color-secondary); font-size: 15px;';
        noCategoryMessage.innerHTML = 'カテゴリが登録されていません。上の「カテゴリ編集」ボタンから登録してください。';
        mainContent.appendChild(noCategoryMessage);
        return;
      }

      if (activeCategoryFilter !== 'all' && !categories.some(c => c.id === activeCategoryFilter)) {
        activeCategoryFilter = 'all';
      }

      const filterContainer = document.createElement('div');
      filterContainer.className = 'category-filter-container';

      const filterLabel = document.createElement('span');
      filterLabel.className = 'category-filter-label';
      filterLabel.textContent = 'カテゴリ';

      const filterSelect = document.createElement('select');
      filterSelect.className = 'category-filter-select';
      
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'すべて';
      filterSelect.appendChild(allOption);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        filterSelect.appendChild(option);
      });

      filterSelect.value = activeCategoryFilter;
      filterSelect.addEventListener('change', (e) => {
        activeCategoryFilter = e.target.value;
        renderCategories();
      });

      filterContainer.appendChild(filterLabel);
      filterContainer.appendChild(filterSelect);

      const actionBar = mainContent.querySelector('.action-bar');
      if (actionBar) {
        actionBar.after(filterContainer);
      } else {
        mainContent.insertBefore(filterContainer, mainContent.firstChild);
      }

      const categoriesToRender = activeCategoryFilter === 'all'
        ? categories
        : categories.filter(c => c.id === activeCategoryFilter);

      categoriesToRender.forEach(cat => {
        const section = document.createElement('section');
        section.className = 'movie-category-section';
        section.id = cat.id;

        const moviesHTML = (cat.movies || []).map(movie => `
          <div class="movie-card hover-zoom-card" data-id="${movie.id}" style="cursor: pointer;">
            <div class="movie-thumbnail">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.4);">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <div class="movie-info">
              <span class="movie-title">${movie.title}</span>
            </div>
          </div>
        `).join('');

        section.innerHTML = `
          <h2 class="category-title">${cat.name}</h2>
          <div class="movies-grid">
            ${moviesHTML || '<div class="empty-list" style="grid-column: span 4; text-align: center; color: var(--text-color-secondary); padding: 20px; font-size: 15px;">このカテゴリにコンテンツは登録されていません。</div>'}
          </div>
        `;
        mainContent.appendChild(section);
      });

      const movieCards = mainContent.querySelectorAll('.movie-card');
      movieCards.forEach(card => {
        card.addEventListener('click', () => {
          const movieId = card.getAttribute('data-id');
          let targetMovie = null;
          categories.forEach(cat => {
            const m = (cat.movies || []).find(x => x.id === movieId);
            if (m) {
              targetMovie = { ...m, categoryId: cat.id };
            }
          });

          if (targetMovie && movieDetailPopup) {
            movieDetailPopup.open(targetMovie, categories);
          }
        });
      });
    };

    renderCategories();

    addCategoryBtn.addEventListener('click', () => {
      categoryPopup.open(categories);
    });

    if (newRegisterBtn && registerPopup) {
      newRegisterBtn.addEventListener('click', () => {
        registerPopup.open(categories);
      });

      document.addEventListener('movie-register', (e) => {
        const { title, desc, type, categoryId, syncBuildingIds } = e.detail;

        const targetCategory = categories.find(cat => cat.id === categoryId);
        if (targetCategory) {
          if (!targetCategory.movies) {
            targetCategory.movies = [];
          }
          const newMovie = {
            id: 'm_' + Date.now(),
            title: title,
            desc: desc,
            type: type
          };
          targetCategory.movies.push(newMovie);

          localStorage.setItem('adeliae_categories', JSON.stringify(categories));
          renderCategories();

          // 上映中コンテンツとして反映 (同期シミュレーション)
          if (syncBuildingIds && syncBuildingIds.length > 0) {
            syncBuildingIds.forEach(buildingId => {
              const card = document.getElementById(buildingId);
              if (card) {
                card.setAttribute('content-name', title);
                if (type === '3dcg') {
                  card.setAttribute('app-type', '3DCGデータ表示ソフト');
                } else if (type === 'mp4') {
                  card.setAttribute('app-type', '2D映像表示ソフト');
                }
              }
              // ローカルストレージに保存して初期化時に適用できるようにする
              localStorage.setItem(`adeliae_building_movie_${buildingId}`, title);
              if (type) {
                localStorage.setItem(`adeliae_building_app_${buildingId}`, type === '3dcg' ? '3DCGデータ表示ソフト' : '2D映像表示ソフト');
              }
            });
          }
        }
      });
    }

    document.addEventListener('movie-update', (e) => {
      const { movieId, title, desc, type, categoryId, syncBuildingIds, thumbnailData } = e.detail;

      let oldCategory = null;
      let targetMovieIndex = -1;
      let targetMovieObj = null;

      categories.forEach(cat => {
        const idx = (cat.movies || []).findIndex(m => m.id === movieId);
        if (idx !== -1) {
          oldCategory = cat;
          targetMovieIndex = idx;
          targetMovieObj = cat.movies[idx];
        }
      });

      if (targetMovieObj) {
        const oldTitle = targetMovieObj.title;
        targetMovieObj.title = title;
        targetMovieObj.desc = desc;
        targetMovieObj.type = type;
        if (thumbnailData) {
          targetMovieObj.thumbnailData = thumbnailData;
        }

        if (oldCategory.id !== categoryId) {
          oldCategory.movies.splice(targetMovieIndex, 1);
          const newCategory = categories.find(cat => cat.id === categoryId);
          if (newCategory) {
            if (!newCategory.movies) newCategory.movies = [];
            targetMovieObj.categoryId = categoryId;
            newCategory.movies.push(targetMovieObj);
          }
        }

        localStorage.setItem('adeliae_categories', JSON.stringify(categories));
        renderCategories();

        // 配信コンテンツに反映 (同期シミュレーション)
        if (syncBuildingIds) {
          const buildingIds = ['1', '2', '3', '4'];
          buildingIds.forEach(buildingId => {
            const card = document.getElementById(buildingId);
            const isChecked = syncBuildingIds.includes(buildingId);
            const storedMovie = localStorage.getItem(`adeliae_building_movie_${buildingId}`);

            if (isChecked) {
              if (card) {
                card.setAttribute('content-name', title);
                if (type === '3dcg') {
                  card.setAttribute('app-type', '3DCGデータ表示ソフト');
                } else if (type === 'mp4') {
                  card.setAttribute('app-type', '2D映像表示ソフト');
                }
              }
              localStorage.setItem(`adeliae_building_movie_${buildingId}`, title);
              if (type) {
                localStorage.setItem(`adeliae_building_app_${buildingId}`, type === '3dcg' ? '3DCGデータ表示ソフト' : '2D映像表示ソフト');
              }
            } else {
              if (storedMovie === title || storedMovie === oldTitle) {
                if (card) {
                  card.setAttribute('content-name', '—');
                  card.setAttribute('app-type', '—');
                }
                localStorage.removeItem(`adeliae_building_movie_${buildingId}`);
                localStorage.removeItem(`adeliae_building_app_${buildingId}`);
              }
            }
          });
        }
      }
    });

    document.addEventListener('movie-delete', (e) => {
      const { movieId } = e.detail;

      categories.forEach(cat => {
        const idx = (cat.movies || []).findIndex(m => m.id === movieId);
        if (idx !== -1) {
          cat.movies.splice(idx, 1);
        }
      });

      localStorage.setItem('adeliae_categories', JSON.stringify(categories));
      renderCategories();
    });

    document.addEventListener('category-save', (e) => {
      const updatedCategories = e.detail.categories;

      const activeMovieIds = new Set();
      updatedCategories.forEach(cat => {
        (cat.movies || []).forEach(m => activeMovieIds.add(m.id));
      });

      const rescuedMovies = [];
      categories.forEach(oldCat => {
        (oldCat.movies || []).forEach(m => {
          if (!activeMovieIds.has(m.id)) {
            rescuedMovies.push(m);
          }
        });
      });

      if (rescuedMovies.length > 0 && updatedCategories.length > 0) {
        updatedCategories[0].movies = [...(updatedCategories[0].movies || []), ...rescuedMovies];
      }

      categories = updatedCategories;
      localStorage.setItem('adeliae_categories', JSON.stringify(categories));
      renderCategories();
    });
  }

  // ==========================================
  // 【B】詳細管理専用画面 (manage.html) の描画ロジック
  // ==========================================
  const editBuildingNameBtn = document.getElementById('editBuildingNameBtn');
  if (editBuildingNameBtn && mainContent && !syncBuildingSelect && !autoplayBuildingSelect) {
    const appHeader = document.querySelector('app-header');

    // URLのパラメータから棟IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const buildingId = urlParams.get('id') || '1';

    // ヘッダーに棟IDを設定
    if (appHeader) {
      appHeader.setAttribute('building-id', buildingId);
    }

    // ヘッダータイトルの動的書き換え
    const updateHeaderTitle = () => {
      if (appHeader) {
        let defaultName = `${buildingId}号棟`;
        const name = localStorage.getItem(`adeliae_building_name_${buildingId}`) || defaultName;
        appHeader.setAttribute('page-title', `${name} - 詳細 / 設定`);
        appHeader.setAttribute('breadcrumbs', JSON.stringify([
          { name: '設置現場 監視', url: 'index.html' },
          { name: `${name} - 詳細 / 設定` }
        ]));
      }
    };
    updateHeaderTitle();

    // --- 現場名編集機能のバインド ---
    const buildingNameDisplay = document.getElementById('buildingNameDisplay');
    const buildingNameModal = document.getElementById('buildingNameModal');
    const nameModalCloseBtn = document.getElementById('nameModalCloseBtn');
    const nameModalCancelBtn = document.getElementById('nameModalCancelBtn');
    const nameModalOverlay = document.getElementById('nameModalOverlay');
    const saveBuildingNameBtn = document.getElementById('saveBuildingNameBtn');
    const newBuildingNameInput = document.getElementById('newBuildingNameInput');

    const updateBuildingNameDisplay = () => {
      const defaultName = `${buildingId}号棟`;
      const name = localStorage.getItem(`adeliae_building_name_${buildingId}`) || defaultName;
      if (buildingNameDisplay) {
        buildingNameDisplay.textContent = name;
      }
    };
    updateBuildingNameDisplay();

    if (editBuildingNameBtn && buildingNameModal) {
      editBuildingNameBtn.addEventListener('click', () => {
        const defaultName = `${buildingId}号棟`;
        const currentName = localStorage.getItem(`adeliae_building_name_${buildingId}`) || defaultName;
        if (newBuildingNameInput) {
          newBuildingNameInput.value = currentName;
        }
        buildingNameModal.style.display = 'block';
      });
    }

    const closeNameModal = () => {
      if (buildingNameModal) buildingNameModal.style.display = 'none';
    };

    if (nameModalCloseBtn) nameModalCloseBtn.addEventListener('click', closeNameModal);
    if (nameModalCancelBtn) nameModalCancelBtn.addEventListener('click', closeNameModal);
    if (nameModalOverlay) nameModalOverlay.addEventListener('click', closeNameModal);

    if (saveBuildingNameBtn && newBuildingNameInput) {
      saveBuildingNameBtn.addEventListener('click', () => {
        const newName = newBuildingNameInput.value.trim();
        if (newName) {
          localStorage.setItem(`adeliae_building_name_${buildingId}`, newName);
          
          // 表示更新
          updateBuildingNameDisplay();
          
          // ヘッダータイトル・パンくず・セレクトボックスの更新
          if (appHeader) {
            appHeader.setAttribute('building-id', buildingId);
          }
          updateHeaderTitle();
          
          closeNameModal();
        } else {
          alert('有効な名前を入力してください。');
        }
      });
    }

    // 詳細管理用プレイリスト/カテゴリの動的描画関数
    let activeManageCategoryFilter = 'all';

    // 詳細管理用プレイリスト/カテゴリの動的描画関数
    const renderManageCategories = () => {
      const existingSections = mainContent.querySelectorAll('.movie-category-section');
      existingSections.forEach(sec => sec.remove());
      const existingTabs = mainContent.querySelector('.category-filter-container');
      if (existingTabs) existingTabs.remove();
      const existingEmpty = mainContent.querySelector('.empty-state');
      if (existingEmpty) existingEmpty.remove();

      if (categories.length === 0) {
        const noCategoryMessage = document.createElement('div');
        noCategoryMessage.className = 'movie-category-section empty-state';
        noCategoryMessage.style.cssText = 'text-align: center; padding: 40px; color: var(--text-color-secondary); font-size: 15px;';
        noCategoryMessage.innerHTML = '登録されているコンテンツカテゴリがありません。';
        mainContent.appendChild(noCategoryMessage);
        return;
      }

      if (activeManageCategoryFilter !== 'all' && !categories.some(c => c.id === activeManageCategoryFilter)) {
        activeManageCategoryFilter = 'all';
      }

      const filterContainer = document.createElement('div');
      filterContainer.className = 'category-filter-container';

      const filterLabel = document.createElement('span');
      filterLabel.className = 'category-filter-label';
      filterLabel.textContent = 'カテゴリ';

      const filterSelect = document.createElement('select');
      filterSelect.className = 'category-filter-select';
      
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'すべて';
      filterSelect.appendChild(allOption);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        filterSelect.appendChild(option);
      });

      filterSelect.value = activeManageCategoryFilter;
      filterSelect.addEventListener('change', (e) => {
        activeManageCategoryFilter = e.target.value;
        renderManageCategories();
      });

      filterContainer.appendChild(filterLabel);
      filterContainer.appendChild(filterSelect);

      const configBar = mainContent.querySelector('.config-bar');
      if (configBar) {
        configBar.after(filterContainer);
      } else {
        mainContent.insertBefore(filterContainer, mainContent.firstChild);
      }

      const categoriesToRender = activeManageCategoryFilter === 'all'
        ? categories
        : categories.filter(c => c.id === activeManageCategoryFilter);

      categoriesToRender.forEach(cat => {
        const section = document.createElement('section');
        section.className = 'movie-category-section';
        section.id = cat.id;

        const moviesHTML = (cat.movies || []).map(movie => `
          <div class="movie-card" data-id="${movie.id}">
            <div class="movie-thumbnail">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.4);">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <div class="movie-info">
              <span class="movie-title">${movie.title}</span>
            </div>
          </div>
        `).join('');

        section.innerHTML = `
          <h2 class="category-title">${cat.name}</h2>
          <div class="movies-grid">
            ${moviesHTML || '<div class="empty-list" style="grid-column: span 4; text-align: center; color: var(--text-color-secondary); padding: 20px; font-size: 15px;">このカテゴリにコンテンツは登録されていません。</div>'}
          </div>
        `;
        mainContent.appendChild(section);
      });
    };

    renderManageCategories();

    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        window.location.href = `sync.html?id=${buildingId}`;
      });
    }

    if (autoPlayBtn) {
      autoPlayBtn.addEventListener('click', () => {
        window.location.href = `autoplay.html?id=${buildingId}`;
      });
    }



    if (logoSelectBtn) {
      const logoModal = document.getElementById('logoChangeModal');
      const logoModalCloseBtn = document.getElementById('logoModalCloseBtn');
      const logoModalCancelBtn = document.getElementById('logoModalCancelBtn');
      const logoModalOverlay = document.getElementById('logoModalOverlay');
      const logoUploadBtn = document.getElementById('logoUploadBtn');
      const logoUploadInput = document.getElementById('logoUploadInput');
      const logoModalThumbnailImg = document.getElementById('logoModalThumbnailImg');
      const saveLogoBtn = document.getElementById('saveLogoBtn');
      const logoRemoveBtn = document.getElementById('logoRemoveBtn');
      const configLogoPreview = document.querySelector('.config-logo-preview');
      
      const logoUploadBox = document.getElementById('logoUploadBox');
      const logoUploadPlaceholder = document.getElementById('logoUploadPlaceholder');
      const logoPreviewContainer = document.getElementById('logoPreviewContainer');
      const logoChangeImageBtn = document.getElementById('logoChangeImageBtn');

      const updateLogoUI = (src) => {
        if (src) {
          if (logoModalThumbnailImg) logoModalThumbnailImg.src = src;
          if (logoUploadBox) logoUploadBox.classList.add('has-image');
          if (logoUploadPlaceholder) logoUploadPlaceholder.style.display = 'none';
          if (logoPreviewContainer) logoPreviewContainer.style.display = 'block';
        } else {
          if (logoModalThumbnailImg) logoModalThumbnailImg.removeAttribute('src');
          if (logoUploadBox) logoUploadBox.classList.remove('has-image');
          if (logoUploadPlaceholder) logoUploadPlaceholder.style.display = 'flex';
          if (logoPreviewContainer) logoPreviewContainer.style.display = 'none';
        }
      };

      logoSelectBtn.addEventListener('click', () => {
        if (logoModal) {
          logoModal.style.display = 'block';
          
          // 初期状態を現在のロゴプレビューから復元
          const currentImg = configLogoPreview ? configLogoPreview.querySelector('img') : null;
          if (currentImg && currentImg.src) {
            updateLogoUI(currentImg.src);
          } else {
            updateLogoUI(null);
          }
        }
      });

      const closeLogoModal = () => {
        if (logoModal) logoModal.style.display = 'none';
      };

      if (logoModalCloseBtn) logoModalCloseBtn.addEventListener('click', closeLogoModal);
      if (logoModalCancelBtn) logoModalCancelBtn.addEventListener('click', closeLogoModal);
      if (logoModalOverlay) logoModalOverlay.addEventListener('click', closeLogoModal);

      const handleLogoFile = (file) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            updateLogoUI(evt.target.result);
          };
          reader.readAsDataURL(file);
        }
      };

      if (logoUploadBtn && logoUploadInput) {
        logoUploadBtn.addEventListener('click', () => {
          logoUploadInput.click();
        });
      }

      if (logoChangeImageBtn && logoUploadInput) {
        logoChangeImageBtn.addEventListener('click', () => {
          logoUploadInput.click();
        });
      }

      if (logoUploadInput) {
        logoUploadInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            handleLogoFile(e.target.files[0]);
          }
        });
      }

      // ドラッグ＆ドロップイベント
      if (logoUploadBox) {
        logoUploadBox.addEventListener('dragover', (e) => {
          e.preventDefault();
          logoUploadBox.classList.add('drag-over');
        });

        logoUploadBox.addEventListener('dragleave', (e) => {
          e.preventDefault();
          logoUploadBox.classList.remove('drag-over');
        });

        logoUploadBox.addEventListener('drop', (e) => {
          e.preventDefault();
          logoUploadBox.classList.remove('drag-over');
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleLogoFile(e.dataTransfer.files[0]);
          }
        });
      }

      if (logoRemoveBtn) {
        logoRemoveBtn.addEventListener('click', () => {
          updateLogoUI(null);
          if (logoUploadInput) logoUploadInput.value = '';
        });
      }

      if (saveLogoBtn) {
        saveLogoBtn.addEventListener('click', () => {
          if (logoModalThumbnailImg && logoModalThumbnailImg.hasAttribute('src') && logoModalThumbnailImg.src) {
            configLogoPreview.innerHTML = `<img src="${logoModalThumbnailImg.src}" style="height: 100%; width: auto; object-fit: contain;">`;
          } else {
            configLogoPreview.innerHTML = 'ロゴ';
          }
          closeLogoModal();
        });
      }
    }

    if (colorPickerBtn) {
      const themeColorModal = document.getElementById('themeColorModal');
      const colorModalCloseBtn = document.getElementById('colorModalCloseBtn');
      const colorModalCancelBtn = document.getElementById('colorModalCancelBtn');
      const colorModalOverlay = document.getElementById('colorModalOverlay');
      const saveColorBtn = document.getElementById('saveColorBtn');
      
      const colorPresetBtns = document.querySelectorAll('#colorPresetGrid .color-preset-btn');
      const customColorPresetBtn = document.getElementById('customColorPresetBtn');
      const customColorInput = document.getElementById('customColorInput');
      
      let selectedColor = '#00d2ff';

      colorPickerBtn.addEventListener('click', () => {
        if (themeColorModal) themeColorModal.style.display = 'block';
      });

      const closeColorModal = () => {
        if (themeColorModal) themeColorModal.style.display = 'none';
      };

      if (colorModalCloseBtn) colorModalCloseBtn.addEventListener('click', closeColorModal);
      if (colorModalCancelBtn) colorModalCancelBtn.addEventListener('click', closeColorModal);
      if (colorModalOverlay) colorModalOverlay.addEventListener('click', closeColorModal);

      colorPresetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          colorPresetBtns.forEach(b => b.classList.remove('selected'));
          if (customColorPresetBtn) customColorPresetBtn.classList.remove('selected');
          
          e.currentTarget.classList.add('selected');
          selectedColor = e.currentTarget.getAttribute('data-color');
          if (customColorInput) customColorInput.value = selectedColor;
        });
      });

      if (customColorInput && customColorPresetBtn) {
        customColorInput.addEventListener('input', (e) => {
          colorPresetBtns.forEach(b => b.classList.remove('selected'));
          customColorPresetBtn.classList.add('selected');
          customColorPresetBtn.style.backgroundColor = e.target.value;
          selectedColor = e.target.value;
        });
      }

      if (saveColorBtn) {
        saveColorBtn.addEventListener('click', () => {
          colorPickerBtn.style.backgroundColor = selectedColor;
          // 管理画面のテーマカラー（--color-cyan）は変更しない
          closeColorModal();
        });
      }
    }
  }

  // ==========================================
  // 【C】同期設定専用画面 (sync.html) の描画・制御ロジック
  // ==========================================
  if (pcMoviesContainer && deviceMoviesContainer) {
    const appHeader = document.querySelector('app-header');

    // URLパラメータから棟IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const buildingId = urlParams.get('id') || '1';

    // ヘッダーに棟IDを設定
    if (appHeader) {
      appHeader.setAttribute('building-id', buildingId);
    }

    let defaultName = `${buildingId}号棟`;
    const name = localStorage.getItem(`adeliae_building_name_${buildingId}`) || defaultName;

    // ヘッダータイトルの同期
    if (appHeader) {
      appHeader.setAttribute('page-title', `${name} - 配信コンテンツ`);
      appHeader.setAttribute('breadcrumbs', JSON.stringify([
        { name: '設置現場 監視', url: 'index.html' },
        { name: `${name} - 詳細 / 設定`, url: `manage.html?id=${buildingId}` },
        { name: '配信コンテンツ' }
      ]));
    }

    if (devicePanelTitle) {
      devicePanelTitle.textContent = `${name} 配信コンテンツ`;
    }

    // 選択された棟の同期対象コンテンツIDリストをロード (なければデフォルト設定)
    const storageKey = `adeliae_sync_ids_building_${buildingId}`;
    let syncMovieIds = JSON.parse(localStorage.getItem(storageKey));
    if (!syncMovieIds) {
      syncMovieIds = ['m1', 'm3', 'm5'];
      localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
    }
    // 初期ロード時の同期済みIDリストを退避
    const originalSyncMovieIds = [...syncMovieIds];

    let currentSelectedCategory = 'all';

    // カテゴリフィルタータブの動的生成
    if (syncCategoryTabs) {
      syncCategoryTabs.innerHTML = '';
      syncCategoryTabs.className = 'category-filter-container';
      syncCategoryTabs.style.cssText = 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px;';
      
      const filterLabel = document.createElement('span');
      filterLabel.className = 'category-filter-label';
      filterLabel.textContent = 'カテゴリ';

      const filterSelect = document.createElement('select');
      filterSelect.className = 'category-filter-select';
      
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'すべて';
      filterSelect.appendChild(allOption);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        filterSelect.appendChild(option);
      });

      filterSelect.addEventListener('change', (e) => {
        currentSelectedCategory = e.target.value;
        renderSyncPanels();
      });

      syncCategoryTabs.appendChild(filterLabel);
      syncCategoryTabs.appendChild(filterSelect);
    }

    // キャンセルボタンの挙動設定
    const syncCancelBtn = document.getElementById('syncCancelBtn');
    if (syncCancelBtn) {
      syncCancelBtn.addEventListener('click', () => {
        window.location.href = `manage.html?id=${buildingId}`;
      });
    }

    // 他の設置現場と同期するオプション動的生成およびチェンジイベント
    if (syncSourceSelect) {
      syncSourceSelect.innerHTML = '<option value="none">-- 自分でコンテンツを選択する --</option>';
      const allBuildingIds = ['1', '2', '3', '4'];
      allBuildingIds.forEach(id => {
        if (id === buildingId) return;
        const storedName = localStorage.getItem(`adeliae_building_name_${id}`) || `${id}号棟`;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = storedName;
        syncSourceSelect.appendChild(opt);
      });

      // 保存されている同期設定をロードして適用
      const syncSourceKey = `adeliae_sync_source_building_${buildingId}`;
      const savedSyncSource = localStorage.getItem(syncSourceKey) || 'none';
      syncSourceSelect.value = savedSyncSource;

      syncSourceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        // 同期設定を保存
        localStorage.setItem(syncSourceKey, val);

        if (val === 'none') {
          // 手動選択に戻す（初期データを復元）
          syncMovieIds = [...originalSyncMovieIds];
          localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
        } else {
          // 他の号棟の同期対象を取得
          const targetStorageKey = `adeliae_sync_ids_building_${val}`;
          const targetSyncIds = JSON.parse(localStorage.getItem(targetStorageKey)) || [];
          syncMovieIds = [...targetSyncIds];
          localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
        }
        renderSyncPanels();
      });
    }

    // 「すべてのコンテンツを選択」チェックボックスの挙動設定
    const selectAllMoviesCheckbox = document.getElementById('selectAllMovies');
    if (selectAllMoviesCheckbox) {
      selectAllMoviesCheckbox.addEventListener('change', (e) => {
        const allMovieIds = [];
        categories.forEach(c => {
          if (c.movies) {
            c.movies.forEach(m => allMovieIds.push(m.id));
          }
        });

        if (e.target.checked) {
          allMovieIds.forEach(id => {
            if (!syncMovieIds.includes(id)) syncMovieIds.push(id);
          });
        } else {
          syncMovieIds = [];
        }
        
        localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
        renderSyncPanels();
      });
    }

    // 左右パネル of コンテンツレンダリング関数 (カテゴリ分け)
    const renderSyncPanels = () => {
      pcMoviesContainer.innerHTML = '';
      deviceMoviesContainer.innerHTML = '';

      const filterVal = currentSelectedCategory;

      // 表示対象のカテゴリを集める
      const filteredCategories = filterVal === 'all' 
        ? categories 
        : categories.filter(c => c.id === filterVal);

      // 他の現場と同期中か
      const syncSourceVal = syncSourceSelect ? syncSourceSelect.value : 'none';
      const isManualDisabled = syncSourceVal !== 'none';

      // 全選択チェックボックスおよび選択件数の更新
      const allMovieIds = [];
      categories.forEach(c => {
        if (c.movies) {
          c.movies.forEach(m => allMovieIds.push(m.id));
        }
      });
      const isAllSelected = allMovieIds.length > 0 && allMovieIds.every(id => syncMovieIds.includes(id));
      if (selectAllMoviesCheckbox) {
        selectAllMoviesCheckbox.checked = isAllSelected;
        selectAllMoviesCheckbox.disabled = isManualDisabled;
      }
      
      const syncBulkControl = document.querySelector('.sync-bulk-control');
      if (syncBulkControl) {
        if (isManualDisabled) {
          syncBulkControl.style.opacity = '0.5';
          syncBulkControl.style.pointerEvents = 'none';
        } else {
          syncBulkControl.style.opacity = '1';
          syncBulkControl.style.pointerEvents = 'auto';
        }
      }

      if (syncCategoryTabs) {
        if (isManualDisabled) {
          syncCategoryTabs.style.opacity = '0.5';
          syncCategoryTabs.style.pointerEvents = 'none';
        } else {
          syncCategoryTabs.style.opacity = '1';
          syncCategoryTabs.style.pointerEvents = 'auto';
        }
      }

      const selectAllMoviesStatus = document.getElementById('selectAllMoviesStatus');
      if (selectAllMoviesStatus) {
        selectAllMoviesStatus.textContent = `選択中: ${syncMovieIds.length}件`;
      }

      let pcCount = 0;
      let deviceCount = 0;

      filteredCategories.forEach(cat => {
        const catMovies = cat.movies || [];
        if (catMovies.length === 0) return;

        // --- PC側カテゴリセクションの作成 ---
        const pcSection = document.createElement('div');
        pcSection.className = 'sync-cat-section';
        
        const catMovieIds = catMovies.map(m => m.id);
        const isAllCatMoviesSelected = catMovieIds.every(id => syncMovieIds.includes(id));

        pcSection.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; margin-top: 6px; padding-bottom: 4px;">
            <h2 class="category-title" style="font-size: 15px; margin: 0;">${cat.name}</h2>
            <label style="margin: 0; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; ${isManualDisabled ? 'opacity: 0.5; pointer-events: none;' : ''}">
              <input type="checkbox" class="select-category-movies" data-category-id="${cat.id}" ${isAllCatMoviesSelected ? 'checked' : ''} ${isManualDisabled ? 'disabled' : ''} style="cursor: pointer; accent-color: var(--color-cyan); width: 13px; height: 13px; margin: 0;">
              <span style="color: var(--text-color-secondary); font-size: 12px; user-select: none;">このカテゴリを全選択</span>
            </label>
          </div>
          <div class="movies-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;"></div>
        `;
        const pcGrid = pcSection.querySelector('.movies-grid');

        // カテゴリ全選択チェックボックスのイベントバインド
        const catCheckbox = pcSection.querySelector('.select-category-movies');
        if (catCheckbox && !isManualDisabled) {
          catCheckbox.addEventListener('change', (e) => {
            const catId = e.target.dataset.categoryId;
            const targetCat = categories.find(c => c.id === catId);
            if (!targetCat || !targetCat.movies) return;

            const targetMovieIds = targetCat.movies.map(m => m.id);

            if (e.target.checked) {
              targetMovieIds.forEach(id => {
                if (!syncMovieIds.includes(id)) syncMovieIds.push(id);
              });
            } else {
              syncMovieIds = syncMovieIds.filter(id => !targetMovieIds.includes(id));
            }

            localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
            renderSyncPanels();
          });
        }

        // --- 機器側カテゴリセクションの作成 (仮作成しておき、同期対象があればアペンド) ---
        const devSection = document.createElement('div');
        devSection.className = 'sync-cat-section';
        devSection.innerHTML = `
          <h2 class="category-title" style="font-size: 15px; margin-bottom: 12px; margin-top: 6px;">${cat.name}</h2>
          <div class="movies-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;"></div>
        `;
        const devGrid = devSection.querySelector('.movies-grid');
        let devSectionHasMovies = false;

        catMovies.forEach(movie => {
          const isSynced = syncMovieIds.includes(movie.id);

          const isOriginalSynced = originalSyncMovieIds.includes(movie.id);

          pcCount++;
          const pcCard = document.createElement('div');
          pcCard.className = `movie-card ${isSynced ? 'sync-selected' : ''}`;
          pcCard.setAttribute('data-id', movie.id);
          pcCard.style.position = 'relative';
          
          if (isManualDisabled) {
            pcCard.style.opacity = '0.5';
            pcCard.style.pointerEvents = 'none';
          } else {
            pcCard.style.cursor = 'pointer';
          }

          pcCard.innerHTML = `
            ${isOriginalSynced ? '<div class="sync-status-badge">反映済</div>' : ''}
            <div class="sync-check-btn">✓</div>
            <div class="movie-thumbnail">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.4);">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <div class="movie-info">
              <span class="movie-title">${movie.title}</span>
            </div>
          `;

          // 左カードクリックで同期対象トグル
          if (!isManualDisabled) {
            pcCard.addEventListener('click', () => {
              const idx = syncMovieIds.indexOf(movie.id);
              if (idx === -1) {
                syncMovieIds.push(movie.id);
              } else {
                syncMovieIds.splice(idx, 1);
              }
              localStorage.setItem(storageKey, JSON.stringify(syncMovieIds));
              renderSyncPanels(); // 再描画
            });
          }

          pcGrid.appendChild(pcCard);

          // 2. 右パネル（号棟側）のコンテンツカード生成
          if (isSynced) {
            deviceCount++;
            devSectionHasMovies = true;
            const devCard = document.createElement('div');
            devCard.className = 'movie-card';
            devCard.style.position = 'relative';
            devCard.innerHTML = `
              ${isOriginalSynced ? '<div class="sync-status-badge">反映済</div>' : ''}
              <div class="movie-thumbnail">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.4);">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <div class="movie-info">
                <span class="movie-title">${movie.title}</span>
              </div>
            `;
            devGrid.appendChild(devCard);
          }
        });

        // 構築したセクションをアペンド
        pcMoviesContainer.appendChild(pcSection);
        if (devSectionHasMovies) {
          deviceMoviesContainer.appendChild(devSection);
        }
      });

      // 空白状態の補足
      if (pcCount === 0) {
        pcMoviesContainer.innerHTML = '<div style="text-align: center; color: var(--text-color-secondary); padding: 40px;">表示するコンテンツがありません。</div>';
      }
      if (deviceCount === 0) {
        deviceMoviesContainer.innerHTML = '<div style="text-align: center; color: var(--text-color-secondary); padding: 40px;">反映対象のコンテンツが選択されていません。</div>';
      }
    };

    // 初期描画
    renderSyncPanels();

    // 同期実行ボタンクリック時のアニメーションモック演出
    if (syncExecuteBtn) {
      syncExecuteBtn.addEventListener('click', () => {
        const progressModal = document.getElementById('syncProgressModal');
        const progressIcon = document.getElementById('syncProgressIcon');
        const progressStatus = document.getElementById('syncProgressStatus');
        const progressDesc = document.getElementById('syncProgressDesc');
        const progressCloseBtn = document.getElementById('syncProgressCloseBtn');

        if (!progressModal) return;

        // モーダルの初期状態をセット
        progressIcon.innerHTML = '<div class="sync-spinner"></div>';
        progressStatus.textContent = 'コンテンツを反映中...';
        progressStatus.style.color = 'var(--color-status-green)';
        progressDesc.innerHTML = '<span style="white-space: nowrap;">しばらくお待ちください。</span>';
        progressDesc.style.display = 'block';
        progressCloseBtn.style.display = 'none';
        progressModal.style.display = 'flex';

        let counter = 3;

        const timer = setInterval(() => {
          counter--;
          if (counter <= 0) {
            clearInterval(timer);
            // 反映完了状態
            progressIcon.innerHTML = `
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            progressStatus.textContent = '反映完了';
            progressStatus.style.color = 'var(--color-status-green)';
            progressDesc.style.display = 'none';
            progressCloseBtn.style.display = 'block';

            // 同期完了したため、オリジナルリストを現在の最新リストで更新して再描画
            originalSyncMovieIds.length = 0;
            originalSyncMovieIds.push(...syncMovieIds);
            renderSyncPanels();
          }
        }, 1000);

        // 閉じるボタンのイベント
        const closeHandler = () => {
          progressModal.style.display = 'none';
          progressCloseBtn.removeEventListener('click', closeHandler);
          window.location.href = `manage.html?id=${buildingId}`;
        };
        progressCloseBtn.addEventListener('click', closeHandler);
      });
    }
  }

  // ==========================================
  // 【D】自動再生設定専用画面 (autoplay.html) の描画・制御ロジック
  // ==========================================
  if (waitTimeInput && slotsContainer) {
    const appHeader = document.querySelector('app-header');

    // URLパラメータから棟IDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const buildingId = urlParams.get('id') || '1';

    // ヘッダーに棟IDを設定
    if (appHeader) {
      appHeader.setAttribute('building-id', buildingId);
    }

    let defaultName = `${buildingId}号棟`;
    const name = localStorage.getItem(`adeliae_building_name_${buildingId}`) || defaultName;

    // ヘッダータイトルの同期
    if (appHeader) {
      appHeader.setAttribute('page-title', `${name} - 待機時表示コンテンツ`);
      appHeader.setAttribute('breadcrumbs', JSON.stringify([
        { name: '設置現場 監視', url: 'index.html' },
        { name: `${name} - 詳細 / 設定`, url: `manage.html?id=${buildingId}` },
        { name: '待機時表示コンテンツ' }
      ]));
    }

    if (slotsPanelTitle) {
      slotsPanelTitle.textContent = `自動再生するコンテンツ （1～5件）`;
    }

    // 「キャンセル（号棟管理へ戻る）」ボタンの挙動設定
    if (backToManageBtn) {
      backToManageBtn.addEventListener('click', () => {
        window.location.href = `manage.html?id=${buildingId}`;
      });
    }

    // データの読み込み
    const storageKey = `adeliae_autoplay_config_building_${buildingId}`;
    let config = JSON.parse(localStorage.getItem(storageKey));
    if (!config) {
      // デフォルト初期状態 (1: 海中探訪 vol.1, 2: 宇宙遊泳体験, 3: 珊瑚礁の世界, 4: 空, 5: 空)
      config = {
        waitTime: 30,
        isEnabled: true,
        videoIds: ['m1', 'm5', 'm3', null, null]
      };
      localStorage.setItem(storageKey, JSON.stringify(config));
    }

    // 自動再生無効化時の警告表示制御 (ディセーブル処理は廃止)
    const updateAutoplayFormStatus = () => {
      const isEnabled = config.isEnabled;
      const warningEl = document.getElementById('autoplayDisabledWarning');
      
      if (warningEl) {
        warningEl.style.display = isEnabled ? 'none' : 'block';
      }
      
      const waitTimeControl = document.querySelector('.wait-time-control');
      if (waitTimeControl) {
        waitTimeControl.style.opacity = '1';
        waitTimeControl.style.pointerEvents = 'auto';
      }

      const presetsGrid = document.querySelector('.presets-grid');
      const presetLabel = document.querySelector('.presets-grid')?.previousElementSibling;
      if (presetsGrid) {
        presetsGrid.style.opacity = '1';
        presetsGrid.style.pointerEvents = 'auto';
        if (presetLabel) presetLabel.style.opacity = '1';
      }

      const rightPanel = document.querySelectorAll('.autoplay-panel')[1];
      if (rightPanel) {
        rightPanel.style.opacity = '1';
        rightPanel.style.pointerEvents = 'auto';
      }
    };

    // 初期UI反映
    waitTimeInput.value = config.waitTime;
    
    if (config.isEnabled) {
      autoplayToggle.classList.add('on');
    } else {
      autoplayToggle.classList.remove('on');
    }
    updateAutoplayFormStatus();

    // プリセットのアクティブ化
    const presetButtons = document.querySelectorAll('.preset-btn');
    const updatePresetActive = (val) => {
      presetButtons.forEach(btn => {
        if (parseInt(btn.getAttribute('data-value')) === val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    };
    updatePresetActive(config.waitTime);

    // プリセットボタンイベント
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-value'));
        config.waitTime = val;
        waitTimeInput.value = val;
        updatePresetActive(val);
      });
    });

    // スピンボタン操作 (▲▼)
    spinUpBtn.addEventListener('click', () => {
      let val = parseInt(waitTimeInput.value) || 0;
      if (val < 120) {
        val++;
        waitTimeInput.value = val;
        config.waitTime = val;
        updatePresetActive(val);
      }
    });

    spinDownBtn.addEventListener('click', () => {
      let val = parseInt(waitTimeInput.value) || 0;
      if (val > 1) {
        val--;
        waitTimeInput.value = val;
        config.waitTime = val;
        updatePresetActive(val);
      }
    });

    // キーボード直接入力のイベントハンドリング
    waitTimeInput.addEventListener('input', (e) => {
      let cleanVal = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = cleanVal;
      
      let val = parseInt(cleanVal);
      if (isNaN(val)) return;
      if (val < 1) val = 1;
      if (val > 120) val = 120;
      config.waitTime = val;
      updatePresetActive(val);
    });

    waitTimeInput.addEventListener('blur', (e) => {
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 30;
      if (val > 120) val = 120;
      e.target.value = val;
      config.waitTime = val;
      updatePresetActive(val);
    });

    // トグルスイッチ操作
    autoplayToggle.addEventListener('click', () => {
      config.isEnabled = !config.isEnabled;
      if (config.isEnabled) {
        autoplayToggle.classList.add('on');
      } else {
        autoplayToggle.classList.remove('on');
      }
      updateAutoplayFormStatus();
    });

    // スロットの描画
    const renderSlots = () => {
      slotsContainer.innerHTML = '';
      
      for (let i = 0; i < 5; i++) {
        const videoId = config.videoIds[i];
        let foundMovie = null;
        
        if (videoId) {
          // 全カテゴリからコンテンツを検索
          categories.forEach(cat => {
            const m = (cat.movies || []).find(x => x.id === videoId);
            if (m) foundMovie = m;
          });
        }

        const slotCard = document.createElement('div');
        
        if (foundMovie) {
          // 設定済みスロット
          slotCard.className = 'slot-card active';
          slotCard.innerHTML = `
            <div class="slot-left-info">
              <div class="slot-index">${i + 1}</div>
              <div class="slot-thumb">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <div class="slot-title">${foundMovie.title}</div>
            </div>
            <button class="slot-btn btn-remove" data-index="${i}">&times;</button>
          `;
        } else {
          // 空のスロット
          slotCard.className = 'slot-card empty';
          slotCard.innerHTML = `
            <div class="slot-left-info">
              <div class="slot-index">${i + 1}</div>
              <div class="slot-thumb">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div class="slot-placeholder">クリックして選択</div>
            </div>
            <button class="slot-btn btn-add" data-index="${i}">＋</button>
          `;
        }

        // イベントバインド: 空スロットクリックで選択モーダル表示
        if (!foundMovie) {
          slotCard.addEventListener('click', (e) => {
            openSelectModal(i);
          });
        } else {
          // 削除ボタンの挙動
          const removeBtn = slotCard.querySelector('.btn-remove');
          removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // バブリング防止
            config.videoIds[i] = null;
            renderSlots();
          });
        }

        slotsContainer.appendChild(slotCard);
      }
    };

    // コンテンツ選択モーダルの起動
    let activeSlotIndex = null;
    const openSelectModal = (index) => {
      activeSlotIndex = index;

      // ヘッダータイトルを更新
      if (modalTitle) modalTitle.textContent = `コンテンツを選択　（スロット ${index + 1} に追加）`;

      // すでに登録されているコンテンツIDをリストアップして重複選択を防ぐ
      const usedIds = config.videoIds.filter(id => id !== null);

      // ---- カテゴリタブの生成 ----
      const modalCategoryTabs = document.getElementById('modalCategoryTabs');
      const modalVideoGrid = document.getElementById('modalVideoGrid');
      if (!modalCategoryTabs || !modalVideoGrid) {
        videoSelectModal.style.display = 'block';
        return;
      }

      let activeTabId = 'all';

      const renderModalGrid = (filterCatId) => {
        modalVideoGrid.innerHTML = '';
        const targetCategories = filterCatId === 'all'
          ? categories
          : categories.filter(c => c.id === filterCatId);

        let totalMoviesCount = 0;

        targetCategories.forEach(cat => {
          if (!cat.movies || cat.movies.length === 0) return;

          const section = document.createElement('section');
          section.className = 'movie-category-section';
          section.style.marginBottom = '0'; // モーダル内の微調整

          const moviesHTML = cat.movies.map(movie => {
            totalMoviesCount++;
            const isUsed = usedIds.includes(movie.id);
            return `
              <div class="movie-card hover-zoom-card vmodal-movie-card ${isUsed ? 'used' : ''}" data-id="${movie.id}" style="cursor: ${isUsed ? 'not-allowed' : 'pointer'};">
                ${isUsed ? '<div class="vcard-used-badge">使用中</div>' : ''}
                <div class="movie-thumbnail">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: rgba(143, 160, 192, 0.4);">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <div class="movie-info">
                  <span class="movie-title">${movie.title}</span>
                </div>
              </div>
            `;
          }).join('');

          section.innerHTML = `
            <h3 class="category-title" style="margin-bottom: 12px; color: var(--text-color-cyan); font-size: 15px; font-weight: bold; border-left: 3px solid var(--color-cyan); padding-left: 8px;">${cat.name}</h3>
            <div class="movies-grid">
              ${moviesHTML}
            </div>
          `;
          
          modalVideoGrid.appendChild(section);
        });

        // Add event listeners to newly created cards
        const cards = modalVideoGrid.querySelectorAll('.movie-card:not(.used)');
        cards.forEach(card => {
          card.addEventListener('click', () => {
            const movieId = card.getAttribute('data-id');
            config.videoIds[activeSlotIndex] = movieId;
            closeSelectModal();
            renderSlots();
          });
        });

        // 空の場合
        if (totalMoviesCount === 0) {
          modalVideoGrid.innerHTML = '<div style="grid-column: span 4; text-align: center; color: var(--text-color-secondary); padding: 40px;">このカテゴリにコンテンツがありません。</div>';
        }
      };

      // タブを構築
      modalCategoryTabs.innerHTML = '';
      modalCategoryTabs.className = 'category-filter-container';
      modalCategoryTabs.style.cssText = 'display: flex; align-items: center; gap: 12px; margin: 16px 24px;';
      
      const filterLabel = document.createElement('span');
      filterLabel.className = 'category-filter-label';
      filterLabel.textContent = 'カテゴリ';

      const filterSelect = document.createElement('select');
      filterSelect.className = 'category-filter-select';
      
      const allOption = document.createElement('option');
      allOption.value = 'all';
      allOption.textContent = 'すべて';
      filterSelect.appendChild(allOption);

      categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        filterSelect.appendChild(option);
      });

      filterSelect.addEventListener('change', (e) => {
        activeTabId = e.target.value;
        renderModalGrid(activeTabId);
      });

      modalCategoryTabs.appendChild(filterLabel);
      modalCategoryTabs.appendChild(filterSelect);

      // 初期グリッドを「全て」で描画
      renderModalGrid('all');

      videoSelectModal.style.display = 'block';
    };

    const closeSelectModal = () => {
      videoSelectModal.style.display = 'none';
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSelectModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeSelectModal);

    // キャンセルボタン
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeSelectModal);

    // スロットの初期レンダリング
    renderSlots();

    // 確定保存
    if (saveAutoplayBtn) {
      saveAutoplayBtn.addEventListener('click', () => {
        localStorage.setItem(storageKey, JSON.stringify(config));
        
        const progressModal = document.getElementById('saveProgressModal');
        const progressIcon = document.getElementById('saveProgressIcon');
        const progressStatus = document.getElementById('saveProgressStatus');
        const progressDesc = document.getElementById('saveProgressDesc');
        const progressCloseBtn = document.getElementById('saveProgressCloseBtn');

        if (!progressModal) {
          alert('待機時表示コンテンツの設定を保存しました。');
          window.location.href = `manage.html?id=${buildingId}`;
          return;
        }

        // モーダルの初期状態をセット
        progressIcon.innerHTML = '<div class="save-spinner"></div>';
        progressStatus.textContent = '設定を保存中...';
        progressStatus.style.color = 'var(--color-cyan)';
        progressDesc.innerHTML = '<span style="white-space: nowrap;">しばらくお待ちください。</span>';
        progressDesc.style.display = 'block';
        progressCloseBtn.style.display = 'none';
        progressModal.style.display = 'flex';

        let counter = 3;
        const timer = setInterval(() => {
          counter--;
          if (counter <= 0) {
            clearInterval(timer);
            // 保存完了状態
            progressIcon.innerHTML = `
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            `;
            progressStatus.textContent = '保存完了';
            progressStatus.style.color = 'var(--color-cyan)';
            progressDesc.style.display = 'none';
            progressCloseBtn.style.display = 'block';
          }
        }, 1000);

        // 閉じるボタンのイベント
        const closeHandler = () => {
          progressModal.style.display = 'none';
          progressCloseBtn.removeEventListener('click', closeHandler);
          window.location.href = `manage.html?id=${buildingId}`;
        };
        progressCloseBtn.addEventListener('click', closeHandler);
      });
    }
  }
});
