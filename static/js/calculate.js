'use strict';

function computeStats(data) {
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
    : sorted[mid].toFixed(2);
  const rangeVal = (sorted[sorted.length - 1] - sorted[0]).toFixed(2);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = (q3 - q1).toFixed(2);
  return { avg, median, rangeVal, iqr };
}
