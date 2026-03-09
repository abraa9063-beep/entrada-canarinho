# Sistema CNR - Controle da Transportes Canarinho

Sistema web responsivo para registro de entradas de itens por Nota Fiscal (N-F) no setor de compras/manutenção.

## 🚀 Tecnologias

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite 7** - Build tool
- **Tailwind CSS 3** - Estilização
- **Zustand** - Gerenciamento de estado (com persistência em localStorage)
- **React Router DOM** - Navegação
- **Lucide React** - Ícones
- **Recharts** - Gráficos interativos

## 🎯 Funcionalidades

### Dashboard
**Indicadores:**
- Total de N-F registradas
- Valor total de entradas (R$)
- Total de itens lançados
- Total de descontos aplicados (R$)
- Ticket médio por N-F

**Gráficos interativos:**
1. **Valor Total por Mês** - Evolução das entradas (gráfico de área)
2. **Categorias de Itens** - Participação % e valor total (gráfico de pizza)
3. **Top Itens** - Por valor ou quantidade (gráfico de barras)
4. **Entradas por Fornecedor** - Valor e quantidade de notas (gráfico de barras)

### Cadastro de N-F (Notas Fiscais)
**Campos obrigatórios:**
- Número da N-F (único)
- Data de emissão
- Data de entrada/lançamento (default: hoje)
- Fornecedor (nome)
- Filial / Unidade (Matriz, Ituiutaba, Carazinho, etc.)

**Campos opcionais:**
- CNPJ do fornecedor (recomendado)
- Responsável pelo lançamento
- Chave de acesso (44 dígitos)
- Observações

**Funcionalidade:**
- Após salvar a N-F, abre automaticamente a tela para lançar itens

### Lançamento de Itens na N-F
- Seleção de item do catálogo
- Quantidade e preço unitário
- Campo de desconto
- Cálculo automático do valor final
- Adição múltipla de itens

### Catálogo de Itens
- Cadastro de itens/materiais
- Controle de estoque
- Alerta de estoque baixo
- Categorias e localização

### 📥 Importador de Itens (NOVO!)
**Como importar seu estoque:**
1. Clique no botão **"Template"** para baixar o arquivo CSV de exemplo
2. Preencha o arquivo com seus itens:
   - **Código** (obrigatório) - Ex: FIL-001
   - **Descrição** (obrigatório) - Nome do item
   - **Categoria** - Ex: Filtros, Pneus, Lubrificantes
   - **Unidade** - UN, JG, L, KG, M, CX
   - **Estoque Atual** - Quantidade em estoque
   - **Estoque Mínimo** - Quantidade mínima para alerta
   - **Localização** - Ex: A1-01
   - **Fornecedor** - Nome do fornecedor
3. Clique em **"Importar"** e selecione seu arquivo CSV
4. Confira a prévia dos itens e clique em **"Importar"**

**Recursos do importador:**
- Suporta arquivos CSV com separador vírgula (,) ou ponto e vírgula (;)
- Reconhecimento automático de colunas por nome
- Prévia dos dados antes de confirmar
- Atualiza itens existentes (mesmo código)
- Validação de dados obrigatórios

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── Badge.tsx     # Badges de status
│   ├── Button.tsx    # Botão customizado
│   ├── Card.tsx      # Cards e StatCards
│   ├── Header.tsx    # Cabeçalho do sistema
│   ├── Layout.tsx    # Layout principal
│   ├── Modal.tsx     # Modal dialog
│   ├── Sidebar.tsx   # Menu lateral
│   └── Table.tsx     # Tabela de dados
├── pages/            # Páginas do sistema
│   ├── Dashboard.tsx           # Dashboard com gráficos
│   ├── NotasFiscais.tsx        # Lista de N-F
│   ├── NotaFiscalForm.tsx      # Formulário de N-F
│   ├── NotaFiscalDetalhe.tsx   # Detalhes da N-F
│   ├── EntradaItemForm.tsx     # Lançamento de itens
│   └── Itens.tsx               # Catálogo de itens (com importador)
├── store/            # Estado global
│   └── useAppStore.ts # Store Zustand
├── types/            # Tipos TypeScript
│   └── index.ts      # Definições de tipos
└── App.tsx           # Componente principal
```

## 🎨 Design

- Interface moderna e limpa
- Tema corporativo em tons de âmbar e cinza
- Totalmente responsivo (mobile-first)
- Gráficos interativos com hover e tooltip
- Animações sutis para melhor UX

## 🔧 Comandos

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 💾 Persistência

Os dados são persistidos localmente usando Zustand com middleware de persistência (localStorage).

## 📋 Primeiros Passos

1. Acesse **Catálogo de Itens**
2. Clique em **"Template"** para baixar o modelo CSV
3. Preencha com seus itens de estoque
4. Clique em **"Importar"** e selecione o arquivo
5. Confirme a importação
6. Pronto! Agora você pode cadastrar N-F e lançar entradas

---

Desenvolvido para **Transportes Canarinho** - Sistema de controle interno.
