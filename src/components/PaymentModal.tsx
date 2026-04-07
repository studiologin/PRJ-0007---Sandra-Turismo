import React from 'react';
import { X, Calendar, Users, ShieldCheck, ArrowRight, Ticket } from 'lucide-react';
import { formatDateBR } from '../lib/format';

interface PaymentModalProps {
  booking: any;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
  isReady?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  booking, 
  onClose, 
  onConfirm,
  isProcessing = false,
  isReady = false
}) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
        
        {/* Header */}
        <div className="bg-brand p-8 pb-10 text-white relative">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-action rounded-2xl flex items-center justify-center shadow-lg shadow-action/20 border border-white/10">
                <Ticket size={24} className="text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black tracking-tight uppercase">Resumo da Reserva</h3>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  Ambiente Seguro Mercado Pago
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        </div>

        {/* Body */}
        <div className="p-8 -mt-6">
          {/* Ticket Card */}
          <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-inner mb-8 transition-all group hover:bg-white hover:shadow-xl hover:shadow-brand/5">
            <h4 className="text-2xl font-black text-brand mb-6 leading-tight group-hover:text-action transition-colors">
              {booking.trips.title}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-action border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Data</p>
                  <p className="font-black text-brand text-sm">{formatDateBR(booking.trips.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-action border border-slate-100">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">Passageiros</p>
                  <p className="font-black text-brand text-sm">{booking.passengers} passageiro(s)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-end justify-between mb-10 px-2">
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1.5">Valor Total</p>
              <p className="text-4xl font-black text-brand">
                R$ {booking.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <ShieldCheck size={16} />
                <span className="text-[11px] font-black uppercase tracking-widest">Garantida</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Check-in liberado após pago</p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full ${isReady ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-action shadow-action/30'} text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group disabled:opacity-50 disabled:scale-100`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isReady ? (
              <>
                Abrir Pagamento Seguro
                <ShieldCheck size={22} className="group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              <>
                Confirmar e Pagar
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <p className="mt-6 text-center text-[10px] font-bold text-slate-400 px-8 leading-relaxed max-w-xs mx-auto">
            Após clicar, você poderá escolher entre Pix ou Cartão no ambiente seguro da Sandra Turismo via Mercado Pago.
          </p>
        </div>
      </div>
    </div>
  );
};
