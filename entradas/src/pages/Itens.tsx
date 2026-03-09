import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Upload, Download, Package, FileSpreadsheet, X, Check, AlertCircle, Trash } from 'lucide-react';
import { Button, Table, Modal } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import type { ItemCatalogo } from '../store/useAppStore';

const CATEGORIAS = ['Diesel', 'Peças', 'Pneus', 'Óleo', 'Bateria', 'Serviços', 'Outros'];

interface CSVItem {
  codigo: string;
  descricao: string;
  categoria: string;
  unidade: string;
  preco: number;
}

export function Itens() {
  const { isDark } = useTheme();
  const { itensCatalogo, fetchCatalogo, addCatalogoItem, importCatalogo, deleteCatalogoItem, deleteAllCatalogo } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalApagarTudo, setModalApagarTudo] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<ItemCatalogo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para importação
  const [csvItems, setCSVItems] = useState<CSVItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    unidade: 'UN',
    precoReferencia: ''
  });

  useEffect(() => {
    fetchCatalogo();
  }, [fetchCatalogo]);

  const itensFiltrados = itensCatalogo.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Buscar por descrição ou código (extraído da descrição no formato [CODIGO] descricao)
    const match = item.descricao.match(/^\[(.*?)\]\s*(.*)$/);
    const codigo = match ? match[1].toLowerCase() : '';
    const descricao = match ? match[2].toLowerCase() : item.descricao.toLowerCase();
    return descricao.includes(term) || codigo.includes(term);
  });

  const handleSalvar = async () => {
    if (!formData.descricao.trim()) return;
    
    await addCatalogoItem({
      descricao: formData.descricao,
      categoria: formData.categoria || null,
      unidade: formData.unidade,
      precoReferencia: formData.precoReferencia ? parseFloat(formData.precoReferencia) : null
    });

    setFormData({ descricao: '', categoria: '', unidade: 'UN', precoReferencia: '' });
    setModalAberto(false);
  };

  const handleExcluir = async () => {
    if (itemSelecionado) {
      await deleteCatalogoItem(itemSelecionado.id);
      setModalExcluir(false);
      setItemSelecionado(null);
    }
  };

  // Parse do arquivo CSV
  const parseCSV = (text: string): CSVItem[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];

    // Detectar se tem cabeçalho
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('codigo') || firstLine.includes('descri') || firstLine.includes('nome');
    
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    return dataLines.map((line, index) => {
      // Suporta tanto vírgula quanto ponto e vírgula como separador
      const parts = line.split(/[;,]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
      
      return {
        codigo: parts[0] || '',
        descricao: parts[1] || parts[0] || '', // Se não tiver código, usa a primeira coluna como descrição
        categoria: parts[2] || '',
        unidade: parts[3] || 'UN',
        preco: parts[4] ? parseFloat(parts[4].replace(',', '.')) : 0
      };
    }).filter(item => item.descricao);
  };

  // Handler para upload de arquivo
  const handleFileUpload = (file: File) => {
    setImportError(null);
    setImportSuccess(false);
    
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setImportError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const items = parseCSV(text);
        
        if (items.length === 0) {
          setImportError('Nenhum item encontrado no arquivo. Verifique o formato.');
        } else {
          setCSVItems(items);
        }
      } catch (err) {
        setImportError('Erro ao processar o arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  // Confirmar importação
  const handleConfirmImport = async () => {
    if (csvItems.length === 0) return;

    setIsImporting(true);
    setImportError(null);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Importar um por um para maior compatibilidade
      for (const item of csvItems) {
        try {
          await addCatalogoItem({
            descricao: `${item.codigo ? `[${item.codigo}] ` : ''}${item.descricao}`,
            categoria: item.categoria || null,
            unidade: item.unidade || 'UN',
            precoReferencia: item.preco || null
          });
          successCount++;
        } catch (err) {
          console.error('[Itens] Erro ao importar item:', item.descricao, err);
          errorCount++;
        }
      }

      console.log(`[Itens] Importação finalizada: ${successCount} sucessos, ${errorCount} erros`);
      
      if (successCount > 0) {
        setImportSuccess(true);
        await fetchCatalogo();
        
        setTimeout(() => {
          setCSVItems([]);
          setModalImportar(false);
          setImportSuccess(false);
        }, 1500);
      } else {
        setImportError('Nenhum item foi importado. Verifique o formato do arquivo.');
      }
    } catch (error) {
      console.error('[Itens] Erro na importação:', error);
      setImportError('Erro ao importar itens. Tente novamente.');
    } finally {
      setIsImporting(false);
    }
  };

  // Limpar preview
  const handleClearPreview = () => {
    setCSVItems([]);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportCSV = () => {
    const header = 'Código,Descrição,Categoria,Unidade,Preço\n';
    const csv = itensCatalogo.map(item => {
      // Extrair código da descrição se existir
      const match = item.descricao.match(/^\[(.*?)\]\s*(.*)$/);
      const codigo = match ? match[1] : '';
      const descricao = match ? match[2] : item.descricao;
      return `${codigo},${descricao},${item.categoria || ''},${item.unidade},${item.precoReferencia || ''}`;
    }).join('\n');
    
    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalogo_cnr.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatarValor = (valor: number) => {
    if (!valor || isNaN(valor)) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const columns = [
    {
      key: 'descricao',
      header: 'Descrição',
      render: (item: ItemCatalogo) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}
          >
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{item.descricao}</p>
            {item.categoria && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.categoria}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'unidade',
      header: 'Unidade',
      width: '80px',
      render: (item: ItemCatalogo) => (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{item.unidade}</span>
      )
    },
    {
      key: 'preco',
      header: 'Preço Ref.',
      width: '120px',
      render: (item: ItemCatalogo) => (
        <span className="font-medium">{formatarValor(item.precoReferencia || 0)}</span>
      )
    },
    {
      key: 'acoes',
      header: '',
      width: '60px',
      render: (item: ItemCatalogo) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setItemSelecionado(item);
            setModalExcluir(true);
          }}
          className="p-2 rounded-lg transition-colors hover:bg-red-50"
          style={{ color: 'var(--danger)' }}
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Catálogo</h1>
            <p className="page-description">
              {itensCatalogo.length} item{itensCatalogo.length !== 1 ? 's' : ''} no catálogo
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={exportCSV}
              icon={<Download className="w-4 h-4" />}
              disabled={itensCatalogo.length === 0}
            >
              Exportar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setCSVItems([]);
                setImportError(null);
                setModalImportar(true);
              }}
              icon={<Upload className="w-4 h-4" />}
            >
              Importar CSV
            </Button>
            {itensCatalogo.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setModalApagarTudo(true)}
                icon={<Trash className="w-4 h-4" />}
                className={`text-red-600 ${isDark ? 'hover:bg-red-900/50' : 'hover:bg-red-50'}`}
              >
                Apagar Tudo
              </Button>
            )}
            <Button
              onClick={() => setModalAberto(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Novo Item
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="input-icon-wrapper" style={{ maxWidth: '320px' }}>
          <Search className="input-icon" />
          <input
            type="text"
            placeholder="Buscar por código ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        data={itensFiltrados}
        columns={columns}
        emptyMessage={
          searchTerm
            ? 'Nenhum item encontrado'
            : 'Nenhum item no catálogo. Importe um CSV ou adicione itens manualmente.'
        }
      />

      {/* Modal Novo Item */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Novo Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Descrição *
            </label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do item"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Categoria
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="input"
              >
                <option value="">Selecione</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Unidade
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                className="input"
              >
                <option value="UN">UN</option>
                <option value="LT">LT</option>
                <option value="KG">KG</option>
                <option value="MT">MT</option>
                <option value="PC">PC</option>
                <option value="CX">CX</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Preço Referência
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precoReferencia}
              onChange={(e) => setFormData({ ...formData, precoReferencia: e.target.value })}
              placeholder="0.00"
              className="input"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={!formData.descricao.trim()}>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Importar CSV */}
      <Modal
        isOpen={modalImportar}
        onClose={() => {
          setModalImportar(false);
          setCSVItems([]);
          setImportError(null);
        }}
        title="Importar Catálogo CSV"
      >
        <div className="space-y-4">
          {/* Instruções */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-800 font-medium mb-2">Formato do arquivo CSV:</p>
            <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded block">
              Código,Descrição,Categoria,Unidade,Preço
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Exemplo: <code>001,Óleo Motor 15W40,Óleo,LT,45.00</code>
            </p>
          </div>

          {/* Área de Upload */}
          {csvItems.length === 0 && !importSuccess ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <FileSpreadsheet className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <p className="font-medium text-gray-700 mb-1">
                    {isDragging ? 'Solte o arquivo aqui' : 'Arraste um arquivo CSV ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-gray-500">Suporta arquivos .csv e .txt</p>
                </div>
              </div>

              {importError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {importError}
                </div>
              )}
            </>
          ) : importSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Importação concluída!</p>
              <p className="text-sm text-gray-500">{csvItems.length} itens importados</p>
            </div>
          ) : (
            <>
              {importError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {importError}
                </div>
              )}

              {/* Preview dos dados */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                  {csvItems.length} itens encontrados
                </p>
                <button
                  onClick={handleClearPreview}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Limpar
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">Código</th>
                      <th className="text-left p-3 font-medium text-gray-600">Descrição</th>
                      <th className="text-left p-3 font-medium text-gray-600">Categoria</th>
                      <th className="text-left p-3 font-medium text-gray-600">Un.</th>
                      <th className="text-right p-3 font-medium text-gray-600">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvItems.slice(0, 50).map((item, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs text-gray-500">{item.codigo || '-'}</td>
                        <td className="p-3 font-medium">{item.descricao}</td>
                        <td className="p-3 text-gray-500">{item.categoria || '-'}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{item.unidade}</span>
                        </td>
                        <td className="p-3 text-right font-medium">{item.preco ? formatarValor(item.preco) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvItems.length > 50 && (
                  <p className="text-center py-2 text-sm text-gray-500 bg-gray-50">
                    ... e mais {csvItems.length - 50} itens
                  </p>
                )}
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Button 
              variant="secondary" 
              onClick={() => {
                setModalImportar(false);
                setCSVItems([]);
                setImportError(null);
              }}
            >
              Cancelar
            </Button>
            {csvItems.length > 0 && !importSuccess && (
              <Button onClick={handleConfirmImport} disabled={isImporting}>
                {isImporting ? 'Importando...' : `Importar ${csvItems.length} itens`}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal
        isOpen={modalExcluir}
        onClose={() => {
          setModalExcluir(false);
          setItemSelecionado(null);
        }}
        title="Excluir Item"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-700 mb-1">
            Deseja excluir o item
          </p>
          <p className="font-semibold text-gray-900 mb-4">
            {itemSelecionado?.descricao}?
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setModalExcluir(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExcluir}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Apagar Tudo */}
      <Modal
        isOpen={modalApagarTudo}
        onClose={() => setModalApagarTudo(false)}
        title="Apagar Todo o Catálogo"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">
            Atenção!
          </p>
          <p className="text-gray-600 mb-1">
            Esta ação irá apagar <strong>todos os {itensCatalogo.length} itens</strong> do catálogo.
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setModalApagarTudo(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={async () => {
                await deleteAllCatalogo();
                setModalApagarTudo(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Apagar Tudo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
