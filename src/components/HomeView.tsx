import React from 'react';
import { ShieldCheck, Heart, Calendar, Plane } from 'lucide-react';
import { Button } from './Button';
import TripCard from './TripCard';
import { Trip, HomeBanner } from '../types';

interface HomeViewProps {
  trips: Trip[];
  loading: boolean;
  banner: HomeBanner | null;
  onSelectTrip: (trip: Trip) => void;
  onSeeAll: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ trips, loading, banner, onSelectTrip, onSeeAll }) => {
  const featuredTrips = trips.filter(t => (t as any).is_featured);

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="mb-12 relative overflow-hidden bg-brand shadow-2xl group min-h-[calc(100vh-120px)] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={banner?.image_url || "https://iaewrojuatewdebifnrv.supabase.co/storage/v1/object/public/Imagem%20Site/Logo%20Sandra%20Tur%20-%20Branca.png"}
            alt="Banner background"
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/60 to-transparent z-10" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 relative z-20 -mt-12 md:-mt-20">
          <div className="w-full py-12 md:py-20 lg:py-24">
            <h2 className="font-heading text-[clamp(2.5rem,10vw,5rem)] md:text-6xl lg:text-7xl xl:text-8xl text-white font-black mb-6 leading-[1.05] animate-in fade-in slide-in-from-left-8 duration-700 tracking-tighter max-w-4xl">
              {banner?.title ? (
                banner.title.split(' ').reduce((acc: any[], word, i, arr) => {
                  const chunkIndex = Math.floor(i / (arr.length / 3));
                  if (!acc[chunkIndex]) acc[chunkIndex] = [];
                  acc[chunkIndex].push(word);
                  return acc;
                }, []).map((chunk, i) => (
                  <React.Fragment key={i}>
                    {chunk.join(' ')}
                    {i < 2 && <br />}
                  </React.Fragment>
                ))
              ) : (
                <>Viaje com<br />segurança e<br />novas amizades.</>
              )}
            </h2>
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-left-12 duration-1000 font-medium">
              {banner?.subtitle || "Excursões rodoviárias exclusivas e passagens aéreas com o cuidado que você merece. Especialista em viagens para a melhor idade."}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button
                className="bg-action hover:bg-white hover:text-brand px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl h-auto shadow-2xl font-black uppercase tracking-tight transition-all active:scale-95"
                onClick={onSeeAll}
              >
                {banner?.button_text || "Ver Próximas Saídas"}
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl h-auto font-bold uppercase backdrop-blur-md"
                onClick={() => window.open('https://wa.me/551198845-8885', '_blank')}
              >
                Falar com Sandra
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 pb-12">
        {/* Trust Indicators */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: ShieldCheck, text: "Site Seguro" },
            { icon: Heart, text: "Atendimento Humanizado" },
            { icon: Calendar, text: "Roteiros Tranquilos" },
            { icon: Plane, text: "Agência Credenciada" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center gap-2 border border-gray-50">
              <item.icon className="text-brand w-8 h-8" />
              <span className="text-brand font-bold text-sm md:text-base">{item.text}</span>
            </div>
          ))}
        </section>

        {/* Excursions Grid */}
        <section id="proximas-saidas">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-2xl text-brand font-bold">Próximas Excursões</h3>
            <button
              onClick={onSeeAll}
              className="text-action font-bold text-sm cursor-pointer hover:underline"
            >
              Ver todas
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredTrips.length > 0 ? featuredTrips : trips.slice(0, 3)).map(trip => (
                <TripCard key={trip.id} trip={trip} onSelect={onSelectTrip} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default HomeView;
