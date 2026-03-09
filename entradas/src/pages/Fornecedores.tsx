import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import { Button, Table, Modal } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import type { Fornecedor } from '../store/useAppStore';

export function Fornecedores() {
  const { isDark } = useTheme();
  const { fornecedores, fetchFornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  const fornecedoresFiltrados = fornecedores.filter(f => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return f.nome.toLowerCase().includes(term) || (f.cnpj?.includes(term) ?? false);
  });

  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const handleNovo = () => {
    setFornecedorSelecionado(null);
    setFormData({
      nome: '',
      cnpj: '',
      telefone: '',
      email: '',
      endereco: '',
      observacoes: ''
    });
    setModalAberto(true);
  };

  const handleEditar = (fornecedor: Fornecedor) => {
    setFornecedorSelecionado(fornecedor);
    setFormData({
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj || '',
      telefone: fornecedor.telefone || '',
      email: fornecedor.email || '',
      endereco: fornecedor.endereco || '',
      observacoes: fornecedor.observacoes || ''
    });
    setModalAberto(true);
  };

  const handleSalvar = async () => {
    if (!formData.nome.trim()) return;

    if (fornecedorSelecionado) {
      await updateFornecedor(fornecedorSelecionado.id, formData);
    } else {
      await addFornecedor(formData);
    }
    setModalAberto(false);
    setFornecedorSelecionado(null);
  };

  const handleExcluir = async () => {
    if (fornecedorSelecionado) {
      await deleteFornecedor(fornecedorSelecionado.id);
      setModalExcluir(false);
      setFornecedorSelecionado(null);
    }
  };

  const columns = [
    {
      key: 'nome',
      header: 'Fornecedor',
      render: (f: Fornecedor) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium">{f.nome}</p>
            {f.cnpj && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.cnpj}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'telefone',
      header: 'Telefone',
      width: '140px',
      render: (f: Fornecedor) => f.telefone || '-'
    },
    {
      key: 'email',
      header: 'E-mail',
      render: (f: Fornecedor) => f.email || '-'
    },
    {
      key: 'acoes',
      header: '',
      width: '100px',
      render: (f: Fornecedor) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditar(f);
            }}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted)' }}
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFornecedorSelecionado(f);
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
            <h1 className="page-title">Fornecedores</h1>
            <p className="page-description">
              {fornecedores.length} fornecedor{fornecedores.length !== 1 ? 'es' : ''} cadastrado{fornecedores.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={handleNovo}
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="input-icon-wrapper" style={{ maxWidth: '320px' }}>
          <Search className="input-icon" />
          <input
            type="text"
            placeholder="Buscar fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        data={fornecedoresFiltrados}
        columns={columns}
        emptyMessage={
          searchTerm
            ? 'Nenhum fornecedor encontrado'
            : 'Nenhum fornecedor cadastrado. Clique em "Novo Fornecedor" para começar.'
        }
      />

      {/* Modal Cadastro/Edição */}
      <Modal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setFornecedorSelecionado(null);
        }}
        title={fornecedorSelecionado ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Nome / Razão Social *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome do fornecedor"
              className="input"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatarCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Telefone
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Endereço
            </label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Cidade - UF"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={2}
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={!formData.nome.trim()}>
              {fornecedorSelecionado ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Excluir */}
      <Modal
        isOpen={modalExcluir}
        onClose={() => {
          setModalExcluir(false);
          setFornecedorSelecionado(null);
        }}
        title="Excluir Fornecedor"
        size="sm"
      >
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Tem certeza que deseja excluir o fornecedor <strong>{fornecedorSelecionado?.nome}</strong>?
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
