/**
 * CSA — EVENTS PAGE
 * Interactive calendar (month / week) + Firestore event feed.
 */

const MONTHS = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let allEvents    = [];
let currentDate  = new Date();
let selectedDate = null;
let currentView  = 'month';

// Week view: always track the Sunday of the displayed week
function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
let currentWeekStart = getWeekStart(new Date());

const PLACEHOLDER_EVENTS = [
  /*  {
    title: '1st General Meeting', category: '', date: new Date(2026, 7, 26), //yyyy,mm,dd month is index- jan-0, feb-1, ...
    time: '6:00 PM', location: 'SU 2.601',
    description: 'orem ipsum dolor sit amet consectetur adipiscing elit',
    imageURL: 'https://i.pinimg.com/originals/59/54/b4/5954b408c66525ad932faa693a647e3f.jpg',
    rsvpURL: 'https://forms.gle/RSVP_AlumniNetworking', rsvpEnabled: false
  },
  */
  {
    title: '1st General Meeting', date: new Date(2026, 7, 26),
    time: '7:00 PM', location: 'GR 4.428',
    description: '',
    imageURL: 'photos/1st-gen-meet.png',
    rsvpURL: '', rsvpEnabled: false
  },
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadEvents();
  renderCalendar();
  renderFeed();
  setupControls();
});

// ---- Load events ----
async function loadEvents() {
  try {
    const snap = await window.db.collection('events').orderBy('date').get();
    allEvents = snap.empty
      ? PLACEHOLDER_EVENTS
      : snap.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data, date: data.date?.toDate?.() || new Date(data.date) };
        });
  } catch (err) {
    console.warn('Events load failed, using placeholders:', err);
    allEvents = PLACEHOLDER_EVENTS;
  }
}

// ---- Month Calendar ----
function renderCalendar() {
  const grid  = document.getElementById('calendar-grid');
  const title = document.getElementById('cal-month-title');
  if (!grid || !title) return;

  grid.className = 'calendar-grid';

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  title.textContent = `${MONTHS[month]} ${year}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays    = new Date(year, month, 0).getDate();

  const eventMap = {};
  allEvents.forEach(ev => {
    const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = `${year}-${month}-${d.getDate()}`;
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(ev);
    }
  });

  grid.innerHTML = DAYS.map(d => `<div class="cal-day-label">${d}</div>`).join('');

  const today = new Date();

  for (let i = firstDay - 1; i >= 0; i--) {
    grid.appendChild(buildCalDay(prevDays - i, true, false, false, []));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    const isSelected = selectedDate && selectedDate.getDate() === d &&
                       selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const events     = eventMap[`${year}-${month}-${d}`] || [];
    const cell       = buildCalDay(d, false, isToday, isSelected, events);
    cell.addEventListener('click', () => {
      selectedDate = new Date(year, month, d);
      renderCalendar();
      renderFeed();
      cell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    grid.appendChild(cell);
  }

  const total     = firstDay + daysInMonth;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let d = 1; d <= remaining; d++) {
    grid.appendChild(buildCalDay(d, true, false, false, []));
  }
}

function buildCalDay(day, otherMonth, isToday, isSelected, events) {
  const div = document.createElement('div');
  div.className = 'cal-day'
    + (otherMonth ? ' other-month' : '')
    + (isToday    ? ' today'       : '')
    + (isSelected ? ' selected'    : '')
    + (events.length ? ' has-event' : '');

  const dateEl = document.createElement('div');
  dateEl.className = 'cal-date';
  dateEl.textContent = day;
  div.appendChild(dateEl);

  events.slice(0, 2).forEach(ev => {
    const dot = document.createElement('div');
    const cat = (ev.category || '').toLowerCase().replace(/\s+/g, '-');
    dot.className = `cal-event-dot ${cat}`;
    dot.textContent = ev.title;
    dot.title = ev.title;
    div.appendChild(dot);
  });

  return div;
}

// ---- Week Calendar ----
function renderWeek() {
  const grid  = document.getElementById('calendar-grid');
  const title = document.getElementById('cal-month-title');
  if (!grid || !title) return;

  grid.className = 'calendar-grid week-view';

  const start = new Date(currentWeekStart);
  const end   = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  title.textContent = `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;

  // Build event map keyed by date string
  const eventMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    eventMap[d.toDateString()] = [];
  }
  allEvents.forEach(ev => {
    const d   = ev.date instanceof Date ? ev.date : new Date(ev.date);
    const key = d.toDateString();
    if (eventMap[key] !== undefined) eventMap[key].push(ev);
  });

  const today = new Date();
  grid.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const d         = new Date(start);
    d.setDate(d.getDate() + i);
    const isToday   = d.toDateString() === today.toDateString();
    const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
    const events    = eventMap[d.toDateString()] || [];

    const cell = document.createElement('div');
    cell.className = 'cal-day week-day'
      + (isToday    ? ' today'    : '')
      + (isSelected ? ' selected' : '')
      + (events.length ? ' has-event' : '');

    // Header inside each cell (day name + date number)
    const header = document.createElement('div');
    header.className = 'week-day-header';
    header.innerHTML = `
      <span class="week-day-name">${DAYS[d.getDay()]}</span>
      <span class="cal-date">${d.getDate()}</span>
    `;
    cell.appendChild(header);

    events.forEach(ev => {
      const dot = document.createElement('div');
      const cat = (ev.category || '').toLowerCase().replace(/\s+/g, '-');
      dot.className = `cal-event-dot ${cat}`;
      dot.textContent = ev.title;
      dot.title = ev.title;
      cell.appendChild(dot);
    });

    if (!events.length) {
      const empty = document.createElement('div');
      empty.className = 'week-no-events';
      empty.textContent = '—';
      cell.appendChild(empty);
    }

    cell.addEventListener('click', () => {
      selectedDate = new Date(d);
      renderWeek();
      renderFeed();
    });

    grid.appendChild(cell);
  }
}

// ---- Event Feed ----
function renderFeed() {
  const feed = document.getElementById('events-feed');
  if (!feed) return;

  let filtered = [...allEvents];

  if (selectedDate) {
    filtered = filtered.filter(ev => {
      const d = ev.date instanceof Date ? ev.date : new Date(ev.date);
      return d.toDateString() === selectedDate.toDateString();
    });
  }

  filtered.sort((a, b) => {
    const da  = a.date instanceof Date ? a.date : new Date(a.date);
    const db_ = b.date instanceof Date ? b.date : new Date(b.date);
    return da - db_;
  });

  feed.innerHTML = '';

  if (!filtered.length) {
    feed.innerHTML = `
      <div class="no-events">
        <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
        <p>${selectedDate ? 'No events on this day.' : 'No events scheduled.'}</p>
        ${selectedDate ? `<button onclick="clearDateFilter()" style="margin-top:12px;color:var(--crimson);font-size:14px;background:none;border:none;cursor:pointer;text-decoration:underline;">Show all events</button>` : ''}
      </div>`;
    return;
  }

  filtered.forEach(ev => feed.appendChild(buildEventCard(ev)));
}

function buildEventCard(ev) {
  const d       = ev.date instanceof Date ? ev.date : new Date(ev.date);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const cat     = (ev.category || '').toLowerCase().replace(/\s+/g, '-');
  const rsvpHref = ev.rsvpURL || 'https://forms.gle/YOUR_FORM_ID';
  const showRsvp = ev.rsvpEnabled !== false;

  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="event-img-wrap">
      <img class="event-img"
           src="${ev.imageURL || 'https://via.placeholder.com/144x128?text=CSA'}"
           alt="${ev.title || ''}"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/144x128?text=CSA'">
      <span class="event-cat-tag ${cat}">${ev.category || ''}</span>
    </div>
    <div class="event-body">
      <div class="event-title">${ev.title || ''}</div>
      <div class="event-desc">${ev.description || ''}</div>
      <div class="event-meta">
        <span class="event-meta-item">
          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-7-7h5v5h-5z"/></svg>
          ${dateStr}${ev.time ? ', ' + ev.time : ''}
        </span>
        ${ev.location ? `
        <span class="event-meta-item">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          ${ev.location}
        </span>` : ''}
      </div>
    </div>
    ${showRsvp ? `
    <div class="event-action">
      <a class="btn btn-primary btn-sm"
         href="${rsvpHref}"
         target="_blank"
         rel="noopener noreferrer">RSVP</a>
    </div>` : ''}
  `;
  return card;
}

function clearDateFilter() {
  selectedDate = null;
  currentView === 'month' ? renderCalendar() : renderWeek();
  renderFeed();
}
window.clearDateFilter = clearDateFilter;

// ---- Controls ----
function setupControls() {
  // Calendar prev / next — respects current view
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    if (currentView === 'month') {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    } else {
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
      renderWeek();
    }
  });

  document.getElementById('cal-next')?.addEventListener('click', () => {
    if (currentView === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    } else {
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      renderWeek();
    }
  });

  // View toggle buttons
  document.querySelectorAll('.cal-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view || 'month';
      if (currentView === 'week') {
        // Snap week to month's current date context
        currentWeekStart = getWeekStart(currentDate);
        renderWeek();
      } else {
        renderCalendar();
      }
    });
  });
}
