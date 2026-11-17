import React, { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../data/constants';
import { formatCurrency } from '../utils/formatters';

export function BudgetPanel({
  transactions,
  budgets,
  hideValues,
  onUpdateBudget,
}) {
  const [editingCatId, setEditingCatId] = useState(null);
  const [draftLimit, setDraftLimit] = useState('');

  const expenseCategories = DEFAULT_CATEGORIES.filter(
    (c) => c.type === 'expense'
  );

  const spentByCategory = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      spentByCategory[tx.category] =
        (spentByCategory[tx.category] || 0) + Number(tx.amount);
    }
  });

  const commitEdit = (catId) => {
    const parsed = parseFloat(draftLimit.replace(',', '.'));
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(catId, parsed);
    }
    setEditingCatId(null);
  };

  return (
    <section className="nu-card nu-list-card">
      <div className="nu-list-header">
        <div>
          <h2 className="nu-section-title">Meus limites por categoria</h2>
          <p className="nu-section-sub">
            Clique no valor limite de qualquer categoria para ajustar sua meta
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
                    type="number"
                    className="nu-inline-input"
                    value={draftLimit}
                    autoFocus
                    onChange={(e) => setDraftLimit(e.target.value)}
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
                      setDraftLimit(String(limit));
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
                <span>Gasto: {formatCurrency(spent, hideValues)}</span>
                <span className={isOver ? 'text-over' : ''}>
                  {isOver
                    ? `Passou ${formatCurrency(spent - limit, hideValues)}`
                    : `Disponível ${formatCurrency(
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
