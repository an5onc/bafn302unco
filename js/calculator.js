// ===== HP 10bII Financial Calculator Simulator =====
// Renders an interactive calculator widget that mimics the HP 10bII key sequences.
// Uses Finance.* engine for all calculations — no math duplication.

class HP10bII {
  constructor(options) {
    this.container = options.container;
    this.onSolve = options.onSolve || null;

    // State
    this.inputBuffer = '';
    this.isInputting = false;
    this.display = '0.00';
    this.registers = { N: null, IYR: null, PV: null, PMT: null, FV: null };
    this.pyr = 1;
    this.isBegin = false;
    this.shiftActive = false;
    this.justComputed = false;
    this.errorState = false;

    // Basic arithmetic
    this.pendingOp = null;
    this.pendingOperand = null;
    this.memory = 0;

    // DOM refs (populated by render)
    this.lcdEl = null;
    this.annBegin = null;
    this.annShift = null;
    this.regEls = {};
    this.shiftKeyEl = null;

    this.render();
    this.bindEvents();
    this.bindKeyboard();
    this.updateDisplay();
  }

  // ===== RENDERING =====

  render() {
    const widget = this._el('div', 'calc-widget');

    // Brand
    const brand = this._el('div', 'calc-brand');
    const brandName = this._el('span', 'calc-brand-name');
    brandName.textContent = 'HP';
    const brandModel = this._el('div', 'calc-brand-model');
    brandModel.textContent = '10bII Financial Calculator';
    brand.appendChild(brandName);
    brand.appendChild(brandModel);
    widget.appendChild(brand);

    // Display
    const display = this._el('div', 'calc-display');

    const anns = this._el('div', 'calc-annunciators');
    this.annBegin = this._el('span');
    this.annBegin.textContent = 'BEGIN';
    this.annShift = this._el('span');
    this.annShift.textContent = 'SHIFT';
    anns.appendChild(this.annBegin);
    anns.appendChild(this.annShift);
    display.appendChild(anns);

    this.lcdEl = this._el('div', 'calc-lcd');
    this.lcdEl.textContent = '0.00';
    display.appendChild(this.lcdEl);

    const regs = this._el('div', 'calc-registers');
    ['N', 'IYR', 'PV', 'PMT', 'FV'].forEach(name => {
      const span = this._el('span');
      span.dataset.reg = name;
      span.textContent = this._regLabel(name) + ': --';
      regs.appendChild(span);
      this.regEls[name] = span;
    });
    display.appendChild(regs);

    widget.appendChild(display);

    // Keypad
    const keypad = this._el('div', 'calc-keypad');

    // Row 1: TVM keys
    keypad.appendChild(this._buildRow('tvm-row', [
      { key: 'n', label: 'N', shift: 'xP/YR', cls: 'tvm' },
      { key: 'iyr', label: 'I/YR', shift: 'P/YR', cls: 'tvm' },
      { key: 'pv', label: 'PV', shift: 'BEG/END', cls: 'tvm' },
      { key: 'pmt', label: 'PMT', shift: '', cls: 'tvm' },
      { key: 'fv', label: 'FV', shift: '', cls: 'tvm' },
    ]));

    // Row 2: Utility
    keypad.appendChild(this._buildRow('util-row', [
      { key: 'shift', label: 'SHIFT', shift: '', cls: 'shift' },
      { key: 'sto', label: 'STO', shift: '', cls: 'util' },
      { key: 'rcl', label: 'RCL', shift: '', cls: 'util' },
      { key: 'percent', label: '%', shift: '', cls: 'util' },
      { key: 'c', label: 'C', shift: 'C ALL', cls: 'clear' },
    ]));

    // Row 3: 7 8 9 /
    keypad.appendChild(this._buildRow('num-row', [
      { key: 'digit_7', label: '7', cls: 'num' },
      { key: 'digit_8', label: '8', cls: 'num' },
      { key: 'digit_9', label: '9', cls: 'num' },
      { key: 'divide', label: '\u00F7', cls: 'op' },
    ]));

    // Row 4: 4 5 6 x
    keypad.appendChild(this._buildRow('num-row', [
      { key: 'digit_4', label: '4', cls: 'num' },
      { key: 'digit_5', label: '5', cls: 'num' },
      { key: 'digit_6', label: '6', cls: 'num' },
      { key: 'multiply', label: '\u00D7', cls: 'op' },
    ]));

    // Row 5: 1 2 3 -
    keypad.appendChild(this._buildRow('num-row', [
      { key: 'digit_1', label: '1', cls: 'num' },
      { key: 'digit_2', label: '2', cls: 'num' },
      { key: 'digit_3', label: '3', cls: 'num' },
      { key: 'minus', label: '\u2212', cls: 'op' },
    ]));

    // Row 6: 0 . +/- +
    keypad.appendChild(this._buildRow('num-row', [
      { key: 'digit_0', label: '0', cls: 'num' },
      { key: 'decimal', label: '.', cls: 'num' },
      { key: 'plus_minus', label: '+/\u2212', cls: 'op' },
      { key: 'plus', label: '+', cls: 'op' },
    ]));

    widget.appendChild(keypad);
    this.container.appendChild(widget);
  }

  _buildRow(rowClass, keys) {
    const row = this._el('div', 'calc-row ' + rowClass);
    keys.forEach(k => {
      const btn = this._el('button', 'calc-key ' + k.cls);
      btn.dataset.key = k.key;
      btn.type = 'button';

      if (k.shift) {
        const shiftLabel = this._el('span', 'key-shift-label');
        shiftLabel.textContent = k.shift;
        btn.appendChild(shiftLabel);
      } else if (k.cls === 'tvm' || k.cls === 'clear' || k.cls === 'util') {
        // Empty shift label for spacing
        const shiftLabel = this._el('span', 'key-shift-label');
        shiftLabel.textContent = '\u00A0';
        btn.appendChild(shiftLabel);
      }

      const label = this._el('span', 'key-label');
      label.textContent = k.label;
      btn.appendChild(label);

      if (k.key === 'shift') this.shiftKeyEl = btn;
      row.appendChild(btn);
    });
    return row;
  }

  _el(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  _regLabel(name) {
    if (name === 'IYR') return 'I/YR';
    return name;
  }

  // ===== EVENT BINDING =====

  bindEvents() {
    this.container.querySelector('.calc-keypad').addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-key');
      if (!btn) return;
      this.pressKey(btn.dataset.key);
    });
  }

  bindKeyboard() {
    this._keyHandler = (e) => {
      // Only respond when calculator is visible
      if (!this.container.offsetParent) return;
      // Don't capture if an input field is focused
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      let handled = true;
      const key = e.key;

      if (key >= '0' && key <= '9') {
        this.pressKey('digit_' + key);
      } else if (key === '.') {
        this.pressKey('decimal');
      } else if (key === '+') {
        this.pressKey('plus');
      } else if (key === '-') {
        this.pressKey('minus');
      } else if (key === '*') {
        this.pressKey('multiply');
      } else if (key === '/') {
        e.preventDefault();
        this.pressKey('divide');
      } else if (key === 'Escape') {
        this.pressKey('c');
      } else if (key === 'Backspace') {
        this.handleBackspace();
      } else {
        handled = false;
      }

      if (handled) e.stopPropagation();
    };
    document.addEventListener('keydown', this._keyHandler);
  }

  // ===== KEY DISPATCH =====

  pressKey(keyId) {
    // Clear error on any key
    if (this.errorState) {
      this.clearEntry();
      this.errorState = false;
      if (keyId === 'c') return;
    }

    // Shift toggle
    if (keyId === 'shift') {
      this.shiftActive = !this.shiftActive;
      this._updateShift();
      return;
    }

    // Digit / decimal
    if (keyId.startsWith('digit_') || keyId === 'decimal') {
      this._handleDigit(keyId);
    }
    // TVM keys
    else if (['n', 'iyr', 'pv', 'pmt', 'fv'].includes(keyId)) {
      if (this.shiftActive) {
        this._handleShiftTVM(keyId);
      } else {
        this._handleTVM(keyId);
      }
    }
    // Clear
    else if (keyId === 'c') {
      if (this.shiftActive) {
        this.clearAll();
      } else {
        this.clearEntry();
      }
    }
    // Sign toggle
    else if (keyId === 'plus_minus') {
      this._handlePlusMinus();
    }
    // Arithmetic operators
    else if (['plus', 'minus', 'multiply', 'divide'].includes(keyId)) {
      this._handleOperator(keyId);
    }
    // Percent
    else if (keyId === 'percent') {
      this._handlePercent();
    }
    // Memory
    else if (keyId === 'sto') {
      this.memory = this._getCurrentValue();
    }
    else if (keyId === 'rcl') {
      this.display = this._formatNum(this.memory);
      this.inputBuffer = '';
      this.isInputting = false;
    }

    // Clear shift after any key except shift itself
    if (keyId !== 'shift') {
      this.shiftActive = false;
      this._updateShift();
    }

    this.updateDisplay();
  }

  // ===== DIGIT ENTRY =====

  _handleDigit(keyId) {
    if (this.justComputed) {
      // After a compute, new digit starts fresh
      this.inputBuffer = '';
      this.justComputed = false;
    }

    if (keyId === 'decimal') {
      if (this.inputBuffer.includes('.')) return;
      if (this.inputBuffer === '') this.inputBuffer = '0';
      this.inputBuffer += '.';
    } else {
      const digit = keyId.replace('digit_', '');
      if (this.inputBuffer === '0') {
        this.inputBuffer = digit;
      } else {
        this.inputBuffer += digit;
      }
    }
    this.isInputting = true;
    this.display = this.inputBuffer;
  }

  handleBackspace() {
    if (this.isInputting && this.inputBuffer.length > 0) {
      this.inputBuffer = this.inputBuffer.slice(0, -1);
      if (this.inputBuffer === '' || this.inputBuffer === '-') {
        this.inputBuffer = '';
        this.display = '0';
        this.isInputting = false;
      } else {
        this.display = this.inputBuffer;
      }
      this.updateDisplay();
    }
  }

  // ===== TVM STORE / COMPUTE =====

  _handleTVM(keyId) {
    const regKey = this._keyToReg(keyId);

    if (this.isInputting && this.inputBuffer !== '') {
      // STORE: user typed a number, now assigning it to a register
      let value = parseFloat(this.inputBuffer);
      if (isNaN(value)) value = 0;
      this.registers[regKey] = value;
      this.display = this._formatNum(value);
      this.inputBuffer = '';
      this.isInputting = false;
      this.justComputed = false;
      this._highlightReg(regKey, 'just-set');
    } else {
      // COMPUTE: solve for this variable
      const blanks = [];
      const filled = [];
      Object.entries(this.registers).forEach(([k, v]) => {
        if (v === null) blanks.push(k);
        else filled.push(k);
      });

      let solveFor = regKey;

      if (filled.length < 4) {
        this._showError();
        return;
      }

      // If the pressed key's register is filled and there's exactly 1 blank elsewhere, solve the blank
      if (this.registers[regKey] !== null && blanks.length === 1) {
        solveFor = blanks[0];
      } else if (blanks.length === 0) {
        // All 5 filled — re-solve for the pressed key
        solveFor = regKey;
      } else if (blanks.length === 1 && blanks[0] === regKey) {
        solveFor = regKey;
      } else {
        this._showError();
        return;
      }

      const result = this._computeTVM(solveFor);
      if (isNaN(result) || !isFinite(result)) {
        this._showError();
        return;
      }

      this.registers[solveFor] = result;
      this.display = this._formatNum(result);
      this.inputBuffer = '';
      this.isInputting = false;
      this.justComputed = true;
      this._highlightReg(solveFor, 'just-solved');

      // Fire callback
      if (this.onSolve) {
        this.onSolve({
          N: this.registers.N,
          IYR: this.registers.IYR,
          PV: this.registers.PV,
          PMT: this.registers.PMT,
          FV: this.registers.FV,
          pyr: this.pyr,
          isBegin: this.isBegin
        }, solveFor);
      }
    }
  }

  _computeTVM(solveFor) {
    const iyr = this.registers.IYR;
    const r = (iyr / 100) / this.pyr;
    const n = this.registers.N;
    const pv = this.registers.PV;
    const pmt = this.registers.PMT;
    const fv = this.registers.FV;
    const isDue = this.isBegin;

    switch (solveFor) {
      case 'FV': return Finance.fv(pv, pmt, r, n, isDue);
      case 'PV': return Finance.pv(fv, pmt, r, n, isDue);
      case 'PMT': return Finance.pmt(pv, fv, r, n, isDue);
      case 'N': return Finance.nper(pv, fv, pmt, r, isDue);
      case 'IYR':
        const rSolved = Finance.rate(pv, fv, pmt, n, isDue);
        return rSolved * this.pyr * 100;
      default: return NaN;
    }
  }

  // ===== SHIFT FUNCTIONS =====

  _handleShiftTVM(keyId) {
    switch (keyId) {
      case 'n':
        // xP/YR: multiply displayed value by P/YR, store in N
        if (this.inputBuffer !== '') {
          const years = parseFloat(this.inputBuffer);
          if (!isNaN(years)) {
            const n = years * this.pyr;
            this.registers.N = n;
            this.display = this._formatNum(n);
            this._highlightReg('N', 'just-set');
          }
          this.inputBuffer = '';
          this.isInputting = false;
        }
        break;
      case 'iyr':
        // P/YR: set payments per year
        if (this.inputBuffer !== '') {
          const val = parseInt(this.inputBuffer);
          if (!isNaN(val) && val > 0) {
            this.pyr = val;
            this.display = this._formatNum(this.pyr);
          }
          this.inputBuffer = '';
          this.isInputting = false;
        } else {
          // Show current P/YR
          this.display = this._formatNum(this.pyr);
        }
        break;
      case 'pv':
        // BEG/END toggle
        this.isBegin = !this.isBegin;
        break;
    }
  }

  // ===== SIGN TOGGLE =====

  _handlePlusMinus() {
    if (this.isInputting && this.inputBuffer !== '') {
      if (this.inputBuffer.startsWith('-')) {
        this.inputBuffer = this.inputBuffer.slice(1);
      } else {
        this.inputBuffer = '-' + this.inputBuffer;
      }
      this.display = this.inputBuffer;
    } else {
      // Toggle sign of the displayed value
      const val = this._getCurrentValue();
      if (val !== 0) {
        this.display = this._formatNum(-val);
      }
    }
  }

  // ===== ARITHMETIC =====

  _handleOperator(keyId) {
    const opMap = { plus: '+', minus: '-', multiply: '*', divide: '/' };
    const newOp = opMap[keyId];

    if (this.pendingOp && this.isInputting) {
      // Chain: evaluate pending operation first
      const result = this._evalOp(this.pendingOperand, this._getCurrentValue(), this.pendingOp);
      this.display = this._formatNum(result);
      this.pendingOperand = result;
    } else {
      this.pendingOperand = this._getCurrentValue();
    }

    this.pendingOp = newOp;
    this.inputBuffer = '';
    this.isInputting = false;
    this.justComputed = false;
  }

  _handlePercent() {
    const val = this._getCurrentValue();
    const result = val / 100;
    this.display = this._formatNum(result);
    this.inputBuffer = '';
    this.isInputting = false;
  }

  _evalOp(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  // ===== CLEAR =====

  clearEntry() {
    this.inputBuffer = '';
    this.isInputting = false;
    this.display = '0.00';
    this.justComputed = false;
    this.pendingOp = null;
    this.pendingOperand = null;
  }

  clearAll() {
    this.clearEntry();
    this.registers = { N: null, IYR: null, PV: null, PMT: null, FV: null };
    this.pyr = 1;
    this.isBegin = false;
    this.memory = 0;
    this._updateAllRegs();
  }

  // ===== DISPLAY =====

  updateDisplay() {
    if (this.lcdEl) {
      this.lcdEl.textContent = this.display;
    }
    this._updateAnnunciators();
    this._updateAllRegs();
  }

  _updateAnnunciators() {
    if (this.annBegin) {
      if (this.isBegin) this.annBegin.classList.add('active');
      else this.annBegin.classList.remove('active');
    }
    if (this.annShift) {
      if (this.shiftActive) this.annShift.classList.add('active');
      else this.annShift.classList.remove('active');
    }
  }

  _updateShift() {
    if (this.shiftKeyEl) {
      if (this.shiftActive) this.shiftKeyEl.classList.add('active');
      else this.shiftKeyEl.classList.remove('active');
    }
    this._updateAnnunciators();
  }

  _updateAllRegs() {
    Object.entries(this.registers).forEach(([name, val]) => {
      const el = this.regEls[name];
      if (!el) return;
      const label = this._regLabel(name);
      if (val === null) {
        el.textContent = label + ': --';
      } else {
        el.textContent = label + ': ' + this._formatNumShort(val);
      }
    });
  }

  _highlightReg(regKey, cls) {
    // Clear all highlights
    Object.values(this.regEls).forEach(el => {
      el.classList.remove('just-set', 'just-solved');
    });
    // Set new highlight
    if (this.regEls[regKey]) {
      this.regEls[regKey].classList.add(cls);
      // Auto-remove after 2s
      setTimeout(() => {
        if (this.regEls[regKey]) {
          this.regEls[regKey].classList.remove(cls);
        }
      }, 2000);
    }
  }

  _showError() {
    this.display = 'Error';
    this.errorState = true;
    this.inputBuffer = '';
    this.isInputting = false;
  }

  // ===== HELPERS =====

  _getCurrentValue() {
    if (this.isInputting && this.inputBuffer !== '') {
      return parseFloat(this.inputBuffer) || 0;
    }
    // Parse from display
    const cleaned = this.display.replace(/,/g, '');
    return parseFloat(cleaned) || 0;
  }

  _formatNum(val) {
    if (isNaN(val) || !isFinite(val)) return 'Error';
    // Show up to 10 significant digits, with commas
    const abs = Math.abs(val);
    let str;
    if (abs === 0) {
      str = '0.00';
    } else if (abs >= 1e10) {
      str = val.toExponential(4);
    } else {
      // Determine decimal places: show 2 by default, up to 6 for small numbers
      let decimals = 2;
      if (abs < 0.01 && abs > 0) decimals = 6;
      else if (abs < 1) decimals = 4;
      str = val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }
    return str;
  }

  _formatNumShort(val) {
    if (isNaN(val) || !isFinite(val)) return '??';
    if (Math.abs(val) >= 1e7) return val.toExponential(1);
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  _keyToReg(keyId) {
    const map = { n: 'N', iyr: 'IYR', pv: 'PV', pmt: 'PMT', fv: 'FV' };
    return map[keyId] || keyId.toUpperCase();
  }

  // ===== CLEANUP =====

  destroy() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
    }
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
