'use strict';

let driveStyleData = [];

function loadDriveStyle() {
  return fetch('/api/drive_style')
    .then(r => r.json())
    .then(d => { driveStyleData = d; });
}

document.addEventListener('DOMContentLoaded', () => {
  loadDriveStyle().then(() => {
    if (typeof applyRange === 'function') {
      applyRange();
    }
  });
});
