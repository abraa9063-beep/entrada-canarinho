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
   // Notas Fiscais
  async getNotaFiscal(id: number) {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select(`
      *,
      fornecedores (
        id,
        nome,
        cnpj
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const notas = (data || []).map((atual: any, index: number) => ({
    id: index + 1,
    numero: atual.numero_nf || '',
    dataEmissao: atual.data_emissao || '',
    dataEntrada: atual.data_emissao || '',
    fornecedor: atual.fornecedores?.nome || 'Sem fornecedor',
    cnpj: atual.fornecedores?.cnpj || '',
    filial: 'Matriz',
    responsavel: '',
    chaveAcesso: '',
    observacoes: '',
    status: 'Lançada',
    userId: atual.empresa_id,
    createdAt: new Date(atual.created_at).getTime(),
    itens: [],
    valorTotal: Number(atual.valor_total || 0),
    totalItens: 0,
    supabaseId: atual.id,
    fornecedorId: atual.fornecedor_id
  }));

  const nota = notas.find((n) => n.id === id);

  return { data: nota || null };
}
  },
  
  async getNotaFiscal(id: number) {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select(`
        *,
        fornecedores (
          id,
          nome,
          cnpj
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const atual = (data || [])[id - 1];
    if (!atual) return { data: null };

    return {
      data: {
        id,
        numero: atual.numero_nf || '',
        dataEmissao: atual.data_emissao || '',
        dataEntrada: atual.data_emissao || '',
        fornecedor: atual.fornecedores?.nome || 'Sem fornecedor',
        cnpj: atual.fornecedores?.cnpj || '',
        filial: 'Matriz',
        responsavel: '',
        chaveAcesso: '',
        observacoes: '',
        status: 'Lançada',
        userId: atual.empresa_id,
        createdAt: new Date(atual.created_at).getTime(),
        itens: [],
        valorTotal: Number(atual.valor_total || 0),
        totalItens: 0,
        supabaseId: atual.id,
        fornecedorId: atual.fornecedor_id
      }
    };
  },
  
 async createNotaFiscal(data: any) {
  const empresaId = '560bf9db-5f5f-4f4e-bc64-c11f073ae78a';

  const { data: inserted, error } = await supabase
    .from('notas_fiscais')
    .insert([
      {
        empresa_id: empresaId,
        fornecedor_id: data.fornecedorId,
        numero_nf: data.numero,
        data_emissao: data.dataEmissao,
        valor_total: data.valorTotal || 0
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    data: {
      id: Date.now(),
      numero: inserted.numero_nf,
      dataEmissao: inserted.data_emissao,
      dataEntrada: inserted.data_emissao,
      fornecedor: '',
      cnpj: '',
      filial: 'Matriz',
      responsavel: '',
      chaveAcesso: '',
      observacoes: '',
      status: 'Lançada',
      userId: inserted.empresa_id,
      createdAt: new Date(inserted.created_at).getTime(),
      itens: [],
      valorTotal: inserted.valor_total,
      totalItens: 0,
      supabaseId: inserted.id,
      fornecedorId: inserted.fornecedor_id
    }
  };
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
