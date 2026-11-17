import React, { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../data/constants';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  numberToCurrencyInput,
} from '../utils/formatters';

export function BudgetPanel({
  transactions,
  budgets,
  hideValues,
  onUpdateBudget,
  onRemoveBudget,
}) {
  const [editingCatId, setEditingCatId] = useState(null);
  const [draftFormatted, setDraftFormatted] = useState('');

  const expenseCategories = DEFAULT_CATEGORIES.filter(
    (c) => c.type === 'saida'
  );

  const spentByCategory = {};
  transactions.forEach((tx) => {
    if (tx.tipo === 'saida') {
      const catKey = tx.categoria || 'Geral';
      spentByCategory[catKey] =
        (spentByCategory[catKey] || 0) + Number(tx.valor);
    }
  });

  const commitEdit = (catId) => {
    const parsed = parseCurrencyInput(draftFormatted);
    if (parsed > 0) {
      onUpdateBudget(catId, parsed);
    } else if (parsed === 0 && onRemoveBudget) {
      onRemoveBudget(catId);
    }
    setEditingCatId(null);
  };

  return (
    <section className="nu-card nu-list-card">
      <div className="nu-list-header">
        <div>
          <h2 className="nu-section-title">Limites por categoria</h2>
          <p className="nu-section-sub">
            Clique no valor da meta de qualquer categoria para ajustar seu limite mensal
          </p>
        </div>
      </div>

      <div className="nu-budget-grid">
        {expenseCategories.map((cat) => {
          const spent = spentByCategory[cat.id] || 0;
          const limit = Number(budgets[cat.id] ?? cat.defaultLimit);
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = limit > 0 && spent > limit;

          return (
            <div key={cat.id} className="nu-budget-card">
              <div className="nu-budget-top">
                <strong className="nu-budget-name">{cat.label}</strong>
                {editingCatId === cat.id ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="nu-inline-input"
                    value={draftFormatted}
                    placeholder="0,00"
                    autoFocus
                    onChange={(e) =>
                      setDraftFormatted(formatCurrencyInput(e.target.value))
                    }
                    onBlur={() => commitEdit(cat.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(cat.id);
                      if (e.key === 'Escape') setEditingCatId(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="nu-limit-edit-btn"
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setDraftFormatted(numberToCurrencyInput(limit));
                    }}
                  >
                    Meta: {formatCurrency(limit, hideValues)} ✎
                  </button>
                )}
              </div>

              <div className="nu-progress-track">
                <div
                  className={`nu-progress-fill ${isOver ? 'fill-over' : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="nu-budget-foot">
                <span>
                  Saídas: <strong>{formatCurrency(spent, hideValues)}</strong>
                </span>
                <span className={isOver ? 'text-over' : ''}>
                  {isOver
                    ? `Passou ${formatCurrency(spent - limit, hideValues)}`
                    : `Livre ${formatCurrency(
                        Math.max(0, limit - spent),
                        hideValues
                      )}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
