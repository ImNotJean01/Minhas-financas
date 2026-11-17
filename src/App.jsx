import React, { useState, useMemo } from 'react';
import {
  getCurrentYearMonth,
  generateDefaultProfile,
  generateDefaultBudgets,
} from './data/constants';
import {
  transactionsToCSV,
  parseCSVToTransactions,
} from './utils/formatters';
import { useLocalStorage } from './hooks/useLocalStorage';
import { HeaderBar } from './components/HeaderBar';
import { MetricsStrip } from './components/MetricsStrip';
import { TransactionLedger } from './components/TransactionLedger';
import { BudgetPanel } from './components/BudgetPanel';
import { TransactionModal } from './components/TransactionModal';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [profile, setProfile] = useLocalStorage(
    'nu_bw_profile_v1',
    generateDefaultProfile
  );
  const [transactions, setTransactions] = useLocalStorage(
    'nu_bw_transactions_v1',
    []
  );
  const [budgets, setBudgets] = useLocalStorage(
    'nu_bw_budgets_v1',
    generateDefaultBudgets
  );

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'budgets'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState('expense');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.date && tx.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const visibleTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.description?.toLowerCase().includes(q);
        const matchNotes = tx.notes?.toLowerCase().includes(q);
        if (!matchDesc && !matchNotes) return false;
      }
      return true;
    });
  }, [monthTransactions, typeFilter, searchQuery]);

  const { totalIncome, totalExpense, creditCardSpent } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, tx) => {
        const val = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          acc.totalIncome += val;
        } else {
          acc.totalExpense += val;
          if (tx.method === 'credito') {
            acc.creditCardSpent += val;
          }
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, creditCardSpent: 0 }
    );
  }, [monthTransactions]);

  const handleOpenNewModal = (type = 'expense') => {
    setEditingTransaction(null);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (txData) => {
    setTransactions((prev) => {
      const exists = prev.some((item) => item.id === txData.id);
      if (exists) {
        return prev.map((item) => (item.id === txData.id ? txData : item));
      }
      return [txData, ...prev];
    });
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateBudget = (catId, newLimit) => {
    setBudgets((prev) => ({
      ...prev,
      [catId]: newLimit,
    }));
  };

  const handleExportCSV = () => {
    const csv = transactionsToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minhas-financas-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const payload = {
      profile,
      budgets,
      transactions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-financas-${selectedMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = String(event.target?.result || '');
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.budgets) setBudgets(parsed.budgets);
          if (Array.isArray(parsed.transactions)) {
            setTransactions(parsed.transactions);
          } else if (Array.isArray(parsed)) {
            setTransactions(parsed);
          }
        } else {
          const imported = parseCSVToTransactions(content);
          if (imported.length > 0) {
            setTransactions((prev) => [...imported, ...prev]);
          }
        }
      } catch (err) {
        console.error('Erro ao importar arquivo:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja apagar todos os lançamentos?')) {
      setTransactions([]);
      setIsProfileModalOpen(false);
    }
  };

  return (
    <div className="nu-app">
      <HeaderBar
        profile={profile}
        onToggleHideValues={() =>
          setProfile((prev) => ({ ...prev, hideValues: !prev.hideValues }))
        }
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onOpenNewModal={handleOpenNewModal}
      />

      <main className="nu-container">
        <MetricsStrip
          income={totalIncome}
          expense={totalExpense}
          creditCardSpent={creditCardSpent}
          profile={profile}
          onOpenNewModal={handleOpenNewModal}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Abas simples para não aglomerar informações na tela */}
        <div className="nu-view-switcher">
          <button
            type="button"
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Movimentações ({monthTransactions.length})
          </button>
          <button
            type="button"
            className={activeTab === 'budgets' ? 'active' : ''}
            onClick={() => setActiveTab('budgets')}
          >
            Limites por categoria
          </button>
        </div>

        {activeTab === 'transactions' ? (
          <TransactionLedger
            transactions={visibleTransactions}
            hideValues={profile.hideValues}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsTxModalOpen(true);
            }}
            onOpenNewModal={handleOpenNewModal}
          />
        ) : (
          <BudgetPanel
            transactions={monthTransactions}
            budgets={budgets}
            hideValues={profile.hideValues}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
      </main>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultMonth={selectedMonth}
        initialType={txInitialType}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={setProfile}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onImportFile={handleImportFile}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
