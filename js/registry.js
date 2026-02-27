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
  }
];
