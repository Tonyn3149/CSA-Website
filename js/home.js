/**
 * CSA — HOME PAGE
 */
document.addEventListener('DOMContentLoaded', () => {

  // ---- Intersection observer for fade-up animations ----
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ---- Scrolling gallery from Firestore ----
  loadHomeGallery();
});

async function loadHomeGallery() {
  const track = document.getElementById('gallery-track');
  if (!track) return;

  try {
    const snap = await window.db.collection('gallery')
      .orderBy('createdAt', 'desc')
      .limit(6)
      .get();

    if (snap.empty) {
      useGalleryPlaceholders(track);
      return;
    }

    const cards = [];
    snap.forEach(doc => cards.push({ id: doc.id, ...doc.data() }));

    // Duplicate for infinite loop
    [...cards, ...cards].forEach(item => {
      const card = buildGalleryCard(item);
      track.appendChild(card);
    });
  } catch (err) {
    console.warn('Gallery load failed, using placeholders:', err);
    useGalleryPlaceholders(track);
  }
}

function buildGalleryCard(item) {
  const div = document.createElement('div');
  div.className = 'gallery-card';
  div.innerHTML = `
    <img src="${item.imageURL || 'https://via.placeholder.com/360x260?text=CSA'}"
         alt="${item.title || 'CSA Gallery'}"
         loading="lazy"
         onerror="this.src='https://via.placeholder.com/360x260?text=CSA'">
    <span class="gallery-card-label">${item.title || ''}</span>
  `;
  return div;
}

function useGalleryPlaceholders(track) {
  const placeholders = [
    {imageURL: 'photos/20260217_200654.jpg' },
    {imageURL: 'photos/IMG_0204.jpg' },
    {imageURL: 'photos/IMG_7233.jpg' },
    {imageURL: 'photos/IMG_9289.jpg' },
    {imageURL: 'photos/IMG_0222.jpg' },
    {imageURL: 'photos/IMG20251006184538.jpg' },
  ];

  [...placeholders, ...placeholders].forEach(item => {
    track.appendChild(buildGalleryCard(item));
  });
}
