// Config da API - ajuste a URL conforme ambiente
const API_URL = 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('datailer_token');
}

function getTipo() {
  return localStorage.getItem('datailer_tipo'); // 'cliente' ou 'lavacar'
}

export async function api(path, options = {}) {
  const url = API_URL + path;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { ...options, headers });
  let data = {};
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : {};
  } catch {}
  if (!res.ok) throw new Error(data.erro || 'Erro na requisição');
  return data;
}

export function logout() {
  localStorage.removeItem('datailer_token');
  localStorage.removeItem('datailer_tipo');
  localStorage.removeItem('datailer_user');
}
