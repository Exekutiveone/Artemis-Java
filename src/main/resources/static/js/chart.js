'use strict';

// Dynamic data provider
function getEventNumeric() {
  if (!window.sFull || !Array.isArray(sFull.event)) return [];
  return sFull.event.map(e => {
    if (e === 'bremsung') return -1;
    if (e === 'fahrt') return 0;
    if (e === 'beschleunigung') return 1;
    return null;
  });
}

function getChartData() {
  const S = window.sFull || {};
  const safe = arr => (Array.isArray(arr) ? arr : []);
  return [
    ['speed', 'Geschwindigkeit (m/s)', safe(S.speed)],
    ['rpm', 'RPM', safe(S.rpm)],
    ['steering', 'Lenkwinkel (°)', safe(S.steering)],
    ['distance', 'Distanz (m)', safe(S.distance)],
    ['accel', 'Beschleunigung (m/s²)', safe(S.accel)],
    ['lateral_acc', 'Querbeschleunigung (m/s²)', safe(S.lateral_acc)],
    ['battery', 'Batteriestand (%)', safe(S.battery)],
    ['distance_front', 'Distanz vorne (m)', safe(S.distance_front)],
    ['event_graph', 'Fahrereignis', getEventNumeric()]
  ];
}

const driveStyleColors = { Aggressiv: '#e74c3c', Defensiv: '#2ecc71', Normal: '#3498db' };
const chartRefs = {}; const histogramRefs = {}; const sequenceChartRefs = {}; const MA_WINDOW = 10;

function insertChartBoxes() {
  const container = document.getElementById('charts');
  container.innerHTML = '';
  for (const [id, label] of getChartData()) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';
    col.innerHTML = `
      <div class="card p-3">
        <div class="chart-container mb-2"><canvas id="${id}"></canvas></div>
        <div class="chart-container mb-2"><canvas id="hist_${id}"></canvas></div>
        <div class="chart-container mb-2"><canvas id="lorenz_${id}"></canvas></div>
        <div class="boxplot-container"><canvas id="boxplot_${id}"></canvas></div>
        <div class="stat-box mt-2">
          Mittelwert: <span id="mean_${id}">-</span> |
          Median: <span id="median_${id}">-</span> |
          Spannweite: <span id="range_${id}">-</span> |
          IQA: <span id="iqr_${id}">-</span> |
          Varianz: <span id="var_${id}">-</span> |
          Std-Abw.: <span id="std_${id}">-</span> |
          V-Koeff.: <span id="vcoeff_${id}">-</span><br>
          Gini: <span id="gini_${id}">-</span> |
          Trend: <span id="trend_${id}">-</span>
        </div>
      </div>`;
    container.appendChild(col);
  }

  const pie1 = document.createElement('div');
  pie1.className = 'col-12 col-md-6';
  pie1.innerHTML = `<div class="card p-3 chart-container"><canvas id="freq_chart"></canvas></div>`;
  container.appendChild(pie1);

  const pie2 = document.createElement('div');
  pie2.className = 'col-12 col-md-6';
  pie2.innerHTML = `<div class="card p-3 chart-container"><canvas id="manoeuvre_chart"></canvas></div>`;
  container.appendChild(pie2);

  const lorenz = document.createElement('div');
  lorenz.className = 'col-12';
  lorenz.innerHTML = `
    <div class="card p-3">
      <div class="chart-container"><canvas id="lorenz_chart"></canvas></div>
      <div class="stat-box mt-2">Gini-Koeffizient: <span id="gini_coef">-</span></div>
    </div>`;
  container.appendChild(lorenz);
}

function buildChart(id, label, data, range) {
  const ctx = document.getElementById(id).getContext('2d');
  if (chartRefs[id]) chartRefs[id].destroy();

  const sliced = data.slice(range[0], range[1]);
  const styles = (window.driveStyleData || []).slice(range[0], range[1]);
  const movingAvg = computeMovingAverage(sliced, MA_WINDOW);
  const trend = computeTrend(sliced);
  const stats = computeStats(sliced);

  document.getElementById(`mean_${id}`).textContent = stats.avg;
  document.getElementById(`median_${id}`).textContent = stats.median;
  document.getElementById(`range_${id}`).textContent = stats.rangeVal;
  document.getElementById(`iqr_${id}`).textContent = stats.iqr;
  document.getElementById(`var_${id}`).textContent = stats.variance;
  document.getElementById(`std_${id}`).textContent = stats.stdDev;
  document.getElementById(`vcoeff_${id}`).textContent = stats.varCoeff;
  document.getElementById(`trend_${id}`).textContent = (trend && trend.slope != null) ? trend.slope.toFixed(2) : '-';

  chartRefs[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: (window.labelsFull || []).slice(range[0], range[1]),
      datasets: [
        { label, data: sliced, borderColor: '#1abc9c', borderWidth: 2, pointRadius: 0, tension: 0.15, fill: false },
        { label: 'Gleitender Mittelwert', data: movingAvg, borderColor: '#f1c40f', borderWidth: 2, pointRadius: 0, tension: 0.15, fill: false },
        { label: 'Drive Style', data: styles, yAxisID: 'y1', borderColor: '#e67e22', borderWidth: 1, pointRadius: 0, tension: 0.15, fill: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#f8f9fa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        y: { ticks: { color: '#f8f9fa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        y1: { position: 'right', ticks: { color: '#f8f9fa' }, grid: { display: false } }
      },
      plugins: { legend: { labels: { color: '#f8f9fa' } } }
    }
  });
}

function buildHistogram(id, label, data, range) {
  const ctx = document.getElementById(`hist_${id}`).getContext('2d');
  if (histogramRefs[id]) histogramRefs[id].destroy();
  const slice = data.slice(range[0], range[1]);
  const hist = computeHistogram(slice, 20);
  histogramRefs[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels: hist.labels, datasets: [{ label: 'Häufigkeit', data: hist.counts, backgroundColor: '#9b59b6' }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#f8f9fa' }, grid: { color: 'rgba(255,255,255,0.1)' }, title: { display: true, text: label, color: '#f8f9fa' } },
        y: { ticks: { color: '#f8f9fa' }, grid: { color: 'rgba(255,255,255,0.1)' }, title: { display: true, text: 'Anzahl', color: '#f8f9fa' } }
      },
      plugins: { legend: { labels: { color: '#f8f9fa' } } }
    }
  });
}

function buildPieChart(id, dataMap) {
  const ctx = document.getElementById(id).getContext('2d');
  const labels = Object.keys(dataMap);
  const data = Object.values(dataMap);
  const colors = labels.map((_, i) => `hsl(${(i*47)%360} 70% 50%)`);
  if (chartRefs[id]) chartRefs[id].destroy();
  chartRefs[id] = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#1e1e1e', borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#f8f9fa' } } } }
  });
}

function buildSequenceChart(id, dataArray) {
  const ctx = document.getElementById(id).getContext('2d');
  const categories = Array.from(new Set(dataArray || []));
  const mapping = {}; categories.forEach((k,i)=>{ mapping[k]=i; });
  const numeric = (dataArray || []).map(v => mapping[v]);
  const labels = (window.labelsFull || []).map(String);
  if (sequenceChartRefs[id]) sequenceChartRefs[id].destroy();
  sequenceChartRefs[id] = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: id, data: numeric, stepped: true, borderColor: '#3498db', pointRadius: 0, fill: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks:{color:'#f8f9fa'}, grid:{color:'rgba(255,255,255,0.1)'} }, y: { ticks:{ callback:v=>categories[v], color:'#f8f9fa' }, grid:{ color:'rgba(255,255,255,0.1)' } } }, plugins:{ legend:{ labels:{ color:'#f8f9fa'} } } }
  });
}

function applyRange() {
  const start = parseInt(document.getElementById('startIdx').value);
  const end = parseInt(document.getElementById('endIdx').value);
  const range = [start, end];
  if (!window.sFull) { return; }

  insertChartBoxes();
  getChartData().forEach(([id, label, data]) => { buildChart(id, label, data, range); buildHistogram(id, label, data, range); });

  const tbody = document.querySelector('#eventTable tbody');
  tbody.innerHTML = '';
  const eventFreq = {}; const manoeuvreFreq = {};
  const ev = (sFull && Array.isArray(sFull.event)) ? sFull.event : [];
  for (let i = start; i < Math.min(end, ev.length); i++) {
    const e = ev[i]; const m = (sFull.manoeuvre||[])[i]; const t = (sFull.terrain_type||[])[i]; const w = (sFull.weather_condition||[])[i];
    const latV = (sFull.gps_lat||[])[i]; const lonV = (sFull.gps_lon||[])[i];
    const lat = (latV==null||isNaN(Number(latV))) ? '-' : Number(latV).toFixed(6);
    const lon = (lonV==null||isNaN(Number(lonV))) ? '-' : Number(lonV).toFixed(6);
    const weatherStyle = w === 'heavy_rain' ? " style=\"background-color:#660000;\" title=\"Heavy rain\"" : '';
    eventFreq[e] = (eventFreq[e] || 0) + 1; manoeuvreFreq[m] = (manoeuvreFreq[m] || 0) + 1;
    tbody.insertAdjacentHTML('beforeend', `<tr><td>${i}</td><td>${e}</td><td>${m}</td><td>${t}</td><td${weatherStyle}>${w}</td><td>${lat}</td><td>${lon}</td></tr>`);
  }
  buildPieChart('freq_chart', eventFreq); buildPieChart('manoeuvre_chart', manoeuvreFreq);

  if (typeof buildBoxplot === 'function') buildBoxplot(range);
  if (typeof buildAllLorenz === 'function') buildAllLorenz(range);
  if (typeof buildOverviewLorenzChart === 'function') buildOverviewLorenzChart(range);

  // Sequences
  buildSequenceChart('weatherSeqChart', sFull.weather_condition || []);
  buildSequenceChart('terrainSeqChart', sFull.terrain_type || []);
}
