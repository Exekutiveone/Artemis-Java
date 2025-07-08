'use strict';

// Display a basic Leaflet map without any route data yet.
document.addEventListener('DOMContentLoaded', () => {
  const map = L.map('map');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  map.setView([0, 0], 2);
});
