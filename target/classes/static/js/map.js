'use strict';

// Single Leaflet map instance for charts/logs pages
let routeMap = null;
let routePolyline = null;

function computeBounds(coords) {
  if (!coords.length) return null;
  const lats = coords.map(c => c[0]);
  const lons = coords.map(c => c[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const buffer = 0.0001;
  const southWest = [minLat === maxLat ? minLat - buffer : minLat,
                     minLon === maxLon ? minLon - buffer : minLon];
  const northEast = [maxLat === minLat ? maxLat + buffer : maxLat,
                     maxLon === minLon ? maxLon + buffer : maxLon];
  return [southWest, northEast];
}

// Update or initialize the map. Optional range = [start, end)
window.renderRouteMap = function(range) {
  try {
    const container = document.getElementById('mapCanvas');
    if (!container || typeof L === 'undefined') return;

    if (!routeMap) {
      routeMap = L.map(container);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(routeMap);
    }

    const SF = (typeof window !== 'undefined' && window.sFull) ? window.sFull : {};
    const latsFull = Array.isArray(SF.gps_lat) ? SF.gps_lat : [];
    const lonsFull = Array.isArray(SF.gps_lon) ? SF.gps_lon : [];

    let start = 0, end = latsFull.length;
    if (Array.isArray(range) && range.length === 2) {
      start = Math.max(0, parseInt(range[0] || 0, 10));
      end = Math.min(latsFull.length, parseInt(range[1] || latsFull.length, 10));
      if (!(end > start)) { start = 0; end = latsFull.length; }
    }

    const coords = [];
    for (let i = start; i < end; i++) {
      const lat = latsFull[i];
      const lon = lonsFull[i];
      if (Number.isFinite(lat) && Number.isFinite(lon)) coords.push([lat, lon]);
    }

    if (routePolyline) { routeMap.removeLayer(routePolyline); routePolyline = null; }
    if (!coords.length) { routeMap.setView([0, 0], 2); return; }
    routePolyline = L.polyline(coords, { color: 'orange' }).addTo(routeMap);
    const b = computeBounds(coords);
    if (b) routeMap.fitBounds(b);
  } catch (e) {
    console.warn('renderRouteMap failed:', e && e.message ? e.message : e);
  }
};

// Initial render on DOM ready (full range) if container exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mapCanvas')) {
    window.renderRouteMap();
  }
});

