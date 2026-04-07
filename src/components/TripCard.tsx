import React, { useState } from 'react';
import { Trip } from '../types';
import { Calendar, MapPin, CheckCircle2, Users, Share2, MessageCircle, Facebook, Instagram, Copy, X, Bus, Building2, ShieldCheck, Map } from 'lucide-react';
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
        className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100 flex flex-col h-full transform transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 group cursor-pointer"
        onClick={() => onSelect(trip)}
      >
        <div className="relative">
          <div className="relative h-64 md:h-72 overflow-hidden">
            <img
              src={trip.image}
              alt={trip.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Subtle Gradient for readability of share button */}
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Vagas Badge - BOTTOM RIGHT */}
            <div className="absolute bottom-4 right-4 z-40 bg-white px-3 py-1.5 rounded-full text-brand shadow-xl flex items-center gap-2 border border-slate-100 animate-in fade-in slide-in-from-right-4">
              <Users size={12} className="text-action" />
              <span className="text-[10px] font-black uppercase tracking-tight">{trip.spots} VAGAS</span>
            </div>

            {/* Share Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
               <button 
                  onClick={handleShare}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-brand transition-all border border-white/20"
               >
                  <Share2 size={12} />
               </button>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 flex flex-col bg-white">
          <div className="flex-1">
            <h3 className="text-xl font-black text-brand mb-4 leading-tight tracking-tight line-clamp-2">{trip.title}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-slate-500 font-bold text-sm">
                <Calendar className="w-4 h-4 text-action mr-3 shrink-0" />
                <span>{formatDateBR(trip.date)} • {trip.duration}</span>
              </div>
              <div className="flex items-center text-slate-500 font-bold text-sm">
                <MapPin className="w-4 h-4 text-action mr-3 shrink-0" />
                <span className="truncate">{trip.destination}</span>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-50 mt-auto">
            <div className="flex items-end justify-between mb-6">
              <span className="text-[10px] font-bold text-slate-400">Por pessoa</span>
              <div className="text-right">
                {trip.price >= 500 ? (
                  <p className="text-2xl font-black text-brand tracking-tighter">
                    10x de R$ {(trip.price / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-2xl font-black text-brand tracking-tighter">
                    R$ {trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
            
            <button 
                className="w-full bg-brand text-white rounded-xl py-4 font-black uppercase tracking-widest text-[11px] hover:bg-brand/95 transition-all shadow-[0_10px_20px_rgba(15,52,96,0.1)] active:scale-95"
                onClick={() => onSelect(trip)}
            >
              VER DETALHES
            </button>
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
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-slate-200 group"
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