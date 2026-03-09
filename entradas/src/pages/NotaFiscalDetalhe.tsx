import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Calendar, Building2, FileText, Plus, Trash2 } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../components';
import { useAppStore } from '../store/useAppStore';
import type { NotaFiscal, ItemNf } from '../store/useAppStore';

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'default' }> = {
  rascunho: { label: 'Rascunho', variant: 'warning' },
  confirmada: { label: 'Confirmada', variant: 'success' },
  cancelada: { label: 'Cancelada', variant: 'error' },
};

export function NotaFiscalDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fetchNotaFiscal, fetchItensNota, deleteItemNota, deleteNotaFiscal, updateNotaFiscal } = useAppStore();
  
  const [nf, setNf] = useState<NotaFiscal | null>(null);
  const [itens, setItens] = useState<ItemNf[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalExcluirItem, setModalExcluirItem] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<ItemNf | null>(null);
  const [modalExcluirNF, setModalExcluirNF] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    const nota = await fetchNotaFiscal(parseInt(id!));
    if (nota) {
      setNf(nota);
      setItens(nota.itens || []);
    }
    setLoading(false);
  }

  const totais = useMemo(() => {
    const valorTotal = itens.reduce((acc, item) => {
      const qtd = Number(item.quantidade) || 0;
      const preco = Number(item.precoUnitario) || 0;
      return acc + (qtd * preco);
    }, 0);
    const totalDescontos = itens.reduce((acc, item) => acc + (Number(item.desconto) || 0), 0);
    const valorFinal = valorTotal - totalDescontos;
    const totalQtd = itens.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
    return { valorTotal, totalDescontos, valorFinal, totalQtd };
  }, [itens]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!nf) {
    return (
      <div className="text-center py-12">
        <p style={{ color: 'var(--text-muted)' }}>Nota Fiscal não encontrada</p>
        <Button variant="secondary" onClick={() => navigate('/notas')} className="mt-4">
          Voltar para lista
        </Button>
      </div>
    );
  }

  const status = statusConfig[nf.status] || { label: nf.status, variant: 'default' as const };

  const formatarData = (data: string) => {
    if (!data) return '-';
    try {
      return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarValor = (valor: number) => {
    const num = Number(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const formatarQuantidade = (qtd: number, unidade?: string) => {
    const num = Number(qtd);
    if (isNaN(num)) return '0';
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 4 }) + (unidade ? ` ${unidade}` : '');
  };

  const handleExcluirItem = async () => {
    if (itemSelecionado) {
      await deleteItemNota(itemSelecionado.id);
      setItens(itens.filter(i => i.id !== itemSelecionado.id));
      setModalExcluirItem(false);
      setItemSelecionado(null);
    }
  };

  const handleExcluirNF = async () => {
    await deleteNotaFiscal(nf.id);
    setModalExcluirNF(false);
    navigate('/notas');
  };

  const handleFinalizar = async () => {
    await updateNotaFiscal(nf.id, { status: 'confirmada' });
    setNf({ ...nf, status: 'confirmada' });
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/notas')}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="page-title">{nf.numero}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="page-description">{nf.fornecedor}</p>
        </div>
        <div className="flex gap-2">
          {nf.status === 'rascunho' && (
            <>
              <Button
                variant="secondary"
                onClick={() => navigate(`/notas/${nf.id}/editar`)}
                icon={<Edit className="w-4 h-4" />}
              >
                Editar
              </Button>
              <Button
                onClick={() => navigate(`/notas/${nf.id}/itens`)}
                icon={<Plus className="w-4 h-4" />}
              >
                Adicionar Itens
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info Card */}
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-3 h-3 inline mr-1" />Emissão
                </p>
                <p className="font-medium">{formatarData(nf.dataEmissao)}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-3 h-3 inline mr-1" />Entrada
                </p>
                <p className="font-medium">{formatarData(nf.dataEntrada)}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Building2 className="w-3 h-3 inline mr-1" />Filial
                </p>
                <p className="font-medium">{nf.filial}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Package className="w-3 h-3 inline mr-1" />Itens
                </p>
                <p className="font-medium">{itens.length}</p>
              </div>
            </div>
            {nf.cnpj && (
              <div className="px-5 pb-4">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>CNPJ</p>
                <p className="font-medium">{nf.cnpj}</p>
              </div>
            )}
            {nf.observacoes && (
              <div className="px-5 pb-4">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Observações</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{nf.observacoes}</p>
              </div>
            )}
          </Card>

          {/* Itens */}
          <Card>
            <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold">Itens da Nota</h3>
            </div>
            {itens.length > 0 ? (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {itens.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.descricao}</p>
                        <div className="flex gap-4 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span>{formatarQuantidade(item.quantidade, item.unidade)}</span>
                          <span>x {formatarValor(item.precoUnitario)}</span>
                          {item.desconto > 0 && (
                            <span style={{ color: 'var(--danger)' }}>-{formatarValor(item.desconto)}</span>
                          )}
                        </div>
                        {item.categoria && (
                          <Badge variant="default" className="mt-2">{item.categoria}</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: 'var(--primary)' }}>
                          {formatarValor((item.quantidade * item.precoUnitario) - (item.desconto || 0))}
                        </p>
                        {nf.status === 'rascunho' && (
                          <button
                            onClick={() => {
                              setItemSelecionado(item);
                              setModalExcluirItem(true);
                            }}
                            className="mt-2 p-1 rounded hover:bg-red-50"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum item lançado</p>
                {nf.status === 'rascunho' && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/notas/${nf.id}/itens`)}
                    className="mt-4"
                  >
                    Adicionar Itens
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Totals */}
        <div className="space-y-4">
          <Card>
            <div className="p-5">
              <h3 className="font-semibold mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{formatarValor(totais.valorTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-muted)' }}>Descontos</span>
                  <span style={{ color: 'var(--danger)' }}>-{formatarValor(totais.totalDescontos)}</span>
                </div>
                <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>
                      {formatarValor(totais.valorFinal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {nf.status === 'rascunho' && itens.length > 0 && (
            <Card>
              <div className="p-5">
                <h3 className="font-semibold mb-4">Ações</h3>
                <div className="space-y-3">
                  <Button className="w-full" onClick={handleFinalizar}>
                    Confirmar N-F
                  </Button>
                  <Button 
                    variant="danger" 
                    className="w-full"
                    onClick={() => setModalExcluirNF(true)}
                  >
                    Excluir N-F
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Excluir Item */}
      <Modal
        isOpen={modalExcluirItem}
        onClose={() => {
          setModalExcluirItem(false);
          setItemSelecionado(null);
        }}
        title="Excluir Item"
        size="sm"
      >
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Deseja excluir o item <strong>{itemSelecionado?.descricao}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalExcluirItem(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirItem}>Excluir</Button>
        </div>
      </Modal>

      {/* Modal Excluir NF */}
      <Modal
        isOpen={modalExcluirNF}
        onClose={() => setModalExcluirNF(false)}
        title="Excluir Nota Fiscal"
        size="sm"
      >
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Deseja excluir a nota fiscal <strong>{nf.numero}</strong> e todos os seus itens?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalExcluirNF(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirNF}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
