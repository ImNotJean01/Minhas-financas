import React, { useState, useEffect, useRef } from 'react';

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onExportCSV,
  onExportJSON,
  onImportFile,
  onClearAllData,
}) {
  const [name, setName] = useState('');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState('');
  const [savingsBox, setSavingsBox] = useState('');
  const [creditCardLimit, setCreditCardLimit] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Jean');
      setMonthlyIncomeGoal(String(profile.monthlyIncomeGoal ?? 0));
      setSavingsBox(String(profile.savingsBox ?? 0));
      setCreditCardLimit(String(profile.creditCardLimit ?? 2500));
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'Jean',
      monthlyIncomeGoal: parseFloat(monthlyIncomeGoal) || 0,
      savingsBox: parseFloat(savingsBox) || 0,
      creditCardLimit: parseFloat(creditCardLimit) || 0,
    });
    onClose();
  };

  return (
    <div className="nu-modal-backdrop" onClick={onClose}>
      <div
        className="nu-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="nu-modal-top">
          <h3>Minhas informações</h3>
          <button type="button" className="nu-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nu-form">
          <div className="nu-field">
            <label>Seu nome (exibido no topo)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jean"
              required
            />
          </div>

          <div className="nu-field">
            <label>Sua renda fixa / salário mensal (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monthlyIncomeGoal}
              onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
              placeholder="0,00"
            />
            <small className="nu-field-hint">
              Se você ainda não tiver lançado entradas no mês, usamos esse valor para calcular seu saldo.
            </small>
          </div>

          <div className="nu-row-2">
            <div className="nu-field">
              <label>Dinheiro guardado / Caixinha (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={savingsBox}
                onChange={(e) => setSavingsBox(e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="nu-field">
              <label>Limite do cartão de crédito (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={creditCardLimit}
                onChange={(e) => setCreditCardLimit(e.target.value)}
                placeholder="2500,00"
              />
            </div>
          </div>

          <div className="nu-data-box">
            <span className="nu-data-title">Backup e dados</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onImportFile(file);
                  e.target.value = '';
                }
              }}
            />
            <div className="nu-data-buttons">
              <button
                type="button"
                className="nu-btn-light"
                onClick={() => fileInputRef.current?.click()}
              >
                Importar CSV/JSON
              </button>
              <button type="button" className="nu-btn-light" onClick={onExportCSV}>
                Baixar CSV
              </button>
              <button type="button" className="nu-btn-light" onClick={onExportJSON}>
                Backup JSON
              </button>
              <button
                type="button"
                className="nu-btn-danger-outline"
                onClick={onClearAllData}
              >
                Zerar lançamentos
              </button>
            </div>
          </div>

          <div className="nu-modal-actions">
            <button type="button" className="nu-btn-light" onClick={onClose}>
              Fechar
            </button>
            <button type="submit" className="nu-btn-dark">
              Salvar meus dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
