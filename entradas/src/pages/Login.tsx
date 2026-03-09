import { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../components';
import logoCanarinho from '../assets/logo-canarinho.png';
import logoCanarinhoBg from '../assets/logo-canarinho-bg.png';

interface LoginProps {
  onLogin: (user: { nome: string; email: string; filial: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Digite seu e-mail');
      return;
    }

    if (senha.length < 4) {
      setErro('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    setCarregando(true);

    // Simula delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 800));

    const nome = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    onLogin({ nome, email, filial: 'Filial Principal' });
    setCarregando(false);
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'var(--bg-main)' }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${logoCanarinhoBg})`,
          backgroundSize: 'cover',
          opacity: 0.03
        }}
      />

      {/* Login Card */}
      <div 
        className="relative z-10 w-full max-w-md animate-fade-in"
        style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '32px'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={logoCanarinho} 
            alt="Transportes Canarinho" 
            className="h-12 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Sistema CNR</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Transportes Canarinho</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2" 
              style={{ color: 'var(--text-secondary)' }}
            >
              E-mail
            </label>
            <div className="relative">
              <User className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input"
                style={{ paddingLeft: '36px' }}
                disabled={carregando}
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2" 
              style={{ color: 'var(--text-secondary)' }}
            >
              Senha
            </label>
            <div className="relative">
              <Lock className="input-icon" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="•••••••"
                className="input"
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
                disabled={carregando}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {erro && (
            <div 
              className="rounded-lg p-3 flex items-center gap-2"
              style={{ background: 'var(--danger-bg)', border: '1px solid #fecaca' }}
            >
              <AlertCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{erro}</p>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={carregando}
            className="mt-2"
          >
            {carregando ? (
              <div className="flex items-center gap-2 justify-center">
                <div 
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
                <span>Entrando...</span>
              </div>
            ) : 'Entrar'}
          </Button>
        </form>

        <p 
          className="text-center text-xs mt-4" 
          style={{ color: 'var(--text-muted)' }}
        >
          Use qualquer e-mail e senha com 4+ caracteres
        </p>
      </div>
    </div>
  );
}
