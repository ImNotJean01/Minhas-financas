import React, { useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

function mapAuthErrorMessage(err, isSignUp) {
  const msg = String(err?.message || '').toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (msg.includes('user already registered')) {
    return 'Este e-mail já está cadastrado. Tente entrar na sua conta.';
  }
  if (msg.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.';
  }
  if (msg.includes('signups not allowed')) {
    return 'Novos cadastros estão desativados no momento.';
  }

  return isSignUp
    ? 'Não foi possível criar a conta. Verifique os dados informados.'
    : 'Não foi possível entrar. Verifique seu e-mail e senha.';
}

export function AuthScreen({ onAuthenticated }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [nome, setNome] = useState('Jean');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const client = getSupabaseClient();
    if (!client) {
      setErrorMsg('Serviço de autenticação indisponível no momento.');
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
      setErrorMsg(mapAuthErrorMessage(err, isSignUp));
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
      </div>
    </div>
  );
}
