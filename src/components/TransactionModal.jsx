import React, { useState, useEffect } from 'react';
import {
  DEFAULT_CATEGORIES,
  PAYMENT_METHODS,
  getCurrentTimeHHMM,
} from '../data/constants';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  numberToCurrencyInput,
} from '../utils/formatters';

const QUICK_ADD_VALUES = [10, 50, 100, 500];

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultMonth,
  initialType = 'expense',
}) {
  const [type, setType] = useState('expense');
  const [description, setDescription] = useState('');
  const [amountFormatted, setAmountFormatted] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('mercado');
  const [method, setMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountFormatted(numberToCurrencyInput(editingTransaction.amount));
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getCurrentTimeHHMM());
      setCategory(editingTransaction.category);
      setMethod(editingTransaction.method || 'pix');
      setNotes(editingTransaction.notes || '');
    } else {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`;
      const initialDate = today.startsWith(defaultMonth)
        ? today
        : `${defaultMonth}-01`;
      setType(initialType);
      setDescription('');
      setAmountFormatted('');
      setDate(initialDate);
      setTime(getCurrentTimeHHMM());
      setCategory(initialType === 'income' ? 'salario' : 'mercado');
      setMethod('pix');
      setNotes('');
    }
  }, [editingTransaction, defaultMonth, initialType, isOpen]);

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const handleTypeSwitch = (newType) => {
    setType(newType);
    const firstCat = DEFAULT_CATEGORIES.find((c) => c.type === newType);
    if (firstCat) setCategory(firstCat.id);
  };

  const handleAmountChange = (e) => {
    const masked = formatCurrencyInput(e.target.value);
    setAmountFormatted(masked);
  };

  const handleQuickAdd = (increment) => {
    const currentVal = parseCurrencyInput(amountFormatted);
    const nextVal = currentVal + increment;
    setAmountFormatted(numberToCurrencyInput(nextVal));
  };

  const setDateShortcut = (daysOffset) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`;
    setDate(iso);
    if (daysOffset === 0) {
      setTime(getCurrentTimeHHMM());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseCurrencyInput(amountFormatted);
    if (!description.trim() || numericAmount <= 0) {
      return;
    }

    onSave({
      id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`,
      type,
      description: description.trim(),
      amount: numericAmount,
      date,
      time: time || getCurrentTimeHHMM(),
      category,
      method,
      notes: notes.trim(),
    });
    onClose();
  };

  const isIncome = type === 'income';

  return (
    <div className="nu-modal-backdrop" onClick={onClose}>
      <div
        className="nu-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="nu-modal-top">
          <h3>
            {editingTransaction
              ? 'Editar lançamento'
              : isIncome
              ? 'Registrar recebimento'
              : 'Registrar saída'}
          </h3>
          <button type="button" className="nu-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nu-form">
          <div className="nu-segment">
            <button
              type="button"
              className={type === 'income' ? 'active-in' : ''}
              onClick={() => handleTypeSwitch('income')}
            >
              ↓ Recebimento (Entrada)
            </button>
            <button
              type="button"
              className={type === 'expense' ? 'active-out' : ''}
              onClick={() => handleTypeSwitch('expense')}
            >
              ↑ Saída (Gasto)
            </button>
          </div>

          <div
            className={`nu-amount-hero ${
              isIncome ? 'hero-income' : 'hero-expense'
            }`}
          >
            <label className="nu-hero-label">
              {isIncome ? 'Valor recebido' : 'Valor da saída'}
            </label>
            <div className="nu-currency-input-wrap">
              <span className="nu-currency-prefix">
                {isIncome ? '+ R$' : '- R$'}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                className="nu-big-input"
                value={amountFormatted}
                onChange={handleAmountChange}
                required
                autoFocus
              />
              {amountFormatted && (
                <button
                  type="button"
                  className="nu-clear-val-btn"
                  onClick={() => setAmountFormatted('')}
                  title="Zerar valor"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="nu-quick-amounts">
              {QUICK_ADD_VALUES.map((val) => (
                <button
                  key={val}
                  type="button"
                  className="nu-quick-val-chip"
                  onClick={() => handleQuickAdd(val)}
                >
                  + R$ {val}
                </button>
              ))}
            </div>
          </div>

          <div className="nu-field">
            <label>Descrição</label>
            <input
              type="text"
              placeholder={
                isIncome
                  ? 'Ex: Salário, Pix recebido, Freelance...'
                  : 'Ex: Mercado, Aluguel, Uber, Lanche...'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Data e Hora com atalhos rápidos */}
          <div className="nu-datetime-block">
            <div className="nu-datetime-top">
              <span className="nu-datetime-label">Data e horário</span>
              <div className="nu-date-shortcuts">
                <button
                  type="button"
                  className="nu-mini-chip"
                  onClick={() => setDateShortcut(0)}
                >
                  Agora (Hoje)
                </button>
                <button
                  type="button"
                  className="nu-mini-chip"
                  onClick={() => setDateShortcut(-1)}
                >
                  Ontem
                </button>
              </div>
            </div>

            <div className="nu-row-2">
              <div className="nu-field">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="nu-field">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="nu-row-2">
            <div className="nu-field">
              <label>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="nu-field">
              <label>Forma de pagamento</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="nu-field">
            <label>Observação (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Parcela 1/2, pago via app..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="nu-modal-actions">
            <button type="button" className="nu-btn-light" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={isIncome ? 'nu-btn-income' : 'nu-btn-dark'}
            >
              {isIncome ? 'Confirmar recebimento' : 'Confirmar saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
