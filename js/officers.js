/**
 * CSA  — OFFICERS PAGE
 */
const PLACEHOLDER_OFFICERS = [
  { name: 'Yoyo Liu',     role: 'President', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Liz Michel',     role: 'Vice President', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Sharna Umino',  role: 'Vice President', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Preston Tang',    role: 'Secretary', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Brendan Chung',        role: 'Treasurer', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Ethan Lee',  role: 'Event Coordinator', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Tan Lin',    role: 'Family Chair', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Ting',   role: 'Cultural Chair', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Phillip Mai', role: 'Marketing Chair', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
  { name: 'Lac Lam', role: 'Webmaster', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg'},
];

const PLACEHOLDER_FAMILY_HEADS = [
  { name: 'Jason Liao', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg' },
  { name: 'Aries Yindee', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg' },
  { name: 'Kristen Heng', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg' },
  { name: 'Nathan Won', photoURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg' },
];

const PLACEHOLDER_PAST_OFFICERS = [
  { name: 'Jason Liao',     year: '2025–2026' }, { name: 'Yoyo Liu',      year: '2025–2026' },
  { name: 'Shara Umino',     year: '2025–2026' }, { name: 'Liz Michel',     year: '2025–2026' },
  { name: 'Tim Lim',     year: '2025–2026' }, { name: 'Summer Norman',     year: '2025–2026' },
  { name: 'Nicholas Wong',      year: '2025–2026' }, { name: 'Jacob Meng',    year: '2025–2026' },

  { name: 'Chloe Tee',    year: '2024–2025' }, { name: 'Nicholas Wong ',     year: '2024–2025' },
  { name: 'Yoyo Liu',      year: '2024–2025' }, { name: 'Shannon Tan', year: '2024–2025' },
  { name: 'Tim Lim',      year: '2024–2025' }, { name: 'Jason Liao', year: '2024–2025' },
  { name: 'Atreya Ghosh',      year: '2024–2025' }, { name: 'Timbo Archey', year: '2024–2025' },
  { name: 'Sophia Tran',      year: '2024–2025' }, { name: 'Jeslyn Wong', year: '2024–2025' },
];

document.addEventListener('DOMContentLoaded', () => {
  loadOfficers();
  loadFamilyHeads();
  loadPastOfficers();
});

function applyRowCentering(grid, count) {
  if (!grid) return;
  grid.classList.toggle('few-items', count > 0 && count <= 2);
}

// ---- Current Officers ----
async function loadOfficers() {
  const grid = document.getElementById('officers-grid');
  if (!grid) return;

  for (let i = 0; i < PLACEHOLDER_OFFICERS.length; i++) grid.appendChild(buildSkeletonCard());

  let officers = [];
  try {
    const snap = await window.db.collection('officers').orderBy('order').get();
    officers = snap.empty ? PLACEHOLDER_OFFICERS : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Officers load failed, using placeholders:', err);
    officers = PLACEHOLDER_OFFICERS;
  }

  grid.innerHTML = '';
  officers.forEach(officer => grid.appendChild(buildOfficerCard(officer)));
}

// ---- Family Heads ----
async function loadFamilyHeads() {
  const grid = document.getElementById('family-heads-grid');
  if (!grid) return;

  for (let i = 0; i < PLACEHOLDER_FAMILY_HEADS.length; i++) grid.appendChild(buildSkeletonCard());

  let heads = [];
  try {
    const snap = await window.db.collection('family-heads').orderBy('order').get();
    heads = snap.empty ? PLACEHOLDER_FAMILY_HEADS : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Family heads load failed, using placeholders:', err);
    heads = PLACEHOLDER_FAMILY_HEADS;
  }

  grid.innerHTML = '';
  heads.forEach(head => grid.appendChild(buildOfficerCard(head)));
}

function buildOfficerCard(officer) {
  const card = document.createElement('div');
  card.className = 'officer-card fade-up';

  card.innerHTML = `
    <div class="officer-photo-wrap">
      <img class="officer-photo"
           src="${officer.photoURL || ''}"
           alt="${officer.name}"
           loading="lazy"
           onerror="this.src=''">
      <span class="officer-role-badge">${officer.role || ''}</span>
    </div>
    <div class="officer-info">
      <div class="officer-name">${officer.name || ''}</div>
    </div>
  `;

  // Fade-in observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  obs.observe(card);

  return card;
}

function buildSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'officer-card loading';
  card.innerHTML = `
    <div class="officer-photo-wrap">
      <div class="officer-photo-skel skeleton" style="height:300px"></div>
    </div>
    <div class="officer-info-skel">
      <div class="skel-line medium skeleton"></div>
      <div class="skel-line short skeleton"></div>
    </div>
  `;
  return card;
}

// ---- Past Officers (grouped by year, name-only, expand/collapse per year) ----
async function loadPastOfficers() {
  const list = document.getElementById('past-officers-list');
  if (!list) return;

  let officers = [];
  try {
    const snap = await window.db.collection('past-officers').orderBy('order').get();
    officers = snap.empty ? PLACEHOLDER_PAST_OFFICERS : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('Past officers load failed, using placeholders:', err);
    officers = PLACEHOLDER_PAST_OFFICERS;
  }

  // Group by year, preserving each year's first-seen order (most recent first in the data)
  const years = [];
  const byYear = {};
  officers.forEach(o => {
    const y = o.year || 'Past';
    if (!byYear[y]) { byYear[y] = []; years.push(y); }
    byYear[y].push(o);
  });

  list.innerHTML = '';
  years.forEach((year, i) => {
    list.appendChild(buildYearGroup(year, byYear[year], i === 0));
  });
}

function buildYearGroup(year, officers, startOpen) {
  const group = document.createElement('div');
  group.className = 'year-group' + (startOpen ? ' open' : '');

  const header = document.createElement('button');
  header.className = 'year-header';
  header.type = 'button';
  header.setAttribute('aria-expanded', String(startOpen));
  header.innerHTML = `
    <span class="year-label">${year}</span>
    <span class="year-count">${officers.length}</span>
    <svg class="year-chevron" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
  `;
  header.addEventListener('click', () => {
    const isOpen = group.classList.toggle('open');
    header.setAttribute('aria-expanded', String(isOpen));
  });

  const body = document.createElement('div');
  body.className = 'year-body';
  const chips = document.createElement('div');
  chips.className = 'year-chips';
  officers.forEach(o => {
    const chip = document.createElement('span');
    chip.className = 'past-officer-chip';
    chip.textContent = o.name || '';
    chips.appendChild(chip);
  });
  body.appendChild(chips);

  group.appendChild(header);
  group.appendChild(body);
  return group;
}