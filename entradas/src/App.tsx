import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components';
import {
  Dashboard,
  NotasFiscais,
  NotaFiscalForm,
  NotaFiscalDetalhe,
  EntradaItemForm,
  Itens,
  Fornecedores,
} from './pages';
import { client } from './api/client';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

interface UserData {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const authRenderedRef = useRef(false);

  // 1. Check session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const session = await client.auth.getSession();
      if (session?.data?.user) {
        setUser({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || session.data.user.email.split('@')[0],
        });
      }
    } catch (error) {
      console.error('[App] Session restore failed:', error);
    } finally {
      setIsChecking(false);
    }
  }

  // 2. Render login UI when needed
  useEffect(() => {
    if (user || isChecking) return;
    if (!containerRef.current) return;
    if (authRenderedRef.current) return;
    
    authRenderedRef.current = true;
    
    client.auth.renderAuthUI(containerRef.current, {
      redirectTo: '/',
      labels: {
        signIn: {
          title: 'Sistema CNR',
          subtitle: 'Transportes Canarinho',
          loginButton: 'Entrar',
          forgotPassword: 'Esqueceu a senha?',
          signUpPrompt: 'Não tem conta?',
          toggleToSignUp: 'Criar conta',
        },
        signUp: {
          title: 'Criar Conta',
          subtitle: 'Cadastre-se para acessar',
          signUpButton: 'Cadastrar',
          toggleToSignIn: 'Já tem conta? Entrar',
        },
      },
      onLogin: (loggedInUser) => {
        setUser({
          id: loggedInUser.id,
          email: loggedInUser.email,
          name: loggedInUser.name || loggedInUser.email.split('@')[0],
        });
      },
    });
  }, [user, isChecking]);

  const handleLogout = async () => {
    await client.auth.signOut();
    setUser(null);
    authRenderedRef.current = false;
  };

  // Show loading while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white/80">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 to-blue-600">
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div ref={containerRef} />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Main app
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
            <Route index element={<Dashboard />} />
            <Route path="notas" element={<NotasFiscais />} />
            <Route path="notas/nova" element={<NotaFiscalForm />} />
            <Route path="notas/:id" element={<NotaFiscalDetalhe />} />
            <Route path="notas/:id/editar" element={<NotaFiscalForm />} />
            <Route path="notas/:nfId/itens" element={<EntradaItemForm />} />
            <Route path="itens" element={<Itens />} />
            <Route path="fornecedores" element={<Fornecedores />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
