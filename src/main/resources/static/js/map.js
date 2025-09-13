'use strict';

// Initialize a Leaflet map with the GPS data and display the route.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.sFull) return;

  const lats = sFull.gps_lat || [];
  const lons = sFull.gps_lon || [];

  const map = L.map('mapCanvas');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  if (!lats.length || !lons.length) {
    map.setView([0, 0], 2);
    const msg = L.control({ position: 'topright' });
    msg.onAdd = function () {
      const div = L.DomUtil.create('div', 'gps-warning');
      div.innerHTML = '<span style="background:#fff;color:#000;padding:4px 8px;border-radius:4px;">Keine GPS-Daten verfügbar</span>';
      return div;
    };
    msg.addTo(map);
    return;
  }

  const coords = lats.map((lat, i) => [lat, lons[i]]);

  const polyline = L.polyline(coords, { color: 'orange' }).addTo(map);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const buffer = 0.0001;
  const southWest = [minLat === maxLat ? minLat - buffer : minLat,
                     minLon === maxLon ? minLon - buffer : minLon];
  const northEast = [maxLat === minLat ? maxLat + buffer : maxLat,
                     maxLon === minLon ? maxLon + buffer : maxLon];

  map.fitBounds([southWest, northEast]);
});
