import React, { useState } from 'react';
import { Trip } from '../types';
import { Calendar, MapPin, CheckCircle2, Users, Share2, MessageCircle, Facebook, Instagram, Copy, X } from 'lucide-react';
import { Button } from './Button';
import { formatDateBR } from '../lib/format';

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onSelect }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const shareOptions = [
    { 
      name: 'WhatsApp', 
      icon: <MessageCircle size={20} />, 
      color: 'bg-green-500', 
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`Olha que viagem incrível: ${trip.title} - ${window.location.origin}/clientes/PRJ-0007/detalhes/${trip.id}`)}`, '_blank') 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={20} />, 
      color: 'bg-blue-600', 
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/clientes/PRJ-0007/detalhes/${trip.id}`)}`, '_blank') 
    },
    { 
      name: 'Copiar Link', 
      icon: <Copy size={20} />, 
      color: 'bg-gray-600', 
      action: () => {
        navigator.clipboard.writeText(`${window.location.origin}/clientes/PRJ-0007/detalhes/${trip.id}`);
        alert('Link copiado para a área de transferência!');
      } 
    }
  ];

  return (
    <>
      <div 
        className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer"
        onClick={() => onSelect(trip)}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={trip.image}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleShare}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 hover:bg-white hover:text-brand transition-all shadow-xl"
            >
              <Share2 size={18} />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 bg-action/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 border border-white/20">
            <Users size={12} />
            {trip.spots} vagas disponíveis
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-heading text-xl text-brand font-black mb-3 leading-tight group-hover:text-action transition-colors">{trip.title}</h3>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center text-gray-500 font-medium text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-action" />
                </div>
                <span>{formatDateBR(trip.date)} • {trip.duration}</span>
              </div>
              <div className="flex items-center text-gray-500 font-medium text-sm">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mr-3">
                    <MapPin className="w-4 h-4 text-action" />
                </div>
                <span>{trip.destination}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {trip.included.slice(0, 3).map((item, idx) => (
                <span key={idx} className="inline-flex items-center bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full border border-gray-100">
                  {item}
                </span>
              ))}
              {trip.included.length > 3 && <span className="text-[10px] font-bold text-gray-300">+{trip.included.length - 3} mais</span>}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Investimento</p>
                <p className="text-2xl font-black text-brand leading-none">
                  {trip.max_installments && trip.max_installments > 1
                    ? <span className="text-sm font-bold text-gray-400 line-through mr-2">R$ {trip.price.toLocaleString('pt-BR')}</span>
                    : null
                  }
                  R$ {trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              {trip.max_installments && trip.max_installments > 1 && (
                <div className="text-right">
                    <p className="text-[10px] font-black text-action uppercase tracking-tighter">Em até {trip.max_installments}x de</p>
                    <p className="text-lg font-black text-action">R$ {(trip.price / trip.max_installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>
            <Button 
                variant="brand" 
                fullWidth 
                className="rounded-2xl py-4 font-black uppercase tracking-widest text-xs h-auto shadow-xl shadow-brand/10"
                onClick={() => onSelect(trip)}
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand/40 backdrop-blur-md" onClick={() => setShowShareModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-black text-brand tracking-tight">Compartilhar</h4>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() => {
                      option.action();
                      setShowShareModal(false);
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`${option.color} text-white p-3 rounded-xl shadow-lg`}>
                        {option.icon}
                      </div>
                      <span className="font-bold text-gray-700">{option.name}</span>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-action transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ArrowRight = ({ size, className }: { size: number, className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

export default TripCard;