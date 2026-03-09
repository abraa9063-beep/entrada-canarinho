import { create } from 'zustand';
import { api } from '../api/client';

// Types
export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  observacoes?: string;
  userId: string;
  createdAt: number;
}

export interface NotaFiscal {
  id: number;
  numero: string;
  dataEmissao: string;
  dataEntrada: string;
  fornecedor: string;
  cnpj?: string;
  filial: string;
  responsavel?: string;
  chaveAcesso?: string;
  observacoes?: string;
  status: string;
  userId: string;
  createdAt: number;
  itens?: ItemNf[];
  valorTotal?: number;
  totalItens?: number;
}

export interface ItemNf {
  id: number;
  notaFiscalId: number;
  descricao: string;
  categoria?: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  desconto: number;
  userId: string;
  createdAt: number;
}

export interface ItemCatalogo {
  id: number;
  descricao: string;
  categoria?: string;
  unidade: string;
  precoReferencia?: number;
  userId: string;
  createdAt: number;
}

export interface DashboardStats {
  totalNF: number;
  valorTotal: number;
  totalItensLancados: number;
  totalDescontos: number;
  ticketMedio: number;
  totalLitrosDiesel: number;
}

export interface DashboardVariacoes {
  nf: number;
  valor: number;
  itens: number;
  ticket: number;
  diesel: number;
}

interface AppState {
  // Loading states
  isLoading: boolean;
  
  // Data
  fornecedores: Fornecedor[];
  notasFiscais: NotaFiscal[];
  itensCatalogo: ItemCatalogo[];
  dashboardStats: DashboardStats | null;
  dashboardVariacoes: DashboardVariacoes | null;
  valorPorMes: { mes: string; valor: number }[];
  itensPorCategoria: { categoria: string; quantidade: number; valor: number; percentual: number }[];
  gastosPorFilial: { filial: string; quantidade: number; valor: number; notas: number; percentual: number }[];
  topItens: { descricao: string; quantidade: number; valor: number }[];
  entradasPorFornecedor: { fornecedor: string; quantidade: number; valor: number; notas: number }[];
  
  // Fornecedores
  fetchFornecedores: () => Promise<void>;
  addFornecedor: (data: Omit<Fornecedor, 'id' | 'userId' | 'createdAt'>) => Promise<Fornecedor>;
  updateFornecedor: (id: number, data: Partial<Fornecedor>) => Promise<void>;
  deleteFornecedor: (id: number) => Promise<void>;
  
  // Notas Fiscais
  fetchNotasFiscais: (filters?: { dataInicio?: string; dataFim?: string }) => Promise<void>;
  fetchNotaFiscal: (id: number) => Promise<NotaFiscal | null>;
  addNotaFiscal: (data: Omit<NotaFiscal, 'id' | 'userId' | 'createdAt' | 'itens' | 'valorTotal' | 'totalItens'>) => Promise<NotaFiscal>;
  updateNotaFiscal: (id: number, data: Partial<NotaFiscal>) => Promise<void>;
  deleteNotaFiscal: (id: number) => Promise<void>;
  
  // Itens da Nota
  fetchItensNota: (notaId: number) => Promise<ItemNf[]>;
  addItemNota: (notaId: number, data: Omit<ItemNf, 'id' | 'notaFiscalId' | 'userId' | 'createdAt'>) => Promise<ItemNf>;
  updateItemNota: (id: number, data: Partial<ItemNf>) => Promise<void>;
  deleteItemNota: (id: number) => Promise<void>;
  
  // Catálogo
  fetchCatalogo: () => Promise<void>;
  addCatalogoItem: (data: Omit<ItemCatalogo, 'id' | 'userId' | 'createdAt'>) => Promise<ItemCatalogo>;
  importCatalogo: (itens: Omit<ItemCatalogo, 'id' | 'userId' | 'createdAt'>[]) => Promise<void>;
  deleteCatalogoItem: (id: number) => Promise<void>;
  deleteAllCatalogo: () => Promise<void>;
  
  // Dashboard
  fetchDashboard: () => Promise<void>;
  
  // Reset
  reset: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isLoading: false,
  fornecedores: [],
  notasFiscais: [],
  itensCatalogo: [],
  dashboardStats: null,
  dashboardVariacoes: null,
  valorPorMes: [],
  itensPorCategoria: [],
  gastosPorFilial: [],
  topItens: [],
  entradasPorFornecedor: [],
  
  // Fornecedores
  fetchFornecedores: async () => {
    try {
      const result = await api.getFornecedores();
      set({ fornecedores: result.data || [] });
    } catch (error) {
      console.error('Error fetching fornecedores:', error);
    }
  },
  
  addFornecedor: async (data) => {
    const result = await api.createFornecedor(data);
    const novo = result.data;
    set((state) => ({ fornecedores: [novo, ...state.fornecedores] }));
    return novo;
  },
  
  updateFornecedor: async (id, data) => {
    const result = await api.updateFornecedor(id, data);
    set((state) => ({
      fornecedores: state.fornecedores.map((f) => (f.id === id ? result.data : f)),
    }));
  },
  
  deleteFornecedor: async (id) => {
    await api.deleteFornecedor(id);
    set((state) => ({
      fornecedores: state.fornecedores.filter((f) => f.id !== id),
    }));
  },
  
  // Notas Fiscais
  fetchNotasFiscais: async (filters) => {
    set({ isLoading: true });
    try {
      const result = await api.getNotasFiscais(filters);
      set({ notasFiscais: result.data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching notas fiscais:', error);
      set({ isLoading: false });
    }
  },
  
  fetchNotaFiscal: async (id) => {
    try {
      const result = await api.getNotaFiscal(id);
      return result.data || null;
    } catch (error) {
      console.error('Error fetching nota fiscal:', error);
      return null;
    }
  },
  
  addNotaFiscal: async (data) => {
    const result = await api.createNotaFiscal(data);
    const nova = result.data;
    set((state) => ({ notasFiscais: [nova, ...state.notasFiscais] }));
    return nova;
  },
  
  updateNotaFiscal: async (id, data) => {
    const result = await api.updateNotaFiscal(id, data);
    set((state) => ({
      notasFiscais: state.notasFiscais.map((n) => (n.id === id ? result.data : n)),
    }));
  },
  
  deleteNotaFiscal: async (id) => {
    await api.deleteNotaFiscal(id);
    set((state) => ({
      notasFiscais: state.notasFiscais.filter((n) => n.id !== id),
    }));
  },
  
  // Itens da Nota
  fetchItensNota: async (notaId) => {
    try {
      const result = await api.getItensNota(notaId);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching itens:', error);
      return [];
    }
  },
  
  addItemNota: async (notaId, data) => {
    const result = await api.createItemNota(notaId, data);
    return result.data;
  },
  
  updateItemNota: async (id, data) => {
    await api.updateItemNota(id, data);
  },
  
  deleteItemNota: async (id) => {
    await api.deleteItemNota(id);
  },
  
  // Catálogo
  fetchCatalogo: async () => {
    try {
      const result = await api.getCatalogo();
      set({ itensCatalogo: result.data || [] });
    } catch (error) {
      console.error('Error fetching catalogo:', error);
    }
  },
  
  addCatalogoItem: async (data) => {
    const result = await api.createCatalogoItem(data);
    const novo = result.data;
    set((state) => ({ itensCatalogo: [novo, ...state.itensCatalogo] }));
    return novo;
  },
  
  importCatalogo: async (itens) => {
    console.log('[Store] importCatalogo - importing', itens.length, 'items');
    try {
      const result = await api.importCatalogo(itens);
      console.log('[Store] importCatalogo - result:', result);
      set({ itensCatalogo: [...result.data, ...get().itensCatalogo] });
    } catch (error) {
      console.error('[Store] importCatalogo - error:', error);
      throw error;
    }
  },
  
  deleteCatalogoItem: async (id) => {
    await api.deleteCatalogoItem(id);
    set((state) => ({
      itensCatalogo: state.itensCatalogo.filter((i) => i.id !== id),
    }));
  },
  
  deleteAllCatalogo: async () => {
    await api.deleteAllCatalogo();
    set({ itensCatalogo: [] });
  },
  
  // Dashboard
  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const result = await api.getDashboard();
      const data = result.data;
      set({
        dashboardStats: data.stats,
        dashboardVariacoes: data.variacoes || null,
        valorPorMes: data.valorPorMes,
        itensPorCategoria: data.itensPorCategoria,
        gastosPorFilial: data.gastosPorFilial || [],
        topItens: data.topItens,
        entradasPorFornecedor: data.entradasPorFornecedor,
        notasFiscais: data.notas,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      set({ isLoading: false });
    }
  },
  
  reset: () => {
    set({
      fornecedores: [],
      notasFiscais: [],
      itensCatalogo: [],
      dashboardStats: null,
      valorPorMes: [],
      itensPorCategoria: [],
      topItens: [],
      entradasPorFornecedor: [],
    });
  },
}));

// Filiais disponíveis
export const FILIAIS = [
  'Cunha Porã',
  'São Paulo',
  'Curitiba',
  'Florianópolis',
  'Porto Alegre',
];
