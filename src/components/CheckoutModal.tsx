import React from 'react';
import { X, ChevronLeft, ShieldCheck, Lock } from 'lucide-react';

interface CheckoutModalProps {
  url: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ url, onClose, onSuccess }) => {
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    try {
      const iframe = e.currentTarget;
      const currentUrl = iframe.contentWindow?.location.href || '';
      
      // Detecta se a URL de retorno contém status de sucesso
      if (currentUrl.includes('status=success')) {
        console.log('Pagamento detectado com sucesso via URL!');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // Cross-origin might block this if not on the same domain, 
      // but since we redirect to our own origin, it should work.
      console.warn('Não foi possível ler a URL do Iframe (Cross-Origin)', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-brand/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#F5F5F5] w-full max-w-2xl h-[90vh] md:h-[80vh] rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header - Dark Tech Style */}
        <div className="bg-[#0A1F3D] p-5 md:p-6 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group hidden md:block"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-action rounded flex items-center justify-center text-[10px] font-black">S</div>
                <h2 className="text-sm font-black uppercase tracking-widest">Finalizar Pagamento</h2>
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">
                Ambiente Seguro Mercado Pago
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors hover:rotate-90 transition-transform duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mercado Pago Iframe Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {/* Brand Bar */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <img 
                src="https://http2.mlstatic.com/static/org-img/mkt/email-mkt-assets/davinci/2.0/logos/logo-mercadopago.png" 
                alt="Mercado Pago" 
                className="h-5"
              />
            </div>
            <div className="text-[9px] font-black text-gray-400 flex items-center gap-2 tracking-widest uppercase">
              Sandra Turismo <ShieldCheck size={12} className="text-emerald-500" />
            </div>
          </div>

          <div className="absolute inset-0 top-[45px] overflow-hidden">
            <iframe 
              src={url}
              className="w-full h-full border-none"
              title="Mercado Pago Checkout"
              allow="payment"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>

        {/* Footer - Security Status */}
        <div className="bg-white p-3 border-t border-gray-100 flex justify-center items-center shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <Lock size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Criptografia de Ponta a Ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
