'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!window.sFull || !window.L) return;

  const latlngs = sFull.gps_lat.map((lat, i) => [lat, sFull.gps_lon[i]]);
  const avgLat = latlngs.reduce((sum, ll) => sum + ll[0], 0) / latlngs.length;
  const avgLon = latlngs.reduce((sum, ll) => sum + ll[1], 0) / latlngs.length;

  const map = L.map('map').setView([avgLat, avgLon], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.polyline(latlngs, { color: 'red' }).addTo(map);
});
