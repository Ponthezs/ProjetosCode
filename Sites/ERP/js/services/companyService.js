/**
 * companyService.js — dados da empresa e preferências gerais do sistema
 * (telas de Configurações).
 */
const CompanyService = (() => {
  function getCompany() { return StorageService.getSetting(SETTINGS_KEYS.COMPANY, {}); }
  function updateCompany(patch) {
    const current = getCompany();
    const next = Object.assign({}, current, patch);
    StorageService.setSetting(SETTINGS_KEYS.COMPANY, next);
    return next;
  }

  function getSettings() { return StorageService.getSetting(SETTINGS_KEYS.SETTINGS, { theme: 'light', sidebarCollapsed: false, dateFormat: 'dd/MM/yyyy', currency: 'BRL' }); }
  function updateSettings(patch) {
    const current = getSettings();
    const next = Object.assign({}, current, patch);
    StorageService.setSetting(SETTINGS_KEYS.SETTINGS, next);
    return next;
  }

  return { getCompany, updateCompany, getSettings, updateSettings };
})();
