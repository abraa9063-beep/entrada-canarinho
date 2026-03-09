import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Hash, Building2, FileText, ChevronDown, Plus } from 'lucide-react';
import { Card, Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import { FILIAIS } from '../types';

export function NotaFiscalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isDark } = useTheme();
  const { addNotaFiscal, updateNotaFiscal, fetchNotaFiscal, fornecedores, fetchFornecedores } = useAppStore();
  
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [existingNF, setExistingNF] = useState<any>(null);

  const [formData, setFormData] = useState({
    numero: '',
    dataEmissao: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    fornecedor: '',
    cnpj: '',
    filial: 'Cunha Porã',
    responsavel: '',
    chaveAcesso: '',
    observacoes: '',
    status: 'rascunho' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFornecedorDropdown, setShowFornecedorDropdown] = useState(false);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    fetchFornecedores();
    if (isEditing) {
      loadNotaFiscal();
    }
  }, [id]);

  async function loadNotaFiscal() {
    const nf = await fetchNotaFiscal(parseInt(id!));
    if (nf) {
      setExistingNF(nf);
      setFormData({
        numero: nf.numero,
        dataEmissao: nf.dataEmissao,
        dataEntrada: nf.dataEntrada,
        fornecedor: nf.fornecedor,
        cnpj: nf.cnpj || '',
        filial: nf.filial,
        responsavel: nf.responsavel || '',
        chaveAcesso: nf.chaveAcesso || '',
        observacoes: nf.observacoes || '',
        status: nf.status as 'rascunho'
      });
    }
    setLoading(false);
  }

  const fornecedoresFiltrados = fornecedores.filter(f => {
    if (!fornecedorSearch) return true;
    const term = fornecedorSearch.toLowerCase();
    return f.nome.toLowerCase().includes(term) || (f.cnpj?.includes(term) ?? false);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFornecedorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFornecedorSelect = (fornecedor: { nome: string; cnpj?: string }) => {
    setFormData((prev) => ({ 
      ...prev, 
      fornecedor: fornecedor.nome,
      cnpj: fornecedor.cnpj || ''
    }));
    setShowFornecedorDropdown(false);
    setFornecedorSearch('');
    if (errors.fornecedor) {
      setErrors((prev) => ({ ...prev, fornecedor: '' }));
    }
  };

  const handleFornecedorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, fornecedor: value }));
    setFornecedorSearch(value);
    setShowFornecedorDropdown(true);
    if (errors.fornecedor) {
      setErrors((prev) => ({ ...prev, fornecedor: '' }));
    }
  };

  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const validarChaveAcesso = (chave: string) => {
    const numeros = chave.replace(/\D/g, '');
    return numeros.length === 44;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.numero.trim()) newErrors.numero = 'Número da N-F é obrigatório';
    if (!formData.dataEmissao) newErrors.dataEmissao = 'Data de emissão é obrigatória';
    if (!formData.dataEntrada) newErrors.dataEntrada = 'Data de entrada é obrigatória';
    if (!formData.fornecedor.trim()) newErrors.fornecedor = 'Fornecedor é obrigatório';
    if (!formData.filial) newErrors.filial = 'Filial é obrigatória';
    if (formData.chaveAcesso && !validarChaveAcesso(formData.chaveAcesso)) {
      newErrors.chaveAcesso = 'Chave de acesso deve ter 44 dígitos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dadosFormatados = {
      ...formData,
      cnpj: formData.cnpj ? formatarCNPJ(formData.cnpj) : '',
      chaveAcesso: formData.chaveAcesso ? formData.chaveAcesso.replace(/\D/g, '') : '',
    };

    if (isEditing) {
      await updateNotaFiscal(parseInt(id!), dadosFormatados);
      navigate(`/notas/${id}`);
    } else {
      const novaNF = await addNotaFiscal(dadosFormatados);
      navigate(`/notas/${novaNF.id}/itens`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/notas')}
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="page-title">{isEditing ? 'Editar N-F' : 'Nova N-F'}</h1>
          <p className="page-description">
            {isEditing ? 'Altere os dados da nota fiscal' : 'Preencha os dados da nota fiscal'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          {/* Section: Dados da N-F */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2 
              className="flex items-center gap-2 mb-4"
              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              <Hash className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Dados da Nota Fiscal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Número da N-F *
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="Ex: NF-001234"
                  className="input"
                  style={errors.numero ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.numero && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.numero}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Data de Emissão *
                </label>
                <input
                  type="date"
                  name="dataEmissao"
                  value={formData.dataEmissao}
                  onChange={handleChange}
                  className="input"
                  style={errors.dataEmissao ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.dataEmissao && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.dataEmissao}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Data de Entrada *
                </label>
                <input
                  type="date"
                  name="dataEntrada"
                  value={formData.dataEntrada}
                  onChange={handleChange}
                  className="input"
                  style={errors.dataEntrada ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.dataEntrada && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.dataEntrada}</p>}
              </div>
            </div>
          </div>

          {/* Section: Fornecedor */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2 
              className="flex items-center gap-2 mb-4"
              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              <Building2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Fornecedor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Razão Social *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleFornecedorInputChange}
                    onFocus={() => setShowFornecedorDropdown(true)}
                    placeholder="Digite ou selecione..."
                    className="input"
                    style={{ paddingRight: '40px', ...(errors.fornecedor ? { borderColor: 'var(--danger)' } : {}) }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowFornecedorDropdown(!showFornecedorDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFornecedorDropdown ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {showFornecedorDropdown && (
                  <div 
                    className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}
                    style={{ 
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}
                  >
                    {fornecedoresFiltrados.length > 0 ? (
                      fornecedoresFiltrados.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFornecedorSelect(f)}
                          className={`w-full px-3 py-2 text-left transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                          style={{ borderBottom: isDark ? '1px solid #374151' : '1px solid #f1f5f9' }}
                        >
                          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.nome}</p>
                          {f.cnpj && <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.cnpj}</p>}
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nenhum fornecedor encontrado</p>
                        <button
                          type="button"
                          onClick={() => navigate('/fornecedores')}
                          className={`mt-2 text-sm font-medium flex items-center gap-1 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                          <Plus className="w-3 h-3" />
                          Cadastrar novo
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.fornecedor && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.fornecedor}</p>}
                
                <button
                  type="button"
                  onClick={() => navigate('/fornecedores')}
                  className="mt-1 text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--primary)' }}
                >
                  <Plus className="w-3 h-3" />
                  Gerenciar fornecedores
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => {
                    const formatted = formatarCNPJ(e.target.value);
                    setFormData((prev) => ({ ...prev, cnpj: formatted }));
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Section: Dados Adicionais */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <h2 
              className="flex items-center gap-2 mb-4"
              style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              <FileText className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Dados Adicionais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Filial *
                </label>
                <select
                  name="filial"
                  value={formData.filial}
                  onChange={handleChange}
                  className="input"
                  style={errors.filial ? { borderColor: 'var(--danger)' } : {}}
                >
                  {FILIAIS.map((filial) => (
                    <option key={filial} value={filial}>{filial}</option>
                  ))}
                </select>
                {errors.filial && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.filial}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Responsável
                </label>
                <input
                  type="text"
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className="input"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Chave de Acesso
              </label>
              <input
                type="text"
                name="chaveAcesso"
                value={formData.chaveAcesso}
                onChange={handleChange}
                placeholder="44 dígitos da chave de acesso"
                className="input"
                style={errors.chaveAcesso ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.chaveAcesso && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.chaveAcesso}</p>}
            </div>
          </div>

          {/* Observações */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Observações adicionais..."
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5" style={{ background: 'var(--bg-hover)' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/notas')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              icon={<Save className="w-4 h-4" />}
            >
              {isEditing ? 'Salvar Alterações' : 'Criar N-F'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
