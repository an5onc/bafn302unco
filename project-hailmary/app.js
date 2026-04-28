/* ============================================================
   BAFN 302 · Stock Project Spring 2026
   Shared data + Chart.js rendering
   ============================================================ */

const investments = {
  TSLA: {
    name: 'Tesla', symbol: 'TSLA', type: 'Individual Stock', colorClass: 'red',
    accent: 'rgba(232, 33, 39, 0.85)', accentSolid: '#e82127',
    buyPrice: 245.04, shares: 40.81, currentPrice: 378.56,
    endingValue: 15449.03, gain: 5449.03, totalReturn: 54.49, cagr: 8.54,
    summary: 'Tesla added the highest company-specific upside in the project, but it was also the most headline-driven and volatile position.'
  },
  SPY: {
    name: 'SPDR S&P 500 ETF Trust', symbol: 'SPY', type: 'S&P 500 Index Fund', colorClass: 'blue',
    accent: 'rgba(88, 160, 255, 0.85)', accentSolid: '#58a0ff',
    buyPrice: 371.33, shares: 26.93, currentPrice: 715.17,
    endingValue: 19259.53, gain: 9259.53, totalReturn: 92.60, cagr: 13.15,
    summary: 'SPY worked as the broad U.S. equity benchmark and showed strong long-run growth with less single-company drama than Tesla.'
  },
  QQQ: {
    name: 'Invesco QQQ Trust', symbol: 'QQQ', type: 'Growth ETF #1', colorClass: 'green',
    accent: 'rgba(32, 201, 151, 0.85)', accentSolid: '#20c997',
    buyPrice: 311.86, shares: 32.07, currentPrice: 664.23,
    endingValue: 21301.86, gain: 11301.86, totalReturn: 113.02, cagr: 15.31,
    summary: 'QQQ was the top performer in the entire project — the only position that beat every individual stock pick, reflecting how strongly large-cap growth and AI-led mega-caps compounded over the full period.'
  },
  VUG: {
    // 6-for-1 split announced Apr 27, 2026 — historical prices and shares restated below.
    name: 'Vanguard Growth ETF', symbol: 'VUG', type: 'Growth ETF #2', colorClass: 'gold',
    accent: 'rgba(242, 185, 75, 0.85)', accentSolid: '#f2b94b',
    buyPrice: 41.88, shares: 238.80, currentPrice: 83.49,
    endingValue: 19937.41, gain: 9937.41, totalReturn: 99.37, cagr: 13.89,
    summary: 'VUG captured broad growth exposure across ~190 holdings. After Vanguard\'s 6-for-1 split on Apr 27, 2026, the position now consists of 238.80 shares at a split-adjusted buy price of $41.88. Total value is unchanged by the split.'
  },
  AGG: {
    name: 'iShares Core U.S. Aggregate Bond ETF', symbol: 'AGG', type: 'Core Bond ETF', colorClass: 'silver',
    accent: 'rgba(198, 208, 229, 0.85)', accentSolid: '#c6d0e5',
    buyPrice: 117.92, shares: 84.8, currentPrice: 99.44,
    endingValue: 8432.51, gain: -1567.49, totalReturn: -15.67, cagr: -3.16,
    summary: 'AGG served as the bond sleeve in the portfolio and was the only holding still below the original $10,000 at the April 27, 2026 close.'
  },
  // ── Additional research positions (not part of the core 5-position class portfolio) ──
  // Verify buyPrice with Yahoo Finance historical data for Jan 5, 2021.
  EA: {
    name: 'Electronic Arts', symbol: 'EA', type: 'Individual Stock (Gaming)', colorClass: 'blue',
    accent: 'rgba(88, 160, 255, 0.85)', accentSolid: '#58a0ff',
    buyPrice: 141.32, shares: 70.76, currentPrice: 202.45,
    endingValue: 14325.36, gain: 4325.36, totalReturn: 43.25, cagr: 7.01,
    summary: 'EA is a major video game publisher (EA SPORTS FC, Madden, Battlefield, Apex Legends) that delivered steady growth with more volatility than index funds.'
  },
  BRKB: {
    name: 'Berkshire Hathaway Class B', symbol: 'BRK.B', type: 'Diversified Conglomerate', colorClass: 'gold',
    accent: 'rgba(242, 185, 75, 0.85)', accentSolid: '#f2b94b',
    buyPrice: 227.47, shares: 43.96, currentPrice: 472.81,
    endingValue: 20784.73, gain: 10784.73, totalReturn: 107.85, cagr: 14.78,
    summary: 'Berkshire Hathaway more than doubled over the tracking period — the strongest individual stock pick in the project, only narrowly trailing QQQ at the finish line. Driven by disciplined capital allocation across insurance, railroads, energy, and equities.'
  }
};

// Per-student portfolio summaries
const portfolios = {
  anson: {
    name: 'Anson', individualStock: 'TSLA',
    stocks: ['TSLA', 'SPY', 'QQQ', 'VUG', 'AGG'],
    initialValue: 50000, endingValue: 84380.34,
    gain: 34380.34, totalReturn: 68.76, cagr: 10.36,
    colorClass: 'red', accentSolid: '#e82127', accent: 'rgba(232,33,39,0.85)',
    page: 'anson.html'
  },
  mikey: {
    name: 'Mikey', individualStock: 'EA',
    stocks: ['EA', 'SPY', 'QQQ', 'VUG', 'AGG'],
    initialValue: 50000, endingValue: 83256.67,
    gain: 33256.67, totalReturn: 66.51, cagr: 10.08,
    colorClass: 'green', accentSolid: '#20c997', accent: 'rgba(32,201,151,0.85)',
    page: 'mikey.html'
  },
  paige: {
    name: 'Paige', individualStock: 'BRKB',
    stocks: ['BRKB', 'SPY', 'QQQ', 'VUG', 'AGG'],
    initialValue: 50000, endingValue: 89716.04,
    gain: 39716.04, totalReturn: 79.43, cagr: 11.65,
    colorClass: 'purple', accentSolid: '#a855f7', accent: 'rgba(168,85,247,0.85)',
    page: 'paige.html'
  }
};

// Legacy alias kept for backward compatibility
const portfolio = portfolios.anson;
const order = ['TSLA', 'SPY', 'QQQ', 'VUG', 'AGG'];

// ── Annual tracking data: approximate year-end investment values ($10,000 starting) ──
// Calculated as: shares × approximate Dec 31 closing price (split-adjusted).
// Jan 5, 2021 = buy date; Apr 27, 2026 = final tracking date (presentation day).
const trackingData = {
  TSLA: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 14365, 5020, 10121, 16446, 15449]
    // TSLA: 40.81 shares × [$245→$352→$123→$248→$403→$378.56]
    // Note: all prices split-adjusted for the Aug 2022 3-for-1 split
  },
  SPY: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 12872, 10287, 12792, 15754, 19260]
    // SPY: 26.93 shares × [$371→$478→$382→$475→$585→$715.17]
  },
  QQQ: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 12860, 8499, 13085, 16901, 21302]
    // QQQ: 32.07 shares × [$312→$401→$265→$408→$527→$664.23]
  },
  VUG: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 13094, 9194, 13134, 17034, 19937]
    // VUG: 238.80 shares × split-adjusted prices [$41.88→$54.83→$38.50→$55.00→$71.33→$83.49]
    // (pre-split equivalents: $251.28→$329→$231→$330→$428→$500.94)
  },
  AGG: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 9243, 8226, 8226, 8183, 8433]
    // AGG: 84.80 shares × [$118→$109→$97→$97→$96.5→$99.44]
  },
  EA: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 9765, 8562, 9482, 10472, 14325]
    // EA: 70.76 shares × [$141→$138→$121→$134→$148→$202.45]
  },
  BRKB: {
    labels: ['Jan 2021', 'Dec 2021', 'Dec 2022', 'Dec 2023', 'Dec 2024', 'Apr 27, 2026'],
    values: [10000, 13276, 13320, 15958, 20397, 20785]
    // BRK.B: 43.96 shares × [$227→$302→$303→$363→$464→$472.81]
  }
};

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

function renderComparisonChart(canvasId = 'comparisonChart', stocks = order) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: stocks.map(k => investments[k].symbol),
      datasets: [{
        label: 'Ending Value ($)',
        data: stocks.map(k => investments[k].endingValue),
        backgroundColor: stocks.map(k => investments[k].accent),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 80
      }, {
        label: 'Starting Value ($)',
        data: stocks.map(() => 10000),
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
              const item = investments[stocks[context.dataIndex]];
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

function renderPortfolioChart(canvasId = 'portfolioChart', stocks = order, totalValue = null) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;
  const total = totalValue || stocks.reduce((sum, k) => sum + investments[k].endingValue, 0);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: stocks.map(k => investments[k].symbol),
      datasets: [{
        data: stocks.map(k => investments[k].endingValue),
        backgroundColor: stocks.map(k => investments[k].accent),
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

function renderGroupChart(canvasId = 'groupChart') {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;
  const members = ['anson', 'mikey', 'paige'];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: members.map(m => portfolios[m].name),
      datasets: [{
        label: 'Portfolio Value ($)',
        data: members.map(m => portfolios[m].endingValue),
        backgroundColor: members.map(m => portfolios[m].accent),
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 100
      }, {
        label: 'Starting Value ($)',
        data: members.map(() => 50000),
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 100
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
          callbacks: {
            label(context) {
              if (context.datasetIndex === 1) return 'Starting: $50,000.00';
              const m = members[context.dataIndex];
              const p = portfolios[m];
              return [
                `Portfolio: ${money(p.endingValue)}`,
                `Gain: +${money(p.gain)}`,
                `Return: +${p.totalReturn.toFixed(2)}%`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#8a95b2', font: { weight: '700', size: 14, family: "'JetBrains Mono', monospace" } },
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

function renderTrackingChart(canvasId = 'trackingChart', symbol) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;

  Chart.defaults.font.family = chartDefaults.font.family;

  const inv = investments[symbol];
  const data = trackingData[symbol];
  if (!inv || !data) return;

  const fillColor = inv.accent.replace(/[\d.]+\)$/, '0.12)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: `${inv.symbol} Value`,
          data: data.values,
          borderColor: inv.accentSolid,
          backgroundColor: fillColor,
          borderWidth: 2.5,
          pointBackgroundColor: inv.accentSolid,
          pointBorderColor: '#0c1224',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.35
        },
        {
          label: 'Initial Investment ($10,000)',
          data: data.labels.map(() => 10000),
          borderColor: 'rgba(255,255,255,0.2)',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false,
          tension: 0
        }
      ]
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
          callbacks: {
            label(context) {
              if (context.datasetIndex === 1) return 'Baseline: $10,000';
              const v = context.parsed.y;
              const gain = v - 10000;
              const gainStr = (gain >= 0 ? '+' : '') + money(gain);
              return [`Value: ${money(v)}`, `vs. start: ${gainStr}`];
            }
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
            callback: v => '$' + Number(v / 1000).toFixed(0) + 'k',
            font: { size: 11, family: "'JetBrains Mono', monospace" }
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
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
  const labels = ['Jan 5, 2021', 'Apr 27, 2026'];

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

window.stockData = { investments, portfolios, portfolio, order, trackingData, money, pct, renderComparisonChart, renderPortfolioChart, renderMiniComparisonChart, renderGroupChart, renderTrackingChart };
