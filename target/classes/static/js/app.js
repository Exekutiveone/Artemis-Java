function App() {
  const { useEffect, useState } = React;
  const [message, setMessage] = useState('Daten werden geladen...');

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Fehler beim Laden der Daten'));
  }, []);

  return React.createElement(
    'div',
    { className: 'container py-5' },
    React.createElement('h1', null, 'Artemis React Übersicht'),
    React.createElement('p', null, message),
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
