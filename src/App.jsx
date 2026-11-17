import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCurrentYearMonth,
  generateDefaultProfile,
  generateDefaultBudgets,
} from './data/constants';
import { getSupabaseClient } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { HeaderBar } from './components/HeaderBar';
import { MetricsStrip } from './components/MetricsStrip';
import { TransactionLedger } from './components/TransactionLedger';
import { BudgetPanel } from './components/BudgetPanel';
import { TransactionModal } from './components/TransactionModal';
import { ProfileModal } from './components/ProfileModal';

function normalizeMovimentacao(row) {
  const dt = row.data_movimentacao ? new Date(row.data_movimentacao) : new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');

  return {
    ...row,
    valor: Number(row.valor) || 0,
    date: `${y}-${m}-${d}`,
    time: `${hh}:${mm}`,
  };
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [profile, setProfile] = useState(generateDefaultProfile);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(generateDefaultBudgets);
  const [hideValues, setHideValues] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth);
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txInitialType, setTxInitialType] = useState('saida');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // 1. Verifica sessão inicial e escuta mudanças de autenticação
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setAuthChecking(false);
      return;
    }

    let mounted = true;
    client.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data?.session || null);
        setAuthChecking(false);
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession || null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // 2. Carregamento paralelo dos dados no Supabase (Promise.all)
  const loadCloudData = useCallback(async (activeSession) => {
    const client = getSupabaseClient();
    const userId = activeSession?.user?.id;
    if (!client || !userId) return;

    setDataLoading(true);
    try {
      const fallbackName =
        activeSession.user?.user_metadata?.nome ||
        activeSession.user?.email?.split('@')[0] ||
        'Jean';

      const [perfilRes, movsRes, limitesRes] = await Promise.all([
        client
          .from('perfis_financeiros')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        client
          .from('movimentacoes')
          .select('*')
          .eq('user_id', userId)
          .order('data_movimentacao', { ascending: false }),
        client
          .from('limites_categoria')
          .select('*')
          .eq('user_id', userId),
      ]);

      // Garante que o registro em perfis_financeiros exista (upsert caso não exista)
      let perfilData = perfilRes?.data;
      if (!perfilData) {
        const defaultRow = {
          user_id: userId,
          nome: fallbackName || 'Jean',
          fatura_atual: 0.0,
          limite_cartao: 2500.0,
          saldo_caixinha: 0.0,
        };
        const { data: upserted } = await client
          .from('perfis_financeiros')
          .upsert(defaultRow, { onConflict: 'user_id' })
          .select('*')
          .single();
        perfilData = upserted || defaultRow;
      }

      setProfile({
        nome: perfilData.nome || fallbackName || 'Jean',
        fatura_atual: Number(perfilData.fatura_atual) || 0,
        limite_cartao: Number(perfilData.limite_cartao ?? 2500),
        saldo_caixinha: Number(perfilData.saldo_caixinha) || 0,
      });

      if (Array.isArray(movsRes?.data)) {
        setTransactions(movsRes.data.map(normalizeMovimentacao));
      }

      const nextBudgets = generateDefaultBudgets();
      if (Array.isArray(limitesRes?.data)) {
        limitesRes.data.forEach((row) => {
          if (row.categoria) {
            nextBudgets[row.categoria] = Number(row.limite_mensal) || 0;
          }
        });
      }
      setBudgets(nextBudgets);
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadCloudData(session);
    }
  }, [session, loadCloudData]);

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((tx) => tx.date && tx.date.startsWith(selectedMonth))
      .sort((a, b) => {
        const cmpDate = b.date.localeCompare(a.date);
        if (cmpDate !== 0) return cmpDate;
        return (b.time || '00:00').localeCompare(a.time || '00:00');
      });
  }, [transactions, selectedMonth]);

  const visibleTransactions = useMemo(() => {
    return monthTransactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.tipo !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = tx.descricao?.toLowerCase().includes(q);
        const matchCat = tx.categoria?.toLowerCase().includes(q);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [monthTransactions, typeFilter, searchQuery]);

  const { totalIncome, totalExpense, incomeCount, expenseCount } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, tx) => {
        const val = Number(tx.valor) || 0;
        if (tx.tipo === 'recebimento') {
          acc.totalIncome += val;
          acc.incomeCount += 1;
        } else {
          acc.totalExpense += val;
          acc.expenseCount += 1;
        }
        return acc;
      },
      {
        totalIncome: 0,
        totalExpense: 0,
        incomeCount: 0,
        expenseCount: 0,
      }
    );
  }, [monthTransactions]);

  const handleOpenNewModal = (type = 'saida') => {
    setEditingTransaction(null);
    setTxInitialType(type);
    setIsTxModalOpen(true);
  };

  // CRUD: Movimentações (insert / update / delete)
  const handleSaveTransaction = async (txPayload) => {
    const client = getSupabaseClient();
    const userId = session?.user?.id;
    if (!client || !userId) return;

    if (txPayload.id) {
      const { data, error } = await client
        .from('movimentacoes')
        .update({
          tipo: txPayload.tipo,
          descricao: txPayload.descricao,
          valor: txPayload.valor,
          categoria: txPayload.categoria,
          data_movimentacao: txPayload.data_movimentacao,
        })
        .eq('id', txPayload.id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (!error && data) {
        const normalized = normalizeMovimentacao(data);
        setTransactions((prev) =>
          prev.map((item) => (item.id === normalized.id ? normalized : item))
        );
      }
    } else {
      const { data, error } = await client
        .from('movimentacoes')
        .insert({
          user_id: userId,
          tipo: txPayload.tipo,
          descricao: txPayload.descricao,
          valor: txPayload.valor,
          categoria: txPayload.categoria,
          data_movimentacao: txPayload.data_movimentacao,
        })
        .select('*')
        .single();

      if (!error && data) {
        const normalized = normalizeMovimentacao(data);
        setTransactions((prev) => [normalized, ...prev]);
      }
    }
  };

  const handleDeleteTransaction = async (id) => {
    const client = getSupabaseClient();
    const userId = session?.user?.id;
    if (!client || !userId) return;

    const { error } = await client
      .from('movimentacoes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // CRUD: Cartão de Crédito e Caixinha (perfis_financeiros)
  const handleSaveProfileFinancials = async (updates) => {
    const client = getSupabaseClient();
    const userId = session?.user?.id;
    if (!client || !userId) return;

    const { data, error } = await client
      .from('perfis_financeiros')
      .update({
        fatura_atual: updates.fatura_atual,
        limite_cartao: updates.limite_cartao,
        saldo_caixinha: updates.saldo_caixinha,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (!error && data) {
      setProfile((prev) => ({
        ...prev,
        fatura_atual: Number(data.fatura_atual) || 0,
        limite_cartao: Number(data.limite_cartao ?? 2500),
        saldo_caixinha: Number(data.saldo_caixinha) || 0,
      }));
    }
  };

  // CRUD: Limites por Categoria (upsert / delete)
  const handleUpdateBudget = async (categoria, limiteMensal) => {
    const client = getSupabaseClient();
    const userId = session?.user?.id;
    if (!client || !userId) return;

    setBudgets((prev) => ({ ...prev, [categoria]: limiteMensal }));

    await client.from('limites_categoria').upsert(
      {
        user_id: userId,
        categoria,
        limite_mensal: limiteMensal,
      },
      { onConflict: 'user_id,categoria' }
    );
  };

  const handleRemoveBudget = async (categoria) => {
    const client = getSupabaseClient();
    const userId = session?.user?.id;
    if (!client || !userId) return;

    setBudgets((prev) => ({ ...prev, [categoria]: 0 }));

    await client
      .from('limites_categoria')
      .delete()
      .eq('user_id', userId)
      .eq('categoria', categoria);
  };

  const handleLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    setSession(null);
  };

  if (authChecking) {
    return (
      <div className="nu-auth-page">
        <div className="nu-auth-card" style={{ textAlign: 'center' }}>
          <p className="nu-auth-subtitle">Verificando sua sessão...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={(newSession) => setSession(newSession)} />;
  }

  const userName =
    profile.nome ||
    session.user?.user_metadata?.nome ||
    'Jean';

  return (
    <div className="nu-app scale-comfortable">
      <HeaderBar
        userName={userName}
        hideValues={hideValues}
        onToggleHideValues={() => setHideValues((prev) => !prev)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onLogout={handleLogout}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onOpenNewModal={handleOpenNewModal}
      />

      <main className="nu-container">
        <MetricsStrip
          income={totalIncome}
          expense={totalExpense}
          incomeCount={incomeCount}
          expenseCount={expenseCount}
          profile={profile}
          hideValues={hideValues}
          onOpenNewModal={handleOpenNewModal}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        />

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
          {dataLoading && (
            <span className="nu-sync-pill">Sincronizando...</span>
          )}
        </div>

        {activeTab === 'transactions' ? (
          <TransactionLedger
            transactions={visibleTransactions}
            hideValues={hideValues}
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
            hideValues={hideValues}
            onUpdateBudget={handleUpdateBudget}
            onRemoveBudget={handleRemoveBudget}
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
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfileFinancials}
      />
    </div>
  );
}
