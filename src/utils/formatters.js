const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value, hidden = false) {
  if (hidden) return 'R$ ••••';
  return brlFormatter.format(Number(value) || 0);
}

/**
 * Formata um número digitado (ou centavos) em máscara brasileira "1.234,56"
 */
export function formatCurrencyInput(rawDigits) {
  const digits = String(rawDigits || '').replace(/\D/g, '');
  if (!digits) return '';
  const cents = parseInt(digits, 10);
  if (Number.isNaN(cents)) return '';
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Converte string formatada "1.234,56" ou "1234.56" em número float
 */
export function parseCurrencyInput(formattedValue) {
  if (typeof formattedValue === 'number') return formattedValue;
  const str = String(formattedValue || '').trim();
  if (!str) return 0;
  if (str.includes(',')) {
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }
  return parseFloat(str) || 0;
}

export function numberToCurrencyInput(num) {
  const val = Number(num) || 0;
  if (val <= 0) return '';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata data e hora conforme preferência do usuário:
 * - 'relative': "Hoje", "Ontem", "Seg, 16 de nov."
 * - 'short': "16 de nov. de 2026"
 * - 'numeric': "16/11/2026"
 */
export function formatFriendlyDate(isoDate, formatStyle = 'relative') {
  if (!isoDate) return '';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3) return isoDate;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);

  if (formatStyle === 'numeric') {
    const d = String(parts[2]).padStart(2, '0');
    const m = String(parts[1]).padStart(2, '0');
    return `${d}/${m}/${parts[0]}`;
  }

  if (formatStyle === 'short') {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // 'relative' (padrão Nubank)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;

  if (isoDate === todayStr) return 'Hoje';
  if (isoDate === yestStr) return 'Ontem';

  const weekday = date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '');
  const dayMonth = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
  const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capWeekday}, ${dayMonth}`;
}

export function formatTimeDisplay(timeStr) {
  if (!timeStr) return '';
  return `${timeStr}h`;
}

export function formatMonthLabel(yearMonth) {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const str = date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function shiftYearMonth(yearMonth, deltaMonths) {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + deltaMonths, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function transactionsToCSV(transactions) {
  const headers = ['id', 'date', 'time', 'description', 'category', 'type', 'amount', 'method', 'notes'];
  const escapeCell = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const rows = transactions.map((tx) => headers.map((h) => escapeCell(tx[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function parseCSVToTransactions(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const imported = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });

    const amount = parseFloat(String(row.amount || '0').replace(',', '.'));
    if (!row.description || Number.isNaN(amount) || amount <= 0) continue;

    imported.push({
      id: row.id || `tx-${Date.now()}-${i}`,
      date: /^\d{4}-\d{2}-\d{2}$/.test(row.date)
        ? row.date
        : new Date().toISOString().slice(0, 10),
      time: /^\d{2}:\d{2}$/.test(row.time) ? row.time : '12:00',
      description: row.description,
      category: row.category || 'mercado',
      type: row.type === 'income' ? 'income' : 'expense',
      amount,
      method: row.method || 'pix',
      notes: row.notes || '',
    });
  }

  return imported;
}
