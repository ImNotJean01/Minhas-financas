export const DEFAULT_CATEGORIES = [
  { id: 'Moradia', label: 'Moradia', type: 'saida', defaultLimit: 1800 },
  { id: 'Mercado', label: 'Mercado', type: 'saida', defaultLimit: 900 },
  { id: 'Restaurantes & Delivery', label: 'Restaurantes & Delivery', type: 'saida', defaultLimit: 450 },
  { id: 'Transporte', label: 'Transporte', type: 'saida', defaultLimit: 400 },
  { id: 'Assinaturas & Contas', label: 'Assinaturas & Contas', type: 'saida', defaultLimit: 250 },
  { id: 'Saúde & Farmácia', label: 'Saúde & Farmácia', type: 'saida', defaultLimit: 300 },
  { id: 'Lazer & Compras', label: 'Lazer & Compras', type: 'saida', defaultLimit: 500 },
  { id: 'Geral', label: 'Geral / Outros gastos', type: 'saida', defaultLimit: 300 },
  { id: 'Salário', label: 'Salário', type: 'recebimento', defaultLimit: 0 },
  { id: 'Renda Extra / Freelance', label: 'Renda Extra / Freelance', type: 'recebimento', defaultLimit: 0 },
  { id: 'Rendimentos', label: 'Rendimentos', type: 'recebimento', defaultLimit: 0 },
];

export function getCurrentYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getCurrentTimeHHMM() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function generateDefaultProfile() {
  return {
    nome: 'Jean',
    fatura_atual: 0,
    limite_cartao: 2500,
    saldo_caixinha: 0,
  };
}

export function generateDefaultBudgets() {
  const map = {};
  DEFAULT_CATEGORIES.forEach((cat) => {
    if (cat.type === 'saida') {
      map[cat.id] = cat.defaultLimit;
    }
  });
  return map;
}
