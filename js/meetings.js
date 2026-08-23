/**
 * CSA — MEETINGS PAGE
 */
const PLACEHOLDER_MEETINGS = [
  /*{
    number: 1,
    title: 'General Meeting #1 (test link w canva)',
    date: new Date('2026-07-02'),
    slidesEmbedURL: 'https://www.canva.com/design/DAHK_CRvtdw/N-D6saFlvfSnt8uA8vWYTg/view?embed', /*testing site
  }
  */
];

document.addEventListener('DOMContentLoaded', loadMeetings);

async function loadMeetings() {
  const list = document.getElementById('meetings-list');
  if (!list) return;

  // Skeleton
  list.innerHTML = `<div class="skeleton" style="height:400px;border-radius:12px"></div>
                    <div class="skeleton" style="height:400px;border-radius:12px;margin-top:32px"></div>`;

  let meetings = [];
  try {
    const snap = await window.db.collection('meetings')
      .orderBy('number', 'desc')
      .get();
    meetings = snap.empty
      ? PLACEHOLDER_MEETINGS
      : snap.docs.map(d => {
          const data = d.data();
          return { id: d.id, ...data, date: data.date?.toDate?.() || data.date };
        });
  } catch (err) {
    console.warn('Meetings load failed, using placeholders:', err);
    meetings = PLACEHOLDER_MEETINGS;
  }

  list.innerHTML = '';
  meetings.forEach(m => list.appendChild(buildMeetingItem(m)));
}

function buildMeetingItem(meeting) {
  const div = document.createElement('div');
  div.className = 'meeting-item';

  const dateStr = meeting.date
    ? (meeting.date instanceof Date
        ? meeting.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : meeting.date)
    : '';

  const embedHTML = meeting.slidesEmbedURL
    ? `<iframe class="slide-embed-frame"
               src="${meeting.slidesEmbedURL}"
               allowfullscreen
               loading="lazy"></iframe>`
    : `<div class="slide-placeholder">
         <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 12H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V5h10v2z"/></svg>
         <span>Slides not yet uploaded</span>
       </div>`;

  div.innerHTML = `
    <h3 class="meeting-item-heading">${meeting.title || `General Meeting #${meeting.number}`}</h3>
    <div class="slide-embed-wrap slide-embed-corners">
      ${embedHTML}
      ${meeting.slidesEmbedURL ? `
      <div class="slide-embed-bar">
        <span>${dateStr}</span>
        <a href="${meeting.slidesEmbedURL}" target="_blank" rel="noopener">Open in Slides ↗</a>
      </div>` : ''}
    </div>
    ${meeting.slidesEmbedURL ? `
    <div class="meeting-link">
      <a href="${meeting.slidesEmbedURL}" target="_blank" rel="noopener">
        View Full Presentation →
      </a>
    </div>` : ''}
  `;

  return div;
}
