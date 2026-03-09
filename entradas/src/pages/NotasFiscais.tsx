import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, FileDown, Calendar } from 'lucide-react';
import { Button, Table, Badge, Modal } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import type { NotaFiscal } from '../store/useAppStore';

export function NotasFiscais() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { notasFiscais, fetchNotasFiscais, deleteNotaFiscal, isLoading } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modalExcluir, setModalExcluir] = useState(false);
  const [nfSelecionada, setNfSelecionada] = useState<NotaFiscal | null>(null);

  useEffect(() => {
    fetchNotasFiscais();
  }, [fetchNotasFiscais]);

  // Aplicar filtros
  useEffect(() => {
    if (dataInicio || dataFim) {
      fetchNotasFiscais({ dataInicio, dataFim });
    }
  }, [dataInicio, dataFim, fetchNotasFiscais]);

  const notasFiltradas = notasFiscais.filter(nf => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return nf.numero.toLowerCase().includes(term) || nf.fornecedor.toLowerCase().includes(term);
  });

  const formatarData = (data: string) => {
    if (!data) return '-';
    try {
      return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  const formatarValor = (valor: number) => {
    if (isNaN(valor) || valor === undefined || valor === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return { label: 'Rascunho', variant: 'warning' as const };
      case 'confirmada':
        return { label: 'Confirmada', variant: 'success' as const };
      case 'cancelada':
        return { label: 'Cancelada', variant: 'error' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  const handleExcluir = async () => {
    if (nfSelecionada) {
      await deleteNotaFiscal(nfSelecionada.id);
      setModalExcluir(false);
      setNfSelecionada(null);
    }
  };

  const exportarRelatorio = () => {
    const notas = notasFiltradas;
    if (notas.length === 0) return;

    const totalGeral = notas.reduce((sum, nf) => sum + (nf.valorTotal || 0), 0);
    const totalDescontos = notas.reduce((sum, nf) => sum + (nf.itens?.reduce((s, i) => s + (i.desconto || 0), 0) || 0), 0);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Notas Fiscais - Transportes Canarinho</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e40af; padding-bottom: 20px; }
    .header h1 { color: #1e40af; margin: 0; font-size: 24px; }
    .header p { color: #666; margin: 5px 0 0 0; }
    .periodo { background: #f3f4f6; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; display: inline-block; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) { background: #f9fafb; }
    .valor { text-align: right; font-family: monospace; }
    .totais { margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px; }
    .totais h3 { margin: 0 0 15px 0; color: #1e40af; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .total-row:last-child { border-bottom: none; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 11px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Transportes Canarinho</h1>
    <p>Relatório de Notas Fiscais</p>
  </div>
  
  <div class="periodo">
    <strong>Período:</strong> ${dataInicio ? formatarData(dataInicio) : 'Início'} até ${dataFim ? formatarData(dataFim) : 'Hoje'}
    <br><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}
  </div>

  <table>
    <thead>
      <tr>
        <th>N-F</th>
        <th>Fornecedor</th>
        <th>Data Entrada</th>
        <th>Filial</th>
        <th>Itens</th>
        <th class="valor">Valor Total</th>
      </tr>
    </thead>
    <tbody>
      ${notas.map(nf => `
        <tr>
          <td><strong>${nf.numero}</strong></td>
          <td>${nf.fornecedor}</td>
          <td>${formatarData(nf.dataEntrada)}</td>
          <td>${nf.filial}</td>
          <td>${nf.totalItens || 0}</td>
          <td class="valor">${formatarValor(nf.valorTotal || 0)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totais">
    <h3>Resumo</h3>
    <div class="total-row"><span>Total de Notas:</span><span>${notas.length}</span></div>
    <div class="total-row"><span>Total de Itens:</span><span>${notas.reduce((s, n) => s + (n.totalItens || 0), 0)}</span></div>
    <div class="total-row"><span>Total de Descontos:</span><span>${formatarValor(totalDescontos)}</span></div>
    <div class="total-row"><span>Valor Geral:</span><span>${formatarValor(totalGeral)}</span></div>
  </div>

  <div class="footer">
    Sistema CNR - Controle de Notas Fiscais | Transportes Canarinho
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-nf-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'numero',
      header: 'N-F',
      width: '120px',
      render: (nf: NotaFiscal) => (
        <div>
          <p className="font-medium">{nf.numero}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatarData(nf.dataEmissao)}</p>
        </div>
      )
    },
    {
      key: 'fornecedor',
      header: 'Fornecedor',
      render: (nf: NotaFiscal) => (
        <div>
          <p className="font-medium">{nf.fornecedor}</p>
          {nf.cnpj && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{nf.cnpj}</p>}
        </div>
      )
    },
    {
      key: 'dataEntrada',
      header: 'Entrada',
      width: '110px',
      render: (nf: NotaFiscal) => formatarData(nf.dataEntrada)
    },
    {
      key: 'filial',
      header: 'Filial',
      width: '120px',
      render: (nf: NotaFiscal) => nf.filial
    },
    {
      key: 'itens',
      header: 'Itens',
      width: '80px',
      render: (nf: NotaFiscal) => nf.totalItens || 0
    },
    {
      key: 'valor',
      header: 'Valor',
      width: '130px',
      render: (nf: NotaFiscal) => (
        <span className="font-medium" style={{ color: 'var(--primary)' }}>
          {formatarValor(nf.valorTotal || 0)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (nf: NotaFiscal) => {
        const status = getStatusBadge(nf.status);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      }
    },
    {
      key: 'acoes',
      header: '',
      width: '80px',
      render: (nf: NotaFiscal) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNfSelecionada(nf);
              setModalExcluir(true);
            }}
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: 'var(--danger)' }}
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Notas Fiscais</h1>
            <p className="page-description">
              {notasFiscais.length} nota{notasFiscais.length !== 1 ? 's' : ''} fiscal{notasFiscais.length !== 1 ? 'is' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={exportarRelatorio}
              icon={<FileDown className="w-4 h-4" />}
              disabled={notasFiltradas.length === 0}
            >
              Exportar
            </Button>
            <Button
              onClick={() => navigate('/notas/nova')}
              icon={<Plus className="w-4 h-4" />}
            >
              Nova N-F
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Buscar
            </label>
            <div className="input-icon-wrapper">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Número ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="w-3 h-3 inline mr-1" />
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="input"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Calendar className="w-3 h-3 inline mr-1" />
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="input"
            />
          </div>
          {(dataInicio || dataFim) && (
            <Button
              variant="secondary"
              onClick={() => {
                setDataInicio('');
                setDataFim('');
                fetchNotasFiscais();
              }}
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Table
          data={notasFiltradas}
          columns={columns}
          onRowClick={(nf) => navigate(`/notas/${nf.id}`)}
          emptyMessage={
            searchTerm || dataInicio || dataFim
              ? 'Nenhuma nota fiscal encontrada com os filtros aplicados'
              : 'Nenhuma nota fiscal cadastrada. Clique em "Nova N-F" para começar.'
          }
        />
      )}

      {/* Modal Excluir */}
      <Modal
        isOpen={modalExcluir}
        onClose={() => {
          setModalExcluir(false);
          setNfSelecionada(null);
        }}
        title="Excluir Nota Fiscal"
        size="sm"
      >
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Tem certeza que deseja excluir a nota fiscal <strong>{nfSelecionada?.numero}</strong>?
          <br />
          <span className="text-sm">Todos os itens da nota também serão excluídos.</span>
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalExcluir(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleExcluir}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
