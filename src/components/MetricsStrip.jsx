import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function MetricsStrip({
  income,
  expense,
  incomeCount,
  expenseCount,
  profile,
  hideValues,
  onOpenNewModal,
  onOpenSettingsModal,
}) {
  const balance = income - expense;
  const faturaAtual = Number(profile.fatura_atual) || 0;
  const cardLimit = Number(profile.limite_cartao ?? 2500);
  const availableCard = Math.max(0, cardLimit - faturaAtual);
  const saldoCaixinha = Number(profile.saldo_caixinha) || 0;

  return (
    <section className="nu-summary-section">
      {/* Card Principal: Saldo disponível no mês */}
      <div className="nu-card nu-account-card">
        <div className="nu-card-top">
          <span className="nu-card-label">Saldo disponível no mês</span>
        </div>

        <div
          className={`nu-balance-value ${
            balance < 0 ? 'balance-negative' : ''
          }`}
        >
          {formatCurrency(balance, hideValues)}
        </div>

        {/* Subcards RECEBIMENTOS e SAÍDAS */}
        <div className="nu-flow-cards">
          <div
            className="nu-flow-box flow-income"
            onClick={() => onOpenNewModal('recebimento')}
            role="button"
            tabIndex={0}
            title="Clique para adicionar um recebimento"
          >
            <div className="nu-flow-header">
              <span className="nu-flow-badge badge-in">↓ RECEBIMENTOS</span>
              <span className="nu-flow-count">{incomeCount} no mês</span>
            </div>
            <strong className="nu-flow-amount amount-in">
              + {formatCurrency(income, hideValues)}
            </strong>
          </div>

          <div
            className="nu-flow-box flow-expense"
            onClick={() => onOpenNewModal('saida')}
            role="button"
            tabIndex={0}
            title="Clique para registrar uma saída"
          >
            <div className="nu-flow-header">
              <span className="nu-flow-badge badge-out">↑ SAÍDAS</span>
              <span className="nu-flow-count">{expenseCount} no mês</span>
            </div>
            <strong className="nu-flow-amount amount-out">
              - {formatCurrency(expense, hideValues)}
            </strong>
          </div>
        </div>

        {/* Atalhos funcionais: apenas Novo recebimento e Nova saída */}
        <div className="nu-quick-actions">
          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('recebimento')}
          >
            <span className="nu-action-icon icon-action-in">↓</span>
            <span className="nu-action-text">Novo recebimento</span>
          </button>

          <button
            type="button"
            className="nu-action-item"
            onClick={() => onOpenNewModal('saida')}
          >
            <span className="nu-action-icon icon-action-out">↑</span>
            <span className="nu-action-text">Nova saída</span>
          </button>
        </div>
      </div>

      {/* Cards Secundários: Cartão de Crédito + Caixinha */}
      <div className="nu-side-cards">
        <div
          className="nu-card nu-compact-card"
          onClick={() => onOpenSettingsModal('cartao')}
          role="button"
          tabIndex={0}
        >
          <div className="nu-card-top">
            <span className="nu-card-label">Cartão de crédito</span>
            <span className="nu-chevron">›</span>
          </div>
          <span className="nu-card-sub">Fatura atual</span>
          <strong className="nu-secondary-value">
            {formatCurrency(faturaAtual, hideValues)}
          </strong>
          <span className="nu-card-foot">
            Limite disponível de {formatCurrency(availableCard, hideValues)}
          </span>
        </div>

        <div
          className="nu-card nu-compact-card"
          onClick={() => onOpenSettingsModal('caixinha')}
          role="button"
          tabIndex={0}
        >
          <div className="nu-card-top">
            <span className="nu-card-label">Dinheiro guardado (Caixinha)</span>
            <span className="nu-chevron">›</span>
          </div>
          <span className="nu-card-sub">Reserva pessoal</span>
          <strong className="nu-secondary-value">
            {formatCurrency(saldoCaixinha, hideValues)}
          </strong>
          <span className="nu-card-foot">
            Clique para atualizar seu saldo guardado
          </span>
        </div>
      </div>
    </section>
  );
}
