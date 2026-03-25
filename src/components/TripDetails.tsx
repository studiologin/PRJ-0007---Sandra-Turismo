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
    ArrowRight
} from 'lucide-react';
import { Button } from './Button';
import { formatDateBR } from '../lib/format';

interface TripDetailsProps {
    trip: Trip;
    onBack: () => void;
}

export const TripDetails: React.FC<TripDetailsProps> = ({ trip, onBack }) => {
    const allImages = [trip.image, ...(trip.images || [])].filter((img, index, self) => img && self.indexOf(img) === index);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleWhatsApp = () => {
        const message = `Olá! Tenho interesse na excursão: ${trip.title} (${formatDateBR(trip.date)}). Poderia me passar mais informações?`;
        window.open(`https://wa.me/551198845-8885?text=${encodeURIComponent(message)}`, '_blank');
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
        <div className="animate-fade-in pb-20 bg-surface min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 pt-8">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-brand font-bold transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span>Voltar para Início</span>
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

                    {/* Left Column: Media Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-xl border border-gray-100 group">
                            <img
                                src={allImages[activeImageIndex]}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={trip.title}
                            />

                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full text-brand shadow-lg hover:bg-brand hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-md rounded-full text-brand shadow-lg hover:bg-brand hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-brand shadow-md scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Information */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="bg-brand/5 text-brand px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-brand/10 flex items-center gap-1">
                                    <MapPin size={12} /> {trip.destination}
                                </span>
                                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-100">
                                    <Users size={12} /> {trip.spots} vagas restantes
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 leading-tight mb-4">{trip.title}</h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8 border-y border-gray-100 mt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Data de Saída</p>
                                        <p className="font-bold text-gray-800 text-lg">{formatDateBR(trip.date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duração</p>
                                        <p className="font-bold text-gray-800 text-lg">{trip.duration}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price and Action Card */}
                        <div className="bg-brand rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-action/20 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-1">
                                <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-2">Valor Total do Pacote</p>
                                <div className="flex flex-col mb-8">
                                    <span className="text-4xl md:text-5xl font-bold">
                                        {trip.max_installments && trip.max_installments > 1
                                            ? `${trip.max_installments}x de R$ ${(trip.price / trip.max_installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : `R$ ${trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                        }
                                    </span>
                                    <p className="text-white/80 mt-2 font-medium">Ou R$ {trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} à vista</p>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        fullWidth
                                        className="bg-action hover:bg-white hover:text-brand border-transparent py-5 text-xl h-auto shadow-2xl font-black uppercase tracking-tight transition-all active:scale-95"
                                        onClick={handleWhatsApp}
                                    >
                                        <MessageCircle className="mr-3" size={28} />
                                        Garantir minha vaga
                                    </Button>
                                    <div className="flex items-center justify-center gap-2 text-white/50 text-xs font-bold">
                                        <CheckCircle2 size={12} />
                                        SITE SEGURO • ATENDIMENTO ESPECIALIZADO
                                    </div>
                                </div>
                            </div>
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
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 group text-left"
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
        </div>
    );
};
