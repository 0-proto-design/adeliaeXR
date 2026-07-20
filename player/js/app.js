document.addEventListener('DOMContentLoaded', () => {
  const movieCards = document.querySelectorAll('.movie-card');
  
  // フィルターボタンとセクションDOM
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sectionNature = document.getElementById('section-nature');
  const sectionScenery = document.getElementById('section-scenery');

  // 詳細モーダルのDOM
  const detailModal = document.getElementById('detailModal');
  const backBtn = document.getElementById('backBtn');
  const detailVideo = document.getElementById('detailVideo');
  const detailTitleText = document.getElementById('detailTitleText');
  const detailDescText = document.getElementById('detailDescText');
  const detailTypeText = document.getElementById('detailTypeText');
  const detailCategoryText = document.getElementById('detailCategoryText');
  const playTriggerBtn = document.getElementById('playTriggerBtn');

  // イマーシブ・シアターモーダルのDOM
  const theaterModal = document.getElementById('theaterModal');
  const theaterScreen = document.getElementById('theaterScreen');
  const closeTheaterBtn = document.getElementById('closeTheaterBtn');

  // VRコントロールパネルのDOM
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  
  const moveUpBtn = document.getElementById('moveUpBtn');
  const moveLeftBtn = document.getElementById('moveLeftBtn');
  const moveRightBtn = document.getElementById('moveRightBtn');
  const moveDownBtn = document.getElementById('moveDownBtn');

  const rotateUpBtn = document.getElementById('rotateUpBtn');
  const rotateLeftBtn = document.getElementById('rotateLeftBtn');
  const rotateRightBtn = document.getElementById('rotateRightBtn');
  const rotateDownBtn = document.getElementById('rotateDownBtn');

  const resetViewBtn = document.getElementById('resetViewBtn');

  let activeMovie = null; // 現在選択中の動画データ
  let visibleCards = [];
  let currentCardIndex = -1;
  
  // VR表示ステート
  let zoomLevel = 1.0;
  let moveX = 0;
  let moveY = 0;
  let rotateX = 0;
  let rotateY = 0;
  let isDragging = false;
  let startDragX = 0;
  let startDragY = 0;

  // ==========================================
  // 【カテゴリ総数の計算・表示更新】
  // ==========================================
  const updateCategoryCounts = () => {
    const totalCardsCount = document.querySelectorAll('.movie-card').length;
    
    filterBtns.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      let count = 0;
      if (cat === 'all') {
        count = totalCardsCount;
      } else {
        const sec = document.querySelector(`.movie-category-section[data-category="${cat}"]`);
        if (sec) {
          count = sec.querySelectorAll('.movie-card').length;
        }
      }
      
      const countSpan = btn.querySelector('.cat-count');
      if (countSpan) {
        countSpan.textContent = `(${count})`;
      }
    });
  };

  // ==========================================
  // 【カテゴリフィルターの制御】
  // ==========================================
  const filterCategories = (category) => {
    const sections = document.querySelectorAll('.movie-category-section');
    
    sections.forEach(sec => {
      const secCategory = sec.getAttribute('data-category');
      const seeAllBtn = sec.querySelector('.see-all-btn');
      const cards = sec.querySelectorAll('.movie-card');

      if (category === 'all') {
        sec.style.display = 'flex';
        if (seeAllBtn) seeAllBtn.classList.remove('hidden');
        
        // 「すべて」の時は各カテゴリ最大3件まで表示
        cards.forEach((card, index) => {
          if (index < 3) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      } else {
        if (secCategory === category) {
          sec.style.display = 'flex';
          if (seeAllBtn) seeAllBtn.classList.add('hidden');
          
          // 特定カテゴリ指定時は全件表示
          cards.forEach(card => {
            card.style.display = 'block';
          });
        } else {
          sec.style.display = 'none';
        }
      }
    });
  };

  // ==========================================
  // 【詳細モーダルの表示制御】
  // ==========================================
  const showDetailModal = (card) => {
    // 表示中のカードリストを取得して現在のインデックスを特定
    visibleCards = Array.from(document.querySelectorAll('.movie-card')).filter(c => c.style.display !== 'none');
    currentCardIndex = visibleCards.indexOf(card);

    // データ抽出
    activeMovie = {
      title: card.getAttribute('data-title'),
      fullTitle: card.getAttribute('data-full-title'),
      desc: card.getAttribute('data-desc'),
      image: card.getAttribute('data-image'),
      video: card.getAttribute('data-video'),
      type: card.getAttribute('data-type'),
      category: card.getAttribute('data-category')
    };

    // 詳細画面DOMの更新
    detailTitleText.textContent = activeMovie.title;
    detailVideo.src = activeMovie.video;
    detailVideo.play().catch(e => console.log(e));
    detailDescText.textContent = activeMovie.desc;
    detailTypeText.textContent = activeMovie.type;
    detailCategoryText.textContent = activeMovie.category;

    // ナビゲーションの更新
    setupModalNav();

    // モーダル表示
    detailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 背景スクロールを禁止
    
    // フェードイン＆スケールアップ効果用ディレイ
    setTimeout(() => {
      detailModal.classList.add('active');
    }, 10);
  };

  const hideDetailModal = () => {
    detailModal.classList.remove('active');
    document.body.style.overflow = ''; // 背景スクロールを復帰
    detailVideo.pause();
    
    // アニュアル表示が残らないように非表示
    setTimeout(() => {
      detailModal.style.display = 'none';
      activeMovie = null;
    }, 300);
  };

  const setupModalNav = () => {
    const prevBtn = document.getElementById('prevMovieBtn');
    const nextBtn = document.getElementById('nextMovieBtn');

    if (currentCardIndex > 0) {
      const prevCard = visibleCards[currentCardIndex - 1];
      document.getElementById('prevMovieThumb').src = prevCard.getAttribute('data-image');
      document.getElementById('prevMovieTitle').textContent = prevCard.getAttribute('data-title');
      prevBtn.style.visibility = 'visible';
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.onclick = () => showDetailModal(prevCard);
    } else {
      prevBtn.style.visibility = 'hidden';
      prevBtn.style.pointerEvents = 'none';
    }

    if (currentCardIndex < visibleCards.length - 1 && currentCardIndex !== -1) {
      const nextCard = visibleCards[currentCardIndex + 1];
      document.getElementById('nextMovieThumb').src = nextCard.getAttribute('data-image');
      document.getElementById('nextMovieTitle').textContent = nextCard.getAttribute('data-title');
      nextBtn.style.visibility = 'visible';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.onclick = () => showDetailModal(nextCard);
    } else {
      nextBtn.style.visibility = 'hidden';
      nextBtn.style.pointerEvents = 'none';
    }
  };

  // ==========================================
  // 【イマーシブ・シアター（新しいVR操作盤）の制御】
  // ==========================================
  const updateViewportTransform = () => {
    // ZOOM (拡大) & MOVE (移動)
    theaterScreen.style.transform = `scale(${zoomLevel}) translate(${moveX}px, ${moveY}px)`;
    // ROTATE (回転 - パノラマの background-position をシフト)
    theaterScreen.style.backgroundPosition = `calc(50% + ${rotateX}px) calc(50% + ${rotateY}px)`;
  };

  const resetViewport = () => {
    zoomLevel = 1.0;
    moveX = 0;
    moveY = 0;
    rotateX = 0;
    rotateY = 0;
    updateViewportTransform();
    
    if (activeMovie && activeMovie.type.includes('360')) {
      theaterScreen.style.animation = 'panoramaScroll 60s linear infinite';
    }
  };

  const stopAutoScroll = () => {
    theaterScreen.style.animation = 'none';
  };

  const openTheater = () => {
    if (!activeMovie) return;

    const is360 = activeMovie.type.includes('360');
    theaterScreen.style.backgroundImage = `url('${activeMovie.image}')`;

    resetViewport();

    if (is360) {
      theaterScreen.classList.add('panorama-active');
      theaterScreen.style.backgroundSize = '200% 100%';
    } else {
      theaterScreen.classList.remove('panorama-active');
      theaterScreen.style.backgroundSize = 'cover';
    }

    theaterModal.style.display = 'flex';
    setTimeout(() => {
      theaterModal.classList.add('active');
    }, 10);
  };

  const closeTheater = () => {
    theaterModal.classList.remove('active');
    setTimeout(() => {
      theaterModal.style.display = 'none';
      theaterScreen.style.backgroundImage = '';
      theaterScreen.classList.remove('panorama-active');
    }, 400);
  };

  // ==========================================
  // 【イベント登録】
  // ==========================================
  // フィルターボタンイベント
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      filterCategories(category);
    });
  });

  // 「すべてを見る」ボタンクリックイベント
  const seeAllBtns = document.querySelectorAll('.see-all-btn');
  seeAllBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetCat = btn.getAttribute('data-target-category');
      
      // 該当のカテゴリボタンをアクティブにする
      filterBtns.forEach(b => {
        if (b.getAttribute('data-category') === targetCat) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      // 対象カテゴリの一覧表示へ切り替え
      filterCategories(targetCat);
      
      // スムーズスクロールで該当カテゴリへ導く
      const targetSec = document.querySelector(`.movie-category-section[data-category="${targetCat}"]`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 初期化：カテゴリ件数計算＆「すべて」状態での3件制限適用
  updateCategoryCounts();
  filterCategories('all');

  // 動画カードクリックイベント
  movieCards.forEach(card => {
    card.addEventListener('click', () => showDetailModal(card));
  });

  if (backBtn) backBtn.addEventListener('click', hideDetailModal);
  const headerCloseBtn = document.getElementById('headerCloseBtn');
  if (headerCloseBtn) headerCloseBtn.addEventListener('click', hideDetailModal);
  playTriggerBtn.addEventListener('click', openTheater);
  closeTheaterBtn.addEventListener('click', closeTheater);

  // 詳細モーダルの外側（オーバーレイ）をクリックして閉じる
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      hideDetailModal();
    }
  });

  // シアターモーダルの外側（オーバーレイ）をクリックして閉じる
  theaterModal.addEventListener('click', (e) => {
    if (e.target === theaterModal) {
      closeTheater();
    }
  });

  // ZOOM ボタンイベント
  zoomInBtn.addEventListener('click', () => {
    stopAutoScroll();
    zoomLevel = Math.min(zoomLevel + 0.15, 3.0);
    updateViewportTransform();
  });
  zoomOutBtn.addEventListener('click', () => {
    stopAutoScroll();
    zoomLevel = Math.max(zoomLevel - 0.15, 0.5);
    updateViewportTransform();
  });

  // MOVE ボタンイベント
  moveUpBtn.addEventListener('click', () => {
    stopAutoScroll();
    moveY -= 15;
    updateViewportTransform();
  });
  moveDownBtn.addEventListener('click', () => {
    stopAutoScroll();
    moveY += 15;
    updateViewportTransform();
  });
  moveLeftBtn.addEventListener('click', () => {
    stopAutoScroll();
    moveX -= 15;
    updateViewportTransform();
  });
  moveRightBtn.addEventListener('click', () => {
    stopAutoScroll();
    moveX += 15;
    updateViewportTransform();
  });

  // ROTATE ボタンイベント
  rotateUpBtn.addEventListener('click', () => {
    stopAutoScroll();
    rotateY -= 20;
    updateViewportTransform();
  });
  rotateDownBtn.addEventListener('click', () => {
    stopAutoScroll();
    rotateY += 20;
    updateViewportTransform();
  });
  rotateLeftBtn.addEventListener('click', () => {
    stopAutoScroll();
    rotateX -= 30;
    updateViewportTransform();
  });
  rotateRightBtn.addEventListener('click', () => {
    stopAutoScroll();
    rotateX += 30;
    updateViewportTransform();
  });

  // RESET ボタンイベント
  resetViewBtn.addEventListener('click', resetViewport);

  // 直感的なマウスドラッグ操作
  theaterScreen.addEventListener('mousedown', (e) => {
    stopAutoScroll();
    isDragging = true;
    startDragX = e.clientX;
    startDragY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startDragX;
    const deltaY = e.clientY - startDragY;
    
    rotateX += deltaX * 0.5;
    rotateY += deltaY * 0.5;
    
    startDragX = e.clientX;
    startDragY = e.clientY;
    
    updateViewportTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // モバイル端末用タッチ操作
  theaterScreen.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      stopAutoScroll();
      isDragging = true;
      startDragX = e.touches[0].clientX;
      startDragY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - startDragX;
    const deltaY = e.touches[0].clientY - startDragY;
    
    rotateX += deltaX * 0.5;
    rotateY += deltaY * 0.5;
    
    startDragX = e.touches[0].clientX;
    startDragY = e.touches[0].clientY;
    
    updateViewportTransform();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ==========================================
  // 【動画サムネイルの5秒ループ再生制御】
  // ==========================================
  const setupThumbnailLoop = (video) => {
    video.addEventListener('timeupdate', () => {
      // 5秒経過したら最初に戻す
      if (video.currentTime >= 5) {
        video.currentTime = 0;
        video.play().catch(e => console.log('Autoplay prevented', e));
      }
    });
    // 初期状態でも再生を試みる
    video.play().catch(e => console.log('Autoplay prevented', e));
  };

  // 一覧の全サムネイルと詳細モーダルのサムネイルに適用
  document.querySelectorAll('.thumbnail-video').forEach(setupThumbnailLoop);
});
