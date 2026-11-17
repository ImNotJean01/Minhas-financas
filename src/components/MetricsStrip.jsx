import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function MetricsStrip({
  income,
  expense,
  creditCardSpent,
  profile,
  onOpenNewModal,
  onOpenProfileModal,
}) {
  const hide = profile.hideValues;
  const baseIncome = income > 0 ? income : Number(profile.monthlyIncomeGoal) || 0;
  const balance = baseIncome - expense;
  const cardLimit = Number(profile.creditCardLimit) || 0;
  const availableCard = Math.max(0, cardLimit - creditCardSpent);

  return (
    <section className="nu-summary-section">
      {/* Card Principal: Conta */}
      <div className="nu-card nu-account-card">
        <div className="nu-card-top">
          <span className="nu-card-label">Saldo disponível no mês</span>
          {income === 0 && profile.monthlyIncomeGoal > 0 && (
            <span className="nu-subtle-badge">Baseado na sua renda fixa</span>
          )}
        </div>

        <div className="nu-balance-value">
          {formatCurrency(balance, hide)}
        </div>

        <div className="nu-income-expense-row">
          <div className="nu-mini-stat">
            <span className="nu-mini-dot dot-in" />
            <div>
              <span className="nu-mini-label">Entradas</span>
              <strong className="nu-mini-val">
                {formatCurrency(baseIncome, hide)}
              </strong>
            </div>
          </div>

          <div className="nu-mini-stat">
            <span className="nu-mini-dot dot-out" />
            <div>
              <span className="nu-mini-label">Saídas</span>
              <strong className="nu-mini-val">
                {formatCurrency(expense, hide)}
              </strong>
            </div>
          </div>
        </div>

        {/* Atalhos circulares estilo Nubank */}
        <div className="nu-quick-actions">
          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('expense')}
          >
            <span className="nu-action-icon">↑</span>
            <span className="nu-action-text">Registrar gasto</span>
          </button>

          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('income')}
          >
            <span className="nu-action-icon">↓</span>
            <span className="nu-action-text">Receber valor</span>
          </button>

          <button
            type="button"
            className="nu-action-item"
            onClick={onOpenProfileModal}
          >
            <span className="nu-action-icon">◎</span>
            <span className="nu-action-text">Caixinha / Renda</span>
          </button>
        </div>
      </div>

      {/* Cards Secundários: Cartão de Crédito + Caixinha */}
      <div className="nu-side-cards">
        <div className="nu-card nu-compact-card" onClick={onOpenProfileModal} role="button" tabIndex={0}>
          <div className="nu-card-top">
            <span className="nu-card-label">Cartão de crédito</span>
            <span className="nu-chevron">›</span>
          </div>
          <span className="nu-card-sub">Fatura atual</span>
          <strong className="nu-secondary-value">
            {formatCurrency(creditCardSpent, hide)}
          </strong>
          <span className="nu-card-foot">
            Limite disponível de {formatCurrency(availableCard, hide)}
          </span>
        </div>

        <div className="nu-card nu-compact-card" onClick={onOpenProfileModal} role="button" tabIndex={0}>
          <div className="nu-card-top">
            <span className="nu-card-label">Dinheiro guardado (Caixinha)</span>
            <span className="nu-chevron">›</span>
          </div>
          <span className="nu-card-sub">Reserva pessoal</span>
          <strong className="nu-secondary-value">
            {formatCurrency(profile.savingsBox || 0, hide)}
          </strong>
          <span className="nu-card-foot">
            Clique para atualizar seu saldo guardado
          </span>
        </div>
      </div>
    </section>
  );
}
