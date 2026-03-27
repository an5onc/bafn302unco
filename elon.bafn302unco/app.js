/* ============================================================
   BAFN 302 · Stock Project Spring 2026
   Shared data + Chart.js rendering
   ============================================================ */

const investments = {
  TSLA: {
    name: 'Tesla', symbol: 'TSLA', type: 'Individual Stock', colorClass: 'red',
    accent: 'rgba(232, 33, 39, 0.85)', accentSolid: '#e82127',
    buyPrice: 245.04, shares: 40.81, currentPrice: 361.83,
    endingValue: 14766.28, gain: 4766.28, totalReturn: 47.66, cagr: 7.75,
    summary: 'Tesla added the highest company-specific upside in the project, but it was also the most headline-driven and volatile position.'
  },
  SPY: {
    name: 'SPDR S&P 500 ETF Trust', symbol: 'SPY', type: 'S&P 500 Index Fund', colorClass: 'blue',
    accent: 'rgba(88, 160, 255, 0.85)', accentSolid: '#58a0ff',
    buyPrice: 371.33, shares: 26.93, currentPrice: 634.09,
    endingValue: 17076.04, gain: 7076.04, totalReturn: 70.76, cagr: 10.79,
    summary: 'SPY worked as the broad U.S. equity benchmark and showed strong long-run growth with less single-company drama than Tesla.'
  },
  QQQ: {
    name: 'Invesco QQQ Trust', symbol: 'QQQ', type: 'Growth ETF #1', colorClass: 'green',
    accent: 'rgba(32, 201, 151, 0.85)', accentSolid: '#20c997',
    buyPrice: 311.86, shares: 32.07, currentPrice: 562.58,
    endingValue: 18041.94, gain: 8041.94, totalReturn: 80.42, cagr: 11.96,
    summary: 'QQQ was the best performer on the worksheet, reflecting how strongly large-cap growth stocks rebounded over the full tracking period.'
  },
  VUG: {
    name: 'Vanguard Growth ETF', symbol: 'VUG', type: 'Growth ETF #2', colorClass: 'gold',
    accent: 'rgba(242, 185, 75, 0.85)', accentSolid: '#f2b94b',
    buyPrice: 251.28, shares: 39.8, currentPrice: 422.37,
    endingValue: 16810.33, gain: 6810.33, totalReturn: 68.10, cagr: 10.45,
    summary: 'VUG captured growth exposure similar to QQQ, but with a slightly lower ending value and a broader basket than a single stock like Tesla.'
  },
  AGG: {
    name: 'iShares Core U.S. Aggregate Bond ETF', symbol: 'AGG', type: 'Core Bond ETF', colorClass: 'silver',
    accent: 'rgba(198, 208, 229, 0.85)', accentSolid: '#c6d0e5',
    buyPrice: 117.92, shares: 84.8, currentPrice: 98.54,
    endingValue: 8356.19, gain: -1643.81, totalReturn: -16.44, cagr: -3.38,
    summary: 'AGG served as the bond sleeve in the portfolio and was the only holding below the original $10,000 at the March 27, 2026 checkpoint.'
  }
};

const portfolio = {
  symbol: 'PORT', name: 'Combined Portfolio',
  initialValue: 50000, endingValue: 75050.78,
  gain: 25050.78, totalReturn: 50.10, cagr: 8.09,
  best: 'QQQ', laggard: 'AGG'
};

const order = ['TSLA', 'SPY', 'QQQ', 'VUG', 'AGG'];

function money(value) {
  return '$' + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(value) {
  return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

const chartDefaults = {
  font: { family: "'Outfit', system-ui, sans-serif" },
  color: '#8a95b2',
};

function renderComparisonChart(canvasId = 'comparisonChart') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: order.map(k => investments[k].symbol),
      datasets: [{
        label: 'Ending Value ($)',
        data: order.map(k => investments[k].endingValue),
        backgroundColor: order.map(k => investments[k].accent),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 80
      }, {
        label: 'Starting Value ($)',
        data: order.map(() => 10000),
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 80
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#8a95b2', padding: 20, font: { weight: '600', size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(12, 18, 36, 0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          titleFont: { weight: '700' },
          callbacks: {
            label(context) {
              if (context.datasetIndex === 1) return 'Starting: $10,000.00';
              const item = investments[order[context.dataIndex]];
              return [
                `Ending: ${money(item.endingValue)}`,
                `Gain/Loss: ${item.gain >= 0 ? '+' : ''}${money(item.gain)}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#8a95b2', font: { weight: '700', size: 13, family: "'JetBrains Mono', monospace" } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#5a6580',
            callback: v => '$' + Number(v).toLocaleString(),
            font: { family: "'JetBrains Mono', monospace", size: 11 }
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

function renderPortfolioChart(canvasId = 'portfolioChart') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: order.map(k => investments[k].symbol),
      datasets: [{
        data: order.map(k => investments[k].endingValue),
        backgroundColor: order.map(k => investments[k].accent),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#8a95b2', padding: 20, font: { weight: '600', size: 12 } }
        },
        tooltip: {
          backgroundColor: 'rgba(12, 18, 36, 0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          callbacks: {
            label(context) {
              const total = portfolio.endingValue;
              const value = context.raw;
              const share = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${money(value)} (${share}%)`;
            }
          }
        }
      }
    }
  });
}

function renderMiniComparisonChart(symbol, canvasId = 'miniChart') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;

  const item = investments[symbol];
  const labels = ['Jan 5, 2021', 'Mar 27, 2026'];

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: [item.buyPrice, item.currentPrice],
        borderColor: item.accentSolid,
        backgroundColor: item.accent,
        tension: 0.35,
        fill: {
          target: 'origin',
          above: item.accent.replace('0.85', '0.08')
        },
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: item.accentSolid,
        pointBorderColor: '#0c1224',
        pointBorderWidth: 3,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(12, 18, 36, 0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          callbacks: {
            label(context) { return money(context.raw); }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#8a95b2', font: { size: 11, family: "'JetBrains Mono', monospace" } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: '#5a6580',
            callback: v => '$' + Number(v).toLocaleString(),
            font: { size: 11, family: "'JetBrains Mono', monospace" }
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

window.stockData = { investments, portfolio, order, money, pct, renderComparisonChart, renderPortfolioChart, renderMiniComparisonChart };
