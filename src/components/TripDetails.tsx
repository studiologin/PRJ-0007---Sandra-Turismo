import React, { useState } from 'react';
import { Trip } from '../types';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    CheckCircle2,
    Users,
    Clock,
    Share2,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    Facebook,
    Copy,
    X,
    ArrowRight,
    ShieldCheck,
    Ticket
} from 'lucide-react';
import { Button } from './Button';
import { AuthModal } from './AuthModal';
import { formatDateBR } from '../lib/format';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface TripDetailsProps {
    trip: Trip;
    onBack: () => void;
    isLoggedIn?: boolean;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, onBack, isLoggedIn = false }) => {
    const navigate = useNavigate();
    const allImages = [trip.image, ...(trip.images || [])].filter((img, index, self) => img && self.indexOf(img) === index);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isBooking, setIsBooking] = useState(false);

    const handleWhatsApp = () => {
        const message = `Olá! Quero garantir minha vaga na excursão: ${trip.title} (${formatDateBR(trip.date)}). Quantidade: ${quantity} pessoa(s).`;
        window.open(`https://wa.me/5511988458885?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleGuarantee = async () => {
        if (!isLoggedIn) {
            setShowAuthModal(true);
            return;
        }

        setIsBooking(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('Sessão expirada');

            const { error } = await supabase
                .from('bookings')
                .insert([{
                    trip_id: trip.id,
                    profile_id: session.user.id,
                    passengers: quantity,
                    total_price: trip.price * quantity,
                    status: 'Pendente'
                }]);

            if (error) throw error;

            // Redireciona para o checkout no painel
            navigate('/painel?tab=checkout');
        } catch (err: any) {
            console.error('Error creating booking:', err);
            alert('Não foi possível gerar sua reserva no momento. Por favor, tente via WhatsApp.');
            handleWhatsApp();
        } finally {
            setIsBooking(false);
        }
    };

    const incrementQuantity = () => {
        if (quantity < (trip.spots || 40)) setQuantity(q => q + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) setQuantity(q => q - 1);
    };

    const totalPrice = trip.price * quantity;

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
        <div className="animate-fade-in pb-20 bg-surface min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 pt-8">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-10">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-brand font-bold transition-all group lg:hidden"
                    >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all border border-gray-100">
                           <ChevronLeft size={18} />
                        </div>
                        <span>Ver todos</span>
                    </button>
                    <button
                        onClick={onBack}
                        className="hidden lg:flex items-center gap-2 text-gray-400 hover:text-brand font-bold transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all border border-gray-100">
                           <ArrowLeft size={18} />
                        </div>
                        <span>Todas as Excursões</span>
                    </button>

                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 bg-white text-gray-500 px-6 py-3 rounded-full font-bold shadow-sm hover:bg-brand hover:text-white transition-all border border-gray-100"
                    >
                        <Share2 size={18} />
                        <span>Compartilhar</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Media Gallery */}
                    <div className="lg:col-span-7">
                        <div className="relative aspect-video lg:aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-2xl border border-gray-100 group mb-6">
                            <img
                                src={allImages[activeImageIndex]}
                                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                                alt={trip.title}
                            />
                            {allImages.length > 1 && (
                                <div className="absolute inset-x-4 bottom-4 flex justify-between pointer-events-none">
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                                        className="p-3 bg-white/90 backdrop-blur-md rounded-full text-brand shadow-lg hover:bg-brand hover:text-white transition-all pointer-events-auto"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                                        className="p-3 bg-white/90 backdrop-blur-md rounded-full text-brand shadow-lg hover:bg-brand hover:text-white transition-all pointer-events-auto"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${activeImageIndex === idx ? 'border-brand scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Information & Booking Card */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="bg-brand/5 text-brand px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand/10 flex items-center gap-1.5">
                                    <MapPin size={12} className="text-action" /> {trip.destination}
                                </span>
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                                    <Users size={12} className="text-green-500" /> {trip.spots} vagas restantes
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-brand leading-[1.1] mb-6 tracking-tight italic">
                              {trip.title}
                            </h1>

                            <div className="grid grid-cols-2 gap-4 py-8 border-y border-brand/5 my-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-action">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Data de Saída</p>
                                        <p className="font-black text-brand text-lg">{formatDateBR(trip.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-action">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Duração</p>
                                        <p className="font-black text-brand text-lg">{trip.duration}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HIGH FIDELITY BOOKING CARD */}
                        <div className="bg-brand rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                           {/* Price Box */}
                           <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8 animate-in slide-in-from-top duration-500">
                              <div className="flex justify-between items-center mb-5 pb-5 border-b border-white/10">
                                 <p className="text-xs font-black uppercase tracking-widest text-white/60">Preço Unitário</p>
                                 <p className="text-xl font-black">R$ {trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                 <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3">Quantidade de vagas</p>
                                    <div className="flex items-center gap-4">
                                       <button 
                                          onClick={decrementQuantity}
                                          className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-xl font-black border border-white/10"
                                       >-</button>
                                       <span className="text-2xl font-black w-8 text-center">{quantity}</span>
                                       <button 
                                          onClick={incrementQuantity}
                                          className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-xl font-black border border-white/10"
                                       >+</button>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Total a Pagar</p>
                                    <p className="text-4xl font-black tracking-tighter transition-all">
                                      R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4 relative z-10">
                               <Button
                                  fullWidth
                                  disabled={isBooking}
                                  className="bg-action hover:bg-white hover:text-brand border-none py-5 text-xl h-auto shadow-[0_15px_35px_rgba(233,69,96,0.3)] font-black uppercase tracking-tight transition-all active:scale-[0.98] disabled:opacity-70"
                                  onClick={handleGuarantee}
                               >
                                  {isBooking ? (
                                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                                  ) : (
                                      <CheckCircle2 className="mr-3" size={24} />
                                  )}
                                  {isBooking ? 'Processando...' : 'Garantir Pacote'}
                               </Button>
                              
                              <Button
                                 variant="outline"
                                 fullWidth
                                 className="border-white/20 text-white hover:bg-white/10 py-4 text-sm font-black uppercase tracking-[0.1em]"
                                 onClick={handleWhatsApp}
                              >
                                 <MessageCircle className="mr-3" size={20} />
                                 Dúvidas via WhatsApp
                              </Button>

                              <button 
                                 onClick={() => setShowShareModal(true)}
                                 className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mt-4"
                              >
                                 <Share2 size={14} /> Compartilhar Viagem
                              </button>

                              <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mt-6">
                                 <ShieldCheck size={14} />
                                 Módulo de Pagamento Seguro
                              </div>
                           </div>

                           {/* Decorative Gradients */}
                           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                           <div className="absolute bottom-0 left-0 w-48 h-48 bg-action/10 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-gray-100 pt-16">
                    <div className="lg:col-span-8 space-y-12">
                        <div className="prose prose-blue max-w-none">
                            <h3 className="text-2xl font-heading font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ChevronRight size={24} className="text-action" />
                                Sobre a Viagem
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                                {trip.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-heading font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <ChevronRight size={24} className="text-action" />
                                O que está incluso
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {trip.included.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-hover hover:shadow-md">
                                        <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                                        <span className="text-gray-700 font-bold text-base">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${option.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            {option.icon}
                                        </div>
                                        <span className="font-bold text-gray-700">{option.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                onLoginSuccess={() => {
                    setShowAuthModal(false);
                }} 
            />
        </div>
    );
};
