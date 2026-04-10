/* ============================================================
   BAFN 302 · Stock Project Spring 2026
   Shared data + Chart.js rendering
   ============================================================ */

const investments = {
  TSLA: {
    name: 'Tesla', symbol: 'TSLA', type: 'Individual Stock', colorClass: 'red',
    accent: 'rgba(232, 33, 39, 0.85)', accentSolid: '#e82127',
    buyPrice: 245.04, shares: 40.81, currentPrice: 343.25,
    endingValue: 14008.03, gain: 4008.03, totalReturn: 40.08, cagr: 6.63,
    summary: 'Tesla added the highest company-specific upside in the project, but it was also the most headline-driven and volatile position.'
  },
  SPY: {
    name: 'SPDR S&P 500 ETF Trust', symbol: 'SPY', type: 'S&P 500 Index Fund', colorClass: 'blue',
    accent: 'rgba(88, 160, 255, 0.85)', accentSolid: '#58a0ff',
    buyPrice: 371.33, shares: 26.93, currentPrice: 674.96,
    endingValue: 18176.67, gain: 8176.67, totalReturn: 81.77, cagr: 12.05,
    summary: 'SPY worked as the broad U.S. equity benchmark and showed strong long-run growth with less single-company drama than Tesla.'
  },
  QQQ: {
    name: 'Invesco QQQ Trust', symbol: 'QQQ', type: 'Growth ETF #1', colorClass: 'green',
    accent: 'rgba(32, 201, 151, 0.85)', accentSolid: '#20c997',
    buyPrice: 311.86, shares: 32.07, currentPrice: 606.09,
    endingValue: 19437.31, gain: 9437.31, totalReturn: 94.37, cagr: 13.48,
    summary: 'QQQ was the best performer on the worksheet, reflecting how strongly large-cap growth stocks rebounded over the full tracking period.'
  },
  VUG: {
    name: 'Vanguard Growth ETF', symbol: 'VUG', type: 'Growth ETF #2', colorClass: 'gold',
    accent: 'rgba(242, 185, 75, 0.85)', accentSolid: '#f2b94b',
    buyPrice: 251.28, shares: 39.8, currentPrice: 459.52,
    endingValue: 18288.90, gain: 8288.90, totalReturn: 82.89, cagr: 12.18,
    summary: 'VUG captured growth exposure similar to QQQ, but with a slightly lower ending value and a broader basket than a single stock like Tesla.'
  },
  AGG: {
    name: 'iShares Core U.S. Aggregate Bond ETF', symbol: 'AGG', type: 'Core Bond ETF', colorClass: 'silver',
    accent: 'rgba(198, 208, 229, 0.85)', accentSolid: '#c6d0e5',
    buyPrice: 117.92, shares: 84.8, currentPrice: 99.05,
    endingValue: 8399.44, gain: -1600.56, totalReturn: -16.01, cagr: -3.27,
    summary: 'AGG served as the bond sleeve in the portfolio and was the only holding below the original $10,000 at the April 8, 2026 checkpoint.'
  },
  // ── Additional research positions (not part of the core 5-position class portfolio) ──
  // UPDATE: Replace currentPrice with the April 23, 2026 closing price before final submission.
  // Verify buyPrice with Yahoo Finance historical data for Jan 5, 2021.
  EA: {
    name: 'Electronic Arts', symbol: 'EA', type: 'Individual Stock (Gaming)', colorClass: 'blue',
    accent: 'rgba(88, 160, 255, 0.85)', accentSolid: '#58a0ff',
    buyPrice: 141.32, shares: 70.76, currentPrice: 204.00,
    endingValue: 14435.04, gain: 4435.04, totalReturn: 44.35, cagr: 7.24,
    summary: 'EA is a major video game publisher (EA SPORTS FC, Madden, Battlefield, Apex Legends) that delivered steady growth with more volatility than index funds.'
  },
  BRKB: {
    name: 'Berkshire Hathaway Class B', symbol: 'BRK.B', type: 'Diversified Conglomerate', colorClass: 'gold',
    accent: 'rgba(242, 185, 75, 0.85)', accentSolid: '#f2b94b',
    buyPrice: 227.47, shares: 43.96, currentPrice: 479.75,
    endingValue: 21089.81, gain: 11089.81, totalReturn: 110.90, cagr: 15.26,
    summary: 'Berkshire Hathaway more than doubled over the tracking period — one of the strongest returns in the project\'s universe, driven by disciplined capital allocation across insurance, railroads, energy, and equities.'
  }
};

const portfolio = {
  symbol: 'PORT', name: 'Combined Portfolio',
  initialValue: 50000, endingValue: 78310.35,
  gain: 28310.35, totalReturn: 56.62, cagr: 8.91,
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
  const labels = ['Jan 5, 2021', 'Apr 8, 2026'];

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
