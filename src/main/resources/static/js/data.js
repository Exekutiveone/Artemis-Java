async function loadList(url, elementId, formatter) {
  const res = await fetch(url);
  const data = await res.json();
  const list = document.getElementById(elementId);
  data.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = formatter(item);
    list.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadList('/api/assets', 'assetList', a => `${a.id}: ${a.name}`);
  loadList('/api/routes', 'routeList', r => `${r.id}: ${r.name}`);
  loadList('/api/missions', 'missionList', m => `${m.id}: ${m.name} (${m.status})`);
});
