import React, { useState } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
} from '../lib/supabase';

export function AuthScreen({ onAuthenticated }) {
  const initialCreds = getSupabaseCredentials();

  const [isSignUp, setIsSignUp] = useState(false);
  const [nome, setNome] = useState('Jean');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Caso as variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ainda não estejam no .env
  const [showConfig, setShowConfig] = useState(!initialCreds.isConfigured);
  const [supabaseUrl, setSupabaseUrl] = useState(initialCreds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialCreds.anonKey);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!supabaseUrl.trim().startsWith('http') || !supabaseAnonKey.trim()) {
      setErrorMsg(
        'Informe uma URL válida (https://...) e a Anon Key pública do seu projeto Supabase.'
      );
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    setShowConfig(false);
    setInfoMsg('Conexão Supabase salva! Agora você pode entrar ou criar sua conta.');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const client = getSupabaseClient();
    if (!client) {
      setShowConfig(true);
      setErrorMsg('Configure primeiro a URL e a Anon Key do Supabase.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const cleanName = nome.trim() || 'Jean';
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              nome: cleanName,
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          onAuthenticated(data.session);
        } else {
          setInfoMsg(
            'Conta criada! Se a confirmação de e-mail estiver ativa no Supabase, verifique sua caixa de entrada ou faça login.'
          );
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
        if (data?.session) {
          onAuthenticated(data.session);
        }
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível autenticar no Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nu-auth-page">
      <div className="nu-auth-card">
        <div className="nu-auth-brand">
          <div className="nu-avatar nu-auth-logo">MF</div>
          <div>
            <h1 className="nu-auth-title">Minhas Finanças</h1>
            <p className="nu-auth-subtitle">
              Controle financeiro pessoal sincronizado na nuvem
            </p>
          </div>
        </div>

        {errorMsg && <div className="nu-alert nu-alert-error">{errorMsg}</div>}
        {infoMsg && <div className="nu-alert nu-alert-info">{infoMsg}</div>}

        {showConfig ? (
          <form onSubmit={handleSaveConfig} className="nu-form">
            <div className="nu-field">
              <label>Supabase Project URL</label>
              <input
                type="url"
                placeholder="https://seu-projeto.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                required
              />
            </div>

            <div className="nu-field">
              <label>Supabase Anon Key (Public)</label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                required
              />
              <small className="nu-field-hint">
                Você também pode definir <code>VITE_SUPABASE_URL</code> e{' '}
                <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code>.
              </small>
            </div>

            <div className="nu-modal-actions">
              {initialCreds.isConfigured && (
                <button
                  type="button"
                  className="nu-btn-light"
                  onClick={() => setShowConfig(false)}
                >
                  Voltar
                </button>
              )}
              <button type="submit" className="nu-btn-dark nu-btn-full">
                Salvar conexão Supabase
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="nu-segment">
              <button
                type="button"
                className={!isSignUp ? 'active-out' : ''}
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                className={isSignUp ? 'active-out' : ''}
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="nu-form">
              {isSignUp && (
                <div className="nu-field">
                  <label>Seu nome</label>
                  <input
                    type="text"
                    placeholder="Jean"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="nu-field">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="nu-field">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="nu-btn-dark nu-btn-full"
                disabled={loading}
              >
                {loading
                  ? 'Aguarde...'
                  : isSignUp
                  ? 'Criar minha conta'
                  : 'Entrar'}
              </button>
            </form>

            {!initialCreds.fromEnv && (
              <div className="nu-auth-footer">
                <button
                  type="button"
                  className="nu-link-muted"
                  onClick={() => setShowConfig(true)}
                >
                  Configurar URL / Chave do Supabase
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
