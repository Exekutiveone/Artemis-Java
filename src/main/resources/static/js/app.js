import React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

function App() {
  return (
    <div className="container py-5">
      <h1>Artemis React Übersicht</h1>
      <ul className="list-group">
        <li className="list-group-item"><a href="/chart">Chart Ansicht</a></li>
        <li className="list-group-item"><a href="/terrain">Terrain/Wetter Daten</a></li>
        <li className="list-group-item"><a href="/zweidimensionale_analyse.html">Zweidimensionale Analyse</a></li>
        <li className="list-group-item"><a href="/analyse/drive_style.html">Drive Style Analyse</a></li>
        <li className="list-group-item"><a href="/trajectory/">Trajektorie Visualisierung</a></li>
      </ul>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
