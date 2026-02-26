// ===== Shared UI Components =====

const UI = {
  // --- Show/hide result card ---
  showResult(el) {
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  hideResult(el) {
    el.classList.add('hidden');
  },

  // --- Copy to clipboard ---
  copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
      UI.toast('Copied to clipboard');
    });
  },

  toast(msg) {
    let el = document.getElementById('copy-feedback');
    if (!el) {
      el = document.createElement('div');
      el.id = 'copy-feedback';
      el.className = 'copy-feedback';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 1800);
  },

  // --- Warnings ---
  clearWarnings(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  },
  addWarning(container, msg, type) {
    type = type || 'warn';
    const div = document.createElement('div');
    div.className = 'warning-msg ' + type;
    div.textContent = msg;
    container.appendChild(div);
  },

  // --- Advanced toggle ---
  initAdvancedToggle() {
    document.querySelectorAll('.advanced-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        const body = btn.nextElementSibling;
        body.classList.toggle('open');
      });
    });
  },

  // --- Steps toggle ---
  initStepsToggle() {
    document.querySelectorAll('.steps-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const isOpen = body.classList.toggle('open');
        btn.textContent = isOpen ? 'Hide steps' : 'Show steps';
      });
    });
  },

  // --- Get numeric value from input (empty = NaN) ---
  getNum(id) {
    const el = document.getElementById(id);
    if (!el) return NaN;
    const v = el.value.trim();
    if (v === '') return NaN;
    return parseFloat(v);
  },

  // --- Set input value ---
  setVal(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = (val === null || val === undefined || val === '') ? '' : val;
  },

  // --- Get select value ---
  getSel(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  },

  // --- URL params: read ---
  getParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },

  // --- URL params: build share link ---
  buildShareLink(params) {
    const url = new URL(window.location.href.split('?')[0]);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        url.searchParams.set(k, v);
      }
    });
    return url.toString();
  },

  // --- Load params into form ---
  loadParams(fields) {
    const params = UI.getParams();
    let anyLoaded = false;
    fields.forEach(id => {
      if (params[id] !== undefined) {
        UI.setVal(id, params[id]);
        anyLoaded = true;
      }
    });
    return anyLoaded;
  },

  // --- Reset form ---
  resetForm(fields) {
    fields.forEach(id => UI.setVal(id, ''));
    document.querySelectorAll('.result-card').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.warnings').forEach(el => {
      while (el.firstChild) el.removeChild(el.firstChild);
    });
    document.querySelectorAll('.steps-body').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.steps-toggle').forEach(el => el.textContent = 'Show steps');
  },

  // --- Cash flow table ---
  createCFTable(containerId, initialRows) {
    initialRows = initialRows || 6;
    const container = document.getElementById(containerId);
    const state = { rows: [] };

    function buildRow(i, cf) {
      const tr = document.createElement('tr');

      const tdPeriod = document.createElement('td');
      tdPeriod.textContent = i;
      tr.appendChild(tdPeriod);

      const tdInput = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.className = 'cf-input';
      input.dataset.idx = i;
      input.value = cf !== null ? cf : '';
      input.addEventListener('input', () => {
        state.rows[i] = input.value === '' ? null : parseFloat(input.value);
      });
      tdInput.appendChild(input);
      tr.appendChild(tdInput);

      const tdAction = document.createElement('td');
      if (i > 0) {
        const btn = document.createElement('button');
        btn.className = 'remove-btn';
        btn.textContent = '\u00D7';
        btn.addEventListener('click', () => {
          state.rows.splice(i, 1);
          render();
        });
        tdAction.appendChild(btn);
      }
      tr.appendChild(tdAction);

      return tr;
    }

    function render() {
      // Clear container
      while (container.firstChild) container.removeChild(container.firstChild);

      // Table
      const table = document.createElement('table');
      table.className = 'cf-table';

      const thead = document.createElement('thead');
      const headRow = document.createElement('tr');
      ['Period', 'Cash Flow', ''].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
      });
      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      state.rows.forEach((cf, i) => {
        tbody.appendChild(buildRow(i, cf));
      });
      table.appendChild(tbody);
      container.appendChild(table);

      // Buttons
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group';

      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn-outline';
      addBtn.textContent = '+ Add period';
      addBtn.addEventListener('click', () => {
        state.rows.push(null);
        render();
        const inputs = container.querySelectorAll('.cf-input');
        inputs[inputs.length - 1].focus();
      });
      btnGroup.appendChild(addBtn);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-outline';
      removeBtn.textContent = 'Remove last';
      removeBtn.addEventListener('click', () => {
        if (state.rows.length > 1) {
          state.rows.pop();
          render();
        }
      });
      btnGroup.appendChild(removeBtn);

      container.appendChild(btnGroup);
    }

    // Init
    for (let i = 0; i < initialRows; i++) state.rows.push(null);
    render();

    return {
      getFlows() { return state.rows.map(v => (v === null || isNaN(v)) ? 0 : v); },
      getRawFlows() { return [...state.rows]; },
      setFlows(arr) { state.rows = arr.slice(); render(); },
      clear() { state.rows = [null]; render(); }
    };
  }
};

// --- Init common behaviors on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  UI.initAdvancedToggle();
  UI.initStepsToggle();
});
