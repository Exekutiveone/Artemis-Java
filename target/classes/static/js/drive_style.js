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
    .then(d => { driveStyleData = d; });
}

// Initial load no-op; charts page will explicitly call loadDriveStyle when mission changes.
