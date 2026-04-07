import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, X, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
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
              whatsapp: whatsapp,
              role: 'client' 
            } 
          },
        });
        if (error) throw error;
        alert('Cadastro realizado! Verifique seu e-mail.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brand/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
        {/* Header Section */}
        <div className="bg-brand p-10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              {isSignUp ? 'Criar Conta' : 'Bem-vinda de volta!'}
            </h2>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
              {isSignUp 
                ? 'Sua próxima aventura começa aqui' 
                : 'Acesse sua Área do Cliente ou Admin'}
            </p>
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-action/10 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white z-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 bg-white max-h-[75vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <>
                <div className="group">
                  <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">Nome Completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Como quer ser chamado?"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-brand transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">WhatsApp</label>
                  <div className="relative">
                    <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-brand transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="group">
              <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">E-mail de acesso</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@sandratur.com.br"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-brand transition-all"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">Senha de acesso</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-brand transition-all"
                  required
                />
              </div>
              {!isSignUp && (
                <button 
                  type="button"
                  className="w-full text-right mt-2 text-action font-black text-[10px] uppercase tracking-widest hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>

            {error && (
              <div className="text-[10px] font-black text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 uppercase tracking-widest leading-relaxed">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="bg-action hover:bg-action/90 py-5 text-lg font-black italic uppercase tracking-tighter shadow-xl shadow-action/30 rounded-2xl"
            >
              {loading ? 'Processando...' : isSignUp ? 'Criar minha conta' : 'Entrar no Sistema'}
              {!loading && <ArrowRight size={20} className="ml-2" />}
            </Button>
          </form>

          {/* Footer Section */}
          <div className="mt-8 text-center pt-8 border-t border-gray-50">
             <p className="text-gray-500 text-[10px] font-bold mb-1 uppercase tracking-wider">
               {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
             </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand font-black uppercase text-xs tracking-widest hover:text-action transition-all"
            >
              {isSignUp ? 'Fazer login agora' : 'Criar conta gratuita'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
