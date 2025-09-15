'use strict';

let driveStyleData = [];

function loadDriveStyle(missionId, assetId) {
  let url = '/api/drive_style';
  const params = [];
  if (missionId) params.push('missionId=' + encodeURIComponent(missionId));
  if (assetId) params.push('assetId=' + encodeURIComponent(assetId));
  if (params.length) url += '?' + params.join('&');
  return fetch(url)
    .then(r => r.json())
    .then(d => {
      // Erwartet Liste von Objekten mit {index, style, score}
      // Für die Diagramme verwenden wir den numerischen Score [0..1]
      if (Array.isArray(d)) {
        driveStyleData = d.map(x => (x && typeof x.score === 'number') ? x.score : 0);
      } else {
        driveStyleData = [];
      }
    });
}

// Initial load no-op; charts page will explicitly call loadDriveStyle when mission changes.
