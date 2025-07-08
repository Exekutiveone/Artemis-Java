'use strict';

function computeStats(data) {
  const n = data.length;
  const avgNum = data.reduce((a, b) => a + b, 0) / n;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2)
    : sorted[mid].toFixed(2);
  const rangeVal = (sorted[sorted.length - 1] - sorted[0]).toFixed(2);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = (q3 - q1).toFixed(2);

  const varianceNum = data.reduce((sum, val) => sum + Math.pow(val - avgNum, 2), 0) / n;
  const stdNum = Math.sqrt(varianceNum);
  const varCoeffNum = avgNum !== 0 ? stdNum / avgNum : 0;

  return {
    avg: avgNum.toFixed(2),
    median,
    rangeVal,
    iqr,
    variance: varianceNum.toFixed(2),
    stdDev: stdNum.toFixed(2),
    varCoeff: varCoeffNum.toFixed(2)
  };
}
