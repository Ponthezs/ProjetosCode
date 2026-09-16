/**
 * storage.js — camada única de persistência (hoje localStorage).
 *
 * Toda leitura/escrita de dados do sistema passa por aqui. Nenhum outro
 * arquivo deve chamar localStorage diretamente — isso é o que permite, no
 * futuro, substituir esta camada por chamadas a uma API REST sem alterar
 * os módulos de serviço (services/*.js) ou as telas.
 */
const COLLECTIONS = {
  CUSTOMERS: 'erp_customers',
  SUPPLIERS: 'erp_suppliers',
  PRODUCTS: 'erp_products',
  CATEGORIES: 'erp_categories',
  STOCK_MOVEMENTS: 'erp_stock_movements',
  SALES: 'erp_sales',
  PURCHASES: 'erp_purchases',
  PAYABLES: 'erp_payables',
  RECEIVABLES: 'erp_receivables',
  CASH_ENTRIES: 'erp_cash_entries',
  FIN_CATEGORIES: 'erp_fin_categories',
  USERS: 'erp_users',
  NOTIFICATIONS: 'erp_notifications',
};

const SETTINGS_KEYS = {
  COMPANY: 'erp_company',
  SETTINGS: 'erp_settings',
  SEED_FLAG: 'erp_seeded_v1',
  COUNTERS: 'erp_counters',
  SESSION: 'erp_session',
};

const StorageService = (() => {

  function _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`StorageService: falha ao ler "${key}"`, e);
      return fallback;
    }
  }

  function _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`StorageService: falha ao gravar "${key}"`, e);
      if (window.Toast) Toast.show('Não foi possível salvar os dados. Verifique o espaço de armazenamento do navegador.', 'error');
      return false;
    }
  }

  function isAvailable() {
    try {
      const t = '__erp_test__';
      localStorage.setItem(t, '1');
      localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }

  function getAll(collection) {
    return _read(collection, []);
  }

  function saveAll(collection, list) {
    return _write(collection, list);
  }

  function getById(collection, id) {
    return getAll(collection).find((item) => String(item.id) === String(id)) || null;
  }

  function query(collection, predicate) {
    return getAll(collection).filter(predicate);
  }

  function nextCounter(name) {
    const counters = _read(SETTINGS_KEYS.COUNTERS, {});
    counters[name] = (counters[name] || 0) + 1;
    _write(SETTINGS_KEYS.COUNTERS, counters);
    return counters[name];
  }

  function insert(collection, obj) {
    const list = getAll(collection);
    const record = Object.assign({}, obj, {
      id: obj.id || Utils.uid(collection.replace('erp_', '')),
      createdAt: obj.createdAt || new Date().toISOString(),
    });
    list.push(record);
    saveAll(collection, list);
    return record;
  }

  function update(collection, id, patch) {
    const list = getAll(collection);
    const idx = list.findIndex((item) => String(item.id) === String(id));
    if (idx === -1) return null;
    list[idx] = Object.assign({}, list[idx], patch, { updatedAt: new Date().toISOString() });
    saveAll(collection, list);
    return list[idx];
  }

  function remove(collection, id) {
    const list = getAll(collection);
    const next = list.filter((item) => String(item.id) !== String(id));
    if (next.length === list.length) return false;
    saveAll(collection, next);
    return true;
  }

  function seedIfEmpty(collection, factory) {
    const existing = getAll(collection);
    if (existing.length > 0) return existing;
    const data = typeof factory === 'function' ? factory() : factory;
    saveAll(collection, data);
    return data;
  }

  function getSetting(key, fallback) {
    return _read(key, fallback);
  }

  function setSetting(key, value) {
    return _write(key, value);
  }

  return {
    isAvailable, getAll, saveAll, getById, query, insert, update, remove,
    seedIfEmpty, nextCounter, getSetting, setSetting,
  };
})();
