import { createEdgeSpark } from "@edgespark/client";
import "@edgespark/client/styles.css";

// Backend URL - staging environment
const WORKER_URL = "https://staging--r22j9rjsvdf4nm1siodh.youbase.cloud";

export const client = createEdgeSpark({ baseUrl: WORKER_URL });

// Helper functions for API calls
export const api = {
  // Fornecedores
  async getFornecedores() {
    const res = await client.api.fetch("/api/fornecedores");
    return res.json();
  },
  
  async createFornecedor(data: any) {
    const res = await client.api.fetch("/api/fornecedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async updateFornecedor(id: number, data: any) {
    const res = await client.api.fetch(`/api/fornecedores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async deleteFornecedor(id: number) {
    const res = await client.api.fetch(`/api/fornecedores/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  
  // Notas Fiscais
  async getNotasFiscais(filters?: { dataInicio?: string; dataFim?: string; fornecedor?: string }) {
    const params = new URLSearchParams();
    if (filters?.dataInicio) params.set("dataInicio", filters.dataInicio);
    if (filters?.dataFim) params.set("dataFim", filters.dataFim);
    if (filters?.fornecedor) params.set("fornecedor", filters.fornecedor);
    
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await client.api.fetch(`/api/notas-fiscais${query}`);
    return res.json();
  },
  
  async getNotaFiscal(id: number) {
    const res = await client.api.fetch(`/api/notas-fiscais/${id}`);
    return res.json();
  },
  
  async createNotaFiscal(data: any) {
    const res = await client.api.fetch("/api/notas-fiscais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async updateNotaFiscal(id: number, data: any) {
    const res = await client.api.fetch(`/api/notas-fiscais/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async deleteNotaFiscal(id: number) {
    const res = await client.api.fetch(`/api/notas-fiscais/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  
  // Itens da Nota
  async getItensNota(notaId: number) {
    const res = await client.api.fetch(`/api/notas-fiscais/${notaId}/itens`);
    return res.json();
  },
  
  async createItemNota(notaId: number, data: any) {
    const res = await client.api.fetch(`/api/notas-fiscais/${notaId}/itens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async updateItemNota(id: number, data: any) {
    const res = await client.api.fetch(`/api/itens-nf/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async deleteItemNota(id: number) {
    const res = await client.api.fetch(`/api/itens-nf/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  
  // Catálogo
  async getCatalogo() {
    const res = await client.api.fetch("/api/catalogo");
    return res.json();
  },
  
  async createCatalogoItem(data: any) {
    const res = await client.api.fetch("/api/catalogo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async importCatalogo(itens: any[]) {
    console.log('[API] importCatalogo - sending', itens.length, 'items');
    console.log('[API] importCatalogo - sample:', itens[0]);
    try {
      const res = await client.api.fetch("/api/catalogo/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itens }),
      });
      const data = await res.json();
      console.log('[API] importCatalogo - response:', data);
      if (!res.ok) {
        throw new Error(data.error || 'Erro na importação');
      }
      return data;
    } catch (error) {
      console.error('[API] importCatalogo - error:', error);
      throw error;
    }
  },
  
  async deleteCatalogoItem(id: number) {
    const res = await client.api.fetch(`/api/catalogo/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
  
  async deleteAllCatalogo() {
    const res = await client.api.fetch("/api/catalogo/all", {
      method: "DELETE",
    });
    return res.json();
  },
  
  // Dashboard
  async getDashboard() {
    const res = await client.api.fetch("/api/dashboard");
    return res.json();
  },
};
