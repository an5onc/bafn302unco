// ===== Tool Registry =====
const TOOL_REGISTRY = [
  {
    id: 'tvm',
    title: 'TVM Solver',
    description: 'Solve for PV, FV, PMT, interest rate, or number of periods. Leave one blank to solve.',
    category: 'Time Value of Money',
    path: '/tools/tvm.html'
  },
  {
    id: 'lumpsum',
    title: 'Lump Sum PV / FV',
    description: 'Quick present or future value of a single cash flow with compounding.',
    category: 'Time Value of Money',
    path: '/tools/lumpsum.html'
  },
  {
    id: 'annuity',
    title: 'Annuity PV / FV',
    description: 'Present or future value of equal periodic payments (ordinary or due).',
    category: 'Time Value of Money',
    path: '/tools/annuity.html'
  },
  {
    id: 'amortization',
    title: 'Amortization Schedule',
    description: 'Generate full loan amortization table with payment breakdown and summary.',
    category: 'Time Value of Money',
    path: '/tools/amortization.html'
  },
  {
    id: 'npv',
    title: 'NPV Calculator',
    description: 'Net present value of uneven cash flows at a given discount rate.',
    category: 'Cash Flows',
    path: '/tools/npv.html'
  },
  {
    id: 'irr',
    title: 'IRR Calculator',
    description: 'Internal rate of return for a series of uneven cash flows.',
    category: 'Cash Flows',
    path: '/tools/irr.html'
  },
  {
    id: 'rates',
    title: 'APR / EAR Converter',
    description: 'Convert between nominal (APR) and effective annual rate (EAR).',
    category: 'Rates',
    path: '/tools/rates.html'
  },
  {
    id: 'bond-price',
    title: 'Bond Price',
    description: 'Price a bond given face value, coupon rate, maturity, and yield.',
    category: 'Bonds',
    path: '/tools/bond-price.html'
  },
  {
    id: 'bond-ytm',
    title: 'Bond YTM',
    description: 'Yield to maturity from current price, coupon, and maturity.',
    category: 'Bonds',
    path: '/tools/bond-ytm.html'
  },
  {
    id: 'bond-ytc',
    title: 'Bond YTC',
    description: 'Yield to call for callable bonds given call price and years to call.',
    category: 'Bonds',
    path: '/tools/bond-ytc.html'
  },
  {
    id: 'bond-current-yield',
    title: 'Bond Current Yield',
    description: 'Annual coupon payment divided by current market price.',
    category: 'Bonds',
    path: '/tools/bond-current-yield.html'
  },
  {
    id: 'rrr',
    title: 'Realized Rate of Return',
    description: 'Actual return on a bond over a holding period using real reinvestment rates and selling price.',
    category: 'Bonds',
    path: '/tools/rrr.html'
  },

  // ── Chapter 8: Risk & Return ─────────────────────────────
  {
    id: 'expected-return',
    title: 'Expected Return',
    description: 'Probability-weighted expected return from scenarios. r̄ = Σ(pᵢ × rᵢ)',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/expected-return.html'
  },
  {
    id: 'std-dev',
    title: 'Standard Deviation',
    description: 'Probability mode or historical returns mode. Compare two assets side-by-side.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/std-dev.html'
  },
  {
    id: 'cv',
    title: 'Coefficient of Variation',
    description: 'CV = σ / r̄. Risk per unit of return. Compare A vs B.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/cv.html'
  },
  {
    id: 'sharpe',
    title: 'Sharpe Ratio',
    description: 'Risk-adjusted return above the risk-free rate. Compare A vs B.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/sharpe.html'
  },
  {
    id: 'portfolio-return',
    title: 'Portfolio Return',
    description: 'Weighted average return across portfolio holdings. rₚ = Σ(wᵢ × rᵢ)',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/portfolio-return.html'
  },
  {
    id: 'portfolio-risk',
    title: 'Two-Asset Portfolio Risk',
    description: 'Portfolio σ with correlation slider (ρ). Diversification benefit visualized.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/portfolio-risk.html'
  },
  {
    id: 'beta',
    title: 'Beta Calculator',
    description: 'Direct β input or Cov/Var mode. Market interpretation included.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/beta.html'
  },
  {
    id: 'portfolio-beta',
    title: 'Portfolio Beta',
    description: 'Weighted average beta across holdings. βₚ = Σ(wᵢ × βᵢ)',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/portfolio-beta.html'
  },
  {
    id: 'capm',
    title: 'CAPM Required Return',
    description: 'rᵢ = rf + β(rₘ − rf). Enter rₘ or MRP. Exam mode supported.',
    category: 'Risk & Return (Ch. 8)',
    path: '/tools/risk/capm.html'
  }
  ,{
    id: 'wacc',
    title: 'WACC',
    description: 'Weighted Average Cost of Capital. Blends cost of equity and after-tax cost of debt by market-value weights. The firm\'s hurdle rate.',
    category: 'Capital Structure',
    path: '/tools/wacc.html'
  }
  ,{
    id: 'gordon-growth',
    title: 'Gordon Growth Model',
    description: 'P₀ = D₁ / (r − g). Constant-growth stock price or required return. Dividend growth model for steady-state firms.',
    category: 'Stock Valuation (Ch. 9)',
    path: '/tools/stock/gordon-growth.html'
  }
  ,{
    id: 'dividend-yield',
    title: 'Dividend Yield & Capital Gains',
    description: 'Break required return into dividend yield and capital gains yield. Reinforces r = D₁/P₀ + g.',
    category: 'Stock Valuation (Ch. 9)',
    path: '/tools/stock/dividend-yield.html'
  }
  ,{
    id: 'pe-valuation',
    title: 'P/E Stock Valuation',
    description: 'Estimate intrinsic value using P/E ratio. P₀ = EPS × (P/E). Compare to market price.',
    category: 'Stock Valuation (Ch. 9)',
    path: '/tools/stock/pe-valuation.html'
  }
  ,{
    id: 'breakeven',
    title: 'Break-Even Analysis',
    description: 'Units and sales-dollar break-even from fixed costs, price, and variable cost. Includes CM ratio, DOL, and profit sensitivity.',
    category: 'Capital Budgeting',
    path: '/tools/capital/breakeven.html'
  }
  ,{
    id: 'payback',
    title: 'Payback Period',
    description: 'Simple and discounted payback period. How long to recover initial investment from project cash flows. Compare against required payback.',
    category: 'Capital Budgeting',
    path: '/tools/capital/payback.html'
  }
];
