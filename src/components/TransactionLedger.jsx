import React from 'react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/constants';
import {
  formatCurrency,
  formatFriendlyDate,
  formatTimeDisplay,
} from '../utils/formatters';

export function TransactionLedger({
  transactions,
  profile,
  onUpdateProfile,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onDeleteTransaction,
  onEditTransaction,
  onOpenNewModal,
}) {
  const hideValues = profile.hideValues;
  const dateFormat = profile.dateFormat || 'relative';
  const showTime = profile.showTime !== false;
  const numberScale = profile.numberScale || 'comfortable';

  const categoryMap = Object.fromEntries(
    DEFAULT_CATEGORIES.map((c) => [c.id, c])
  );
  const methodMap = Object.fromEntries(
    PAYMENT_METHODS.map((m) => [m.id, m.label])
  );

  // Agrupa transações por data para leitura muito mais clara
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

  const cycleDateFormat = () => {
    const order = ['relative', 'numeric', 'short'];
    const next = order[(order.indexOf(dateFormat) + 1) % order.length];
    onUpdateProfile({ ...profile, dateFormat: next });
  };

  const cycleNumberScale = () => {
    const order = ['normal', 'comfortable', 'large'];
    const next = order[(order.indexOf(numberScale) + 1) % order.length];
    onUpdateProfile({ ...profile, numberScale: next });
  };

  const dateFormatLabel =
    dateFormat === 'relative'
      ? 'Data: Hoje / Dia'
      : dateFormat === 'numeric'
      ? 'Data: 17/11/2026'
      : 'Data: 17 de nov.';

  const scaleLabel =
    numberScale === 'large'
      ? 'Números: Grandes'
      : numberScale === 'comfortable'
      ? 'Números: Médios'
      : 'Números: Compactos';

  return (
    <section className="nu-card nu-list-card">
      <div className="nu-list-header">
        <div>
          <h2 className="nu-section-title">Histórico de movimentações</h2>
          <p className="nu-section-sub">
            Acompanhe cada recebimento e saída com data e horário
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
              className={typeFilter === 'income' ? 'active' : ''}
              onClick={() => onTypeFilterChange('income')}
            >
              Recebimentos
            </button>
            <button
              type="button"
              className={typeFilter === 'expense' ? 'active' : ''}
              onClick={() => onTypeFilterChange('expense')}
            >
              Saídas
            </button>
          </div>
        </div>
      </div>

      {/* Barra rápida de ajuste de visualização (Datas, Horas e Tamanho dos Números) */}
      <div className="nu-display-bar">
        <span className="nu-display-bar-label">Visualização rápida:</span>
        <div className="nu-display-chips">
          <button
            type="button"
            className="nu-chip-btn"
            onClick={cycleDateFormat}
            title="Clique para alternar o modelo de data"
          >
            📅 {dateFormatLabel}
          </button>

          <button
            type="button"
            className={`nu-chip-btn ${showTime ? 'chip-active' : ''}`}
            onClick={() => onUpdateProfile({ ...profile, showTime: !showTime })}
            title="Mostrar ou ocultar o horário de cada lançamento"
          >
            🕒 {showTime ? 'Horário: Visível' : 'Horário: Oculto'}
          </button>

          <button
            type="button"
            className="nu-chip-btn"
            onClick={cycleNumberScale}
            title="Clique para ajustar o tamanho dos números"
          >
            🔢 {scaleLabel}
          </button>
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
              onClick={() => onOpenNewModal('income')}
            >
              + Registrar recebimento
            </button>
            <button
              type="button"
              className="nu-btn-dark"
              onClick={() => onOpenNewModal('expense')}
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
                acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
              0
            );

            return (
              <div key={group.date} className="nu-date-group">
                <div className="nu-date-group-header">
                  <span className="nu-date-group-title">
                    {formatFriendlyDate(group.date, dateFormat)}
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
                    const cat = categoryMap[tx.category] || {
                      label: tx.category,
                    };
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
                            <div className="nu-tx-title-row">
                              <strong className="nu-tx-title">
                                {tx.description}
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
                              {cat.label} · {methodMap[tx.method] || tx.method}
                              {tx.notes ? ` · ${tx.notes}` : ''}
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
                              {formatCurrency(tx.amount, hideValues)}
                            </strong>
                            <span className="nu-tx-datetime">
                              <span>
                                {formatFriendlyDate(tx.date, 'numeric')}
                              </span>
                              {showTime && tx.time && (
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
