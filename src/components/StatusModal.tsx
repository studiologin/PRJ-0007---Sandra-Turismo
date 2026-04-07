import React from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl shadow-brand/20 overflow-hidden relative border border-slate-100 animate-in zoom-in-95 duration-300">
        
        {/* Decorative Background Element */}
        <div className={`absolute top-0 inset-x-0 h-32 opacity-10 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`} style={{ clipPath: 'ellipse(70% 50% at 50% 0%)' }} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 pt-12 flex flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative ${isSuccess ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${isSuccess ? 'bg-green-400' : 'bg-red-400'}`} />
            {isSuccess ? <CheckCircle2 size={42} strokeWidth={2.5} /> : <XCircle size={42} strokeWidth={2.5} />}
          </div>

          <h3 className="text-xl font-black text-brand mb-3 uppercase tracking-tight">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-4">
            {message}
          </p>

          <button 
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] ${
              isSuccess 
              ? 'bg-brand text-white shadow-brand/20 hover:bg-brand/90' 
              : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
            }`}
          >
            ENTENDI, OBRIGADO
          </button>
        </div>

        {/* Brand Accent */}
        <div className="h-1.5 w-full bg-action opacity-20" />
      </div>
    </div>
  );
};
