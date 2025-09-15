function App() {
  const { useEffect, useState } = React;
  const [message, setMessage] = useState('Daten werden geladen...');
  const [missions, setMissions] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selectedMission, setSelectedMission] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Fehler beim Laden der Daten'));
    fetch('/api/missions').then(r=>r.json()).then(ms => {
      setMissions(ms || []);
      if (ms && ms.length === 1) setSelectedMission(ms[0].id);
    }).catch(()=>setMissions([]));
    fetch('/api/assets').then(r=>r.json()).then(as => setAssets(as || [])).catch(()=>setAssets([]));
  }, []);

  useEffect(() => {
    // Reset asset selection when mission changes
    setSelectedAsset('');
  }, [selectedMission]);

  const gotoChart = () => {
    if (selectedMission) {
      const params = new URLSearchParams({ missionId: selectedMission });
      if (selectedAsset) params.set('assetId', selectedAsset);
      location.href = '/chart?' + params.toString();
    } else {
      location.href = '/chart';
    }
  };

  const gotoLogs = () => {
    const params = new URLSearchParams();
    if (selectedMission) params.set('missionId', selectedMission);
    if (selectedAsset) params.set('assetId', selectedAsset);
    const qs = params.toString();
    location.href = '/logs' + (qs ? ('?' + qs) : '');
  };

  return React.createElement(
    'div',
    { className: 'container py-5' },
    React.createElement('h1', null, 'Artemis Übersicht'),
    React.createElement('p', null, message),
    React.createElement('div', { className:'card mb-4' },
      React.createElement('div', { className:'card-body' },
        React.createElement('h5', { className:'card-title' }, 'Schnellauswahl'),
        React.createElement('div', { className:'row g-3 align-items-end' },
          React.createElement('div', { className:'col-md-5' },
            React.createElement('label', { className:'form-label' }, 'Mission'),
            React.createElement('select', { className:'form-select', value:selectedMission, onChange:(e)=>setSelectedMission(e.target.value) },
              React.createElement('option', { value:'' }, '-- Mission wählen --'),
              missions.map(m => React.createElement('option', { key:m.id, value:m.id }, m.name))
            )
          ),
          React.createElement('div', { className:'col-md-5' },
            React.createElement('label', { className:'form-label' }, 'Asset (optional)'),
            React.createElement('select', { className:'form-select', value:selectedAsset, onChange:(e)=>setSelectedAsset(e.target.value) },
              React.createElement('option', { value:'' }, 'Alle'),
              assets.map(a => React.createElement('option', { key:a.id, value:a.id }, a.name))
            )
          ),
          React.createElement('div', { className:'col-md-2 d-grid gap-2' },
            React.createElement('button', { className:'btn btn-primary', onClick: gotoChart }, 'Chart anzeigen'),
            React.createElement('button', { className:'btn btn-outline-secondary', onClick: gotoLogs }, 'Logs anzeigen')
          )
        )
      )
    ),
    React.createElement(
      'ul',
      { className: 'list-group' },
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/chart' }, 'Chart Ansicht')
      ),
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/assets' }, 'Assets')
      ),
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/missions' }, 'Missionen')
      ),
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/zweidimensionale_analyse.html' }, 'Asset-Modelle')
      ),
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/trajectory/' }, 'Trajektorie Visualisierung')
      ),
      React.createElement(
        'li',
        { className: 'list-group-item' },
        React.createElement('a', { href: '/logs' }, 'Logs (Tabelle)')
      )
    )
  );
}

function mountApp() {
  try {
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      throw new Error('React/ReactDOM not loaded');
    }
    var rootEl = document.getElementById('root');
    if (!rootEl) {
      return false; // DOM not ready yet
    }
    ReactDOM.createRoot(rootEl).render(React.createElement(App));
    return true;
  } catch (e) {
    console.error('Startscreen error:', e);
    var root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div class="container py-5"><div class="alert alert-danger">Fehler beim Initialisieren: '+ (e && e.message ? e.message : 'Unbekannt') +'</div></div>';
    }
    return true; // prevent retry loop on hard error
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  if (!mountApp()) {
    document.addEventListener('DOMContentLoaded', mountApp);
  }
}

