import React from 'react';
import {
  formatCurrency,
  formatFriendlyDate,
  formatTimeDisplay,
} from '../utils/formatters';

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
  // Agrupa transações por data local (YYYY-MM-DD)
  const groupedByDate = [];
  transactions.forEach((tx) => {
    const lastGroup = groupedByDate[groupedByDate.length - 1];
    if (!lastGroup || lastGroup.date !== tx.date) {
      groupedByDate.push({
        date: tx.date,
        items: [tx],
      });
    } else {
      lastGroup.items.push(tx);
    }
  });

  return (
    <section className="nu-card nu-list-card">
      <div className="nu-list-header">
        <div>
          <h2 className="nu-section-title">Histórico de movimentações</h2>
          <p className="nu-section-sub">
            Acompanhe cada recebimento e saída sincronizados na sua conta
          </p>
        </div>

        <div className="nu-list-filters">
          <input
            type="text"
            className="nu-search-input"
            placeholder="Buscar descrição..."
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
              className={typeFilter === 'recebimento' ? 'active' : ''}
              onClick={() => onTypeFilterChange('recebimento')}
            >
              Recebimentos
            </button>
            <button
              type="button"
              className={typeFilter === 'saida' ? 'active' : ''}
              onClick={() => onTypeFilterChange('saida')}
            >
              Saídas
            </button>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="nu-empty-box">
          <p className="nu-empty-title">Nenhuma movimentação registrada ainda</p>
          <p className="nu-empty-desc">
            Registre seus recebimentos (salário, pix, renda extra) ou suas saídas do mês.
          </p>
          <div className="nu-empty-actions">
            <button
              type="button"
              className="nu-btn-income"
              onClick={() => onOpenNewModal('recebimento')}
            >
              + Registrar recebimento
            </button>
            <button
              type="button"
              className="nu-btn-dark"
              onClick={() => onOpenNewModal('saida')}
            >
              - Registrar saída
            </button>
          </div>
        </div>
      ) : (
        <div className="nu-date-groups">
          {groupedByDate.map((group) => {
            const dayNet = group.items.reduce(
              (acc, t) =>
                acc +
                (t.tipo === 'recebimento'
                  ? Number(t.valor)
                  : -Number(t.valor)),
              0
            );

            return (
              <div key={group.date} className="nu-date-group">
                <div className="nu-date-group-header">
                  <span className="nu-date-group-title">
                    {formatFriendlyDate(group.date, 'relative')}
                  </span>
                  <span className="nu-date-group-sum">
                    Saldo do dia:{' '}
                    <strong className={dayNet >= 0 ? 'amount-positive' : ''}>
                      {dayNet >= 0 ? '+ ' : '- '}
                      {formatCurrency(Math.abs(dayNet), hideValues)}
                    </strong>
                  </span>
                </div>

                <ul className="nu-tx-list">
                  {group.items.map((tx) => {
                    const isIncome = tx.tipo === 'recebimento';

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
                            <div className="nu-tx-title-row">
                              <strong className="nu-tx-title">
                                {tx.descricao}
                              </strong>
                              <span
                                className={`nu-type-pill ${
                                  isIncome ? 'pill-in' : 'pill-out'
                                }`}
                              >
                                {isIncome ? 'Recebimento' : 'Saída'}
                              </span>
                            </div>
                            <span className="nu-tx-meta">
                              {tx.categoria || 'Geral'}
                            </span>
                          </div>
                        </div>

                        <div className="nu-tx-right">
                          <div className="nu-tx-amount-col">
                            <strong
                              className={`nu-tx-amount ${
                                isIncome ? 'amount-positive' : 'amount-expense'
                              }`}
                            >
                              {isIncome ? '+ ' : '- '}
                              {formatCurrency(tx.valor, hideValues)}
                            </strong>
                            <span className="nu-tx-datetime">
                              <span>
                                {formatFriendlyDate(tx.date, 'numeric')}
                              </span>
                              {tx.time && (
                                <>
                                  <span className="nu-dot-sep">·</span>
                                  <span className="nu-tx-time-badge">
                                    {formatTimeDisplay(tx.time)}
                                  </span>
                                </>
                              )}
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
