'use strict';

// Initialize a Leaflet map with the GPS data and display the route.
document.addEventListener('DOMContentLoaded', () => {
  if (!window.sFull) return;

  const lats = sFull.gps_lat || [];
  const lons = sFull.gps_lon || [];
  if (!lats.length || !lons.length) return;

  const coords = lats.map((lat, i) => [lat, lons[i]]);

  const map = L.map('mapCanvas');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

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
