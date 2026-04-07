import React from 'react';
import { ViewState } from '../types';
import { Home, Plane, User, Phone, Menu, Users, Map, MessageSquare, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, isLoggedIn, isAdmin, onLogout }) => {
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block bg-brand/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate(ViewState.HOME)}
          >
            <img
              src={logo}
              alt="Sandra Tur"
              className="h-16 w-auto drop-shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1"
            />
          </div>

          <nav className="flex items-center gap-10">
            {[
              { id: ViewState.HOME, label: 'INÍCIO' },
              { id: ViewState.ABOUT, label: 'SOBRE' },
              { id: ViewState.ALL_TRIPS, label: 'PACOTES' },
              { id: ViewState.CONTACT, label: 'CONTATO' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group relative text-sm font-black tracking-widest transition-all duration-300 py-2`}
              >
                <span className={`hover:text-action ${currentView === item.id ? 'text-action' : 'text-white'}`}>
                  {item.label}
                </span>
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-action transform origin-left transition-transform duration-300 ${currentView === item.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-full pr-2 shadow-lg hover:shadow-brand/10 transition-all duration-300">
              <button
                onClick={() => onNavigate(ViewState.MY_TRIPS)}
                className="flex items-center gap-2 bg-white text-brand px-6 py-3 rounded-full font-black text-sm uppercase tracking-tighter hover:bg-emerald-50 transition-all duration-300 active:scale-95 border-2 border-transparent"
              >
                <User size={18} />
                {isAdmin ? 'Painel Admin' : 'Área do Cliente'}
              </button>
              {isLoggedIn && onLogout && (
                <button
                  onClick={onLogout}
                  title="Encerrar Sessão"
                  className="p-2 text-gray-300 hover:text-red-500 transition-all duration-300 border-l border-gray-100 ml-1"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-brand/95 backdrop-blur-md text-white py-2.5 px-4 sticky top-0 z-50 flex items-center justify-between shadow-lg border-b border-white/10">
        <div className="w-8" /> {/* Spacer for centering logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(ViewState.HOME)}>
          <img src={logo} alt="Sandra Tur" className="h-10 w-auto drop-shadow-xl" />
        </div>
        <div className="flex items-center">
          {isLoggedIn && onLogout && (
            <button 
              onClick={onLogout} 
              className="p-2 text-white/80 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => onNavigate(ViewState.HOME)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === ViewState.HOME ? 'text-brand' : 'text-gray-400'}`}
          >
            <Home size={24} strokeWidth={currentView === ViewState.HOME ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Início</span>
          </button>

          <button
            onClick={() => onNavigate(ViewState.ABOUT)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === ViewState.ABOUT ? 'text-brand' : 'text-gray-400'}`}
          >
            <Users size={24} strokeWidth={currentView === ViewState.ABOUT ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Sobre</span>
          </button>

          <button
            onClick={() => onNavigate(ViewState.ALL_TRIPS)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === ViewState.ALL_TRIPS ? 'text-brand' : 'text-gray-400'}`}
          >
            <Map size={24} strokeWidth={currentView === ViewState.ALL_TRIPS ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Pacotes</span>
          </button>



          <button
            onClick={() => onNavigate(ViewState.CONTACT)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === ViewState.CONTACT ? 'text-brand' : 'text-gray-400'}`}
          >
            <MessageSquare size={24} strokeWidth={currentView === ViewState.CONTACT ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Contato</span>
          </button>

          <button
            onClick={() => onNavigate(ViewState.MY_TRIPS)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === ViewState.MY_TRIPS ? 'text-brand' : 'text-gray-400'}`}
          >
            <User size={24} strokeWidth={currentView === ViewState.MY_TRIPS ? 2.5 : 2} />
            <span className="text-[10px] font-bold">{isAdmin ? 'Admin' : 'Perfil'}</span>
          </button>
        </div>
      </div>
    </>
  );
};