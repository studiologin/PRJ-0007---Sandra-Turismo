import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Chrome, Github } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UnifiedLoginPageProps {
  onLogin: () => void;
  defaultSignUp?: boolean;
}

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({ onLogin, defaultSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/clientes/PRJ-0007/',
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isSignUp 
                ? 'Junte-se a nós para planejar sua próxima aventura.' 
                : 'Acesse suas viagens e reservas com segurança.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-action text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nome Completo"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-action/20 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-gray-400 text-gray-700"
                  required
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-action text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-action/20 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-gray-400 text-gray-700"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-action text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-action/20 focus:bg-white rounded-2xl outline-none transition-all placeholder:text-gray-400 text-gray-700"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action hover:bg-action-hover text-white py-4 rounded-2xl font-semibold transition-all transform active:scale-[0.98] shadow-lg shadow-action/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Processando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative px-4 text-xs font-medium text-gray-400 bg-white uppercase tracking-widest">Ou continue com</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 active:scale-[0.98]"
            >
              <Chrome size={18} className="text-action" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 opacity-50 cursor-not-allowed">
              <Github size={18} />
              GitHub
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-gray-500 hover:text-action transition-colors"
            >
              {isSignUp ? 'Já tem uma conta? Entre agora' : 'Não tem conta? Crie uma aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
