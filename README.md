# Minhas Finanças

Dashboard de finanças pessoais minimalista em **Preto & Branco** (inspirado no layout do Nubank), desenvolvido com **React + Vite** e integrado ao **Supabase (Auth + PostgreSQL)** para autenticação e sincronização de dados na nuvem.

🔗 **Acesse online:** https://imnotjean01.github.io/Minhas-financas/

---

## O que mudou (Últimas Atualizações)

- **Autenticação e Banco em Nuvem (Supabase)**:
  - Substituição do armazenamento puramente local por login e cadastro via **Supabase Auth** (`persistSession` ativo para manter a conta conectada).
  - Sincronização em tempo real com banco PostgreSQL protegido por **Row Level Security (`auth.uid() = user_id`)** nas tabelas `perfis_financeiros`, `movimentacoes` e `limites_categoria`.
- **Números de Recebimentos e Saídas em Destaque**:
  - Subcards dedicados para **Recebimentos (`+ R$`)** e **Saídas (`- R$`)** com contagem mensal e atalhos rápidos.
  - Máscara automática de moeda em Reais (`0,00`) ao digitar valores e chips de adição rápida (`+ R$ 10`, `+ R$ 50`, `+ R$ 100`, `+ R$ 500`).
- **Datas, Horários e Relógio Ao Vivo**:
  - Indicador de data e horário atual no cabeçalho.
  - Histórico agrupado por dia ("Hoje", "Ontem" ou data amigável) com cálculo do **Saldo do dia** e exibição do horário de cada lançamento.
- **Interface Mais Limpa e Direta**:
  - Remoção de telas de configuração inicial e de botões de ajuste manual de formato, deixando o fluxo direto: fez login, todos os seus saldos (Mês, Cartão de Crédito, Caixinha, Movimentações e Limites) já carregam automaticamente da nuvem.

---

## Funcionalidades Principais

- **Resumo do Mês**: Saldo disponível calculado automaticamente, total de recebimentos, total de saídas e filtro mensal.
- **Modo Privacidade**: Oculte ou mostre todos os valores monetários com um clique no ícone de olho (`R$ ••••`).
- **Cartão de Crédito & Caixinha**: Acompanhamento e edição da **Fatura atual**, **Limite disponível** (padrão `R$ 2.500,00`) e **Reserva pessoal (Caixinha)** sincronizados no banco.
- **Limites por Categoria**: Defina metas mensais de gastos para Mercado, Moradia, Lazer, Transporte, etc., com barra de progresso visual.

---

## Estrutura do Projeto

```text
├── .github/workflows/
│   └── deploy.yml                # CI/CD: Compila com Vite e publica no GitHub Pages
├── src/
│   ├── components/
│   │   ├── AuthScreen.jsx        # Tela de Login e Cadastro integrada ao Supabase Auth
│   │   ├── HeaderBar.jsx         # Cabeçalho com saudação, relógio ao vivo, privacidade e Logout
│   │   ├── MetricsStrip.jsx      # Cards de Saldo, Recebimentos/Saídas, Cartão e Caixinha
│   │   ├── TransactionLedger.jsx # Histórico agrupado por data com busca e filtros
│   │   ├── BudgetPanel.jsx       # Limites mensais por categoria sincronizados na nuvem
│   │   ├── TransactionModal.jsx  # Modal de lançamento com máscara de moeda e atalhos
│   │   └── ProfileModal.jsx      # Edição rápida de Fatura, Limite do Cartão e Caixinha
│   ├── data/constants.js         # Categorias e valores iniciais padrão
│   ├── lib/supabase.js           # Cliente Supabase configurado com persistência de sessão
│   ├── styles/index.css          # Identidade visual Preto & Branco estilo Nubank
│   ├── utils/formatters.js       # Formatação BRL, máscaras numéricas e datas amigáveis
│   ├── App.jsx                   # Gerenciamento de sessão e sincronização CRUD (Promise.all)
│   └── main.jsx                  # Ponto de entrada React
├── supabase_schema.sql           # Script SQL completo (Tabelas, RLS Policies e Trigger)
├── .env.example                  # Exemplo de variáveis de ambiente do Supabase
├── index.html
├── package.json
└── vite.config.js
```

---

## Banco de Dados (Supabase)

O esquema completo do banco está no arquivo [`supabase_schema.sql`](./supabase_schema.sql) e inclui:
1. `public.perfis_financeiros`: armazena `nome`, `fatura_atual`, `limite_cartao` e `saldo_caixinha`.
2. `public.movimentacoes`: armazena `tipo` (`recebimento` | `saida`), `descricao`, `valor`, `categoria` e `data_movimentacao`.
3. `public.limites_categoria`: armazena `categoria` e `limite_mensal` por usuário.
4. **Trigger `on_auth_user_created`**: cria automaticamente o perfil inicial ao cadastrar um novo usuário.

---

## Como Rodar Localmente

1. Instale o [Node.js LTS](https://nodejs.org/).
2. Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

---

## Publicação Automática (GitHub Pages)

A cada `git push` na branch `main`, o workflow do **GitHub Actions** (`.github/workflows/deploy.yml`) executa `npm run build` e publica automaticamente a pasta `dist` no GitHub Pages.
