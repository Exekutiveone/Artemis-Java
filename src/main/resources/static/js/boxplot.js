'use strict';

const boxplotRefs = {};

function buildBoxplot(range) {
  const chartData = (typeof getChartData === 'function') ? getChartData() : [];
  chartData.forEach(([id, label, data]) => {
    const canvas = document.getElementById(`boxplot_${id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (boxplotRefs[id]) boxplotRefs[id].destroy();

    const sliced = data.slice(range[0], range[1]);

    boxplotRefs[id] = new Chart(ctx, {
      type: 'boxplot',
      data: {
        labels: [label],
        datasets: [{
          label: 'Verteilung',
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1,
          outlierColor: '#e74c3c',
          padding: 5,
          itemRadius: 0,
          data: [sliced]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
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
  });
}
