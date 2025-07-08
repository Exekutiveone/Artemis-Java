'use strict';

const regressionPairsLabels = {
  "speed_m_s_vs_rpm": ["speed_m_s", "rpm"],
  "speed_m_s_vs_distance_m": ["speed_m_s", "distance_m"],
  "speed_m_s_vs_steering_deg": ["speed_m_s", "steering_deg"],
  "speed_m_s_vs_lateral_acc_m_s2": ["speed_m_s", "lateral_acc_m_s2"],
  "accel_m_s2_vs_rpm": ["accel_m_s2", "rpm"],
  "steering_deg_vs_lateral_acc_m_s2": ["steering_deg", "lateral_acc_m_s2"],
  "speed_m_s_vs_distance_front_m": ["speed_m_s", "distance_front_m"],
  "speed_m_s_vs_battery_pct": ["speed_m_s", "battery_pct"]
};

let regressionData = {};

function loadRegressionPairs() {
  return fetch('/api/regression_pairs')
    .then(r => r.json())
    .then(d => { regressionData = d; });
}

function makeRegressionCard(id) {
  const col = document.createElement('div');
  col.className = 'col-12 col-md-6';
  col.innerHTML = `<div class='card p-3'>\n<canvas id='reg_${id}'></canvas>\n<div class='stat-box mt-2' id='reg_stat_${id}'></div>\n</div>`;
  document.getElementById('regressionCharts').appendChild(col);
}

function buildRegressionCharts() {
  for (const key in regressionPairsLabels) {
    const obj = regressionData[key];
    if (!obj) continue;
    makeRegressionCard(key);
    const ctx = document.getElementById('reg_' + key).getContext('2d');
    const [xLab, yLab] = regressionPairsLabels[key];
    const pts = obj.x.map((v, i) => ({ x: v, y: obj.y[i] }));
    const minX = Math.min(...obj.x);
    const maxX = Math.max(...obj.x);
    const line = [
      { x: minX, y: obj.intercept + obj.slope * minX },
      { x: maxX, y: obj.intercept + obj.slope * maxX }
    ];
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          { label: `${yLab} zu ${xLab}`, data: pts, backgroundColor: '#1abc9c' },
          { label: 'Regression', data: line, type: 'line', fill: false, borderColor: '#e74c3c' }
        ]
      },
      options: {
        animation: false,
        responsive: true,
        plugins: { legend: { labels: { color: '#fff' } } },
        scales: {
          x: { title: { display: true, text: xLab, color: '#fff' }, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          y: { title: { display: true, text: yLab, color: '#fff' }, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
        }
      }
    });
    document.getElementById('reg_stat_' + key).textContent =
      `ŷ = ${obj.intercept.toFixed(2)} + ${obj.slope.toFixed(2)}·x | r=${obj.r.toFixed(2)} | R²=${obj.r2.toFixed(2)}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadRegressionPairs().then(buildRegressionCharts);
});

