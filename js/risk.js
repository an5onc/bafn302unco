// ===== js/risk.js — Chapter 8 Risk & Return Math =====
// Pure math functions — no DOM dependencies

const Risk = (() => {

  // ── Expected Return ──────────────────────────────────────
  function expectedReturn(scenarios) {
    // scenarios: [{prob, ret}]
    return scenarios.reduce((sum, s) => sum + s.prob * s.ret, 0);
  }

  // ── Variance & Standard Deviation (Probability mode) ────
  function varianceProb(scenarios, mean) {
    if (mean === undefined) mean = expectedReturn(scenarios);
    return scenarios.reduce((sum, s) => sum + s.prob * Math.pow(s.ret - mean, 2), 0);
  }

  function stdDevProb(scenarios) {
    const mean = expectedReturn(scenarios);
    return { mean, variance: varianceProb(scenarios, mean), stdDev: Math.sqrt(varianceProb(scenarios, mean)) };
  }

  // ── Standard Deviation (Historical mode) ────────────────
  function stdDevHistorical(returns, sample = true) {
    const n = returns.length;
    if (n < 2) return { mean: returns[0] || 0, variance: 0, stdDev: 0 };
    const mean = returns.reduce((a, b) => a + b, 0) / n;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (sample ? n - 1 : n);
    return { mean, variance, stdDev: Math.sqrt(variance) };
  }

  // ── Coefficient of Variation ─────────────────────────────
  function cv(stdDev, mean) {
    if (mean === 0) return null; // undefined
    return stdDev / mean;
  }

  // ── Sharpe Ratio ─────────────────────────────────────────
  function sharpe(portfolioReturn, riskFreeRate, stdDev) {
    if (stdDev === 0) return null; // undefined
    return (portfolioReturn - riskFreeRate) / stdDev;
  }

  // ── Portfolio Return ─────────────────────────────────────
  function portfolioReturn(holdings) {
    // holdings: [{weight, ret}]
    return holdings.reduce((sum, h) => sum + h.weight * h.ret, 0);
  }

  // ── Two-Asset Portfolio Risk ──────────────────────────────
  function twoAssetRisk(w1, sigma1, w2, sigma2, rho) {
    const w1s = w1 * w1 * sigma1 * sigma1;
    const w2s = w2 * w2 * sigma2 * sigma2;
    const cov = 2 * w1 * w2 * sigma1 * sigma2 * rho;
    const variance = w1s + w2s + cov;
    return { variance, stdDev: Math.sqrt(variance), covTerm: cov };
  }

  // ── Beta (Cov/Var mode) ───────────────────────────────────
  function betaCovVar(cov, varMarket) {
    if (varMarket === 0) return null;
    return cov / varMarket;
  }

  // ── Portfolio Beta ────────────────────────────────────────
  function portfolioBeta(holdings) {
    // holdings: [{weight, beta}]
    return holdings.reduce((sum, h) => sum + h.weight * h.beta, 0);
  }

  // ── CAPM ──────────────────────────────────────────────────
  function capm(rf, beta, rm) {
    // rm = market return (rm - rf = market risk premium)
    return rf + beta * (rm - rf);
  }

  function capmFromPremium(rf, beta, mrp) {
    return rf + beta * mrp;
  }

  // ── Utilities ─────────────────────────────────────────────
  function sumProbs(scenarios) {
    return scenarios.reduce((s, x) => s + x.prob, 0);
  }

  function normalizeProbs(scenarios) {
    const total = sumProbs(scenarios);
    return scenarios.map(s => ({ ...s, prob: s.prob / total }));
  }

  function sumWeights(holdings) {
    return holdings.reduce((s, h) => s + h.weight, 0);
  }

  function normalizeWeights(holdings) {
    const total = sumWeights(holdings);
    return holdings.map(h => ({ ...h, weight: h.weight / total }));
  }

  function pct(val, decimals = 2) {
    return (val * 100).toFixed(decimals) + '%';
  }

  function fmt(val, decimals = 4) {
    return parseFloat(val.toFixed(decimals));
  }

  return {
    expectedReturn, varianceProb, stdDevProb,
    stdDevHistorical, cv, sharpe,
    portfolioReturn, twoAssetRisk,
    betaCovVar, portfolioBeta,
    capm, capmFromPremium,
    sumProbs, normalizeProbs, sumWeights, normalizeWeights,
    pct, fmt
  };
})();
