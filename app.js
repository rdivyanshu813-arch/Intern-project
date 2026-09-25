const STORAGE_KEY = 'waypoint-trips-v1';
const palettes = [
  { emoji: '⛩️', colors: 'linear-gradient(145deg,#d8c8a6,#93a28b 55%,#64755e)' },
  { emoji: '🌊', colors: 'linear-gradient(145deg,#c6dedc,#78aaa7 55%,#527f83)' },
  { emoji: '🏔️', colors: 'linear-gradient(145deg,#ded9c9,#a4b2a3 54%,#768c83)' },
  { emoji: '🌵', colors: 'linear-gradient(145deg,#ead9b9,#cda17b 55%,#9b775c)' },
  { emoji: '🏛️', colors: 'linear-gradient(145deg,#e7d9c3,#b99a81 55%,#8e7562)' }
];
const seedTrips = [
  { id: 'kyoto-sample', destination: 'Kyoto', country: 'Japan', startDate: '2026-11-08', endDate: '2026-11-13', note: 'Slow mornings, temple paths, and one very good bowl of ramen.', palette: 0, days: [
    [{ time: '09:00', title: 'Arrive & settle in', place: 'Check in near Gion' }, { time: '14:00', title: 'Wander Gion', place: 'Old streets at golden hour' }, { time: '19:00', title: 'Dinner at Pontocho', place: 'Find something that smells good' }],
    [{ time: '07:30', title: 'Fushimi Inari', place: 'Beat the crowds on the early trail' }, { time: '12:00', title: 'Nishiki Market', place: 'Little bites & local snacks' }],
    [{ time: '09:00', title: 'Arashiyama bamboo grove', place: 'Take the river path back' }], [], [], []
  ] },
  { id: 'goa-sample', destination: 'Goa', country: 'India', startDate: '2026-12-18', endDate: '2026-12-22', note: 'A few beach days with nowhere urgent to be.', palette: 1, days: [[], [], [], [], []] },
  { id: 'manali-sample', destination: 'Manali', country: 'India', startDate: '2027-01-09', endDate: '2027-01-14', note: 'Mountain air and warm cups of chai.', palette: 2, days: [[], [], [], [], [], []] }
];
let trips = readTrips();
let activeFilter = 'upcoming';
let activeTripId = null;
let activeDay = 0;
let toastTimer;

function readTrips() { try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(value) ? value : structuredClone(seedTrips); } catch { return structuredClone(seedTrips); } }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(trips)); render(); }
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
function dateObj(value) { return new Date(`${value}T12:00:00`); }
function fmtDate(value, options = { month: 'short', day: 'numeric' }) { return dateObj(value).toLocaleDateString('en', options); }
function duration(trip) { return Math.max(1, Math.round((dateObj(trip.endDate) - dateObj(trip.startDate)) / 86400000) + 1); }
function tripStatus(trip) { const today = new Date(); today.setHours(0, 0, 0, 0); const start = dateObj(trip.startDate); const end = dateObj(trip.endDate); return end < today ? 'Past trip' : start <= today && today <= end ? 'Happening now' : 'Coming up'; }
function currentTrips() { return activeFilter === 'upcoming' ? trips.filter(t => tripStatus(t) !== 'Past trip') : trips; }
function coverStyle(trip, detail = false) { const fallback = palettes[trip.palette % palettes.length].colors; return trip.cover ? `background-image:linear-gradient(#1d282022,#1d282022),url("${escapeHtml(trip.cover)}");background-color:#d8d8ce;background-size:cover;background-position:center` : `background:${fallback}`; }
function completedCount(trip) { return (trip.days || []).flat().length; }
function render() {
  const visible = [...currentTrips()].sort((a, b) => a.startDate.localeCompare(b.startDate));
  document.querySelector('#trip-count').textContent = trips.length;
  document.querySelector('#trip-heading-count').textContent = `(${visible.length})`;
  document.querySelector('#trip-nav').innerHTML = trips.slice(0, 6).map(t => `<button data-open="${escapeHtml(t.id)}"><span class="mini-dot"></span><span>${escapeHtml(t.destination)}</span></button>`).join('');
  document.querySelector('#empty-state').hidden = visible.length !== 0;
  document.querySelector('#trip-grid').innerHTML = visible.map(trip => {
    const total = duration(trip); const count = completedCount(trip); const palette = palettes[trip.palette % palettes.length];
    const status = tripStatus(trip); const dateRange = `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}`;
    return `<article class="trip-card" data-open="${escapeHtml(trip.id)}" tabindex="0" aria-label="Open ${escapeHtml(trip.destination)} itinerary"><div class="card-cover" style="${coverStyle(trip)}"><span class="cover-chip">${escapeHtml(status.toUpperCase())}</span><span class="cover-emoji">${trip.cover ? '' : palette.emoji}</span><button class="cover-menu" data-edit="${escapeHtml(trip.id)}" aria-label="Edit ${escapeHtml(trip.destination)} trip">···</button></div><div class="card-body"><div class="card-topline"><h3>${escapeHtml(trip.destination)}</h3><span class="card-country">${escapeHtml(trip.country || 'Your destination')}</span></div><div class="date-line">▦ ${dateRange}<span>·</span>${total} days</div><div class="card-progress"><span style="width:${Math.min(100, Math.round((count / Math.max(total * 3, 1)) * 100))}%"></span></div><div class="card-bottom"><span>${count ? `${count} planned ${count === 1 ? 'moment' : 'moments'}` : 'Ready when you are'}</span><span class="plan-link">Open itinerary →</span></div></div></article>`;
  }).join('');
}
function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); }
function openTripDialog(trip = null) {
  const dialog = document.querySelector('#trip-dialog'); const form = document.querySelector('#trip-form'); form.reset();
  document.querySelector('#trip-dialog-title').textContent = trip ? 'Edit your trip' : 'Plan a trip';
  if (trip) { Object.entries(trip).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; }); }
  dialog.showModal();
}
function parseDestination(raw) { const bits = raw.split(',').map(x => x.trim()).filter(Boolean); return { destination: bits[0] || raw.trim(), country: bits.slice(1).join(', ') || 'Your destination' }; }
function buildDays(startDate, endDate, previous = []) { const count = Math.min(30, Math.max(1, Math.round((dateObj(endDate) - dateObj(startDate)) / 86400000) + 1)); return Array.from({ length: count }, (_, i) => previous[i] || []); }
function openDetail(id) { activeTripId = id; activeDay = 0; renderDetail(); document.querySelector('#detail-dialog').showModal(); }
function renderDetail() {
  const trip = trips.find(t => t.id === activeTripId); if (!trip) return;
  const total = duration(trip); const days = trip.days || Array.from({ length: total }, () => []); const activities = days[activeDay] || [];
  const dayDate = new Date(dateObj(trip.startDate)); dayDate.setDate(dayDate.getDate() + activeDay);
  const dateLabel = dayDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  const palette = palettes[trip.palette % palettes.length];
  document.querySelector('#detail-content').innerHTML = `<div class="detail-cover" style="${coverStyle(trip, true)}"><button class="close-button detail-x" data-close aria-label="Close">×</button><div class="detail-cover-content"><small>${escapeHtml(trip.country || 'YOUR JOURNEY').toUpperCase()} · ${total} DAYS</small><h2>${escapeHtml(trip.destination)}</h2></div></div><div class="detail-inner"><div class="detail-meta"><span>▦ ${fmtDate(trip.startDate, { month: 'long', day: 'numeric', year: 'numeric' })} – ${fmtDate(trip.endDate, { month: 'long', day: 'numeric', year: 'numeric' })}</span><span>✦ ${escapeHtml(tripStatus(trip))}</span></div>${trip.note ? `<p class="detail-note">${escapeHtml(trip.note)}</p>` : ''}<div class="day-heading"><h3>Your itinerary</h3><small>${completedCount(trip)} moments planned</small></div><div class="day-tabs">${days.map((_, i) => `<button class="day-tab ${i === activeDay ? 'active' : ''}" data-day="${i}">Day ${i + 1}</button>`).join('')}</div><div class="day-heading"><h3>${dateLabel}</h3><small>${activities.length} ${activities.length === 1 ? 'plan' : 'plans'}</small></div><div class="activity-list">${activities.length ? activities.map((item, i) => `<div class="activity-row"><time>${escapeHtml(item.time || 'Anytime')}</time><div><strong>${escapeHtml(item.title)}</strong>${item.place ? `<small>${escapeHtml(item.place)}</small>` : ''}</div><button data-remove-activity="${i}" aria-label="Remove ${escapeHtml(item.title)}">×</button></div>`).join('') : '<p class="detail-note">Nothing on the calendar yet. Leave it open or add a little plan.</p>'}</div><form class="add-activity" id="activity-form"><input name="time" type="time" aria-label="Time"><input name="title" required maxlength="80" placeholder="Add a plan for this day…" aria-label="Activity"><input name="place" maxlength="100" placeholder="Place or note (optional)" aria-label="Place or note"><button aria-label="Add activity">＋</button></form><div class="detail-toolbar"><button class="button button-quiet" data-edit="${escapeHtml(trip.id)}">Edit trip</button><button class="button button-quiet" data-download="${escapeHtml(trip.id)}">↓ Download itinerary</button><button class="button button-quiet danger" data-delete="${escapeHtml(trip.id)}">Delete trip</button></div></div>`;
}
function exportAll() { const blob = new Blob([JSON.stringify({ app: 'Waypoint', exportedAt: new Date().toISOString(), trips }, null, 2)], { type: 'application/json' }); downloadBlob(blob, 'waypoint-trips-backup.json'); toast('Your trip backup is ready.'); }
function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
function downloadTrip(id) { const trip = trips.find(t => t.id === id); if (!trip) return; const lines = [`# ${trip.destination} itinerary`, `**${fmtDate(trip.startDate, { month: 'long', day: 'numeric', year: 'numeric' })} – ${fmtDate(trip.endDate, { month: 'long', day: 'numeric', year: 'numeric' })}**`, '', trip.note || '', '']; (trip.days || []).forEach((day, i) => { const d = new Date(dateObj(trip.startDate)); d.setDate(d.getDate() + i); lines.push(`## Day ${i + 1} — ${d.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}`); if (!day.length) lines.push('- No plans yet'); day.forEach(item => lines.push(`- **${item.time || 'Anytime'}** ${item.title}${item.place ? ` — ${item.place}` : ''}`)); lines.push(''); }); downloadBlob(new Blob([lines.join('\n')], { type: 'text/markdown' }), `${trip.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-itinerary.md`); toast('Itinerary downloaded.'); }
document.addEventListener('click', event => {
  const close = event.target.closest('[data-close]'); if (close) { close.closest('dialog').close(); return; }
  const edit = event.target.closest('[data-edit]'); if (edit) { event.stopPropagation(); const trip = trips.find(t => t.id === edit.dataset.edit); if (document.querySelector('#detail-dialog').open) document.querySelector('#detail-dialog').close(); openTripDialog(trip); return; }
  const del = event.target.closest('[data-delete]'); if (del) { if (confirm('Delete this trip and its itinerary? This cannot be undone.')) { trips = trips.filter(t => t.id !== del.dataset.delete); document.querySelector('#detail-dialog').close(); save(); toast('Trip deleted.'); } return; }
  const remove = event.target.closest('[data-remove-activity]'); if (remove) { trips.find(t => t.id === activeTripId).days[activeDay].splice(Number(remove.dataset.removeActivity), 1); save(); renderDetail(); toast('Plan removed.'); return; }
  const day = event.target.closest('[data-day]'); if (day) { activeDay = Number(day.dataset.day); renderDetail(); return; }
  const dl = event.target.closest('[data-download]'); if (dl) { downloadTrip(dl.dataset.download); return; }
  const open = event.target.closest('[data-open]'); if (open && !event.target.closest('[data-edit]')) { openTrip(open.dataset.open); return; }
  const filter = event.target.closest('[data-filter]'); if (filter) { activeFilter = filter.dataset.filter; document.querySelectorAll('.filter-button').forEach(b => b.classList.toggle('active', b === filter)); render(); }
});
function openTrip(id) { openDetail(id); }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelector('#trip-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
document.querySelector('#detail-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
document.querySelector('#trip-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const parsed = parseDestination(data.get('destination')); const startDate = data.get('startDate'); const endDate = data.get('endDate');
  if (endDate < startDate) { toast('The end date should be after the start date.'); return; }
  const existing = trips.find(t => t.id === data.get('id')); const id = existing?.id || `trip-${Date.now()}`;
  const trip = { ...(existing || {}), id, ...parsed, startDate, endDate, note: String(data.get('note') || '').trim(), cover: String(data.get('cover') || '').trim(), palette: existing?.palette ?? trips.length % palettes.length };
  trip.days = buildDays(startDate, endDate, existing?.days || []); if (existing) trips = trips.map(t => t.id === id ? trip : t); else trips.push(trip);
  document.querySelector('#trip-dialog').close(); save(); toast(existing ? 'Trip details saved.' : 'A new trip is on the horizon.');
});
document.querySelector('#detail-dialog').addEventListener('submit', event => {
  if (event.target.id !== 'activity-form') return; event.preventDefault(); const form = new FormData(event.target); const title = String(form.get('title') || '').trim(); if (!title) return;
  const trip = trips.find(t => t.id === activeTripId); trip.days[activeDay].push({ time: form.get('time') || '', title, place: String(form.get('place') || '').trim() }); trip.days[activeDay].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')); save(); renderDetail(); toast('Plan added to your day.');
});
['#new-trip-top', '#quick-add', '#empty-add'].forEach(selector => document.querySelector(selector).addEventListener('click', () => openTripDialog()));
document.querySelector('#export-btn').addEventListener('click', exportAll);
document.querySelector('#trip-grid').addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.trip-card')) { event.preventDefault(); openTrip(event.target.dataset.open); } });
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => { if (button.dataset.view === 'discover') { toast('Discover is coming soon. For now, add your own favorite places to an itinerary.'); return; } document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b === button)); document.querySelector('#trip-heading').scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./service-worker.js').catch(() => {});
render();
