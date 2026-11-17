import React, { useState, useEffect } from 'react';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  numberToCurrencyInput,
} from '../utils/formatters';

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) {
  const [faturaFormatted, setFaturaFormatted] = useState('');
  const [cardLimitFormatted, setCardLimitFormatted] = useState('');
  const [savingsFormatted, setSavingsFormatted] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFaturaFormatted(numberToCurrencyInput(profile.fatura_atual));
      setCardLimitFormatted(
        numberToCurrencyInput(profile.limite_cartao ?? 2500)
      );
      setSavingsFormatted(numberToCurrencyInput(profile.saldo_caixinha));
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile({
        fatura_atual: parseCurrencyInput(faturaFormatted),
        limite_cartao: parseCurrencyInput(cardLimitFormatted),
        saldo_caixinha: parseCurrencyInput(savingsFormatted),
      });
      onClose();
    } finally {
      setSaving(false);
    }
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
          <h3>Cartão de crédito e Caixinha</h3>
          <button type="button" className="nu-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nu-form">
          <div className="nu-row-2">
            <div className="nu-field">
              <label>Fatura atual do cartão (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                value={faturaFormatted}
                onChange={(e) =>
                  setFaturaFormatted(formatCurrencyInput(e.target.value))
                }
                placeholder="0,00"
              />
            </div>

            <div className="nu-field">
              <label>Limite total do cartão (R$)</label>
              <input
                type="text"
                inputMode="numeric"
                value={cardLimitFormatted}
                onChange={(e) =>
                  setCardLimitFormatted(formatCurrencyInput(e.target.value))
                }
                placeholder="2.500,00"
              />
            </div>
          </div>

          <div className="nu-field">
            <label>Dinheiro guardado na Caixinha / Reserva pessoal (R$)</label>
            <input
              type="text"
              inputMode="numeric"
              value={savingsFormatted}
              onChange={(e) =>
                setSavingsFormatted(formatCurrencyInput(e.target.value))
              }
              placeholder="0,00"
            />
          </div>

          <div className="nu-modal-actions">
            <button type="button" className="nu-btn-light" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="nu-btn-dark">
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
