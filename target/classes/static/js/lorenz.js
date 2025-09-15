'use strict';

const lorenzRefs = {};
let lorenzRef;

function computeLorenz(data) {
  const arr = Array.isArray(data) ? data : [];
  const sorted = [...arr].map(v => Math.abs(v)).sort((a, b) => a - b);
  const n = sorted.length;
  if (!n) { return { xs: [0, 1], ys: [0, 0], gini: '0.00' }; }
  const cum = [0];
  for (let i = 0; i < n; i++) {
    cum.push(cum[i] + sorted[i]);
  }
  const total = cum[n];
  if (!total) { return { xs: [0, 1], ys: [0, 0], gini: '0.00' }; }
  const xs = [0];
  const ys = [0];
  for (let i = 1; i <= n; i++) {
    xs.push(i / n);
    ys.push(cum[i] / total);
  }
  let area = 0;
  for (let i = 1; i <= n; i++) {
    area += (ys[i] + ys[i - 1]) * (xs[i] - xs[i - 1]);
  }
  const gini = (1 - area).toFixed(2);
  return { xs, ys, gini };
}

function buildMetricLorenzChart(id, label, data, range) {
  const ctx = document.getElementById(`lorenz_${id}`).getContext('2d');
  if (lorenzRefs[id]) lorenzRefs[id].destroy();
  const slice = data.slice(range[0], range[1]);
  const { xs, ys, gini } = computeLorenz(slice);
  const giniEl = document.getElementById(`gini_${id}`);
  if (giniEl) giniEl.textContent = gini;
  lorenzRefs[id] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{
        label: `Lorenzkurve (${label})`,
        data: ys,
        borderColor: '#e67e22',
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Kumulierter Anteil Fahrzeuge', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          title: { display: true, text: 'Kumulierter Anteil Geschwindigkeit', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#f8f9fa' } }
      }
    }
  });
}

function buildOverviewLorenzChart(range) {
  const ctx = document.getElementById('lorenz_chart').getContext('2d');
  if (lorenzRef) lorenzRef.destroy();
  const slice = (sFull && Array.isArray(sFull.speed)) ? sFull.speed.slice(range[0], range[1]) : [];
  const { xs, ys, gini } = computeLorenz(slice);
  const gEl = document.getElementById('gini_coef'); if (gEl) gEl.textContent = gini;
  lorenzRef = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xs,
      datasets: [{
        label: 'Lorenzkurve (Geschwindigkeit)',
        data: ys,
        borderColor: '#e67e22',
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Kumulierter Anteil Fahrzeuge', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          title: { display: true, text: 'Kumulierter Anteil Geschwindigkeit', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#f8f9fa' } }
      }
    }
  });
}

function buildAllLorenz(range) {
  const chartData = (typeof getChartData === 'function') ? getChartData() : [];
  chartData.forEach(([id, label, data]) => {
    const canvas = document.getElementById(`lorenz_${id}`);
    if (!canvas) return;
    buildMetricLorenzChart(id, label, data, range);
  });
}
