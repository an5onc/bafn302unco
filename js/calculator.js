// ===== HP 10bII+ Financial Calculator — Faithful Layout Recreation =====
// Matches the physical HP 10bII+ key layout exactly.
// Orange shift (↓) accesses orange-labeled functions.
// Blue shift (↑) accesses blue-labeled functions.

class HP10bII {
  constructor(options) {
    this.container = options.container;
    this.onSolve = options.onSolve || null;

    // Display state
    this.inputBuffer = '';
    this.isInputting = false;
    this.display = '0.00';
    this.justComputed = false;
    this.errorState = false;

    // TVM registers
    this.registers = { N: null, IYR: null, PV: null, PMT: null, FV: null };
    this.pyr = 1;
    this.isBegin = false;

    // Shift states
    this.orangeShift = false;
    this.blueShift = false;

    // Arithmetic
    this.pendingOp = null;
    this.pendingOperand = null;

    // Memory register (→M / RM)
    this.memM = 0;

    // STO register (separate from →M)
    this.stoReg = 0;

    // Cash flow list for NPV/IRR: [{cf, n}]
    this.cfList = [];
    this.cfMode = false;       // true after first CFj entry
    this.cfPending = null;     // amount waiting for Nj

    // DOM refs
    this.lcdEl = null;
    this.annEls = {};
    this.regEls = {};
    this.orangeShiftEl = null;
    this.blueShiftEl = null;

    this.render();
    this.bindEvents();
    this.bindKeyboard();
    this.updateDisplay();
  }

  // ===== RENDERING =====

  render() {
    const w = this._el('div', 'calc-widget');

    // Brand
    const brand = this._el('div', 'calc-brand');
    const bName = this._el('span', 'calc-brand-name'); bName.textContent = 'HP';
    const bModel = this._el('div', 'calc-brand-model'); bModel.textContent = '10bII+ Financial Calculator';
    brand.appendChild(bName); brand.appendChild(bModel);
    w.appendChild(brand);

    // Display
    w.appendChild(this._buildDisplay());

    // Keypad
    const kp = this._el('div', 'calc-keypad');

    // Row 1 — TVM
    kp.appendChild(this._buildRow('tvm-row', [
      { key: 'n',   main: 'N',     orange: 'xP/YR', blue: 'AccInt', cls: 'tvm' },
      { key: 'iyr', main: 'I/YR',  orange: 'NOM%',  blue: 'YTM',    cls: 'tvm' },
      { key: 'pv',  main: 'PV',    orange: 'EFF%',  blue: 'PRICE',  cls: 'tvm' },
      { key: 'pmt', main: 'PMT',   orange: 'P/YR',  blue: 'CPN%',   cls: 'tvm' },
      { key: 'fv',  main: 'FV',    orange: 'AMORT', blue: 'CALL',   cls: 'tvm' },
    ]));

    // Row 2 — Financial
    kp.appendChild(this._buildRow('fin-row', [
      { key: 'input', main: 'INPUT', orange: 'DATE',    blue: 'D.MY/M.DY', cls: 'fin' },
      { key: 'mu',    main: 'MU',    orange: '∆DAYS',   blue: '360/Act',   cls: 'fin' },
      { key: 'cst',   main: 'CST',   orange: 'IRR/YR',  blue: 'Semi/Ann',  cls: 'fin' },
      { key: 'prc',   main: 'PRC',   orange: 'NPV',     blue: 'SetDate',   cls: 'fin' },
      { key: 'mar',   main: 'MAR',   orange: 'Beg/End', blue: 'MatDate',   cls: 'fin' },
    ]));

    // Row 3 — CF / Stat
    kp.appendChild(this._buildRow('cf-row', [
      { key: 'k',     main: 'K',   orange: 'SWAP',  blue: 'UNITS',  cls: 'fin' },
      { key: 'pct',   main: '%',   orange: '%CHG',  blue: 'SP',     cls: 'fin' },
      { key: 'cfj',   main: 'CFj', orange: 'Nj',    blue: 'VC',     cls: 'fin' },
      { key: 'sigma', main: 'Σ+',  orange: 'Σ−',    blue: 'FC',     cls: 'fin' },
      { key: 'bksp',  main: '←',   orange: 'RND',   blue: 'PROFIT', cls: 'fin' },
    ]));

    // Row 4 — Memory / Math
    kp.appendChild(this._buildRow('mem-row', [
      { key: 'pm',   main: '+/−',  orange: 'E',      blue: 'SL',   cls: 'fin' },
      { key: 'rcl',  main: 'RCL',  orange: 'STO',    blue: 'SOYD', cls: 'fin' },
      { key: 'msto', main: '→M',   orange: 'C STAT', blue: 'DB',   cls: 'fin' },
      { key: 'mrcl', main: 'RM',   orange: '(',      blue: 'HYP',  cls: 'fin' },
      { key: 'mplus','main': 'M+', orange: ')',       blue: 'INV',  cls: 'fin' },
    ]));

    // Row 5 — Blue shift + 7 8 9 ÷
    kp.appendChild(this._buildShiftRow('blue', [
      { key: 'digit_7', main: '7',  orange: 'x̄,ȳ',   blue: 'n',   blueTop: 'Σx²',  cls: 'num' },
      { key: 'digit_8', main: '8',  orange: 'Sx,Sy',  blue: 'Σx',  blueTop: 'Σy²',  cls: 'num' },
      { key: 'digit_9', main: '9',  orange: 'σx,σy',  blue: 'Σy',  blueTop: 'Σxy',  cls: 'num' },
      { key: 'divide',  main: '÷',  orange: '1/x',    blue: 'SIN',                   cls: 'op'  },
    ]));

    // Row 6 — Orange shift + 4 5 6 ×
    kp.appendChild(this._buildShiftRow('orange', [
      { key: 'digit_4', main: '4', orange: 'î,r',   cls: 'num' },
      { key: 'digit_5', main: '5', orange: 'ŷ,m',   cls: 'num' },
      { key: 'digit_6', main: '6', orange: 'x̄w,b',  cls: 'num' },
      { key: 'multiply','main': '×', orange: 'yˣ', blue: 'COS', cls: 'op' },
    ]));

    // Row 7 — C + 1 2 3 −
    kp.appendChild(this._buildRow('num-row', [
      { key: 'c',       main: 'C', orange: 'C ALL', blue: '', cls: 'clear', noTop: true },
      { key: 'digit_1', main: '1', orange: 'eˣ',   blue: 'nPr',  cls: 'num' },
      { key: 'digit_2', main: '2', orange: 'LN',   blue: 'nCr',  cls: 'num' },
      { key: 'digit_3', main: '3', orange: 'n!',   blue: 'RAND', cls: 'num' },
      { key: 'minus',   main: '−', orange: '√x',   blue: 'Rad/Deg', cls: 'op' },
    ]));

    // Row 8 — ON + 0 . = +
    kp.appendChild(this._buildRow('num-row num-row-bottom', [
      { key: 'on',      main: 'ON', orange: '', blue: 'Alg/Chain', cls: 'on', noTop: true },
      { key: 'digit_0', main: '0',  orange: 'π',     blue: '',      cls: 'num' },
      { key: 'decimal', main: '.',  orange: ',/·',   blue: '',      cls: 'num' },
      { key: 'equals',  main: '=',  orange: 'DISP',  blue: '',      cls: 'op-eq' },
      { key: 'plus',    main: '+',  orange: 'x²',    blue: '',      cls: 'op' },
    ]));

    w.appendChild(kp);
    this.container.appendChild(w);
  }

  _buildDisplay() {
    const disp = this._el('div', 'calc-display');

    const anns = this._el('div', 'calc-annunciators');
    const annNames = ['BEGIN', 'SHIFT', 'INPUT'];
    annNames.forEach(a => {
      const s = this._el('span', 'ann'); s.textContent = a; s.dataset.ann = a;
      anns.appendChild(s);
      this.annEls[a] = s;
    });
    disp.appendChild(anns);

    this.lcdEl = this._el('div', 'calc-lcd');
    this.lcdEl.textContent = '0.00';
    disp.appendChild(this.lcdEl);

    const regs = this._el('div', 'calc-registers');
    ['N', 'IYR', 'PV', 'PMT', 'FV'].forEach(name => {
      const s = this._el('span');
      s.dataset.reg = name;
      s.textContent = this._regLabel(name) + ': --';
      regs.appendChild(s);
      this.regEls[name] = s;
    });
    disp.appendChild(regs);

    return disp;
  }

  _buildRow(rowClass, keys) {
    const row = this._el('div', 'calc-row ' + rowClass);
    keys.forEach(k => {
      row.appendChild(this._buildKey(k));
    });
    return row;
  }

  // Row with a shift key on the left, then 4 number/op keys
  _buildShiftRow(color, keys) {
    const row = this._el('div', 'calc-row num-row');

    const shiftBtn = this._el('button', 'calc-key shift-' + color);
    shiftBtn.type = 'button';
    shiftBtn.dataset.key = 'shift_' + color;
    const arrow = this._el('span', 'key-label');
    arrow.textContent = color === 'blue' ? '⬆' : '⬇';
    shiftBtn.appendChild(arrow);
    if (color === 'blue') this.blueShiftEl = shiftBtn;
    else this.orangeShiftEl = shiftBtn;
    row.appendChild(shiftBtn);

    keys.forEach(k => row.appendChild(this._buildKey(k)));
    return row;
  }

  _buildKey(k) {
    const btn = this._el('button', 'calc-key ' + k.cls);
    btn.dataset.key = k.key;
    btn.type = 'button';

    // Blue top label
    if (k.blueTop) {
      const t = this._el('span', 'key-top-label blue-top'); t.textContent = k.blueTop;
      btn.appendChild(t);
    } else if (!k.noTop) {
      const t = this._el('span', 'key-top-label'); t.textContent = '\u00A0';
      btn.appendChild(t);
    }

    // Orange shift label (above main label)
    if (k.orange) {
      const s = this._el('span', 'key-shift-label orange-label'); s.textContent = k.orange;
      btn.appendChild(s);
    } else {
      const s = this._el('span', 'key-shift-label'); s.textContent = '\u00A0';
      btn.appendChild(s);
    }

    // Main label
    const m = this._el('span', 'key-label'); m.textContent = k.main;
    btn.appendChild(m);

    // Blue sub-label (below main, inside key)
    if (k.blue) {
      const b = this._el('span', 'key-blue-label'); b.textContent = k.blue;
      btn.appendChild(b);
    }

    return btn;
  }

  _el(tag, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  _regLabel(name) {
    return name === 'IYR' ? 'I/YR' : name;
  }

  // ===== EVENTS =====

  bindEvents() {
    this.container.querySelector('.calc-keypad').addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-key');
      if (!btn) return;
      this.pressKey(btn.dataset.key);
    });
  }

  bindKeyboard() {
    this._kh = (e) => {
      if (!this.container.offsetParent) return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      let handled = true;
      const key = e.key;
      if (key >= '0' && key <= '9')      { this.pressKey('digit_' + key); }
      else if (key === '.')              { this.pressKey('decimal'); }
      else if (key === '+')              { this.pressKey('plus'); }
      else if (key === '-')              { this.pressKey('minus'); }
      else if (key === '*')              { this.pressKey('multiply'); }
      else if (key === '/')              { e.preventDefault(); this.pressKey('divide'); }
      else if (key === 'Enter' || key === '=') { e.preventDefault(); this.pressKey('equals'); }
      else if (key === 'Escape')         { this.pressKey('c'); }
      else if (key === 'Backspace')      { this.pressKey('bksp'); }
      else if (key === '^')              { this.pressKey('multiply'); this._setPendingPow(); }
      else { handled = false; }
      if (handled) e.stopPropagation();
    };
    document.addEventListener('keydown', this._kh);
  }

  // ===== KEY DISPATCH =====

  pressKey(keyId) {
    if (this.errorState && keyId !== 'c') {
      this.clearEntry();
      this.errorState = false;
    }

    // Shift keys
    if (keyId === 'shift_orange') {
      this.orangeShift = !this.orangeShift;
      this.blueShift = false;
      this._updateShiftVisuals();
      return;
    }
    if (keyId === 'shift_blue') {
      this.blueShift = !this.blueShift;
      this.orangeShift = false;
      this._updateShiftVisuals();
      return;
    }

    const orange = this.orangeShift;
    const blue   = this.blueShift;

    // Clear shift before processing
    this.orangeShift = false;
    this.blueShift   = false;
    this._updateShiftVisuals();

    // ---- Digit entry ----
    if (keyId.startsWith('digit_') || keyId === 'decimal') {
      this._handleDigit(keyId, orange);
      this.updateDisplay(); return;
    }

    // ---- Backspace / RND ----
    if (keyId === 'bksp') {
      if (orange) {
        // RND — round display to 2dp
        const v = this._getCurrentValue();
        this.display = this._fmt(Math.round(v * 100) / 100);
        this.inputBuffer = ''; this.isInputting = false;
      } else {
        this._doBackspace();
      }
      this.updateDisplay(); return;
    }

    // ---- TVM keys ----
    if (['n','iyr','pv','pmt','fv'].includes(keyId)) {
      if (orange) this._handleOrangeTVM(keyId);
      else        this._handleTVM(keyId);
      this.updateDisplay(); return;
    }

    // ---- Financial row ----
    if (keyId === 'input') {
      // INPUT / DATE — for now, mark input mode (Σ+ stat entry uses it on real calc)
      this.display = 'InPut';
      this.updateDisplay(); return;
    }
    if (keyId === 'mu') {
      if (!orange) {
        // MU — markup: (selling − cost) / cost * 100
        const cost = this._getCurrentValue();
        this.display = 'MU: enter'; // stub
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'cst') {
      if (orange) this._computeIRR();
      // else CST stub
      this.updateDisplay(); return;
    }
    if (keyId === 'prc') {
      if (orange) this._computeNPV();
      // else PRC stub
      this.updateDisplay(); return;
    }
    if (keyId === 'mar') {
      if (orange) {
        // BEG/END toggle
        this.isBegin = !this.isBegin;
        this.display = this.isBegin ? 'bEGin' : 'End';
      }
      this.updateDisplay(); return;
    }

    // ---- CF row ----
    if (keyId === 'k') {
      if (!orange) {
        // K key — store displayed value for later (percent key companion on HP)
        // On HP 10bII+ K is used for percent calculations
        this._percentK();
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'pct') {
      if (orange) this._handlePctChg();
      else        this._handlePercent();
      this.updateDisplay(); return;
    }
    if (keyId === 'cfj') {
      if (orange) this._handleNj();
      else        this._handleCFj();
      this.updateDisplay(); return;
    }
    if (keyId === 'sigma') {
      if (orange) this._handleSigmaMinus();
      else        this._handleSigmaPlus();
      this.updateDisplay(); return;
    }

    // ---- Memory row ----
    if (keyId === 'pm') {
      if (orange) {
        // E — enter exponent (EEX): treat as ×10^ for scientific notation
        this._handleEEX();
      } else {
        this._handlePlusMinus();
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'rcl') {
      if (orange) {
        // STO
        this.stoReg = this._getCurrentValue();
        this.display = this._fmt(this.stoReg);
        this.inputBuffer = ''; this.isInputting = false;
      } else {
        // RCL
        this.display = this._fmt(this.stoReg);
        this.inputBuffer = ''; this.isInputting = false;
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'msto') {
      if (orange) {
        // C STAT — clear statistics registers
        this.statData = [];
        this.display = '0.00';
        this.inputBuffer = ''; this.isInputting = false;
      } else {
        // →M
        this.memM = this._getCurrentValue();
        this.display = this._fmt(this.memM);
        this.inputBuffer = ''; this.isInputting = false;
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'mrcl') {
      if (orange) {
        // ( — open parenthesis
        this._handleParenOpen();
      } else {
        // RM
        this.display = this._fmt(this.memM);
        this.inputBuffer = ''; this.isInputting = false;
      }
      this.updateDisplay(); return;
    }
    if (keyId === 'mplus') {
      if (orange) {
        // )
        this._handleParenClose();
      } else {
        // M+
        this.memM += this._getCurrentValue();
        this.display = this._fmt(this.memM);
        this.inputBuffer = ''; this.isInputting = false;
      }
      this.updateDisplay(); return;
    }

    // ---- Arithmetic operators ----
    if (['plus','minus','multiply','divide'].includes(keyId)) {
      const opMap = { plus:'+', minus:'-', multiply:'*', divide:'/' };
      const sciMap = {
        divide:  { orange: '1/x',  fn: v => v === 0 ? NaN : 1/v },
        multiply:{ orange: 'yx',   fn: null }, // yˣ handled below
        minus:   { orange: 'sqrt', fn: v => v < 0 ? NaN : Math.sqrt(v) },
        plus:    { orange: 'sq',   fn: v => v * v },
      };

      if (orange && sciMap[keyId] && sciMap[keyId].fn) {
        this._handleUnary(sciMap[keyId].fn);
      } else if (orange && keyId === 'multiply') {
        // yˣ — store base, wait for exponent
        this.pendingOperand = this._getCurrentValue();
        this.pendingOp = '^';
        this.inputBuffer = ''; this.isInputting = false; this.justComputed = false;
      } else {
        this._handleOperator(opMap[keyId]);
      }
      this.updateDisplay(); return;
    }

    // ---- Equals ----
    if (keyId === 'equals') {
      if (orange) {
        // DISP — cycle decimal places (stub: toggle 2/4 dp)
        this._cycleDisp();
      } else {
        this._handleEquals();
      }
      this.updateDisplay(); return;
    }

    // ---- Number keys with orange scientific functions ----
    // digit_1 orange = eˣ
    // digit_2 orange = LN
    // digit_3 orange = n!
    // digit_0 orange = π
    // (digits handled above normally; orange-shifted handled here)
    // NOTE: digit keys are handled at top if no shift. We need to re-route for orange shift.
    // Since shift is consumed before digit dispatch, we need a different approach.
    // Actually digits are handled at the very top BEFORE shift consumption —
    // we need to re-check. The fix: don't consume shift for digit keys above.
    // Let me restructure: digits with no shift go through _handleDigit, but
    // we'll handle orange-shifted digits here separately.

    // ---- Clear ----
    if (keyId === 'c') {
      if (orange) this.clearAll();
      else        this.clearEntry();
      this.updateDisplay(); return;
    }

    // ---- ON key ----
    if (keyId === 'on') {
      this.clearAll();
      this.updateDisplay(); return;
    }

    this.updateDisplay();
  }

  // ===== DIGIT ENTRY =====

  _handleDigit(keyId, forceOrange) {
    const orange = forceOrange || false;

    // Orange-shifted digit functions
    if (orange) {
      switch (keyId) {
        case 'digit_0': // π
          this.display = this._fmt(Math.PI);
          this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
          return;
        case 'digit_1': // eˣ
          this._handleUnary(v => Math.exp(v));
          return;
        case 'digit_2': // LN
          this._handleUnary(v => v <= 0 ? NaN : Math.log(v));
          return;
        case 'digit_3': // n!
          this._handleUnary(v => {
            const n = Math.round(v);
            if (n < 0 || n > 170) return NaN;
            let f = 1; for (let i = 2; i <= n; i++) f *= i; return f;
          });
          return;
      }
    }

    if (this.justComputed) {
      this.inputBuffer = '';
      this.justComputed = false;
    }
    if (keyId === 'decimal') {
      if (this.inputBuffer.includes('.')) return;
      if (!this.inputBuffer) this.inputBuffer = '0';
      this.inputBuffer += '.';
    } else {
      const d = keyId.replace('digit_', '');
      this.inputBuffer = (this.inputBuffer === '0' || this.inputBuffer === '') ? d : this.inputBuffer + d;
    }
    this.isInputting = true;
    this.display = this.inputBuffer;
  }

  _doBackspace() {
    if (this.isInputting && this.inputBuffer.length > 0) {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      if (!this.inputBuffer || this.inputBuffer === '-') {
        this.inputBuffer = ''; this.display = '0'; this.isInputting = false;
      } else {
        this.display = this.inputBuffer;
      }
    }
  }

  // ===== TVM =====

  _handleTVM(keyId) {
    const reg = this._k2r(keyId);
    if (this.isInputting && this.inputBuffer !== '') {
      let v = parseFloat(this.inputBuffer);
      if (isNaN(v)) v = 0;
      this.registers[reg] = v;
      this.display = this._fmt(v);
      this.inputBuffer = ''; this.isInputting = false; this.justComputed = false;
      this._hlReg(reg, 'just-set');
    } else {
      this._solveTVM(reg);
    }
  }

  _handleOrangeTVM(keyId) {
    switch (keyId) {
      case 'n':   // xP/YR — multiply years by P/YR, store in N
        if (this.isInputting && this.inputBuffer !== '') {
          const yrs = parseFloat(this.inputBuffer);
          if (!isNaN(yrs)) {
            const n = yrs * this.pyr;
            this.registers.N = n;
            this.display = this._fmt(n);
            this._hlReg('N', 'just-set');
          }
          this.inputBuffer = ''; this.isInputting = false;
        }
        break;
      case 'iyr': // NOM% — show/set nominal rate
        if (this.isInputting && this.inputBuffer !== '') {
          // Convert EAR → NOM: NOM = PYR * ((1 + EAR/100)^(1/PYR) - 1) * 100
          const ear = parseFloat(this.inputBuffer) / 100;
          const nom = this.pyr * (Math.pow(1 + ear, 1 / this.pyr) - 1) * 100;
          this.display = this._fmt(nom);
          this.inputBuffer = ''; this.isInputting = false;
        } else {
          this.display = this._fmt(this.registers.IYR || 0);
        }
        break;
      case 'pv':  // EFF% — effective annual rate
        if (this.isInputting && this.inputBuffer !== '') {
          // Convert NOM → EAR: EAR = (1 + NOM/(100*PYR))^PYR - 1
          const nom = parseFloat(this.inputBuffer) / 100;
          const ear = (Math.pow(1 + nom / this.pyr, this.pyr) - 1) * 100;
          this.display = this._fmt(ear);
          this.inputBuffer = ''; this.isInputting = false;
        }
        break;
      case 'pmt': // P/YR — set payments per year
        if (this.isInputting && this.inputBuffer !== '') {
          const p = parseInt(this.inputBuffer);
          if (!isNaN(p) && p > 0) { this.pyr = p; this.display = this._fmt(p); }
          this.inputBuffer = ''; this.isInputting = false;
        } else {
          this.display = this._fmt(this.pyr);
        }
        break;
      case 'fv':  // AMORT — stub
        this.display = 'AMort';
        break;
    }
  }

  _solveTVM(solveFor) {
    const regs = this.registers;
    const nulls = Object.entries(regs).filter(([,v]) => v === null).map(([k]) => k);
    const filled = Object.entries(regs).filter(([,v]) => v !== null).map(([k]) => k);

    let target = solveFor;
    if (regs[solveFor] !== null && nulls.length === 1) target = nulls[0];
    else if (nulls.length === 0) target = solveFor;
    else if (nulls.length === 1 && nulls[0] === solveFor) target = solveFor;
    else if (filled.length < 4) { this._showError(); return; }
    else { this._showError(); return; }

    const result = this._computeTVM(target);
    if (isNaN(result) || !isFinite(result)) { this._showError(); return; }

    this.registers[target] = result;
    this.display = this._fmt(result);
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
    this._hlReg(target, 'just-solved');

    if (this.onSolve) {
      this.onSolve({
        N: regs.N, IYR: regs.IYR, PV: regs.PV, PMT: regs.PMT, FV: regs.FV,
        pyr: this.pyr, isBegin: this.isBegin
      }, target);
    }
  }

  _computeTVM(solve) {
    const r = (this.registers.IYR / 100) / this.pyr;
    const { N, PV, PMT, FV } = this.registers;
    const due = this.isBegin;
    switch (solve) {
      case 'FV':  return Finance.fv(PV, PMT, r, N, due);
      case 'PV':  return Finance.pv(FV, PMT, r, N, due);
      case 'PMT': return Finance.pmt(PV, FV, r, N, due);
      case 'N':   return Finance.nper(PV, FV, PMT, r, due);
      case 'IYR': return Finance.rate(PV, FV, PMT, N, due) * this.pyr * 100;
      default: return NaN;
    }
  }

  // ===== CASH FLOW (CFj / Nj) =====

  _handleCFj() {
    const v = this._getCurrentValue();
    this.cfPending = v;
    // Add with count=1 by default; Nj will update the last entry
    this.cfList.push({ cf: v, n: 1 });
    this.cfMode = true;
    this.display = this._fmt(v) + ' C' + this.cfList.length;
    this.inputBuffer = ''; this.isInputting = false;
  }

  _handleNj() {
    if (this.cfList.length === 0) return;
    const count = Math.round(this._getCurrentValue());
    if (count > 0) {
      this.cfList[this.cfList.length - 1].n = count;
      this.display = this._fmt(count) + ' n' + this.cfList.length;
    }
    this.inputBuffer = ''; this.isInputting = false;
  }

  _computeNPV() {
    // PRC orange = NPV
    // I/YR register must be set; CF0 is first in cfList
    if (this.cfList.length === 0) { this._showError(); return; }
    const iyr = this.registers.IYR;
    if (iyr === null) { this._showError(); return; }
    const r = (iyr / 100) / this.pyr;
    let npv = 0;
    let t = 0;
    this.cfList.forEach(({ cf, n }) => {
      for (let i = 0; i < n; i++) {
        if (t === 0) npv += cf; // CF0 not discounted
        else npv += cf / Math.pow(1 + r, t);
        t++;
      }
    });
    this.display = this._fmt(npv);
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
  }

  _computeIRR() {
    // CST orange = IRR/YR
    if (this.cfList.length < 2) { this._showError(); return; }
    // Newton-Raphson on NPV=0
    let r = 0.1 / this.pyr;
    const maxIter = 300;
    const tol = 1e-10;
    for (let iter = 0; iter < maxIter; iter++) {
      let f = 0, df = 0, t = 0;
      this.cfList.forEach(({ cf, n }) => {
        for (let i = 0; i < n; i++) {
          if (t === 0) { f += cf; } else {
            const disc = Math.pow(1 + r, t);
            f  += cf / disc;
            df -= t * cf / (disc * (1 + r));
          }
          t++;
        }
      });
      if (Math.abs(df) < 1e-14) break;
      const rNew = r - f / df;
      if (Math.abs(rNew - r) < tol) { r = rNew; break; }
      r = rNew;
      if (r <= -1) r = -0.99;
    }
    const irr = r * this.pyr * 100;
    if (!isFinite(irr)) { this._showError(); return; }
    this.display = this._fmt(irr);
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
  }

  // ===== STATISTICS =====

  _handleSigmaPlus() {
    // Σ+ — add current value to stat register (x only for now)
    const v = this._getCurrentValue();
    this.statData.push(v);
    this.display = this._fmt(this.statData.length);
    this.inputBuffer = ''; this.isInputting = false;
  }

  _handleSigmaMinus() {
    if (this.statData.length > 0) this.statData.pop();
    this.display = this._fmt(this.statData.length);
    this.inputBuffer = ''; this.isInputting = false;
  }

  // ===== ARITHMETIC =====

  _handleOperator(op) {
    if (this.pendingOp && this.isInputting) {
      const result = this._evalOp(this.pendingOperand, this._getCurrentValue(), this.pendingOp);
      this.display = this._fmt(result);
      this.pendingOperand = result;
    } else {
      this.pendingOperand = this._getCurrentValue();
    }
    this.pendingOp = op;
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = false;
  }

  _handleEquals() {
    if (this.pendingOp !== null && this.pendingOperand !== null) {
      const b = this._getCurrentValue();
      const result = this._evalOp(this.pendingOperand, b, this.pendingOp);
      if (isNaN(result) || !isFinite(result)) { this._showError(); return; }
      this.display = this._fmt(result);
      this.inputBuffer = ''; this.isInputting = false;
      this.pendingOp = null; this.pendingOperand = null; this.justComputed = true;
    }
  }

  _evalOp(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      case '^': return Math.pow(a, b);
      default:  return b;
    }
  }

  // ===== UNARY / SCIENTIFIC =====

  _handleUnary(fn) {
    const v = this._getCurrentValue();
    const result = fn(v);
    if (isNaN(result) || !isFinite(result)) { this._showError(); return; }
    this.display = this._fmt(result);
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
  }

  // ===== PARENTHESES =====

  _parenStack = [];

  _handleParenOpen() {
    this._parenStack.push({ op: this.pendingOp, operand: this.pendingOperand });
    this.pendingOp = null; this.pendingOperand = null;
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = false;
    this.display = '( ' + this._parenStack.length;
  }

  _handleParenClose() {
    if (this._parenStack.length === 0) return;
    let inner = this._getCurrentValue();
    if (this.pendingOp && this.pendingOperand !== null) {
      inner = this._evalOp(this.pendingOperand, inner, this.pendingOp);
    }
    const outer = this._parenStack.pop();
    this.pendingOp = outer.op; this.pendingOperand = outer.operand;
    if (this.pendingOp && this.pendingOperand !== null) {
      inner = this._evalOp(this.pendingOperand, inner, this.pendingOp);
      this.pendingOp = null; this.pendingOperand = null;
    }
    if (isNaN(inner) || !isFinite(inner)) { this._showError(); return; }
    this.display = this._fmt(inner);
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
  }

  // ===== PERCENT =====

  _handlePercent() {
    // % on base: if pending op, compute percentage of pendingOperand; else /100
    if (this.pendingOp === '+' || this.pendingOp === '-') {
      const pct = this.pendingOperand * this._getCurrentValue() / 100;
      this.display = this._fmt(pct);
    } else {
      this.display = this._fmt(this._getCurrentValue() / 100);
    }
    this.inputBuffer = ''; this.isInputting = false;
  }

  _handlePctChg() {
    // %CHG = (new - old) / old * 100
    if (this.pendingOperand !== null) {
      const old = this.pendingOperand;
      const nw  = this._getCurrentValue();
      const pct = old === 0 ? NaN : (nw - old) / Math.abs(old) * 100;
      if (isNaN(pct)) { this._showError(); return; }
      this.display = this._fmt(pct);
      this.pendingOp = null; this.pendingOperand = null;
    }
    this.inputBuffer = ''; this.isInputting = false; this.justComputed = true;
  }

  _percentK() {
    // K key on HP 10bII+: stores percent base for repeated % calc
    this.stoReg = this._getCurrentValue();
  }

  // ===== SIGN / EEX =====

  _handlePlusMinus() {
    if (this.isInputting && this.inputBuffer) {
      this.inputBuffer = this.inputBuffer.startsWith('-')
        ? this.inputBuffer.slice(1)
        : '-' + this.inputBuffer;
      this.display = this.inputBuffer;
    } else {
      const v = this._getCurrentValue();
      if (v !== 0) { this.display = this._fmt(-v); this.inputBuffer = ''; this.isInputting = false; }
    }
  }

  _handleEEX() {
    // E key: enter scientific notation exponent
    // Append 'e' to current buffer so user can type the exponent
    if (!this.isInputting) {
      this.inputBuffer = this.display.replace(/,/g, '');
      this.isInputting = true;
    }
    if (!this.inputBuffer.includes('e') && !this.inputBuffer.includes('E')) {
      this.inputBuffer += 'e';
      this.display = this.inputBuffer;
    }
  }

  _cycleDisp() {
    // Toggle between 2 and 4 decimal display
    this._dispDecimals = this._dispDecimals === 2 ? 4 : 2;
    const v = this._getCurrentValue();
    this.display = this._fmt(v);
    this.inputBuffer = ''; this.isInputting = false;
  }
  _dispDecimals = 2;

  // ===== CLEAR =====

  clearEntry() {
    this.inputBuffer = ''; this.isInputting = false;
    this.display = '0.00'; this.justComputed = false;
    this.pendingOp = null; this.pendingOperand = null;
    this._parenStack = [];
  }

  clearAll() {
    this.clearEntry();
    this.registers = { N: null, IYR: null, PV: null, PMT: null, FV: null };
    this.pyr = 1; this.isBegin = false;
    this.stoReg = 0; this.memM = 0;
    this.cfList = []; this.cfMode = false; this.cfPending = null;
    this.statData = [];
    this._updateAllRegs();
  }

  handleBackspace() { this._doBackspace(); this.updateDisplay(); }

  // ===== DISPLAY =====

  updateDisplay() {
    // Cache display value to avoid repeated string operations
    if (this.lcdEl && this.lcdEl.textContent !== this.display) {
      this.lcdEl.textContent = this.display;
    }
    this._updateAnn('BEGIN', this.isBegin);
    this._updateAnn('INPUT', this.cfMode);
    this._updateAllRegs();
  }

  _updateAnn(name, active) {
    const el = this.annEls[name];
    if (!el) return;
    const isActive = !!active;
    if (el.classList.contains('active') !== isActive) {
      el.classList.toggle('active', isActive);
    }
  }

  _updateShiftVisuals() {
    if (this.orangeShiftEl) this.orangeShiftEl.classList.toggle('active', this.orangeShift);
    if (this.blueShiftEl)   this.blueShiftEl.classList.toggle('active', this.blueShift);
    if (this.annEls['SHIFT']) this.annEls['SHIFT'].classList.toggle('active', this.orangeShift || this.blueShift);
  }

  _updateAllRegs() {
    // Batch DOM operations
    const fragment = document.createDocumentFragment();
    Object.entries(this.registers).forEach(([name, val]) => {
      const el = this.regEls[name];
      if (!el) return;
      const newText = this._regLabel(name) + ': ' + (val === null ? '--' : this._fmtShort(val));
      if (el.textContent !== newText) {
        el.textContent = newText;
      }
    });
  }

  _hlReg(reg, cls) {
    Object.values(this.regEls).forEach(el => el.classList.remove('just-set', 'just-solved'));
    if (this.regEls[reg]) {
      this.regEls[reg].classList.add(cls);
      setTimeout(() => { if (this.regEls[reg]) this.regEls[reg].classList.remove(cls); }, 2000);
    }
  }

  _showError() { this.display = 'Error'; this.errorState = true; this.inputBuffer = ''; this.isInputting = false; }

  // ===== HELPERS =====

  _getCurrentValue() {
    if (this.isInputting && this.inputBuffer) return parseFloat(this.inputBuffer) || 0;
    return parseFloat(this.display.replace(/,/g, '')) || 0;
  }

  _fmt(val) {
    if (isNaN(val) || !isFinite(val)) return 'Error';
    const abs = Math.abs(val);
    if (abs === 0) return '0.00';
    if (abs >= 1e10) return val.toExponential(4);
    const dp = this._dispDecimals || 2;
    let decimals = dp;
    if (abs < 0.01 && abs > 0) decimals = Math.max(dp, 6);
    else if (abs < 1) decimals = Math.max(dp, 4);
    return val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  _fmtShort(val) {
    if (isNaN(val) || !isFinite(val)) return '??';
    if (Math.abs(val) >= 1e7) return val.toExponential(1);
    return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  _k2r(k) { return { n:'N', iyr:'IYR', pv:'PV', pmt:'PMT', fv:'FV' }[k] || k.toUpperCase(); }

  // ===== CLEANUP =====

  destroy() {
    if (this._kh) document.removeEventListener('keydown', this._kh);
    while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
  }
}
