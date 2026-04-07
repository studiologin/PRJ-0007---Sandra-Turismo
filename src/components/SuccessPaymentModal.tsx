import React from 'react';
import { CheckCircle, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';

interface SuccessPaymentModalProps {
  onClose: () => void;
  bookingTitle: string;
}

export const SuccessPaymentModal: React.FC<SuccessPaymentModalProps> = ({ onClose, bookingTitle }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
        
        {/* Header - Success Gradient */}
        <div className="bg-emerald-500 p-10 text-white text-center relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-900/20 mb-6 animate-bounce">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Pagamento Confirmado!</h3>
            <p className="text-sm font-bold text-white/80 mt-2 uppercase tracking-widest">Reserva Garantida</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-10 text-center">
          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Destino / Pacote</p>
            <p className="text-lg font-black text-brand leading-tight">{bookingTitle}</p>
          </div>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 px-4">
            Sua reserva foi confirmada com sucesso! Você já pode acessar seu voucher e detalhes da viagem no seu painel.
          </p>

          <button 
            onClick={onClose}
            className="w-full bg-brand text-white py-5 rounded-2xl font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            Acessar Meu Painel
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-emerald-500">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Ambiente 100% Seguro</span>
          </div>
        </div>

        {/* Footer decorative bar */}
        <div className="h-2 bg-emerald-500/20" />
      </div>
    </div>
  );
};
