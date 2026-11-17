import React, { useState, useEffect, useRef } from 'react';
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
  onExportCSV,
  onExportJSON,
  onImportFile,
  onClearAllData,
}) {
  const [name, setName] = useState('');
  const [monthlyIncomeFormatted, setMonthlyIncomeFormatted] = useState('');
  const [savingsFormatted, setSavingsFormatted] = useState('');
  const [cardLimitFormatted, setCardLimitFormatted] = useState('');
  const [dateFormat, setDateFormat] = useState('relative');
  const [showTime, setShowTime] = useState(true);
  const [numberScale, setNumberScale] = useState('comfortable');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name || 'Jean');
      setMonthlyIncomeFormatted(
        numberToCurrencyInput(profile.monthlyIncomeGoal)
      );
      setSavingsFormatted(numberToCurrencyInput(profile.savingsBox));
      setCardLimitFormatted(
        numberToCurrencyInput(profile.creditCardLimit ?? 2500)
      );
      setDateFormat(profile.dateFormat || 'relative');
      setShowTime(profile.showTime !== false);
      setNumberScale(profile.numberScale || 'comfortable');
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'Jean',
      monthlyIncomeGoal: parseCurrencyInput(monthlyIncomeFormatted),
      savingsBox: parseCurrencyInput(savingsFormatted),
      creditCardLimit: parseCurrencyInput(cardLimitFormatted),
      dateFormat,
      showTime,
      numberScale,
    });
    onClose();
  };

  return (
    <div className="nu-modal-backdrop" onClick={onClose}>
      <div
        className="nu-modal-sheet nu-modal-sheet-wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="nu-modal-top">
          <h3>Meus dados e formato dos números</h3>
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
              type="text"
              inputMode="numeric"
              value={monthlyIncomeFormatted}
              onChange={(e) =>
                setMonthlyIncomeFormatted(formatCurrencyInput(e.target.value))
              }
              placeholder="0,00"
            />
            <small className="nu-field-hint">
              Digite os números normalmente (ex: 350000 vira 3.500,00).
            </small>
          </div>

          <div className="nu-row-2">
            <div className="nu-field">
              <label>Dinheiro guardado / Caixinha (R$)</label>
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

            <div className="nu-field">
              <label>Limite do cartão de crédito (R$)</label>
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

          {/* Preferências de Datas, Horas e Tamanho dos Números */}
          <div className="nu-prefs-box">
            <span className="nu-data-title">
              Aparência de datas, horas e números
            </span>

            <div className="nu-row-2">
              <div className="nu-field">
                <label>Modelo de data</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="relative">
                    Inteligente (Hoje, Ontem, Seg, 17 nov)
                  </option>
                  <option value="numeric">Numérico (17/11/2026)</option>
                  <option value="short">Por extenso (17 de nov. de 2026)</option>
                </select>
              </div>

              <div className="nu-field">
                <label>Tamanho dos números</label>
                <select
                  value={numberScale}
                  onChange={(e) => setNumberScale(e.target.value)}
                >
                  <option value="normal">Compacto</option>
                  <option value="comfortable">Médio (Recomendado)</option>
                  <option value="large">Grande e bem aparente</option>
                </select>
              </div>
            </div>

            <label className="nu-checkbox-row">
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => setShowTime(e.target.checked)}
              />
              <span>Mostrar o horário (ex: 14:30h) em cada movimentação</span>
            </label>
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
              <button
                type="button"
                className="nu-btn-light"
                onClick={onExportCSV}
              >
                Baixar CSV
              </button>
              <button
                type="button"
                className="nu-btn-light"
                onClick={onExportJSON}
              >
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
              Salvar configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
