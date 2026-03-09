import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Trash2, Package, X } from 'lucide-react';
import { Card, Button, Modal } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import type { ItemNf, ItemCatalogo } from '../store/useAppStore';

const CATEGORIAS = ['Diesel', 'Peças', 'Pneus', 'Óleo', 'Bateria', 'Serviços', 'Outros'];
const UNIDADES = ['UN', 'LT', 'KG', 'MT', 'PC', 'CX'];

export function EntradaItemForm() {
  const navigate = useNavigate();
  const { nfId } = useParams();
  const { isDark } = useTheme();
  const { fetchNotaFiscal, addItemNota, deleteItemNota, fetchCatalogo, itensCatalogo } = useAppStore();
  
  const [nf, setNf] = useState<any>(null);
  const [itens, setItens] = useState<ItemNf[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatalogoModal, setShowCatalogoModal] = useState(false);
  const [searchCatalogo, setSearchCatalogo] = useState('');
  const [modalExcluir, setModalExcluir] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState<ItemNf | null>(null);

  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    quantidade: '',
    unidade: 'UN',
    precoUnitario: '',
    desconto: '0'
  });

  useEffect(() => {
    loadData();
  }, [nfId]);

  async function loadData() {
    setLoading(true);
    const nota = await fetchNotaFiscal(parseInt(nfId!));
    if (nota) {
      setNf(nota);
      setItens(nota.itens || []);
    }
    await fetchCatalogo();
    setLoading(false);
  }

  const catalogoFiltrado = itensCatalogo.filter(item => {
    if (!searchCatalogo) return true;
    const term = searchCatalogo.toLowerCase();
    const match = item.descricao.match(/^\[(.*?)\]\s*(.*)$/);
    const codigo = match ? match[1].toLowerCase() : '';
    const descricao = match ? match[2].toLowerCase() : item.descricao.toLowerCase();
    return descricao.includes(term) || codigo.includes(term);
  });

  const formatarValor = (valor: number) => {
    if (isNaN(valor)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleSelectFromCatalogo = (item: ItemCatalogo) => {
    setFormData({
      descricao: item.descricao,
      categoria: item.categoria || '',
      quantidade: '',
      unidade: item.unidade || 'UN',
      precoUnitario: item.precoReferencia ? item.precoReferencia.toString() : '',
      desconto: '0'
    });
    setShowCatalogoModal(false);
    setSearchCatalogo('');
  };

  const handleAddItem = async () => {
    if (!formData.descricao || !formData.quantidade || !formData.precoUnitario) return;

    const novoItem = await addItemNota(parseInt(nfId!), {
      descricao: formData.descricao,
      categoria: formData.categoria || null,
      quantidade: parseFloat(formData.quantidade),
      unidade: formData.unidade,
      precoUnitario: parseFloat(formData.precoUnitario),
      desconto: parseFloat(formData.desconto) || 0
    });

    setItens([...itens, novoItem]);
    setFormData({
      descricao: '',
      categoria: '',
      quantidade: '',
      unidade: 'UN',
      precoUnitario: '',
      desconto: '0'
    });
  };

  const handleExcluirItem = async () => {
    if (itemSelecionado) {
      await deleteItemNota(itemSelecionado.id);
      setItens(itens.filter(i => i.id !== itemSelecionado.id));
      setModalExcluir(false);
      setItemSelecionado(null);
    }
  };

  const calcularTotal = () => {
    const qtd = parseFloat(formData.quantidade) || 0;
    const preco = parseFloat(formData.precoUnitario) || 0;
    const desc = parseFloat(formData.desconto) || 0;
    return (qtd * preco) - desc;
  };

  const calcularTotalItens = () => {
    return itens.reduce((sum, item) => {
      return sum + (item.quantidade * item.precoUnitario) - (item.desconto || 0);
    }, 0);
  };

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
        <p style={{ color: 'var(--text-muted)' }}>Nota fiscal não encontrada</p>
        <Button onClick={() => navigate('/notas')} className="mt-4">Voltar</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/notas')}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">Lançar Itens</h1>
          <p className="page-description">
            N-F {nf.numero} • {nf.fornecedor}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
          <span className="text-sm font-medium">Total: {formatarValor(calcularTotalItens())}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Novo Item</h3>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowCatalogoModal(true)}
                  icon={<Package className="w-4 h-4" />}
                >
                  Catálogo
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unidade
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    className="input"
                  >
                    {UNIDADES.map((un) => (
                      <option key={un} value={un}>{un}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    placeholder="0"
                    className="input"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preço Unit. *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.precoUnitario}
                    onChange={(e) => setFormData({ ...formData, precoUnitario: e.target.value })}
                    placeholder="0.00"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Desconto
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.desconto}
                  onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                  placeholder="0.00"
                  className="input"
                />
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total do Item</span>
                  <span className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatarValor(calcularTotal())}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleAddItem}
                disabled={!formData.descricao || !formData.quantidade || !formData.precoUnitario}
                icon={<Plus className="w-4 h-4" />}
              >
                Adicionar Item
              </Button>
            </div>
          </Card>
        </div>

        {/* Items List */}
        <div className="lg:col-span-3">
          <Card>
            <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Itens Lançados ({itens.length})
              </h3>
            </div>
            {itens.length > 0 ? (
              <div className={`divide-y max-h-[500px] overflow-y-auto ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {itens.map((item) => (
                  <div key={item.id} className={`p-4 ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.descricao}</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.quantidade} {item.unidade} × {formatarValor(item.precoUnitario)}
                          {item.desconto > 0 && <span className="text-red-500 ml-2">-{formatarValor(item.desconto)}</span>}
                        </p>
                        {item.categoria && (
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {item.categoria}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`font-semibold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {formatarValor((item.quantidade * item.precoUnitario) - (item.desconto || 0))}
                        </span>
                        <button
                          onClick={() => {
                            setItemSelecionado(item);
                            setModalExcluir(true);
                          }}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum item lançado</p>
                <p className="text-sm mt-1">Adicione itens à nota fiscal</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal Catálogo Moderno */}
      <Modal
        isOpen={showCatalogoModal}
        onClose={() => {
          setShowCatalogoModal(false);
          setSearchCatalogo('');
        }}
        title="Selecionar do Catálogo"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar por código ou nome..."
              value={searchCatalogo}
              onChange={(e) => setSearchCatalogo(e.target.value)}
              className={`input pl-10 ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
              autoFocus
            />
          </div>

          {/* Results Grid */}
          <div className="max-h-[400px] overflow-y-auto">
            {catalogoFiltrado.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {catalogoFiltrado.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectFromCatalogo(item)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                        : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.descricao}
                        </p>
                        <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.categoria && (
                            <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              {item.categoria}
                            </span>
                          )}
                          <span>{item.unidade}</span>
                        </div>
                      </div>
                      {item.precoReferencia && (
                        <span className={`font-semibold ml-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {formatarValor(item.precoReferencia)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhum item encontrado</p>
                <p className="text-sm mt-1">Tente outra busca</p>
              </div>
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
        <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Deseja excluir o item <strong className={isDark ? 'text-white' : 'text-gray-900'}>{itemSelecionado?.descricao}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setModalExcluir(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirItem}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
