// Calcula horário de fim a partir de início + duração (minutos)
export function addMinutes(hora, minutos) {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
}

// Gera slots disponíveis entre abertura e fechamento
export function gerarSlots(abertura, fechamento, intervalo) {
  const slots = [];
  let atual = abertura;
  while (atual < fechamento) {
    slots.push(atual);
    const [h, m] = atual.split(':').map(Number);
    let total = h * 60 + m + intervalo;
    const nh = Math.floor(total / 60);
    const nm = total % 60;
    atual = `${nh.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}`;
  }
  return slots;
}

// Parse horários de funcionamento (JSON)
export function parseHorarios(json) {
  try {
    return typeof json === 'string' ? JSON.parse(json) : (json || {});
  } catch {
    return {};
  }
}

// Dia da semana (0=domingo, 1=segunda, ...)
export function getDiaSemana(dataStr) {
  const d = new Date(dataStr + 'T12:00:00');
  return d.getDay().toString();
}
