import React from 'react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/constants';
import { formatCurrency, formatFriendlyDate } from '../utils/formatters';

export function TransactionLedger({
  transactions,
  hideValues,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onDeleteTransaction,
  onEditTransaction,
  onOpenNewModal,
}) {
  const categoryMap = Object.fromEntries(
    DEFAULT_CATEGORIES.map((c) => [c.id, c])
  );
  const methodMap = Object.fromEntries(
    PAYMENT_METHODS.map((m) => [m.id, m.label])
  );

  return (
    <section className="nu-card nu-list-card">
      <div className="nu-list-header">
        <div>
          <h2 className="nu-section-title">Histórico de movimentações</h2>
          <p className="nu-section-sub">
            Tudo o que entrou e saiu neste mês
          </p>
        </div>

        <div className="nu-list-filters">
          <input
            type="text"
            className="nu-search-input"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <div className="nu-pill-tabs">
            <button
              type="button"
              className={typeFilter === 'all' ? 'active' : ''}
              onClick={() => onTypeFilterChange('all')}
            >
              Tudo
            </button>
            <button
              type="button"
              className={typeFilter === 'expense' ? 'active' : ''}
              onClick={() => onTypeFilterChange('expense')}
            >
              Saídas
            </button>
            <button
              type="button"
              className={typeFilter === 'income' ? 'active' : ''}
              onClick={() => onTypeFilterChange('income')}
            >
              Entradas
            </button>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="nu-empty-box">
          <p className="nu-empty-title">Nenhuma movimentação registrada ainda</p>
          <p className="nu-empty-desc">
            Comece adicionando suas contas, compras ou seu salário do mês.
          </p>
          <button
            type="button"
            className="nu-btn-dark"
            onClick={() => onOpenNewModal('expense')}
          >
            + Adicionar primeiro lançamento
          </button>
        </div>
      ) : (
        <ul className="nu-tx-list">
          {transactions.map((tx) => {
            const cat = categoryMap[tx.category] || { label: tx.category };
            const isIncome = tx.type === 'income';

            return (
              <li key={tx.id} className="nu-tx-item">
                <div className="nu-tx-left">
                  <div
                    className={`nu-tx-icon ${
                      isIncome ? 'icon-income' : 'icon-expense'
                    }`}
                  >
                    {isIncome ? '↓' : '↑'}
                  </div>
                  <div className="nu-tx-info">
                    <strong className="nu-tx-title">{tx.description}</strong>
                    <span className="nu-tx-meta">
                      {cat.label} · {methodMap[tx.method] || tx.method}
                      {tx.notes ? ` · ${tx.notes}` : ''}
                    </span>
                  </div>
                </div>

                <div className="nu-tx-right">
                  <div className="nu-tx-amount-col">
                    <strong
                      className={`nu-tx-amount ${
                        isIncome ? 'amount-positive' : ''
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      {formatCurrency(tx.amount, hideValues)}
                    </strong>
                    <span className="nu-tx-date">
                      {formatFriendlyDate(tx.date)}
                    </span>
                  </div>

                  <div className="nu-tx-actions">
                    <button
                      type="button"
                      className="nu-text-btn"
                      onClick={() => onEditTransaction(tx)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="nu-text-btn btn-del"
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Excluir"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
