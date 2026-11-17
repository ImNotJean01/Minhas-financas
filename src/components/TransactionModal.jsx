import React, { useState, useEffect } from 'react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from '../data/constants';

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
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('mercado');
  const [method, setMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setMethod(editingTransaction.method || 'pix');
      setNotes(editingTransaction.notes || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const initialDate = today.startsWith(defaultMonth)
        ? today
        : `${defaultMonth}-01`;
      setType(initialType);
      setDescription('');
      setAmount('');
      setDate(initialDate);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = parseFloat(String(amount).replace(',', '.'));
    if (!description.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    onSave({
      id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`,
      type,
      description: description.trim(),
      amount: numericAmount,
      date,
      category,
      method,
      notes: notes.trim(),
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
          <h3>
            {editingTransaction ? 'Editar lançamento' : 'Nova movimentação'}
          </h3>
          <button type="button" className="nu-close-x" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="nu-form">
          <div className="nu-segment">
            <button
              type="button"
              className={type === 'expense' ? 'active' : ''}
              onClick={() => handleTypeSwitch('expense')}
            >
              Saída (Gasto)
            </button>
            <button
              type="button"
              className={type === 'income' ? 'active' : ''}
              onClick={() => handleTypeSwitch('income')}
            >
              Entrada (Receita)
            </button>
          </div>

          <div className="nu-field">
            <label>Qual foi o valor?</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="R$ 0,00"
              className="nu-big-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="nu-field">
            <label>Descrição</label>
            <input
              type="text"
              placeholder="Ex: Mercado, Aluguel, Salário, Uber..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
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

          <div className="nu-row-2">
            <div className="nu-field">
              <label>Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="nu-field">
              <label>Observação (opcional)</label>
              <input
                type="text"
                placeholder="Ex: Parcela 1/2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="nu-modal-actions">
            <button type="button" className="nu-btn-light" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="nu-btn-dark">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
