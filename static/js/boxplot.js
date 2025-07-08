'use strict';

let boxplotRef = null;

function buildBoxplot(range) {
  const ctx = document.getElementById('boxplot_chart').getContext('2d');
  if (boxplotRef) boxplotRef.destroy();

  const slicedData = chartData.map(([id, label, data]) => {
    return {
      label: label,
      data: data.slice(range[0], range[1])
    };
  }).filter(d => d.data.length > 0);

  boxplotRef = new Chart(ctx, {
    type: 'boxplot',
    data: {
      labels: slicedData.map(d => d.label),
      datasets: [{
        label: 'Verteilung',
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
        borderWidth: 1,
        outlierColor: '#e74c3c',
        padding: 10,
        itemRadius: 0,
        data: slicedData.map(d => d.data)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f8f9fa' } }
      },
      scales: {
        x: {
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        y: {
          ticks: { color: '#f8f9fa' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        }
      }
    }
  });
}
