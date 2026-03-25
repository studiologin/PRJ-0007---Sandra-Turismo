import React, { useState } from 'react';
import { AlertCircle, Lock, User as UserIcon } from 'lucide-react';
import { Button } from './Button';

interface AdminLoginFormProps {
  onLogin: () => void;
  onCancel: () => void;
  logo: string;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLogin, onCancel, logo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Admin Verification
    setTimeout(() => {
      if (email === 'admin@sandraturismo.com.br' && password === 'admin123') {
        setLoading(false);
        onLogin();
      } else {
        setLoading(false);
        setError('Credenciais inválidas.');
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand p-8 text-center relative">
          <button onClick={onCancel} className="absolute top-4 left-4 text-white/50 hover:text-white" title="Voltar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Sandra Tur" className="h-16 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">Área Restrita</h2>
          <p className="text-blue-200 text-sm mt-2">Acesso exclusivo para administração.</p>
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">E-mail Corporativo</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand outline-none transition-colors"
                  placeholder="admin@sandraturismo.com.br"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button fullWidth disabled={loading} className="mt-2">
              {loading ? 'Verificando...' : 'Acessar Painel'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">Sistema protegido e monitorado.</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLoginForm;
