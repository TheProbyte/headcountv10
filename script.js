const services = ['9:00 AM SERVICE','11:30 AM SERVICE','6:00 PM SERVICE'];
let serviceIndex = 1;

const locations = [
  {name:'WORSHIP CENTER',sub:'Main Auditorium',count:312,color:'#b45b37',icon:'✝'},
  {name:'LOBBY',sub:'Main Entrance',count:64,color:'#798166',icon:'🛋'},
  {name:'PATIO',sub:'Outdoor Area',count:38,color:'#c89a25',icon:'☂'},
  {name:'STUMIN',sub:'Student Ministry',count:42,color:'#6f9a92',icon:'S'},
  {name:'FAMILY ROOMS',sub:'Parents & Infants',count:19,color:'#b5673f',icon:'👥'},
  {name:'PRAYER ROOM',sub:'Prayer & Reflection',count:7,color:'#757e63',icon:'🙏'},
  {name:'ORIGIN',sub:'Young Adults',count:5,color:'#be9324',icon:'◉'},
];

function refreshDashboard(){
  const list = document.getElementById('locationList');
  const total = document.getElementById('totalCount');
  if(!list || !total) return;
  list.innerHTML = '';
  locations.forEach((l)=>{
    const row = document.createElement('article');
    row.className = 'location-row';
    row.innerHTML = `<div class="bar" style="background:${l.color}"></div>
      <div class="icon">${l.icon}</div>
      <div class="name"><strong>${l.name}</strong><span>${l.sub}</span></div>
      <div class="count" style="color:${l.color}">${l.count}</div>
      <a class="open" href="counter.html">×</a>`;
    list.appendChild(row);
  });
  total.textContent = locations.reduce((s,l)=>s+l.count,0);
}

function attachServiceControls(){
  const label = document.getElementById('serviceLabel');
  const prev = document.getElementById('prevService');
  const next = document.getElementById('nextService');
  if(!label || !prev || !next) return;
  const draw = ()=> label.textContent = services[serviceIndex];
  prev.onclick = ()=>{serviceIndex=(serviceIndex+services.length-1)%services.length;draw();};
  next.onclick = ()=>{serviceIndex=(serviceIndex+1)%services.length;draw();};
  draw();
}

function attachReset(){
  const btn = document.getElementById('resetAll');
  if(!btn) return;
  btn.onclick = ()=>{
    locations.forEach(l=>l.count=0);
    refreshDashboard();
    const updated = document.getElementById('updatedAt');
    if(updated) updated.textContent = new Date().toLocaleString();
  };
}

function attachCounter(){
  const target = document.getElementById('tapTarget');
  const out = document.getElementById('counterValue');
  const lastTap = document.getElementById('lastTap');
  const recent = document.getElementById('recent');
  if(!target || !out) return;
  let n = Number(out.textContent);
  const history = [312,310,307,305,304];
  target.addEventListener('click', ()=>{
    n += 1;
    out.textContent = String(n);
    history.unshift(n);
    history.splice(5);
    if(lastTap) lastTap.textContent = new Date().toLocaleTimeString();
    if(recent) recent.textContent = history.join(', ');
  });
}

refreshDashboard();
attachServiceControls();
attachReset();
attachCounter();
