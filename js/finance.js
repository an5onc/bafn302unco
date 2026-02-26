// ===== Finance Engine =====
// Core financial math functions used by all tools.

const Finance = {
  // --- TVM ---
  // Standard TVM equation: PV*(1+r)^n + PMT*((1+r)^n - 1)/r * (1+r*t) + FV = 0
  // t = 0 for ordinary annuity (END), t = 1 for annuity due (BEGIN)

  fv(pv, pmt, r, n, isDue) {
    const t = isDue ? 1 : 0;
    if (r === 0) return -(pv + pmt * n);
    const factor = Math.pow(1 + r, n);
    return -(pv * factor + pmt * ((factor - 1) / r) * (1 + r * t));
  },

  pv(fv, pmt, r, n, isDue) {
    const t = isDue ? 1 : 0;
    if (r === 0) return -(fv + pmt * n);
    const factor = Math.pow(1 + r, n);
    return -(fv / factor + pmt * ((factor - 1) / r) * (1 + r * t) / factor);
    // Simplified: -(fv + pmt*((factor-1)/r)*(1+r*t)) / factor
  },

  pmt(pv, fv, r, n, isDue) {
    const t = isDue ? 1 : 0;
    if (r === 0) return -(pv + fv) / n;
    const factor = Math.pow(1 + r, n);
    return -(pv * factor + fv) / (((factor - 1) / r) * (1 + r * t));
  },

  nper(pv, fv, pmt, r, isDue) {
    const t = isDue ? 1 : 0;
    if (r === 0) {
      if (pmt === 0) return NaN;
      return -(pv + fv) / pmt;
    }
    // Newton's method for n
    const pmtAdj = pmt * (1 + r * t);
    if (pmtAdj === 0 && r !== 0) {
      // No payments, just compound: PV*(1+r)^n + FV = 0
      if (pv === 0) return NaN;
      return Math.log(-fv / pv) / Math.log(1 + r);
    }
    // Standard formula: n = ln((pmtAdj - FV*r) / (pmtAdj + PV*r)) / ln(1+r)
    const num = (pmtAdj - fv * r);
    const den = (pmtAdj + pv * r);
    if (den === 0 || num / den <= 0) return NaN;
    return Math.log(num / den) / Math.log(1 + r);
  },

  rate(pv, fv, pmt, n, isDue, guess) {
    // Newton-Raphson iteration to solve for r
    let r = guess || 0.1;
    const t = isDue ? 1 : 0;
    const maxIter = 200;
    const tol = 1e-10;

    for (let i = 0; i < maxIter; i++) {
      const factor = Math.pow(1 + r, n);
      let f, df;

      if (Math.abs(r) < 1e-14) {
        // Near zero rate, use linear approx
        f = pv + fv + pmt * n;
        df = pmt * n * (n - 1) / 2; // approximate derivative
        if (Math.abs(df) < 1e-14) break;
      } else {
        const annFactor = ((factor - 1) / r) * (1 + r * t);
        f = pv * factor + pmt * annFactor + fv;

        // Derivative of f with respect to r
        const dFactor = n * Math.pow(1 + r, n - 1);
        const dAnnBase = (r * dFactor - factor + 1) / (r * r);
        const dAnn = dAnnBase * (1 + r * t) + ((factor - 1) / r) * t;
        df = pv * dFactor + pmt * dAnn;
      }

      if (Math.abs(df) < 1e-14) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < tol) return rNew;
      r = rNew;
      if (r <= -1) r = -0.99; // clamp
    }
    return r;
  },

  // --- NPV ---
  npv(rate, cashFlows) {
    // cashFlows[0] = CF at time 0, cashFlows[1] = CF at time 1, etc.
    let npv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
    }
    return npv;
  },

  // PV of each cash flow
  npvBreakdown(rate, cashFlows) {
    return cashFlows.map((cf, t) => ({
      period: t,
      cf: cf,
      pv: cf / Math.pow(1 + rate, t)
    }));
  },

  // --- IRR ---
  irr(cashFlows, guess, maxIter) {
    guess = guess || 0.1;
    maxIter = maxIter || 500;
    let r = guess;
    const tol = 1e-10;

    for (let i = 0; i < maxIter; i++) {
      let f = 0, df = 0;
      for (let t = 0; t < cashFlows.length; t++) {
        const denom = Math.pow(1 + r, t);
        f += cashFlows[t] / denom;
        if (t > 0) df -= t * cashFlows[t] / Math.pow(1 + r, t + 1);
      }
      if (Math.abs(df) < 1e-14) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < tol && Math.abs(f) < 1e-8) return rNew;
      r = rNew;
      if (r <= -1) r = -0.99;
    }
    // Check if converged
    const check = this.npv(r, cashFlows);
    if (Math.abs(check) < 0.01) return r;
    return NaN;
  },

  // Count sign changes in cash flows (for multiple IRR warning)
  signChanges(cashFlows) {
    let changes = 0;
    for (let i = 1; i < cashFlows.length; i++) {
      if (cashFlows[i] !== 0 && cashFlows[i - 1] !== 0 &&
        Math.sign(cashFlows[i]) !== Math.sign(cashFlows[i - 1])) {
        changes++;
      }
    }
    return changes;
  },

  // --- Rates ---
  aprToEar(apr, m) {
    return Math.pow(1 + apr / m, m) - 1;
  },

  earToApr(ear, m) {
    return m * (Math.pow(1 + ear, 1 / m) - 1);
  },

  // --- Bonds ---
  bondPrice(faceValue, couponRate, ytm, yearsToMaturity, paymentsPerYear) {
    const c = (couponRate / paymentsPerYear) * faceValue; // coupon per period
    const r = ytm / paymentsPerYear;
    const n = yearsToMaturity * paymentsPerYear;

    if (r === 0) return c * n + faceValue;

    const pvCoupons = c * (1 - Math.pow(1 + r, -n)) / r;
    const pvFace = faceValue / Math.pow(1 + r, n);
    return pvCoupons + pvFace;
  },

  bondYTM(price, faceValue, couponRate, yearsToMaturity, paymentsPerYear, guess) {
    const c = (couponRate / paymentsPerYear) * faceValue;
    const n = yearsToMaturity * paymentsPerYear;
    let r = (guess || 0.05) / paymentsPerYear;
    const maxIter = 500;
    const tol = 1e-10;

    for (let i = 0; i < maxIter; i++) {
      const factor = Math.pow(1 + r, n);
      let f, df;

      if (Math.abs(r) < 1e-14) {
        f = c * n + faceValue - price;
        df = c * n * (n + 1) / 2;
      } else {
        f = c * (1 - 1 / factor) / r + faceValue / factor - price;
        // derivative
        const t1 = c * (r * n / Math.pow(1 + r, n + 1) - (1 - 1 / factor)) / (r * r);
        const t2 = -n * faceValue / Math.pow(1 + r, n + 1);
        df = t1 + t2;
      }

      if (Math.abs(df) < 1e-14) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < tol) return rNew * paymentsPerYear;
      r = rNew;
      if (r <= -1) r = -0.99;
    }
    return r * paymentsPerYear;
  },

  // YTC: same math as YTM but uses call price instead of face and years-to-call instead of maturity
  bondYTC(price, faceValue, callPrice, couponRate, yearsToCall, paymentsPerYear, guess) {
    // Coupons are still based on face value, but terminal payment is call price
    const c = (couponRate / paymentsPerYear) * faceValue;
    const n = yearsToCall * paymentsPerYear;
    let r = (guess || 0.05) / paymentsPerYear;
    const maxIter = 500;
    const tol = 1e-10;

    for (let i = 0; i < maxIter; i++) {
      const factor = Math.pow(1 + r, n);
      let f, df;

      if (Math.abs(r) < 1e-14) {
        f = c * n + callPrice - price;
        df = c * n * (n + 1) / 2;
      } else {
        f = c * (1 - 1 / factor) / r + callPrice / factor - price;
        const t1 = c * (r * n / Math.pow(1 + r, n + 1) - (1 - 1 / factor)) / (r * r);
        const t2 = -n * callPrice / Math.pow(1 + r, n + 1);
        df = t1 + t2;
      }

      if (Math.abs(df) < 1e-14) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < tol) return rNew * paymentsPerYear;
      r = rNew;
      if (r <= -1) r = -0.99;
    }
    return r * paymentsPerYear;
  },

  // Price a callable bond (to call date) for verification
  bondPriceToCall(faceValue, callPrice, couponRate, yearsToCall, ytc, paymentsPerYear) {
    const c = (couponRate / paymentsPerYear) * faceValue;
    const r = ytc / paymentsPerYear;
    const n = yearsToCall * paymentsPerYear;

    if (r === 0) return c * n + callPrice;

    const pvCoupons = c * (1 - Math.pow(1 + r, -n)) / r;
    const pvCall = callPrice / Math.pow(1 + r, n);
    return pvCoupons + pvCall;
  },

  currentYield(annualCoupon, price) {
    return annualCoupon / price;
  },

  // --- Helpers ---
  fmt(val, decimals) {
    if (typeof decimals === 'undefined') decimals = 2;
    if (isNaN(val) || !isFinite(val)) return '—';
    return val.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  fmtPct(val, decimals) {
    if (typeof decimals === 'undefined') decimals = 4;
    if (isNaN(val) || !isFinite(val)) return '—';
    return (val * 100).toFixed(decimals) + '%';
  },

  fmtMoney(val, decimals) {
    if (typeof decimals === 'undefined') decimals = 2;
    if (isNaN(val) || !isFinite(val)) return '—';
    const prefix = val < 0 ? '-$' : '$';
    return prefix + Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
};
