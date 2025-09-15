function AssetCard({ asset }) {
  return (
    React.createElement('a', { href:'/assets/' + asset.id, className:'card bg-dark border-secondary h-100 asset-card card-hover' },
      asset.imageUrl ?
        React.createElement('img', { src: asset.imageUrl, className: 'card-img-top', alt: asset.name }) :
        React.createElement('div', { className:'bg-secondary d-flex align-items-center justify-content-center', style:{height:'140px'} },
          React.createElement('span', { className:'text-dark' }, 'Kein Bild')
        ),
      React.createElement('div', { className:'card-body' },
        React.createElement('h5', { className:'card-title mb-1' }, asset.name),
        React.createElement('div', { className:'small text-muted' }, asset.category || 'Allgemein'),
        (asset.models && asset.models.length) ? React.createElement('div', { className:'mt-2' },
          asset.models.map((m, idx) => React.createElement('span', { key:idx, className:'badge text-bg-primary me-1' }, m.name))
        ) : null,
        asset.tags && asset.tags.length > 0 ?
          React.createElement('div', { className:'mt-2' },
            asset.tags.map((t, idx) => React.createElement('span', { key:idx, className:'badge text-bg-secondary me-1' }, t))
          ) : null
      )
    )
  );
}

function Grid() {
  const { useEffect, useState } = React;
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelsMap, setModelsMap] = useState({});

  const fetchAssets = () => {
    setLoading(true);
    fetch('/api/assets')
      .then(r => r.json())
      .then(setAssets)
      .catch(() => setError('Fehler beim Laden'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
    fetch('/api/asset-models/by-asset')
      .then(r => r.json())
      .then(setModelsMap)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const form = document.getElementById('assetForm');
    if (!form) return;
    const submit = (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: fd.get('name'),
        category: fd.get('category') || '',
        status: fd.get('status') || '',
        imageUrl: fd.get('imageUrl') || '',
        description: fd.get('description') || '',
        tags: (fd.get('tags') || '').toString().split(',').map(s => s.trim()).filter(Boolean)
      };
      fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json())
        .then(() => { form.reset(); fetchAssets(); })
        .catch(() => alert('Fehler beim Anlegen'));
    };
    form.addEventListener('submit', submit);
    return () => form.removeEventListener('submit', submit);
  }, []);

  if (loading) return React.createElement('div', null, 'Lade Assets...');
  if (error) return React.createElement('div', { className:'text-danger' }, error);

  return React.createElement('div', { className:'row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3' },
    assets.map(a => (
      React.createElement('div', { className:'col', key:a.id },
        React.createElement(AssetCard, { asset: Object.assign({}, a, { models: (modelsMap[a.id] || []) }) })
      )
    )),
    assets.length === 0 ? React.createElement('div', { className:'text-muted' }, 'Noch keine Assets vorhanden.') : null
  );
}

function mountAssets() {
  try {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      throw new Error('React/ReactDOM not loaded');
    }
    var el = document.getElementById('root');
    if (!el) return false; // wait for DOM
    ReactDOM.createRoot(el).render(React.createElement(Grid));
    return true;
  } catch (e) {
    console.error('Assets screen error:', e);
    var root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div class="container py-4"><div class="alert alert-danger">Fehler in Assets-Ansicht: '+ (e && e.message ? e.message : 'Unbekannt') +'</div></div>';
    }
    return true;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAssets);
} else {
  if (!mountAssets()) {
    document.addEventListener('DOMContentLoaded', mountAssets);
  }
}
