/**
 * CSA — GALLERY PAGE
 */
let allPhotos    = [];
let currentIndex = 0;
let suppressClickUntil = 0;
const MAX_VISIBLE_OFFSET = 3; // # covers show on each side


let cfSpacing = 210;
let cfZStep   = 120;
function readCoverflowMetrics() {
  const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cf-size')) || 340;
  cfSpacing = size * 0.62;
  cfZStep   = size * 0.35;
}


const PLACEHOLDER_PHOTOS = [
  //{ title: '',      imageURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg' },
  {imageURL: 'photos/gallery/photo_1771381770.jpg' },
  {imageURL: 'photos/gallery/IMG_9133.jpg' },
  {imageURL: 'photos/gallery/IMG_0124.jpg' },
  {imageURL: 'photos/gallery/IMG_01111.jpg' },
  {imageURL: 'photos/gallery/IMG_7315.jpg' },
  {imageURL: 'photos/gallery/20251111_193436.jpg' },
  {imageURL: 'photos/gallery/ppcfampic1.jpg' },
  {imageURL: 'photos/gallery/20251202_194152.jpg' },
  {imageURL: 'photos/gallery/cachedImage.png' },
  {imageURL: 'photos/20260217_200654.jpg' },
  {imageURL: 'photos/IMG_0204.jpg' },
  {imageURL: 'photos/IMG_0222.jpg' },
  {imageURL: 'photos/IMG_7233.jpg' },
  {imageURL: 'photos/IMG_9289.jpg' },
  {imageURL: 'photos/IMG20251006184538.jpg' },
  {imageURL: 'photos/gallery/20260207_113826.jpg' },
];

document.addEventListener('DOMContentLoaded', () => {
  loadGallery();
  setupLightbox();
  setupCoverflowControls();
});

// ---- Load from Firestore ----
async function loadGallery() {
  const stage = document.getElementById('coverflow-stage');
  if (!stage) return;

  stage.innerHTML = '<div class="coverflow-skel skeleton" style="position:absolute;top:0;left:50%;width:var(--cf-size);height:var(--cf-size);margin-left:calc(var(--cf-size) / -2);"></div>';

  try {
    const snap = await window.db.collection('gallery')
      .orderBy('createdAt', 'desc')
      .get();

    allPhotos = snap.empty
      ? PLACEHOLDER_PHOTOS
      : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Gallery load failed, using placeholders:', err);
    allPhotos = PLACEHOLDER_PHOTOS;
  }

  currentIndex = 0;
  renderGallery();
}

// ---- Render coverflow ----
function renderGallery() {
  const stage = document.getElementById('coverflow-stage');
  if (!stage) return;

  stage.innerHTML = '';

  if (!allPhotos.length) {
    stage.innerHTML = `<div class="empty-state">
      <p>No photos yet.</p>
    </div>`;
    updateCaption();
    return;
  }

  currentIndex = Math.min(currentIndex, allPhotos.length - 1);

  allPhotos.forEach((photo, i) => {
    const src = photo.imageURL || 'https://via.placeholder.com/800x600?text=CSA';
    const item = document.createElement('div');
    item.className = 'coverflow-item';
    item.dataset.index = i;
    item.style.setProperty('--cf-img', `url("${src}")`);
    item.innerHTML = `
      <img src="${src}"
           alt="${photo.title || ''}"
           loading="lazy"
           draggable="false"
           onerror="this.src='https://via.placeholder.com/800x600?text=CSA'">
      <div class="coverflow-item-overlay">
        <div class="coverflow-item-title">${photo.title || ''}</div>
      </div>
    `;
    item.addEventListener('click', () => {
      if (Date.now() < suppressClickUntil) return;
      if (i === currentIndex) {
        openLightbox(i, allPhotos);
      } else {
        goToIndex(i);
      }
    });
    stage.appendChild(item);
  });

  readCoverflowMetrics();
  layoutCoverflow();
  updateCaption();
}

// ---- Position each cover based on distance from the active index ----
// dragOffsetPx: live pixel offset applied while the user is dragging, so the
// stack tracks the finger/cursor in real time instead of only snapping on release.
function layoutCoverflow(dragOffsetPx = 0) {
  const stage = document.getElementById('coverflow-stage');
  if (!stage) return;

  stage.querySelectorAll('.coverflow-item').forEach(item => {
    const i = Number(item.dataset.index);
    const offset = i - currentIndex;
    const absOffset = Math.abs(offset);

    item.classList.toggle('is-active', offset === 0);

    if (absOffset > MAX_VISIBLE_OFFSET) {
      item.style.opacity = '0';
      item.style.pointerEvents = 'none';
      item.style.transform = `translateX(${offset * cfSpacing + dragOffsetPx}px) translateZ(-400px)`;
      item.style.zIndex = 0;
      return;
    }

    const translateX = offset * cfSpacing + dragOffsetPx;
    const translateZ = -absOffset * cfZStep;
    const rotateY = Math.max(-50, Math.min(50, -offset * 45));
    const scale = offset === 0 ? 1.15 : Math.max(0.6, 1 - absOffset * 0.18);

    item.style.transform =
      `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
    item.style.zIndex = 100 - absOffset;
    item.style.opacity = String(Math.max(0.25, 1 - absOffset * 0.2));
    item.style.pointerEvents = 'auto';
  });
}

function goToIndex(i) {
  if (!allPhotos.length) return;
  currentIndex = Math.max(0, Math.min(i, allPhotos.length - 1));
  layoutCoverflow();
  updateCaption();
}

function nextPhoto() { goToIndex(currentIndex + 1); }
function prevPhoto() { goToIndex(currentIndex - 1); }

function updateCaption() {
  const cap = document.getElementById('coverflow-caption');
  if (!cap) return;
  const photo = allPhotos[currentIndex];
  if (!photo) { cap.innerHTML = ''; return; }
  cap.innerHTML = `
    <div class="title">${photo.title || ''}</div>
    <div class="count">${currentIndex + 1} / ${allPhotos.length}</div>
  `;
}

// ---- Arrow buttons, keyboard, wheel & drag/swipe ----
function setupCoverflowControls() {
  const wrap  = document.getElementById('coverflow-wrap');
  const stage = document.getElementById('coverflow-stage');
  document.getElementById('coverflow-prev')?.addEventListener('click', prevPhoto);
  document.getElementById('coverflow-next')?.addEventListener('click', nextPhoto);
  if (!wrap || !stage) return;

  readCoverflowMetrics();
  window.addEventListener('resize', () => { readCoverflowMetrics(); layoutCoverflow(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
  });

  let wheelLock = false;
  wrap.addEventListener('wheel', e => {
    e.preventDefault();
    if (wheelLock) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 15) nextPhoto();
    else if (delta < -15) prevPhoto();
    else return;
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 200);
  }, { passive: false });

  // Unified pointer-drag (mouse + touch) so the stack follows the finger/cursor
  // in real time and snaps smoothly on release — same interaction on mobile and desktop.
  let pointerId    = null;
  let dragging     = false;
  let draggedEnough = false;
  let startX = 0, startY = 0, dragDx = 0;
  let lastMoveTime = 0, velocity = 0;
  let rafPending = false;

  wrap.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dragDx = 0;
    dragging = true;
    draggedEnough = false;
    velocity = 0;
    lastMoveTime = performance.now();
  });

  wrap.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!draggedEnough) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; } // vertical scroll intent
      draggedEnough = true;
      try { wrap.setPointerCapture(pointerId); } catch (_) {}
      wrap.classList.add('dragging');
    }

    e.preventDefault();
    const now = performance.now();
    const dt = now - lastMoveTime;
    if (dt > 0) velocity = (dx - dragDx) / dt;
    lastMoveTime = now;
    dragDx = dx;

    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        if (dragging) layoutCoverflow(dragDx);
      });
    }
  }, { passive: false });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('dragging');

    if (draggedEnough) {
      suppressClickUntil = Date.now() + 300;
      let shift = Math.round(-dragDx / cfSpacing);
      if (shift === 0 && Math.abs(velocity) > 0.5) shift = velocity < 0 ? 1 : -1;
      goToIndex(currentIndex + shift);
    }
    pointerId = null;
    draggedEnough = false;
  }

  wrap.addEventListener('pointerup', endDrag);
  wrap.addEventListener('pointercancel', endDrag);
  wrap.addEventListener('pointerleave', e => {
    if (dragging && e.pointerId === pointerId) endDrag();
  });
}

// ---- Lightbox ----
function setupLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lightbox-close')
    ?.addEventListener('click', closeLightbox);

  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(index, photos) {
  const lb   = document.getElementById('lightbox');
  const img  = document.getElementById('lightbox-img');
  const cap  = document.getElementById('lightbox-caption');
  if (!lb || !img) return;

  const photo = photos[index];
  img.src  = photo.imageURL || '';
  img.alt  = photo.title || '';
  if (cap) cap.innerHTML = `
    <div class="title">${photo.title || ''}</div>
  `;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb?.classList.remove('open');
  document.body.style.overflow = '';
}
