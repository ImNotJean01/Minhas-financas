# Minhas Finanças

Dashboard de finanças pessoais simples, inspirado no visual do Nubank, em preto e branco. Feito com **React + Vite**.

🔗 **Acesse online:** https://imnotjean01.github.io/Minhas-financas/

---

## Funcionalidades

- **Resumo do mês**: saldo disponível, entradas, saídas e atalhos rápidos.
- **Modo privacidade**: esconde todos os valores com um clique no ícone de olho (`R$ ••••`).
- **Cartão de crédito e Caixinha**: fatura do mês calculada automaticamente a partir dos gastos no crédito, limite disponível e dinheiro guardado.
- **Seus dados**: nome, renda fixa mensal, valor guardado e limite do cartão.
- **Limites por categoria**: metas de gasto para mercado, moradia, lazer etc., com barra de progresso.
- **Backup**: exporta e importa os dados em CSV ou JSON.

> **Privacidade:** tudo o que você preenche fica salvo só no seu navegador (`localStorage`). Nenhum dado é enviado para servidor nem para o GitHub.

---

## Estrutura

```text
├── .github/workflows/
│   └── deploy.yml            # Gera e publica o site no GitHub Pages a cada push
├── src/
│   ├── components/
│   │   ├── HeaderBar.jsx         # Topo com saudação, mês e modo privacidade
│   │   ├── MetricsStrip.jsx      # Cards de saldo, cartão de crédito e caixinha
│   │   ├── TransactionLedger.jsx # Histórico de movimentações com busca e filtros
│   │   ├── BudgetPanel.jsx       # Limites de gasto por categoria
│   │   ├── TransactionModal.jsx  # Formulário de gasto / receita
│   │   └── ProfileModal.jsx      # Seus dados e backup CSV/JSON
│   ├── data/constants.js         # Categorias e valores padrão
│   ├── hooks/useLocalStorage.js  # Salvamento automático no navegador
│   ├── styles/index.css          # Estilos
│   ├── utils/formatters.js       # Formatação de R$, datas e CSV
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Inicialização do React
├── index.html
├── package.json
└── vite.config.js
```

---

## Rodando no seu computador

Precisa do [Node.js](https://nodejs.org/) (versão LTS).

```bash
npm install
npm run dev
```

## Publicação

O site é publicado automaticamente pelo GitHub Actions: a cada `push` na branch `main`, o workflow roda `npm run build` e envia a pasta `dist` para o GitHub Pages.
