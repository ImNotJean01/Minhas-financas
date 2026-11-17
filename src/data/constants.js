export const DEFAULT_CATEGORIES = [
  { id: 'moradia', label: 'Moradia', type: 'expense', defaultLimit: 1800 },
  { id: 'mercado', label: 'Mercado', type: 'expense', defaultLimit: 900 },
  { id: 'alimentacao', label: 'Restaurantes & Delivery', type: 'expense', defaultLimit: 450 },
  { id: 'transporte', label: 'Transporte', type: 'expense', defaultLimit: 400 },
  { id: 'assinaturas', label: 'Assinaturas & Contas', type: 'expense', defaultLimit: 250 },
  { id: 'saude', label: 'Saúde & Farmácia', type: 'expense', defaultLimit: 300 },
  { id: 'lazer', label: 'Lazer & Compras', type: 'expense', defaultLimit: 500 },
  { id: 'outros_saida', label: 'Outros gastos', type: 'expense', defaultLimit: 300 },
  { id: 'salario', label: 'Salário', type: 'income', defaultLimit: 0 },
  { id: 'extra', label: 'Renda Extra / Freelance', type: 'income', defaultLimit: 0 },
  { id: 'rendimentos', label: 'Rendimentos', type: 'income', defaultLimit: 0 },
];

export const PAYMENT_METHODS = [
  { id: 'pix', label: 'Pix' },
  { id: 'credito', label: 'Cartão de crédito' },
  { id: 'debito', label: 'Cartão de débito' },
  { id: 'boleto', label: 'Boleto / Conta' },
  { id: 'dinheiro', label: 'Dinheiro' },
];

export function getCurrentYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function generateDefaultProfile() {
  return {
    name: 'Jean',
    monthlyIncomeGoal: 0,
    savingsBox: 0,
    creditCardLimit: 2500,
    hideValues: false,
  };
}

export function generateDefaultBudgets() {
  const map = {};
  DEFAULT_CATEGORIES.forEach((cat) => {
    if (cat.type === 'expense') {
      map[cat.id] = cat.defaultLimit;
    }
  });
  return map;
}
