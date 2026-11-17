import React, { useState, useEffect } from 'react';
import { formatMonthLabel, shiftYearMonth } from '../utils/formatters';

export function HeaderBar({
  userName,
  hideValues,
  onToggleHideValues,
  onOpenSettingsModal,
  onLogout,
  selectedMonth,
  onSelectMonth,
  onOpenNewModal,
}) {
  const [liveClock, setLiveClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const displayName = userName || 'Jean';
  const initials = displayName
    .trim()
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currentDayStr = liveClock.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
  const currentTimeStr = liveClock.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="nu-header">
      <div className="nu-header-inner">
        <div className="nu-user-row">
          <div className="nu-user-left">
            <div className="nu-avatar" aria-hidden="true">
              {initials}
            </div>
            <div>
              <div className="nu-greeting-line">
                <h1 className="nu-greeting">Olá, {displayName}</h1>
                <span className="nu-live-clock" title="Data e horário atuais">
                  {currentDayStr} · {currentTimeStr}
                </span>
              </div>
            </div>
          </div>

          <div className="nu-header-actions">
            <button
              type="button"
              className="nu-circle-btn"
              onClick={onToggleHideValues}
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
              aria-label="Alternar visibilidade dos valores"
            >
              {hideValues ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="nu-circle-btn"
              onClick={onOpenSettingsModal}
              title="Configurações de Cartão e Caixinha"
              aria-label="Configurações"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            <button
              type="button"
              className="nu-logout-btn"
              onClick={onLogout}
              title="Sair da conta"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="nu-subbar">
          <div className="nu-month-pill">
            <button
              type="button"
              onClick={() => onSelectMonth(shiftYearMonth(selectedMonth, -1))}
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              ‹
            </button>
            <span>{formatMonthLabel(selectedMonth)}</span>
            <button
              type="button"
              onClick={() => onSelectMonth(shiftYearMonth(selectedMonth, 1))}
              aria-label="Próximo mês"
              title="Próximo mês"
            >
              ›
            </button>
          </div>

          <div className="nu-top-cta-group">
            <button
              type="button"
              className="nu-new-btn nu-new-income-btn"
              onClick={() => onOpenNewModal('recebimento')}
            >
              + Recebimento
            </button>
            <button
              type="button"
              className="nu-new-btn"
              onClick={() => onOpenNewModal('saida')}
            >
              - Nova saída
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
