/**
 * EDGESPARK BACKEND - Sistema CNR
 * Controle de Notas Fiscais e Estoque - Transportes Canarinho
 */

import { Hono } from "hono";
import type { Client } from "@sdk/server-types";
import { tables } from "@generated";
import { eq, desc, and, gte, lte, like, sql } from "drizzle-orm";

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();
  const { fornecedores, notasFiscais, itensNf, itensCatalogo } = tables;
  const db = edgespark.db;
  const user = () => edgespark.auth.user!;

  // ═══════════════════════════════════════════════════════════
  // FORNECEDORES
  // ═══════════════════════════════════════════════════════════

  // Listar fornecedores
  app.get("/api/fornecedores", async (c) => {
    console.log("[API] GET /api/fornecedores - user:", user().id);
    const result = await db
      .select()
      .from(fornecedores)
      .where(eq(fornecedores.userId, user().id))
      .orderBy(desc(fornecedores.createdAt));
    return c.json({ data: result });
  });

  // Criar fornecedor
  app.post("/api/fornecedores", async (c) => {
    const body = await c.req.json();
    console.log("[API] POST /api/fornecedores - creating:", body.nome);
    const result = await db
      .insert(fornecedores)
      .values({
        nome: body.nome,
        cnpj: body.cnpj || null,
        telefone: body.telefone || null,
        email: body.email || null,
        endereco: body.endereco || null,
        observacoes: body.observacoes || null,
        userId: user().id,
      })
      .returning();
    console.log("[API] POST /api/fornecedores - success, id:", result[0].id);
    return c.json({ data: result[0] }, 201);
  });

  // Atualizar fornecedor
  app.put("/api/fornecedores/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    console.log("[API] PUT /api/fornecedores/" + id);
    const result = await db
      .update(fornecedores)
      .set({
        nome: body.nome,
        cnpj: body.cnpj || null,
        telefone: body.telefone || null,
        email: body.email || null,
        endereco: body.endereco || null,
        observacoes: body.observacoes || null,
      })
      .where(and(eq(fornecedores.id, id), eq(fornecedores.userId, user().id)))
      .returning();
    if (result.length === 0) {
      return c.json({ error: "Fornecedor não encontrado" }, 404);
    }
    return c.json({ data: result[0] });
  });

  // Deletar fornecedor
  app.delete("/api/fornecedores/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    console.log("[API] DELETE /api/fornecedores/" + id);
    const result = await db
      .delete(fornecedores)
      .where(and(eq(fornecedores.id, id), eq(fornecedores.userId, user().id)))
      .returning();
    if (result.length === 0) {
      return c.json({ error: "Fornecedor não encontrado" }, 404);
    }
    return c.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // NOTAS FISCAIS
  // ═══════════════════════════════════════════════════════════

  // Listar notas fiscais com filtros
  app.get("/api/notas-fiscais", async (c) => {
    const { dataInicio, dataFim, fornecedor: fornecedorFilter } = c.req.query();
    console.log("[API] GET /api/notas-fiscais - user:", user().id);
    
    let query = db
      .select()
      .from(notasFiscais)
      .where(eq(notasFiscais.userId, user().id));

    // Aplicar filtros de data
    const conditions = [eq(notasFiscais.userId, user().id)];
    if (dataInicio) {
      conditions.push(gte(notasFiscais.dataEntrada, dataInicio));
    }
    if (dataFim) {
      conditions.push(lte(notasFiscais.dataEntrada, dataFim));
    }
    if (fornecedorFilter) {
      conditions.push(like(notasFiscais.fornecedor, `%${fornecedorFilter}%`));
    }

    const result = await db
      .select()
      .from(notasFiscais)
      .where(and(...conditions))
      .orderBy(desc(notasFiscais.dataEntrada));

    // Buscar itens de cada nota
    const notasComItens = await Promise.all(
      result.map(async (nota) => {
        const itens = await db
          .select()
          .from(itensNf)
          .where(eq(itensNf.notaFiscalId, nota.id));
        const valorTotal = itens.reduce((sum, item) => {
          const qtd = Number(item.quantidade) || 0;
          const preco = Number(item.precoUnitario) || 0;
          const desc = Number(item.desconto) || 0;
          return sum + (qtd * preco) - desc;
        }, 0);
        return {
          ...nota,
          itens,
          valorTotal,
          totalItens: itens.length,
        };
      })
    );

    return c.json({ data: notasComItens });
  });

  // Obter nota fiscal por ID
  app.get("/api/notas-fiscais/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    console.log("[API] GET /api/notas-fiscais/" + id);
    
    const result = await db
      .select()
      .from(notasFiscais)
      .where(and(eq(notasFiscais.id, id), eq(notasFiscais.userId, user().id)));

    if (result.length === 0) {
      return c.json({ error: "Nota fiscal não encontrada" }, 404);
    }

    const nota = result[0];
    const itens = await db
      .select()
      .from(itensNf)
      .where(eq(itensNf.notaFiscalId, nota.id));

    const valorTotal = itens.reduce((sum, item) => {
      const qtd = Number(item.quantidade) || 0;
      const preco = Number(item.precoUnitario) || 0;
      const desc = Number(item.desconto) || 0;
      return sum + (qtd * preco) - desc;
    }, 0);

    return c.json({ data: { ...nota, itens, valorTotal, totalItens: itens.length } });
  });

  // Criar nota fiscal
  app.post("/api/notas-fiscais", async (c) => {
    const body = await c.req.json();
    console.log("[API] POST /api/notas-fiscais - numero:", body.numero);
    
    const result = await db
      .insert(notasFiscais)
      .values({
        numero: body.numero,
        dataEmissao: body.dataEmissao,
        dataEntrada: body.dataEntrada,
        fornecedor: body.fornecedor,
        cnpj: body.cnpj || null,
        filial: body.filial,
        responsavel: body.responsavel || null,
        chaveAcesso: body.chaveAcesso || null,
        observacoes: body.observacoes || null,
        status: body.status || "rascunho",
        userId: user().id,
      })
      .returning();
    
    console.log("[API] POST /api/notas-fiscais - success, id:", result[0].id);
    return c.json({ data: result[0] }, 201);
  });

  // Atualizar nota fiscal
  app.put("/api/notas-fiscais/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    console.log("[API] PUT /api/notas-fiscais/" + id);
    
    const result = await db
      .update(notasFiscais)
      .set({
        numero: body.numero,
        dataEmissao: body.dataEmissao,
        dataEntrada: body.dataEntrada,
        fornecedor: body.fornecedor,
        cnpj: body.cnpj || null,
        filial: body.filial,
        responsavel: body.responsavel || null,
        chaveAcesso: body.chaveAcesso || null,
        observacoes: body.observacoes || null,
        status: body.status,
      })
      .where(and(eq(notasFiscais.id, id), eq(notasFiscais.userId, user().id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Nota fiscal não encontrada" }, 404);
    }
    return c.json({ data: result[0] });
  });

  // Deletar nota fiscal (e seus itens)
  app.delete("/api/notas-fiscais/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    console.log("[API] DELETE /api/notas-fiscais/" + id);
    
    // Deletar itens primeiro
    await db.delete(itensNf).where(eq(itensNf.notaFiscalId, id));
    
    // Deletar nota
    const result = await db
      .delete(notasFiscais)
      .where(and(eq(notasFiscais.id, id), eq(notasFiscais.userId, user().id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Nota fiscal não encontrada" }, 404);
    }
    return c.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // ITENS DA NOTA FISCAL
  // ═══════════════════════════════════════════════════════════

  // Listar itens de uma nota
  app.get("/api/notas-fiscais/:notaId/itens", async (c) => {
    const notaId = parseInt(c.req.param("notaId"));
    console.log("[API] GET /api/notas-fiscais/" + notaId + "/itens");
    
    const result = await db
      .select()
      .from(itensNf)
      .where(and(eq(itensNf.notaFiscalId, notaId), eq(itensNf.userId, user().id)));
    return c.json({ data: result });
  });

  // Adicionar item à nota
  app.post("/api/notas-fiscais/:notaId/itens", async (c) => {
    const notaId = parseInt(c.req.param("notaId"));
    const body = await c.req.json();
    console.log("[API] POST /api/notas-fiscais/" + notaId + "/itens");
    
    const result = await db
      .insert(itensNf)
      .values({
        notaFiscalId: notaId,
        descricao: body.descricao,
        categoria: body.categoria || null,
        quantidade: body.quantidade,
        unidade: body.unidade || "UN",
        precoUnitario: body.precoUnitario,
        desconto: body.desconto || 0,
        userId: user().id,
      })
      .returning();
    
    return c.json({ data: result[0] }, 201);
  });

  // Atualizar item
  app.put("/api/itens-nf/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    console.log("[API] PUT /api/itens-nf/" + id);
    
    const result = await db
      .update(itensNf)
      .set({
        descricao: body.descricao,
        categoria: body.categoria || null,
        quantidade: body.quantidade,
        unidade: body.unidade || "UN",
        precoUnitario: body.precoUnitario,
        desconto: body.desconto || 0,
      })
      .where(and(eq(itensNf.id, id), eq(itensNf.userId, user().id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Item não encontrado" }, 404);
    }
    return c.json({ data: result[0] });
  });

  // Deletar item
  app.delete("/api/itens-nf/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    console.log("[API] DELETE /api/itens-nf/" + id);
    
    const result = await db
      .delete(itensNf)
      .where(and(eq(itensNf.id, id), eq(itensNf.userId, user().id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Item não encontrado" }, 404);
    }
    return c.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // CATÁLOGO DE ITENS
  // ═══════════════════════════════════════════════════════════

  // Listar catálogo
  app.get("/api/catalogo", async (c) => {
    console.log("[API] GET /api/catalogo - user:", user().id);
    const result = await db
      .select()
      .from(itensCatalogo)
      .where(eq(itensCatalogo.userId, user().id))
      .orderBy(desc(itensCatalogo.createdAt));
    return c.json({ data: result });
  });

  // Adicionar ao catálogo
  app.post("/api/catalogo", async (c) => {
    const body = await c.req.json();
    console.log("[API] POST /api/catalogo - descricao:", body.descricao);
    
    const result = await db
      .insert(itensCatalogo)
      .values({
        descricao: body.descricao,
        categoria: body.categoria || null,
        unidade: body.unidade || "UN",
        precoReferencia: body.precoReferencia || null,
        userId: user().id,
      })
      .returning();
    
    return c.json({ data: result[0] }, 201);
  });

  // Importar catálogo em massa
  app.post("/api/catalogo/import", async (c) => {
    const body = await c.req.json();
    console.log("[API] POST /api/catalogo/import - count:", body.itens?.length);
    
    if (!body.itens || !Array.isArray(body.itens)) {
      return c.json({ error: "Lista de itens inválida" }, 400);
    }

    const values = body.itens.map((item: any) => ({
      descricao: item.descricao,
      categoria: item.categoria || null,
      unidade: item.unidade || "UN",
      precoReferencia: item.precoReferencia || null,
      userId: user().id,
    }));

    const result = await db.insert(itensCatalogo).values(values).returning();
    return c.json({ data: result, count: result.length }, 201);
  });

  // Deletar TODOS os itens do catálogo (deve vir antes de /:id)
  app.delete("/api/catalogo/all", async (c) => {
    console.log("[API] DELETE /api/catalogo/all - user:", user().id);
    
    const result = await db
      .delete(itensCatalogo)
      .where(eq(itensCatalogo.userId, user().id))
      .returning();

    console.log("[API] DELETE /api/catalogo/all - deleted:", result.length, "items");
    return c.json({ success: true, count: result.length });
  });

  // Deletar do catálogo
  app.delete("/api/catalogo/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    console.log("[API] DELETE /api/catalogo/" + id);
    
    if (isNaN(id)) {
      return c.json({ error: "ID inválido" }, 400);
    }
    
    const result = await db
      .delete(itensCatalogo)
      .where(and(eq(itensCatalogo.id, id), eq(itensCatalogo.userId, user().id)))
      .returning();

    if (result.length === 0) {
      return c.json({ error: "Item não encontrado" }, 404);
    }
    return c.json({ success: true });
  });

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD / ESTATÍSTICAS
  // ═══════════════════════════════════════════════════════════

  app.get("/api/dashboard", async (c) => {
    console.log("[API] GET /api/dashboard - user:", user().id);
    
    // Data atual para comparações
    const hoje = new Date();
    const mesAtual = hoje.toISOString().substring(0, 7); // YYYY-MM
    const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().substring(0, 7);
    
    // Buscar todas as notas com itens
    const notas = await db
      .select()
      .from(notasFiscais)
      .where(eq(notasFiscais.userId, user().id))
      .orderBy(desc(notasFiscais.dataEntrada));

    // Buscar todos os itens
    const todosItens = await db
      .select()
      .from(itensNf)
      .where(eq(itensNf.userId, user().id));

    // Calcular estatísticas
    let valorTotal = 0;
    let totalItens = 0;
    let totalDescontos = 0;
    let totalLitrosDiesel = 0;
    const porMes: Record<string, number> = {};
    const porCategoria: Record<string, { quantidade: number; valor: number }> = {};
    const porFornecedor: Record<string, { quantidade: number; valor: number; notas: Set<string> }> = {};
    const porFilial: Record<string, { quantidade: number; valor: number; notas: number }> = {};
    const topItens: Record<string, { quantidade: number; valor: number }> = {};
    
    // Para cálculo de variações
    let valorMesAtual = 0;
    let valorMesPassado = 0;
    let nfMesAtual = 0;
    let nfMesPassado = 0;
    let itensMesAtual = 0;
    let itensMesPassado = 0;
    let dieselMesAtual = 0;
    let dieselMesPassado = 0;

    todosItens.forEach((item) => {
      const qtd = Number(item.quantidade) || 0;
      const preco = Number(item.precoUnitario) || 0;
      const desc = Number(item.desconto) || 0;
      const valorItem = (qtd * preco) - desc;
      
      valorTotal += valorItem;
      totalItens += 1;
      totalDescontos += desc;

      // Diesel (contagem especial)
      if (item.categoria?.toLowerCase() === "diesel") {
        totalLitrosDiesel += qtd;
      }
    });

    // Agrupar por nota
    const notasComValores = notas.map((nota) => {
      const itensNota = todosItens.filter((i) => i.notaFiscalId === nota.id);
      const valor = itensNota.reduce((sum, item) => {
        const qtd = Number(item.quantidade) || 0;
        const preco = Number(item.precoUnitario) || 0;
        const desc = Number(item.desconto) || 0;
        return sum + (qtd * preco) - desc;
      }, 0);

      // Por mês
      const mes = nota.dataEntrada?.substring(0, 7) || "sem data";
      porMes[mes] = (porMes[mes] || 0) + valor;
      
      // Por filial
      const filial = nota.filial || "Sem filial";
      if (!porFilial[filial]) {
        porFilial[filial] = { quantidade: 0, valor: 0, notas: 0 };
      }
      porFilial[filial].valor += valor;
      porFilial[filial].quantidade += itensNota.length;
      porFilial[filial].notas += 1;
      
      // Cálculo de variações por mês
      if (mes === mesAtual) {
        valorMesAtual += valor;
        nfMesAtual += 1;
        itensMesAtual += itensNota.length;
        itensNota.forEach((item) => {
          if (item.categoria?.toLowerCase() === "diesel") {
            dieselMesAtual += Number(item.quantidade) || 0;
          }
        });
      } else if (mes === mesPassado) {
        valorMesPassado += valor;
        nfMesPassado += 1;
        itensMesPassado += itensNota.length;
        itensNota.forEach((item) => {
          if (item.categoria?.toLowerCase() === "diesel") {
            dieselMesPassado += Number(item.quantidade) || 0;
          }
        });
      }

      // Por fornecedor
      const forn = nota.fornecedor || "Sem fornecedor";
      if (!porFornecedor[forn]) {
        porFornecedor[forn] = { quantidade: 0, valor: 0, notas: new Set() };
      }
      porFornecedor[forn].valor += valor;
      porFornecedor[forn].quantidade += itensNota.length;
      porFornecedor[forn].notas.add(nota.numero);

      // Por categoria e top itens
      itensNota.forEach((item) => {
        const qtd = Number(item.quantidade) || 0;
        const preco = Number(item.precoUnitario) || 0;
        const desc = Number(item.desconto) || 0;
        const v = (qtd * preco) - desc;

        const cat = item.categoria || "Sem categoria";
        if (!porCategoria[cat]) {
          porCategoria[cat] = { quantidade: 0, valor: 0 };
        }
        porCategoria[cat].quantidade += qtd;
        porCategoria[cat].valor += v;

        const descItem = item.descricao || "Sem descrição";
        if (!topItens[descItem]) {
          topItens[descItem] = { quantidade: 0, valor: 0 };
        }
        topItens[descItem].quantidade += qtd;
        topItens[descItem].valor += v;
      });

      return { ...nota, valor, itensCount: itensNota.length };
    });

    // Converter para arrays
    const valorPorMes = Object.entries(porMes)
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    const itensPorCategoria = Object.entries(porCategoria)
      .map(([categoria, data]) => ({
        categoria,
        quantidade: data.quantidade,
        valor: data.valor,
        percentual: valorTotal > 0 ? (data.valor / valorTotal) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    const topItensList = Object.entries(topItens)
      .map(([descricao, data]) => ({
        descricao,
        quantidade: data.quantidade,
        valor: data.valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const entradasPorFornecedor = Object.entries(porFornecedor)
      .map(([fornecedor, data]) => ({
        fornecedor,
        quantidade: data.quantidade,
        valor: data.valor,
        notas: data.notas.size,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const gastosPorFilial = Object.entries(porFilial)
      .map(([filial, data]) => ({
        filial,
        quantidade: data.quantidade,
        valor: data.valor,
        notas: data.notas,
        percentual: valorTotal > 0 ? (data.valor / valorTotal) * 100 : 0,
      }))
      .sort((a, b) => b.valor - a.valor);

    // Calcular variações percentuais
    const calcVariacao = (atual: number, anterior: number): number => {
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return ((atual - anterior) / anterior) * 100;
    };
    
    const ticketMesAtual = nfMesAtual > 0 ? valorMesAtual / nfMesAtual : 0;
    const ticketMesPassado = nfMesPassado > 0 ? valorMesPassado / nfMesPassado : 0;
    
    const variacoes = {
      nf: calcVariacao(nfMesAtual, nfMesPassado),
      valor: calcVariacao(valorMesAtual, valorMesPassado),
      itens: calcVariacao(itensMesAtual, itensMesPassado),
      ticket: calcVariacao(ticketMesAtual, ticketMesPassado),
      diesel: calcVariacao(dieselMesAtual, dieselMesPassado),
    };

    return c.json({
      data: {
        stats: {
          totalNF: notas.length,
          valorTotal,
          totalItensLancados: totalItens,
          totalDescontos,
          ticketMedio: notas.length > 0 ? valorTotal / notas.length : 0,
          totalLitrosDiesel,
        },
        variacoes,
        valorPorMes,
        itensPorCategoria,
        gastosPorFilial,
        topItens: topItensList,
        entradasPorFornecedor,
        notas: notasComValores.slice(0, 10),
      },
    });
  });

  return app;
}
