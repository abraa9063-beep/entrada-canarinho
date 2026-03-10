import { supabase } from '../lib/supabase';
import { createEdgeSpark } from "@edgespark/client";
import "@edgespark/client/styles.css";

// Backend URL - staging environment
const WORKER_URL = "https://staging--r22j9rjsvdf4nm1siodh.youbase.cloud";

export const client = createEdgeSpark({ baseUrl: WORKER_URL });

// Helper functions for API calls
export const api = {
   // Fornecedores
  async getFornecedores() {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: (data || []).map((f: any, index: number) => ({
        id: index + 1,
        nome: f.nome,
        cnpj: f.cnpj || '',
        telefone: '',
        email: '',
        endereco: '',
        observacoes: '',
        userId: f.empresa_id,
        createdAt: new Date(f.created_at).getTime(),
        supabaseId: f.id,
      })),
    };
  },
  
  async createFornecedor(data: any) {
    const empresaId = '560bf9db-5f5f-4f4e-bc64-c11f073ae78a';

    const { data: inserted, error } = await supabase
      .from('fornecedores')
      .insert([
        {
          empresa_id: empresaId,
          nome: data.nome,
          cnpj: data.cnpj || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      data: {
        id: Date.now(),
        nome: inserted.nome,
        cnpj: inserted.cnpj || '',
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
        userId: inserted.empresa_id,
        createdAt: new Date(inserted.created_at).getTime(),
        supabaseId: inserted.id,
      },
    };
  },
  
  async updateFornecedor(id: number, data: any) {
    const { data: fornecedores, error: listError } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) throw listError;

    const atual = (fornecedores || [])[id - 1];
    if (!atual) throw new Error('Fornecedor não encontrado no Supabase.');

    const { data: updated, error } = await supabase
      .from('fornecedores')
      .update({
        nome: data.nome ?? atual.nome,
        cnpj: data.cnpj ?? atual.cnpj,
      })
      .eq('id', atual.id)
      .select()
      .single();

    if (error) throw error;

    return {
      data: {
        id,
        nome: updated.nome,
        cnpj: updated.cnpj || '',
        telefone: data.telefone || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
        userId: updated.empresa_id,
        createdAt: new Date(updated.created_at).getTime(),
        supabaseId: updated.id,
      },
    };
  },
  
  async deleteFornecedor(id: number) {
    const { data: fornecedores, error: listError } = await supabase
      .from('fornecedores')
      .select('*')
      .order('created_at', { ascending: false });

    if (listError) throw listError;

    const atual = (fornecedores || [])[id - 1];
    if (!atual) throw new Error('Fornecedor não encontrado no Supabase.');

    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', atual.id);

    if (error) throw error;

    return { success: true };
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
