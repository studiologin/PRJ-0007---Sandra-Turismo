import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Lock } from 'lucide-react';
import { Button } from './Button';
import logo from '../assets/logo.png';

interface FooterProps {
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-brand text-white pt-8 pb-8 mt-auto md:mb-0 mb-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Coluna 1: Sobre */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={logo} alt="Sandra Tur" className="h-32 w-auto" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Especialista em realizar sonhos através de viagens rodoviárias e aéreas. Segurança, conforto e amizade para a melhor idade.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-action transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-action transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-action">Links Rápidos</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Próximas Excursões</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Área da Cliente</a></li>
              {onAdminClick && (
                <li className="pt-4">
                  <button onClick={onAdminClick} className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
                    <Lock size={12} /> Área Administrativa
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-action">Fale Conosco</h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-action mt-1 shrink-0" />
                <span>
                  (11) 99238-7001<br />
                  <span className="text-xs opacity-70">Seg a Sex, 09h às 18h</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-action shrink-0" />
                <span>contato@sandraturismo.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-action mt-1 shrink-0" />
                <span>
                  Av. Principal, 1000 - Centro<br />
                  São Paulo - SP
                </span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Certificações */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-6 text-action">Segurança</h3>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-4">
              <p className="text-xs text-gray-400 mb-1">CADASTUR</p>
              <p className="font-mono text-white tracking-widest">12.345.678/0001-90</p>
            </div>
            <p className="text-xs text-gray-400 mb-4">Site protegido com criptografia SSL.</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-6">
          <p>&copy; 2026 Sandra Turismo. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
          </div>
          <p>Desenvolvido com carinho por <a href="https://studiologin.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-action/30 underline-offset-4">Studio Login</a>.</p>
        </div>
      </div>
    </footer>
  );
};