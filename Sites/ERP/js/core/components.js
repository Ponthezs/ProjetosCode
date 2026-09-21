/**
 * components.js — componentes de UI reutilizáveis: Toast, Modal (genérico,
 * confirmação e formulário) e DataTable (tabela com ordenação e paginação).
 * Usados por todos os módulos para evitar duplicação de código de tela.
 */

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
const Toast = (() => {
  const ICONS = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };

  function ensureRoot() {
    let root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      document.body.appendChild(root);
    }
    return root;
  }

  function show(message, type = 'info', duration = 4200) {
    const root = ensureRoot();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fa-solid ${ICONS[type] || ICONS.info} toast-icon"></i>` +
      `<div class="toast-msg">${Utils.escapeHtml(message)}</div>` +
      `<button type="button" class="toast-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>`;
    root.appendChild(el);
    const remove = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 200); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    if (duration) setTimeout(remove, duration);
    return { remove };
  }

  return { show };
})();

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
const Modal = (() => {
  const MASK_FN = { cpf: 'maskCPF', cnpj: 'maskCNPJ', phone: 'maskPhone', cep: 'maskCEP' };

  function _mount(innerHtml, { onClose, closeOnBackdrop = true, closeOnEsc = true } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = innerHtml;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKeydown);
      setTimeout(() => overlay.remove(), 200);
      if (onClose) onClose();
    }
    function onKeydown(e) { if (e.key === 'Escape' && closeOnEsc) close(); }
    document.addEventListener('keydown', onKeydown);
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay && closeOnBackdrop) close(); });

    return { overlay, close };
  }

  function open({ title, bodyHtml, footerHtml = '', size = 'md', onClose, closeOnBackdrop = true, closeOnEsc = true }) {
    const sizeClass = size === 'lg' ? 'modal-lg' : size === 'sm' ? 'modal-sm' : '';
    const html = `
      <div class="modal-box ${sizeClass}">
        <div class="modal-header">
          <h3>${title}</h3>
          <button type="button" class="modal-close" aria-label="Fechar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>`;
    const inst = _mount(html, { onClose, closeOnBackdrop, closeOnEsc });
    inst.overlay.querySelector('.modal-close').addEventListener('click', inst.close);
    return inst;
  }

  function confirm({ title = 'Confirmar ação', message, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = true }) {
    return new Promise((resolve) => {
      const tone = danger ? { bg: 'var(--danger-100)', fg: 'var(--danger-600)', icon: 'fa-trash-can' } : { bg: 'var(--info-100)', fg: 'var(--info-600)', icon: 'fa-circle-question' };
      const bodyHtml = `
        <div class="modal-confirm-icon" style="background:${tone.bg};color:${tone.fg}"><i class="fa-solid ${tone.icon}"></i></div>
        <p>${message}</p>`;
      const footerHtml = `
        <button type="button" class="btn btn-secondary" data-act="cancel">${cancelText}</button>
        <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="confirm">${confirmText}</button>`;
      let resolved = false;
      const inst = open({ title, bodyHtml, footerHtml, size: 'sm', onClose: () => { if (!resolved) { resolved = true; resolve(false); } } });
      inst.overlay.querySelector('[data-act="cancel"]').addEventListener('click', () => { resolved = true; resolve(false); inst.close(); });
      inst.overlay.querySelector('[data-act="confirm"]').addEventListener('click', () => { resolved = true; resolve(true); inst.close(); });
    });
  }

  /**
   * Modal de formulário genérico. Retorna uma Promise que resolve com o
   * retorno de onSubmit em caso de sucesso, ou null se o usuário cancelar.
   *
   * fields: [{ name, label, type, required, options, placeholder, hint,
   *            mask ('cpf'|'cnpj'|'phone'|'cep' | function(value, getValues)),
   *            validate(value, values), onChange(value, ctx), colSpan(1|2),
   *            defaultValue, disabled, rows, maxlength }]
   */
  function form({ title, fields, initialData = {}, submitLabel = 'Salvar', size = 'md', onSubmit }) {
    return new Promise((resolve) => {
      const values = Object.assign({}, initialData);
      fields.forEach((f) => {
        if (values[f.name] === undefined) values[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'checkbox' ? false : '');
      });
      const getValues = () => values;

      function renderField(f) {
        const span = f.colSpan === 2 ? ' col-span-2' : '';
        const reqMark = f.required ? '<span style="color:var(--danger-600)"> *</span>' : (f.showOptional === false ? '' : '<span class="optional"> (opcional)</span>');
        const disabled = f.disabled ? 'disabled' : '';
        let control;
        if (f.type === 'select') {
          control = `<select class="input" name="${f.name}" ${disabled}>` +
            (f.placeholder ? `<option value="">${Utils.escapeHtml(f.placeholder)}</option>` : '') +
            f.options.map((o) => `<option value="${Utils.escapeHtml(o.value)}" ${String(o.value) === String(values[f.name]) ? 'selected' : ''}>${Utils.escapeHtml(o.label)}</option>`).join('') +
            `</select>`;
        } else if (f.type === 'textarea') {
          control = `<textarea class="input" name="${f.name}" rows="${f.rows || 3}" ${disabled}>${Utils.escapeHtml(values[f.name])}</textarea>`;
        } else if (f.type === 'checkbox') {
          control = `<label class="toggle-switch"><input type="checkbox" name="${f.name}" ${values[f.name] ? 'checked' : ''} ${disabled}><span class="toggle-slider"></span></label>`;
        } else {
          control = `<input class="input" type="${f.type || 'text'}" name="${f.name}" value="${Utils.escapeHtml(values[f.name])}" ${disabled}` +
            `${f.maxlength ? ` maxlength="${f.maxlength}"` : ''} placeholder="${Utils.escapeHtml(f.placeholder || '')}"` +
            `${f.step ? ` step="${f.step}"` : ''}${f.min !== undefined ? ` min="${f.min}"` : ''}>`;
        }
        return `<div class="form-field${span}" data-field="${f.name}">
          <label>${Utils.escapeHtml(f.label)}${reqMark}</label>
          ${control}
          ${f.hint ? `<div class="hint">${Utils.escapeHtml(f.hint)}</div>` : ''}
          <div class="field-error"></div>
        </div>`;
      }

      const bodyHtml = `<form id="modalForm" novalidate><div class="form-grid">${fields.map(renderField).join('')}</div></form>`;
      const footerHtml = `
        <button type="button" class="btn btn-secondary" data-act="cancel">Cancelar</button>
        <button type="submit" form="modalForm" class="btn btn-primary" data-act="submit"><i class="fa-solid fa-floppy-disk"></i> ${Utils.escapeHtml(submitLabel)}</button>`;

      let resolved = false;
      const inst = open({ title, bodyHtml, footerHtml, size, onClose: () => { if (!resolved) { resolved = true; resolve(null); } } });
      const formEl = inst.overlay.querySelector('#modalForm');

      fields.forEach((f) => {
        const wrapper = inst.overlay.querySelector(`[data-field="${f.name}"]`);
        const control = wrapper.querySelector('input,select,textarea');
        if (!control) return;
        const readValue = () => (f.type === 'checkbox' ? control.checked : control.value);
        control.addEventListener('input', () => {
          if (f.mask) {
            const maskFn = typeof f.mask === 'function' ? f.mask : (v) => Utils[MASK_FN[f.mask]](v);
            const masked = maskFn(control.value, getValues);
            if (masked !== undefined && masked !== control.value) control.value = masked;
          }
          values[f.name] = readValue();
          wrapper.classList.remove('has-error');
          if (f.onChange) f.onChange(values[f.name], { values, overlay: inst.overlay, rerenderField: (name) => rerenderField(name) });
        });
        control.addEventListener('change', () => { values[f.name] = readValue(); });
      });

      function rerenderField(name) {
        const f = fields.find((x) => x.name === name);
        const wrapper = inst.overlay.querySelector(`[data-field="${name}"]`);
        if (!f || !wrapper) return;
        wrapper.outerHTML = renderField(f);
        bindField(f);
      }
      function bindField(f) {
        const wrapper = inst.overlay.querySelector(`[data-field="${f.name}"]`);
        const control = wrapper.querySelector('input,select,textarea');
        if (!control) return;
        const readValue = () => (f.type === 'checkbox' ? control.checked : control.value);
        control.addEventListener('input', () => {
          if (f.mask) {
            const maskFn = typeof f.mask === 'function' ? f.mask : (v) => Utils[MASK_FN[f.mask]](v);
            const masked = maskFn(control.value, getValues);
            if (masked !== undefined && masked !== control.value) control.value = masked;
          }
          values[f.name] = readValue();
          wrapper.classList.remove('has-error');
          if (f.onChange) f.onChange(values[f.name], { values, overlay: inst.overlay, rerenderField });
        });
        control.addEventListener('change', () => { values[f.name] = readValue(); });
      }

      formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        let hasError = false;
        fields.forEach((f) => {
          const wrapper = inst.overlay.querySelector(`[data-field="${f.name}"]`);
          const errorEl = wrapper.querySelector('.field-error');
          let error = null;
          const value = values[f.name];
          if (f.required && (value === '' || value === null || value === undefined)) {
            error = 'Campo obrigatório.';
          } else if (value !== '' && f.validate) {
            error = f.validate(value, values) || null;
          }
          if (error) {
            hasError = true;
            wrapper.classList.add('has-error');
            errorEl.textContent = error;
          } else {
            wrapper.classList.remove('has-error');
          }
        });
        if (hasError) { Toast.show('Verifique os campos destacados em vermelho.', 'warning'); return; }

        const submitBtn = inst.overlay.querySelector('[data-act="submit"]');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        try {
          const result = await onSubmit(Object.assign({}, values));
          resolved = true;
          resolve(result === undefined ? true : result);
          inst.close();
        } catch (err) {
          Toast.show((err && err.message) || 'Não foi possível salvar. Tente novamente.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      });

      inst.overlay.querySelector('[data-act="cancel"]').addEventListener('click', () => { resolved = true; resolve(null); inst.close(); });
    });
  }

  return { open, confirm, form };
})();

// ---------------------------------------------------------------------------
// DataTable — tabela genérica com ordenação, paginação e ações por linha
// ---------------------------------------------------------------------------
function createDataTable(container, opts) {
  const state = {
    data: [],
    sortKey: opts.defaultSortKey || null,
    sortDir: opts.defaultSortDir || 'asc',
    page: 1,
    pageSize: opts.pageSize || 8,
  };

  function setData(data) { state.data = data || []; state.page = 1; render(); }
  function getData() { return state.data; }

  function sortedData() {
    const d = state.data.slice();
    if (!state.sortKey) return d;
    const col = opts.columns.find((c) => c.key === state.sortKey);
    d.sort((a, b) => {
      let av = col && col.sortValue ? col.sortValue(a) : a[state.sortKey];
      let bv = col && col.sortValue ? col.sortValue(b) : b[state.sortKey];
      if (av === undefined || av === null) av = '';
      if (bv === undefined || bv === null) bv = '';
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return state.sortDir === 'asc' ? -1 : 1;
      if (av > bv) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return d;
  }

  function render() {
    const all = sortedData();
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.pageSize;
    const pageItems = all.slice(start, start + state.pageSize);
    const colCount = opts.columns.length + (opts.actions ? 1 : 0);

    const theadHtml = `<tr>${opts.columns.map((c) => `
      <th class="${c.sortable ? 'sortable' : ''} ${state.sortKey === c.key ? 'sort-active' : ''}" data-key="${c.key}" ${c.align === 'right' ? 'style="text-align:right"' : ''}>
        ${Utils.escapeHtml(c.label)}${c.sortable ? `<i class="fa-solid ${state.sortKey === c.key && state.sortDir === 'desc' ? 'fa-arrow-down' : 'fa-arrow-up'} sort-icon"></i>` : ''}
      </th>`).join('')}${opts.actions ? '<th style="text-align:right">Ações</th>' : ''}</tr>`;

    let tbodyHtml;
    if (pageItems.length === 0) {
      tbodyHtml = `<tr><td colspan="${colCount}">
        <div class="table-empty"><i class="fa-solid ${opts.emptyIcon || 'fa-inbox'}"></i>${Utils.escapeHtml(opts.emptyMessage || 'Nenhum registro encontrado.')}</div>
      </td></tr>`;
    } else {
      tbodyHtml = pageItems.map((row) => {
        const rowClass = opts.rowClass ? opts.rowClass(row) : '';
        const cells = opts.columns.map((c) => `<td ${c.align === 'right' ? 'style="text-align:right"' : ''}>${c.render ? c.render(row) : Utils.escapeHtml(row[c.key] ?? '—')}</td>`).join('');
        let actionsCell = '';
        if (opts.actions) {
          const visible = opts.actions.filter((a) => !a.show || a.show(row));
          actionsCell = `<td><div class="cell-actions">${visible.map((a, i) => `
            <button type="button" class="btn btn-icon btn-ghost" data-tooltip="${Utils.escapeHtml(a.label)}" data-action-idx="${i}" data-row-id="${row.id}">
              <i class="fa-solid ${a.icon}"></i>
            </button>`).join('')}</div></td>`;
        }
        return `<tr class="${rowClass}" data-row-id="${row.id}">${cells}${actionsCell}</tr>`;
      }).join('');
    }

    container.innerHTML = `
      <div class="table-scroll">
        <table class="data-table">
          <thead>${theadHtml}</thead>
          <tbody>${tbodyHtml}</tbody>
        </table>
      </div>
      <div class="table-pagination">
        <div class="tp-info">Mostrando ${total === 0 ? 0 : start + 1}–${Math.min(start + state.pageSize, total)} de ${total} registro(s)</div>
        <div class="tp-controls">
          <button type="button" data-page="prev" ${state.page <= 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>
          <span style="font-size:12.5px;color:var(--text-muted);padding:0 8px;">Página ${state.page} de ${totalPages}</span>
          <button type="button" data-page="next" ${state.page >= totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>`;

    container.querySelectorAll('th.sortable').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.key;
        if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = key; state.sortDir = 'asc'; }
        render();
      });
    });
    const prevBtn = container.querySelector('[data-page="prev"]');
    const nextBtn = container.querySelector('[data-page="next"]');
    if (prevBtn) prevBtn.addEventListener('click', () => { state.page--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { state.page++; render(); });

    if (opts.actions) {
      container.querySelectorAll('[data-action-idx]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const row = state.data.find((r) => String(r.id) === btn.dataset.rowId);
          if (!row) return;
          const visible = opts.actions.filter((a) => !a.show || a.show(row));
          const action = visible[Number(btn.dataset.actionIdx)];
          if (action) action.onClick(row);
        });
      });
    }
  }

  render();
  return { setData, getData, refresh: render };
}
