// Tipos do Sistema CNR - Controle da Transportes Canarinho
// Os tipos principais agora estão em src/store/useAppStore.ts

// Filiais disponíveis
export const FILIAIS = [
  'Cunha Porã',
  'São Paulo',
  'Curitiba',
  'Florianópolis',
  'Porto Alegre',
];

// Re-export types from store
export type { 
  Fornecedor, 
  NotaFiscal, 
  ItemNf, 
  ItemCatalogo,
  DashboardStats 
} from '../store/useAppStore';
