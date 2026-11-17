-- 1. Tabela de Perfil Financeiro (Nome, Cartão de Crédito e Caixinha)
create table if not exists public.perfis_financeiros (
  user_id uuid references auth.users(id) on delete cascade primary key,
  nome text not null default 'Jean',
  fatura_atual numeric(12,2) not null default 0.00,
  limite_cartao numeric(12,2) not null default 2500.00,
  saldo_caixinha numeric(12,2) not null default 0.00,
  updated_at timestamptz not null default now()
);

-- 2. Tabela de Movimentações (Recebimentos e Saídas)
create table if not exists public.movimentacoes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  tipo text not null check (tipo in ('recebimento', 'saida')),
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null default 'Geral',
  data_movimentacao timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 3. Tabela de Limites por Categoria
create table if not exists public.limites_categoria (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  categoria text not null,
  limite_mensal numeric(12,2) not null default 0.00,
  unique (user_id, categoria)
);

-- Habilitar Row Level Security (RLS)
alter table public.perfis_financeiros enable row level security;
alter table public.movimentacoes enable row level security;
alter table public.limites_categoria enable row level security;

-- Políticas de acesso por usuário autenticado
create policy "Usuário gerencia próprio perfil"
  on public.perfis_financeiros for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuário gerencia próprias movimentações"
  on public.movimentacoes for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuário gerencia próprios limites"
  on public.limites_categoria for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger automática para criar o perfil padrão no primeiro cadastro
create or replace function public.criar_perfil_financeiro_padrao()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis_financeiros (user_id, nome, fatura_atual, limite_cartao, saldo_caixinha)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', 'Jean'), 0.00, 2500.00, 0.00)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_financeiro_padrao();
