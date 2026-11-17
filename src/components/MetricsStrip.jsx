import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function MetricsStrip({
  income,
  expense,
  incomeCount,
  expenseCount,
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
      {/* Card Principal: Conta e Números de Recebimento / Saída */}
      <div className="nu-card nu-account-card">
        <div className="nu-card-top">
          <span className="nu-card-label">Saldo disponível no mês</span>
          {income === 0 && profile.monthlyIncomeGoal > 0 && (
            <span className="nu-subtle-badge">Baseado na sua renda fixa</span>
          )}
        </div>

        <div
          className={`nu-balance-value ${
            balance < 0 ? 'balance-negative' : ''
          }`}
        >
          {formatCurrency(balance, hide)}
        </div>

        {/* Blocos destacados de Recebimentos (Entradas) e Saídas (Gastos) */}
        <div className="nu-flow-cards">
          <div
            className="nu-flow-box flow-income"
            onClick={() => onOpenNewModal('income')}
            role="button"
            tabIndex={0}
            title="Clique para adicionar um recebimento"
          >
            <div className="nu-flow-header">
              <span className="nu-flow-badge badge-in">↓ RECEBIMENTOS</span>
              <span className="nu-flow-count">{incomeCount} no mês</span>
            </div>
            <strong className="nu-flow-amount amount-in">
              + {formatCurrency(baseIncome, hide)}
            </strong>
          </div>

          <div
            className="nu-flow-box flow-expense"
            onClick={() => onOpenNewModal('expense')}
            role="button"
            tabIndex={0}
            title="Clique para registrar uma saída"
          >
            <div className="nu-flow-header">
              <span className="nu-flow-badge badge-out">↑ SAÍDAS</span>
              <span className="nu-flow-count">{expenseCount} no mês</span>
            </div>
            <strong className="nu-flow-amount amount-out">
              - {formatCurrency(expense, hide)}
            </strong>
          </div>
        </div>

        {/* Atalhos circulares estilo Nubank */}
        <div className="nu-quick-actions">
          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('income')}
          >
            <span className="nu-action-icon icon-action-in">↓</span>
            <span className="nu-action-text">Novo recebimento</span>
          </button>

          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('expense')}
          >
            <span className="nu-action-icon icon-action-out">↑</span>
            <span className="nu-action-text">Nova saída</span>
          </button>

          <button
            type="button"
            className="nu-action-item"
            onClick={onOpenProfileModal}
          >
            <span className="nu-action-icon">◎</span>
            <span className="nu-action-text">Ajustar formatos</span>
          </button>
        </div>
      </div>

      {/* Cards Secundários: Cartão de Crédito + Caixinha */}
      <div className="nu-side-cards">
        <div
          className="nu-card nu-compact-card"
          onClick={onOpenProfileModal}
          role="button"
          tabIndex={0}
        >
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

        <div
          className="nu-card nu-compact-card"
          onClick={onOpenProfileModal}
          role="button"
          tabIndex={0}
        >
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
