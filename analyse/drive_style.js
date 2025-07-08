'use strict';

document.addEventListener('DOMContentLoaded', () => {
  fetch('drive_style_output.json')
    .then(r => r.json())
    .then(renderCharts)
    .catch(err => console.error('fetch failed', err));
});

function renderCharts(data) {
  const labels = data.time || data.timestamp || data.index || [];
  const values = data.style || data.value || data.values || [];

  const ctx1 = document.getElementById('timeline').getContext('2d');
  new Chart(ctx1, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Fahrstil',
        data: values,
        borderColor: '#1abc9c',
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        tension: 0.15
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Zeit', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          title: { display: true, text: 'Fahrstil', color: '#f8f9fa' },
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: { legend: { labels: { color: '#f8f9fa' } } }
    }
  });

  const freq = {};
  values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const ctx2 = document.getElementById('distribution').getContext('2d');
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(freq),
      datasets: [{
        label: 'Häufigkeit',
        data: Object.values(freq),
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      },
      plugins: { legend: { labels: { color: '#f8f9fa' } } }
    }
  });
}
