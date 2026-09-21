/**
 * utils.js — funções utilitárias puras: formatação, máscaras, datas, ids.
 * Não depende de nenhum outro módulo do sistema.
 */
const Utils = (() => {

  function formatCurrency(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatNumber(value, decimals = 0) {
    const n = Number(value) || 0;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function formatDate(value, withTime = false) {
    if (!value) return '—';
    const d = (value instanceof Date) ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    const date = d.toLocaleDateString('pt-BR');
    if (!withTime) return date;
    return `${date} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysISO(iso, days) {
    const d = new Date((iso || todayISO()) + 'T00:00:00');
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString().slice(0, 10);
  }

  function isoToBR(iso) {
    if (!iso) return '—';
    const [y, m, d] = String(iso).split('-');
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
  }

  function daysBetween(dateIso, refDate = new Date()) {
    const d1 = new Date(dateIso + 'T00:00:00');
    const d2 = new Date(refDate.toISOString().slice(0, 10) + 'T00:00:00');
    return Math.round((d2 - d1) / 86400000);
  }

  function isOverdue(dueDateIso) {
    if (!dueDateIso) return false;
    return daysBetween(dueDateIso) > 0;
  }

  function isDueToday(dueDateIso) {
    if (!dueDateIso) return false;
    return daysBetween(dueDateIso) === 0;
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Gera o próximo código sequencial (ex.: CLI0011) olhando o maior número já usado na lista. */
  function nextSequentialCode(list, prefix, size = 4) {
    let max = 0;
    const re = new RegExp(`^${prefix}(\\d+)$`);
    (list || []).forEach((item) => {
      const m = String(item.code || item.id || '').match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return `${prefix}${pad(max + 1, size)}`;
  }

  function pad(num, size = 4) {
    return String(num).padStart(size, '0');
  }

  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initials(name) {
    if (!name) return '?';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // ---------- Máscaras ----------
  function onlyDigits(v) { return String(v || '').replace(/\D/g, ''); }

  function maskCPF(v) {
    v = onlyDigits(v).slice(0, 11);
    return v.replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskCNPJ(v) {
    v = onlyDigits(v).slice(0, 14);
    return v.replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function maskDocument(v, personType) {
    return personType === 'PJ' ? maskCNPJ(v) : maskCPF(v);
  }

  function maskPhone(v) {
    v = onlyDigits(v).slice(0, 11);
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  function maskCEP(v) {
    v = onlyDigits(v).slice(0, 8);
    return v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }

  function validateCPF(cpf) {
    cpf = onlyDigits(cpf);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev >= 10) rev = 0;
    if (rev !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev >= 10) rev = 0;
    return rev === parseInt(cpf[10]);
  }

  function validateCNPJ(cnpj) {
    cnpj = onlyDigits(cnpj);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    const calc = (base) => {
      let weights = base.length === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
      let sum = 0;
      for (let i = 0; i < base.length; i++) sum += parseInt(base[i]) * weights[i];
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };
    const d1 = calc(cnpj.slice(0, 12));
    if (d1 !== parseInt(cnpj[12])) return false;
    const d2 = calc(cnpj.slice(0, 13));
    return d2 === parseInt(cnpj[13]);
  }

  function validateDocument(v, personType) {
    return personType === 'PJ' ? validateCNPJ(v) : validateCPF(v);
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
  }

  function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function toCSV(rows, headers) {
    const esc = (v) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[";\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.map((h) => esc(h.label)).join(';')];
    rows.forEach((row) => {
      lines.push(headers.map((h) => esc(typeof h.value === 'function' ? h.value(row) : row[h.value])).join(';'));
    });
    return '﻿' + lines.join('\n');
  }

  return {
    formatCurrency, formatNumber, formatDate, todayISO, addDaysISO, isoToBR, daysBetween, isOverdue, isDueToday,
    uid, pad, nextSequentialCode, debounce, escapeHtml, initials, onlyDigits, maskCPF, maskCNPJ, maskDocument, maskPhone, maskCEP,
    validateCPF, validateCNPJ, validateDocument, validateEmail, downloadFile, toCSV,
  };
})();
