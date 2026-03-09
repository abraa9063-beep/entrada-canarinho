import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Receipt, TrendingUp, FileText, ArrowUpRight, Truck, Fuel, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../components';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';

// Paleta de cores premium
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  pink: '#ec4899',
  cyan: '#06b6d4',
  orange: '#f97316',
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

type ViewMode = 'mensal' | 'anual';

export function Dashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { 
    dashboardStats, 
    dashboardVariacoes,
    valorPorMes, 
    itensPorCategoria, 
    gastosPorFilial,
    topItens, 
    entradasPorFornecedor,
    isLoading,
    fetchDashboard 
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>('mensal');
  const [animatedStats, setAnimatedStats] = useState({
    totalNF: 0,
    valorTotal: 0,
    totalItensLancados: 0,
    ticketMedio: 0,
    totalLitrosDiesel: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Animação dos números
  useEffect(() => {
    if (dashboardStats) {
      const duration = 1000;
      const steps = 30;
      const interval = duration / steps;
      let step = 0;
      
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedStats({
          totalNF: Math.round(dashboardStats.totalNF * easeOut),
          valorTotal: Math.round(dashboardStats.valorTotal * easeOut),
          totalItensLancados: Math.round(dashboardStats.totalItensLancados * easeOut),
          ticketMedio: Math.round(dashboardStats.ticketMedio * easeOut),
          totalLitrosDiesel: Math.round(dashboardStats.totalLitrosDiesel * easeOut),
        });
        
        if (step >= steps) clearInterval(timer);
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [dashboardStats]);

  const formatarValor = (valor: number) => {
    if (isNaN(valor) || valor === undefined || valor === null) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatarValorTooltip = (valor: number) => {
    if (isNaN(valor) || valor === undefined || valor === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const stats = dashboardStats || {
    totalNF: 0,
    valorTotal: 0,
    totalItensLancados: 0,
    totalDescontos: 0,
    ticketMedio: 0,
    totalLitrosDiesel: 0,
  };

  // Formatar variação para exibição
  const formatarTrend = (valor: number | undefined): string => {
    if (valor === undefined || valor === null || isNaN(valor)) return '0%';
    const sinal = valor >= 0 ? '+' : '';
    return `${sinal}${valor.toFixed(0)}%`;
  };

  const variacoes = dashboardVariacoes || { nf: 0, valor: 0, itens: 0, ticket: 0, diesel: 0 };

  // Group data by year for annual view
  const valorPorAno = valorPorMes.reduce((acc: Record<string, number>, item) => {
    const year = item.mes.substring(0, 4);
    acc[year] = (acc[year] || 0) + item.valor;
    return acc;
  }, {} as Record<string, number>);

  const chartData = viewMode === 'mensal' 
    ? valorPorMes 
    : Object.entries(valorPorAno).map(([ano, valor]) => ({ mes: ano, valor }));

  // Dados para gráfico de pizza
  const pieData = itensPorCategoria.slice(0, 6).map((item, idx) => ({
    name: item.categoria || 'Outros',
    value: item.valor,
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  // Dark mode classes
  const bgCardClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textPrimaryClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDark ? 'text-gray-300' : 'text-gray-500';
  const textMutedClass = isDark ? 'text-gray-400' : 'text-gray-500';

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-3 shadow-xl`}>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} font-semibold`}>
            {formatarValorTooltip(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className={`animate-spin w-12 h-12 border-4 ${isDark ? 'border-blue-400' : 'border-blue-500'} border-t-transparent rounded-full`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'} animate-pulse`} />
            </div>
          </div>
          <p className={`mt-4 ${textSecondaryClass} font-medium`}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimaryClass}`}>Dashboard</h1>
          <p className={`${textSecondaryClass} mt-1`}>Visão geral das suas notas fiscais</p>
        </div>
        <Button
          onClick={() => navigate('/notas/nova')}
          icon={<Receipt className="w-4 h-4" />}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
        >
          Nova N-F
        </Button>
      </div>

      {/* Stats Cards Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Receipt className="w-6 h-6" />}
          label="Total N-F"
          value={animatedStats.totalNF.toString()}
          color="blue"
          trend={formatarTrend(variacoes.nf)}
          isDark={isDark}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Valor Total"
          value={formatarValor(animatedStats.valorTotal)}
          color="green"
          trend={formatarTrend(variacoes.valor)}
          isDark={isDark}
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="Itens Lançados"
          value={animatedStats.totalItensLancados.toString()}
          color="yellow"
          trend={formatarTrend(variacoes.itens)}
          isDark={isDark}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Ticket Médio"
          value={formatarValor(animatedStats.ticketMedio)}
          color="purple"
          trend={formatarTrend(variacoes.ticket)}
          isDark={isDark}
        />
        <StatCard
          icon={<Fuel className="w-6 h-6" />}
          label="Diesel (L)"
          value={animatedStats.totalLitrosDiesel.toLocaleString('pt-BR')}
          color="pink"
          trend={formatarTrend(variacoes.diesel)}
          isDark={isDark}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gastos por Mês - Gráfico principal */}
        <div className={`lg:col-span-2 rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${textPrimaryClass}`}>Evolução de Gastos</h3>
              <p className={`text-sm ${textSecondaryClass}`}>{viewMode === 'mensal' ? 'Últimos 12 meses' : 'Por ano'}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('mensal')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  viewMode === 'mensal' 
                    ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setViewMode('anual')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  viewMode === 'anual' 
                    ? isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'
                    : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Anual
              </button>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.4 : 0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f1f5f9'} vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#94a3b8' }}
                  tickFormatter={(v) => viewMode === 'mensal' && v ? v.substring(5) + '/' + v.substring(2, 4) : v}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#94a3b8' }}
                  tickFormatter={(v) => formatarValor(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#colorValor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[280px] flex flex-col items-center justify-center ${textMutedClass}`}>
              <Calendar className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Sem dados para exibir</p>
              <p className="text-sm">Cadastre notas fiscais para ver a evolução</p>
            </div>
          )}
        </div>

        {/* Gráfico de Pizza - Categorias */}
        <div className={`rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <h3 className={`font-semibold ${textPrimaryClass} mb-4`}>Por Categoria</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatarValorTooltip(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[200px] flex items-center justify-center ${textMutedClass}`}>
              <p>Sem categorias</p>
            </div>
          )}
          {/* Legenda */}
          <div className="mt-4 space-y-2">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.fill }} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item.name}</span>
                </div>
                <span className={`font-medium ${textPrimaryClass}`}>{formatarValor(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gastos por Categoria - Barras Horizontais */}
        <div className={`rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${textPrimaryClass}`}>Gastos por Categoria</h3>
              <p className={`text-sm ${textSecondaryClass}`}>Distribuição de valores</p>
            </div>
          </div>
          {itensPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={itensPorCategoria.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f1f5f9'} horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#94a3b8' }}
                  tickFormatter={(v) => formatarValor(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey="categoria" 
                  tick={{ fontSize: 12, fill: isDark ? '#d1d5db' : '#64748b' }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="valor" 
                  radius={[0, 6, 6, 0]}
                >
                  {itensPorCategoria.slice(0, 6).map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[250px] flex flex-col items-center justify-center ${textMutedClass}`}>
              <Package className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Sem categorias</p>
            </div>
          )}
        </div>

        {/* Gastos por Filial */}
        <div className={`rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${textPrimaryClass}`}>Gastos por Filial</h3>
              <p className={`text-sm ${textSecondaryClass}`}>Distribuição por unidade</p>
            </div>
          </div>
          {gastosPorFilial && gastosPorFilial.length > 0 ? (
            <div className="space-y-3">
              {gastosPorFilial.slice(0, 5).map((item, idx) => {
                const percentual = stats.valorTotal > 0 ? (item.valor / stats.valorTotal) * 100 : 0;
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className={`font-medium text-sm truncate max-w-[100px] ${textPrimaryClass}`}>{item.filial}</p>
                          <p className={`text-xs ${textSecondaryClass}`}>{item.notas} notas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${textPrimaryClass}`}>{formatarValor(item.valor)}</p>
                        <p className={`text-xs ${textSecondaryClass}`}>{percentual.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ml-11 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentual}%`, 
                          background: CHART_COLORS[idx % CHART_COLORS.length] 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`h-[250px] flex flex-col items-center justify-center ${textMutedClass}`}>
              <FileText className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Sem dados de filiais</p>
              <p className="text-sm text-center mt-1">Cadastre notas com filiais para ver</p>
            </div>
          )}
        </div>

        {/* Top Fornecedores */}
        <div className={`rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${textPrimaryClass}`}>Top Fornecedores</h3>
              <p className={`text-sm ${textSecondaryClass}`}>Maiores valores</p>
            </div>
            <button 
              onClick={() => navigate('/fornecedores')}
              className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              Ver todos <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {entradasPorFornecedor.length > 0 ? (
            <div className="space-y-3">
              {entradasPorFornecedor.slice(0, 5).map((f, idx) => {
                const percentual = stats.valorTotal > 0 ? (f.valor / stats.valorTotal) * 100 : 0;
                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <p className={`font-medium text-sm truncate max-w-[140px] ${textPrimaryClass}`}>{f.fornecedor}</p>
                          <p className={`text-xs ${textSecondaryClass}`}>{f.notas} notas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${textPrimaryClass}`}>{formatarValor(f.valor)}</p>
                        <p className={`text-xs ${textSecondaryClass}`}>{percentual.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ml-11 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentual}%`, 
                          background: CHART_COLORS[idx % CHART_COLORS.length] 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`h-[250px] flex flex-col items-center justify-center ${textMutedClass}`}>
              <Truck className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Sem fornecedores</p>
              <p className="text-sm">Cadastre notas para ver o ranking</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Itens */}
      {topItens.length > 0 && (
        <div className={`rounded-2xl p-6 shadow-sm border ${bgCardClass}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`font-semibold ${textPrimaryClass}`}>Itens Mais Comprados</h3>
              <p className={`text-sm ${textSecondaryClass}`}>Por quantidade</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topItens.slice(0, 6).map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border hover:shadow-md transition-shadow ${isDark ? 'bg-gray-750 border-gray-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-100'}`}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3"
                  style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                >
                  {idx + 1}
                </div>
                <p className={`font-medium text-sm truncate ${textPrimaryClass}`}>{item.descricao}</p>
                <p className={`text-xs ${textSecondaryClass} mt-1`}>{item.quantidade} unidades</p>
                <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-2`}>{formatarValor(item.valor)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats.totalNF === 0 && (
        <div className={`rounded-2xl p-8 border ${isDark ? 'bg-blue-900/50 border-blue-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'}`}>
          <div className="text-center max-w-md mx-auto">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
              <Receipt className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`font-semibold text-lg mb-2 ${textPrimaryClass}`}>Comece a usar o sistema</h3>
            <p className={`${textSecondaryClass} mb-6`}>
              Cadastre suas notas fiscais para ter uma visão completa dos seus gastos e acompanhar seus fornecedores.
            </p>
            <Button
              onClick={() => navigate('/notas/nova')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Cadastrar Primeira Nota
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'pink';
  trend?: string;
  isDark?: boolean;
}

function StatCard({ icon, label, value, color, trend, isDark }: StatCardProps) {
  const colorClasses = {
    blue: `from-blue-500 to-blue-600 shadow-blue-500/25`,
    green: `from-emerald-500 to-emerald-600 shadow-emerald-500/25`,
    yellow: `from-amber-500 to-amber-600 shadow-amber-500/25`,
    purple: `from-violet-500 to-violet-600 shadow-violet-500/25`,
    pink: `from-pink-500 to-pink-600 shadow-pink-500/25`,
  };

  const bgColorClasses = {
    blue: isDark ? 'bg-blue-900/50' : 'bg-blue-50',
    green: isDark ? 'bg-emerald-900/50' : 'bg-emerald-50',
    yellow: isDark ? 'bg-amber-900/50' : 'bg-amber-50',
    purple: isDark ? 'bg-violet-900/50' : 'bg-violet-50',
    pink: isDark ? 'bg-pink-900/50' : 'bg-pink-50',
  };

  const textColorClasses = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    green: isDark ? 'text-emerald-400' : 'text-emerald-600',
    yellow: isDark ? 'text-amber-400' : 'text-amber-600',
    purple: isDark ? 'text-violet-400' : 'text-violet-600',
    pink: isDark ? 'text-pink-400' : 'text-pink-600',
  };

  return (
    <div className={`rounded-2xl p-5 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${bgColorClasses[color]} ${textColorClasses[color]}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>{value}</p>
      </div>
    </div>
  );
}