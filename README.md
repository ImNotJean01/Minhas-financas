# Minhas Finanças — Dashboard Pessoal (React + Vite)

Um dashboard de controle financeiro pessoal limpo e intuitivo, inspirado no layout do **Nubank** em uma paleta **Preto & Branco** minimalista. Desenvolvido em **React + Vite** com armazenamento local (`localStorage`).

---

## Funcionalidades

- **Resumo Estilo Conta Digital**: Saldo disponível no mês, total de entradas, saídas e botões rápidos de ação.
- **Modo Privacidade (Olhinho)**: Esconda ou mostre todos os valores da tela com um clique (`R$ ••••`).
- **Cartão de Crédito & Caixinha**: Acompanhamento automático da fatura do mês (compras no crédito), limite disponível e reserva guardada na Caixinha.
- **Personalização Completa**: Configure seu nome, renda fixa mensal, saldo guardado e limite do cartão.
- **Limites por Categoria**: Defina metas de gastos para Mercado, Moradia, Lazer, Transporte, etc., e acompanhe a barra de progresso.
- **Backup e Portabilidade**: Exporte ou importe seus dados em **CSV** ou **JSON** quando quiser.

> **Privacidade**: Todos os valores e lançamentos que você preenche ficam salvos **apenas no seu próprio navegador** (`localStorage`). Quando você publica o código no GitHub, seus dados pessoais **não** vão junto com o código.

---

## Estrutura do Projeto

```text
├── src/
│   ├── components/
│   │   ├── HeaderBar.jsx         # Topo preto com saudação, mês e modo privacidade
│   │   ├── MetricsStrip.jsx      # Cards de Saldo, Cartão de Crédito e Caixinha
│   │   ├── TransactionLedger.jsx # Histórico de movimentações com busca e filtros
│   │   ├── BudgetPanel.jsx       # Controle de metas de gastos por categoria
│   │   ├── TransactionModal.jsx  # Modal para registrar gastos ou receitas
│   │   └── ProfileModal.jsx      # Configuração dos seus dados e backup CSV/JSON
│   ├── data/
│   │   └── constants.js          # Categorias e valores padrão iniciais
│   ├── hooks/
│   │   └── useLocalStorage.js    # Persistência automática no navegador
│   ├── styles/
│   │   └── index.css             # Estilização Preto & Branco inspirada no Nubank
│   ├── utils/
│   │   └── formatters.js         # Formatação em Real (R$), datas e CSV
│   ├── App.jsx                   # Componente principal
│   └── main.jsx                  # Inicialização do React
├── index.html                    # Entrada padrão do Vite
├── preview.html                  # Versão standalone pronta para abrir direto no navegador
└── package.json                  # Dependências e scripts
```

---

## Como Executar

### 1. Abrir direto no navegador (Sem instalar nada)
Basta abrir o arquivo `preview.html` em qualquer navegador.

### 2. Rodando com Node.js + Vite
```bash
npm install
npm run dev
```
