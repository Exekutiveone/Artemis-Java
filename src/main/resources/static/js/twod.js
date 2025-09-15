const h = React.createElement;

function AssignView() {
  const { useEffect, useState } = React;
  const [models, setModels] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelAssets, setModelAssets] = useState([]);
  const [error, setError] = useState(null);

  const loadModels = () => fetch('/api/asset-models').then(r=>r.json()).then(setModels);
  const loadAssets = () => fetch('/api/assets').then(r=>r.json()).then(setAssets);
  const loadModelAssets = (id) => fetch(`/api/asset-models/${id}/assets`).then(r=>r.json()).then(setModelAssets);

  useEffect(() => { loadModels(); loadAssets(); }, []);

  useEffect(() => {
    if (selectedModel) loadModelAssets(selectedModel.id);
  }, [selectedModel]);

  const isAssigned = (assetId) => modelAssets.some(a => a.id === assetId);

  const toggleAssign = (assetId, checked) => {
    if (!selectedModel) return;
    const url = `/api/asset-models/${selectedModel.id}/assign` + (checked ? '' : `/${assetId}`);
    const opts = checked
      ? { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ assetId }) }
      : { method: 'DELETE' };
    fetch(url, opts)
      .then(res => { if (!res.ok) throw new Error('Fehler beim Speichern'); })
      .then(() => loadModelAssets(selectedModel.id))
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    const form = document.getElementById('modelForm');
    if (!form) return;
    const submit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = { name: fd.get('name'), description: fd.get('description') };
      fetch('/api/asset-models', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(r=>r.json())
        .then((m)=>{ form.reset(); setSelectedModel(m); loadModels(); })
        .catch(()=> setError('Fehler beim Erstellen'));
    };
    form.addEventListener('submit', submit);
    return () => form.removeEventListener('submit', submit);
  }, []);

  useEffect(() => {
    const list = document.getElementById('modelList');
    if (!list) return;
    list.innerHTML = '';
    list.className = 'row row-cols-1 row-cols-sm-2 g-2';
    models.forEach(m => {
      const col = document.createElement('div');
      col.className = 'col';
      const card = document.createElement('div');
      card.className = 'card bg-dark border-secondary h-100 card-hover';
      const body = document.createElement('div');
      body.className = 'card-body';

      const title = document.createElement('div');
      title.className = 'h5 mb-1';
      title.textContent = m.name;
      const desc = document.createElement('div');
      desc.className = 'text-muted small mb-2';
      desc.textContent = m.description || '';

      const actions = document.createElement('div');
      actions.className = 'd-flex gap-2';
      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn btn-sm btn-outline-primary';
      selectBtn.textContent = 'Auswählen';
      selectBtn.onclick = () => setSelectedModel(m);
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-outline-danger';
      delBtn.textContent = 'Löschen';
      delBtn.onclick = async () => {
        if (!confirm('Modell wirklich löschen?')) return;
        await fetch(`/api/asset-models/${m.id}`, { method: 'DELETE' });
        if (selectedModel && selectedModel.id === m.id) setSelectedModel(null);
        loadModels();
        setModelAssets([]);
      };

      actions.appendChild(selectBtn);
      actions.appendChild(delBtn);
      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(actions);
      card.appendChild(body);
      col.appendChild(card);
      list.appendChild(col);
    });
  }, [models, selectedModel]);

  if (!selectedModel) {
    return h('div', { className:'text-muted' }, 'WÃ¤hle links ein Modell oder erstelle ein neues.');
  }

  return h('div', { className:'card bg-dark border-secondary' },
    h('div', { className:'card-body' },
      h('h5', { className:'card-title' }, `Zuordnung fÃ¼r: ${selectedModel.name}`),
      error ? h('div', { className:'alert alert-danger' }, error) : null,
      h('div', { className:'row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3' },
        assets.map(a => h('div', { key:a.id, className:'col' },
          h('div', { className:'form-check bg-body-tertiary rounded p-2' },
            h('input', {
              className:'form-check-input', type:'checkbox', id:`chk-${a.id}`,
              checked: isAssigned(a.id),
              onChange: (e)=> toggleAssign(a.id, e.target.checked)
            }),
            h('label', { className:'form-check-label ms-2', htmlFor:`chk-${a.id}` }, a.name)
          )
        ))
      )
    )
  );
}

function mountTwod() {
  try {
    const root = document.getElementById('assignRoot');
    if (!root) return false;
    ReactDOM.createRoot(root).render(React.createElement(AssignView));
    return true;
  } catch (e) {
    console.error('TwoD error', e);
    return true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountTwod);
} else {
  if (!mountTwod()) document.addEventListener('DOMContentLoaded', mountTwod);
}


