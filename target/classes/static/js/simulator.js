'use strict';

// Helpers
function toRad(d){return d*Math.PI/180;} function toDeg(r){return r*180/Math.PI;}
function bearing(a,b){const φ1=toRad(a.lat), φ2=toRad(b.lat), λ1=toRad(a.lng), λ2=toRad(b.lng); const y=Math.sin(λ2-λ1)*Math.cos(φ2); const x=Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1); return (toDeg(Math.atan2(y,x))+360)%360;}
function distanceMeters(a,b){return L.latLng(a.lat,a.lng).distanceTo([b.lat,b.lng]);}

let map, drawControl, featureGroup, currentLine = null;

async function loadMissionAssetSelects(){
  const mSel = document.getElementById('simMission');
  const aSel = document.getElementById('simAsset');
  const missions = await fetch('/api/missions').then(r=>r.json()).catch(()=>[]);
  const assets = await fetch('/api/assets').then(r=>r.json()).catch(()=>[]);
  mSel.innerHTML = missions.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
  aSel.innerHTML = assets.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
  // Preselect from query params if present
  const params = new URLSearchParams(location.search);
  const mid = params.get('missionId');
  const aid = params.get('assetId');
  if (mid) mSel.value = mid;
  if (aid) aSel.value = aid;
}

function initMap(){
  map = L.map('simMap');
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap contributors'}).addTo(map);
  map.setView([48.137, 11.575], 12);
  featureGroup = new L.FeatureGroup();
  map.addLayer(featureGroup);
  drawControl = new L.Control.Draw({
    draw:{ polygon:false, rectangle:false, circle:false, marker:false, circlemarker:false, polyline:true },
    edit:{ featureGroup: featureGroup }
  });
  map.addControl(drawControl);
  map.on(L.Draw.Event.CREATED, function (e) {
    featureGroup.clearLayers();
    featureGroup.addLayer(e.layer);
    currentLine = e.layer.getLatLngs().map(ll=>({lat:ll.lat,lng:ll.lng}));
  });
  map.on(L.Draw.Event.EDITED, function (e) {
    const layers=e.layers; layers.eachLayer(function(layer){ currentLine = layer.getLatLngs().map(ll=>({lat:ll.lat,lng:ll.lng})); });
  });
}

function resamplePath(latlngs, stepMeters){
  if (!Array.isArray(latlngs) || latlngs.length<2) return [];
  const pts=[]; let prev=latlngs[0]; let accum=0; pts.push(prev);
  for(let i=1;i<latlngs.length;i++){
    const cur=latlngs[i]; let segDist=distanceMeters(prev,cur);
    let rest=segDist; let dir={lat:(cur.lat-prev.lat)/segDist, lng:(cur.lng-prev.lng)/segDist};
    while(accum+rest>=stepMeters){
      const t=(stepMeters-accum)/segDist;
      const p={lat:prev.lat+(cur.lat-prev.lat)*t, lng:prev.lng+(cur.lng-prev.lng)*t};
      pts.push(p); prev=p; rest=distanceMeters(prev,cur); segDist=rest; dir={lat:(cur.lat-prev.lat)/segDist, lng:(cur.lng-prev.lng)/segDist}; accum=0;
    }
    accum+=rest; prev=cur;
  }
  return pts;
}

function synthesizeCsv(latlngs, dt, baseSpeed, noise, weather){
  if (!Array.isArray(latlngs) || latlngs.length<2) return '';
  const stepMeters = Math.max(0.1, baseSpeed*dt);
  const pts = resamplePath(latlngs, stepMeters);
  const header = ['rpm','steering_deg','distance_m','accel_m_s2','lateral_acc_m_s2','battery_pct','distance_front_m','event_code','manoeuvre','terrain_type','weather_condition','gps_lat','gps_lon','timestamp'];
  const rows = [];
  const startTime = Date.now();
  let battery = 100; let prevSpeed = baseSpeed; let distance = 0; let prevBear = bearing(pts[0], pts[1]);
  for(let i=0;i<pts.length;i++){
    const p = pts[i];
    const nxt = i<pts.length-1?pts[i+1]:pts[i];
    const seg = distanceMeters(p, nxt);
    let speed = baseSpeed * (1 + (Math.random()*2-1)*noise);
    // slow down on curves
    const br = (i<pts.length-1? bearing(p,nxt) : prevBear);
    const dHead = ((br - prevBear + 540)%360) - 180; // -180..180
    const turnFactor = Math.min(1, Math.abs(dHead)/45);
    speed *= (1 - 0.3*turnFactor);
    const accel = (speed - prevSpeed)/dt;
    const curvature = Math.abs(dHead) / Math.max(seg, 1e-3);
    const lateralAcc = speed*speed*curvature; // approx
    distance += seg;
    battery = Math.max(0, battery - (speed*dt*0.005 + Math.abs(accel)*0.001));
    const rpm = Math.round(speed*100); // consistent with chart speed=rpm/100
    const distFront = 10 + Math.max(0, 40*(1-Math.random()*Math.pow(turnFactor,0.5)));
    const event_code = accel<-0.5? 'bremsung' : (accel>0.5? 'beschleunigung' : 'fahrt');
    let manoeuvre = '-'; if (dHead>10) manoeuvre='left_turn'; else if (dHead<-10) manoeuvre='right_turn';
    const terrain = 'road';
    const ts = new Date(startTime + Math.round(i*dt*1000)).toISOString();
    rows.push([rpm, (br-prevBear).toFixed(2), distance.toFixed(2), accel.toFixed(3), lateralAcc.toFixed(3), battery.toFixed(1), distFront.toFixed(2), event_code, manoeuvre, terrain, weather, p.lat.toFixed(6), p.lng.toFixed(6), ts]);
    prevSpeed = speed; prevBear = br;
  }
  const csv = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
  return csv;
}

async function uploadCsv(assetId, missionId, csv){
  const fd = new FormData();
  fd.append('missionId', missionId);
  fd.append('file', new Blob([csv], {type:'text/csv'}), 'simulated.csv');
  const r = await fetch(`/api/assets/${assetId}/logs/upload`, { method:'POST', body: fd });
  if (!r.ok) throw new Error(await r.text().catch(()=>r.statusText));
  return r.json();
}

function bindUi(){
  const status = document.getElementById('simStatus');
  const btnGen = document.getElementById('btnGenerate');
  const btnUp = document.getElementById('btnUpload');
  const btnDl = document.getElementById('btnDownload');
  const prev = document.getElementById('csvPreview');
  btnGen.addEventListener('click', () => {
    status.textContent='';
    if (!currentLine || currentLine.length<2) { status.textContent='Bitte zuerst eine Route zeichnen.'; return; }
    const dt = parseFloat(document.getElementById('simDt').value||'0.2');
    const speed = parseFloat(document.getElementById('simSpeed').value||'8');
    const noise = parseFloat(document.getElementById('simNoise').value||'0.05');
    const weather = document.getElementById('simWeather').value||'clear';
    const csv = synthesizeCsv(currentLine, dt, speed, noise, weather);
    if (!csv) { status.textContent='Generierung fehlgeschlagen.'; return; }
    prev.value = csv;
    status.textContent = `CSV erzeugt (${csv.split('\n').length-1} Zeilen).`;
  });
  btnUp.addEventListener('click', async () => {
    try {
      status.textContent='';
      const missionId = document.getElementById('simMission').value;
      const assetId = document.getElementById('simAsset').value;
      if (!missionId || !assetId) { status.textContent='Bitte Mission und Asset wählen.'; return; }
      const csv = prev.value.trim();
      if (!csv) { status.textContent='Keine CSV vorhanden. Erst generieren.'; return; }
      const resp = await uploadCsv(assetId, missionId, csv);
      status.textContent = `Upload OK – importiert: ${resp.inserted ?? '?'} Zeilen.`;
    } catch (e) {
      status.textContent = `Upload fehlgeschlagen: ${e && e.message ? e.message : e}`;
    }
  });
  btnDl.addEventListener('click', () => {
    const csv = prev.value.trim();
    if (!csv) { status.textContent='Keine CSV vorhanden. Erst generieren.'; return; }
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='simulated.csv'; a.click();
    URL.revokeObjectURL(url);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  bindUi();
  loadMissionAssetSelects();
});
