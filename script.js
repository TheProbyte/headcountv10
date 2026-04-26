const STORAGE_KEY = 'headcount_mobile_state_v1';
const services = ['9:00 AM SERVICE', '11:30 AM SERVICE', '6:00 PM SERVICE'];

const defaultLocations = [
  { name: 'WORSHIP CENTER', sub: 'Main Auditorium', count: 312, color: '#b45b37', icon: '✝' },
  { name: 'LOBBY', sub: 'Main Entrance', count: 64, color: '#798166', icon: '🛋' },
  { name: 'PATIO', sub: 'Outdoor Area', count: 38, color: '#c89a25', icon: '☂' },
  { name: 'STUMIN', sub: 'Student Ministry', count: 42, color: '#6f9a92', icon: 'S' },
  { name: 'FAMILY ROOMS', sub: 'Parents & Infants', count: 19, color: '#b5673f', icon: '👥' },
  { name: 'PRAYER ROOM', sub: 'Prayer & Reflection', count: 7, color: '#757e63', icon: '🙏' },
  { name: 'ORIGIN', sub: 'Young Adults', count: 5, color: '#be9324', icon: '◉' },
];

const state = loadState();

function cloneLocations(list) {
  return list.map((item) => ({ ...item }));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      serviceIndex: Number.isInteger(stored.serviceIndex) ? stored.serviceIndex : 1,
      locations: Array.isArray(stored.locations) && stored.locations.length ? stored.locations : cloneLocations(defaultLocations),
      updatedAt: stored.updatedAt || 'May 24, 2025 11:32 AM',
      recent: Array.isArray(stored.recent) && stored.recent.length ? stored.recent : [312, 310, 307, 305, 304],
    };
  } catch {
    return { serviceIndex: 1, locations: cloneLocations(defaultLocations), updatedAt: 'May 24, 2025 11:32 AM', recent: [312, 310, 307, 305, 304] };
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function refreshDashboard() {
  const list = document.getElementById('locationList');
  const total = document.getElementById('totalCount');
  const updated = document.getElementById('updatedAt');
  if (!list || !total) return;
  list.innerHTML = '';

  state.locations.forEach((l, idx) => {
    const row = document.createElement('article');
    row.className = 'location-row';
    row.innerHTML = `<div class="bar" style="background:${l.color}"></div>
      <div class="icon">${l.icon}</div>
      <div class="name"><strong>${l.name}</strong><span>${l.sub}</span></div>
      <div class="count" style="color:${l.color}">${l.count}</div>
      <a class="open" href="counter.html?location=${idx}" aria-label="open ${l.name}">›</a>`;
    list.appendChild(row);
  });

  total.textContent = state.locations.reduce((sum, l) => sum + l.count, 0);
  if (updated) updated.textContent = state.updatedAt;
}

function attachServiceControls() {
  const label = document.getElementById('serviceLabel');
  const prev = document.getElementById('prevService');
  const next = document.getElementById('nextService');
  if (!label || !prev || !next) return;

  const draw = () => {
    label.textContent = services[state.serviceIndex % services.length];
    persist();
  };

  prev.onclick = () => {
    state.serviceIndex = (state.serviceIndex + services.length - 1) % services.length;
    draw();
  };
  next.onclick = () => {
    state.serviceIndex = (state.serviceIndex + 1) % services.length;
    draw();
  };
  draw();
}

function attachReset() {
  const btn = document.getElementById('resetAll');
  if (!btn) return;
  btn.onclick = () => {
    state.locations.forEach((l) => (l.count = 0));
    state.updatedAt = new Date().toLocaleString();
    persist();
    refreshDashboard();
  };
}

function attachAddLocation() {
  const btn = document.getElementById('addLocation');
  if (!btn) return;
  btn.onclick = () => {
    const name = prompt('Location name');
    if (!name) return;
    state.locations.push({ name: name.toUpperCase(), sub: 'New Area', count: 0, color: '#7b7a65', icon: '＋' });
    state.updatedAt = new Date().toLocaleString();
    persist();
    refreshDashboard();
  };
}

function attachCounter() {
  const target = document.getElementById('tapTarget');
  const out = document.getElementById('counterValue');
  const lastTap = document.getElementById('lastTap');
  const recent = document.getElementById('recent');
  if (!target || !out) return;

  const params = new URLSearchParams(location.search);
  const idx = Number(params.get('location') || 0);
  const locationEntry = state.locations[idx] || state.locations[0];

  const title = document.querySelector('.counter-screen h2');
  const subtitle = document.querySelector('.counter-screen p');
  if (title) title.textContent = locationEntry.name;
  if (subtitle) subtitle.textContent = locationEntry.sub;

  out.textContent = String(locationEntry.count);
  if (recent) recent.textContent = state.recent.join(', ');

  let pressTimer;
  let longPressTriggered = false;
  const enterManual = () => {
    longPressTriggered = true;
    const manual = prompt('Enter count', String(locationEntry.count));
    if (manual === null) return;
    const value = Number.parseInt(manual, 10);
    if (Number.isNaN(value) || value < 0) return;
    locationEntry.count = value;
    out.textContent = String(value);
    state.recent.unshift(value);
    state.recent = state.recent.slice(0, 5);
    state.updatedAt = new Date().toLocaleString();
    persist();
  };

  const bump = () => {
    locationEntry.count += 1;
    out.textContent = String(locationEntry.count);
    state.recent.unshift(locationEntry.count);
    state.recent = state.recent.slice(0, 5);
    if (lastTap) lastTap.textContent = new Date().toLocaleTimeString();
    if (recent) recent.textContent = state.recent.join(', ');
    state.updatedAt = new Date().toLocaleString();
    persist();
  };

  const startPress = () => {
    longPressTriggered = false;
    clearTimeout(pressTimer);
    pressTimer = setTimeout(enterManual, 3000);
  };

  const cancelPress = () => clearTimeout(pressTimer);

  const commitTap = () => {
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }
    bump();
  };

  target.addEventListener('pointerdown', startPress);
  target.addEventListener('pointerup', () => {
    cancelPress();
    commitTap();
  });
  target.addEventListener('pointercancel', cancelPress);
  target.addEventListener('pointerleave', cancelPress);
}

refreshDashboard();
attachServiceControls();
attachReset();
attachAddLocation();
attachCounter();
