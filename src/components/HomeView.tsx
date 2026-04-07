import React from 'react';
import { ShieldCheck, Heart, Calendar, Plane, ArrowRight, Quote, Star, Globe, Sparkles, HeartPulse, Trophy, Instagram, MessageCircle } from 'lucide-react';
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
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="mb-12 relative overflow-hidden bg-brand shadow-2xl group min-h-[calc(100vh-120px)] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={banner?.image_url || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80"}
            alt="Banner background"
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/60 to-transparent z-10" />
        </div>

        <div className="container mx-auto max-w-7xl px-4 relative z-20">
          <div className="w-full py-12 md:py-20 lg:py-24">
            <h2 className="font-heading text-[clamp(2.5rem,10vw,5rem)] md:text-6xl lg:text-7xl xl:text-8xl text-white font-black mb-6 leading-[1.05] animate-in fade-in slide-in-from-left-8 duration-700 tracking-tighter max-w-4xl">
              {banner?.title ? (
                <span>{banner.title}</span>
              ) : (
                <>Viaje com<br />conforto e<br />segurança.</>
              )}
            </h2>
            <p className="text-white/90 text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-left-12 duration-1000 font-medium">
              {banner?.subtitle || "Excursões rodoviárias exclusivas com o cuidado que você merece. Especialista em viagens para a melhor idade."}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Button
                className="bg-action hover:bg-white hover:text-brand px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl h-auto shadow-2xl font-black uppercase tracking-tight transition-all"
                onClick={onSeeAll}
              >
                {banner?.button_text || "Ver Próximas Saídas"}
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl h-auto font-bold uppercase backdrop-blur-md"
                onClick={() => window.open('https://wa.me/5511988458885', '_blank')}
              >
                Falar com Sandra
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Essência */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Column: Image with Badge */}
            <div className="w-full lg:w-1/2 relative">
               <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl transform transition-transform hover:scale-[1.02] duration-700">
                  <img 
                    src="https://iaewrojuatewdebifnrv.supabase.co/storage/v1/object/public/Imagem%20Site/premium_travel_bus_essence_1775500332328.png" 
                    alt="Nossa Essência" 
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent" />
               </div>
               {/* Badge */}
               <div className="absolute bottom-10 -left-6 lg:-left-10 z-20 bg-brand text-white p-8 rounded-3xl shadow-2xl animate-bounce-slow">
                  <p className="text-4xl font-black mb-1">+15 Anos</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">De Experiência</p>
               </div>
               {/* Decorative Element */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-action/10 rounded-full blur-3xl -z-10" />
            </div>

            {/* Right Column: Content */}
            <div className="w-full lg:w-1/2">
               <span className="inline-block px-4 py-1.5 bg-slate-100 rounded-full text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-6">Nossa Essência</span>
               <h2 className="text-5xl md:text-6xl font-black text-brand mb-8 leading-[1.05] tracking-tighter">Conforto, Segurança e Novas Amizades.</h2>
               <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                  Na Sandra Turismo, acreditamos que viajar é a melhor forma de celebrar a vida. Com anos de experiência no mercado, somos especialistas em criar roteiros que proporcionam não apenas o transporte, mas momentos de alegria e integração.
               </p>
               
               {/* Testimonial Quote */}
               <div className="relative pl-8 mb-12 py-2 border-l-4 border-action/30">
                  <p className="text-slate-500 italic text-lg leading-relaxed">
                    "Cada detalhe é planejado para que você se sinta em casa, mesmo longe dela. Nossa missão é transformar cada quilômetro em uma nova história."
                  </p>
               </div>

               <div className="flex flex-wrap gap-4">
                  <Button className="bg-brand hover:bg-brand/90 px-8 py-4 uppercase font-black tracking-widest text-[10px]" onClick={onSeeAll}>
                    SAIBA MAIS <ArrowRight size={14} className="ml-2" />
                  </Button>
                  <Button variant="outline" className="border-action text-action hover:bg-action hover:text-white px-8 py-4 uppercase font-black tracking-widest text-[10px]" onClick={() => window.open('https://wa.me/5511988458885', '_blank')}>
                    <MessageCircle size={14} className="mr-2" /> FALAR COM SANDRA
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Por Que Escolher a Sandra Tur? */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-brand mb-4 tracking-tight">Por Que Escolher a Sandra Tur?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-16 font-medium">Oferecemos muito mais do que viagens. Criamos experiências que transformam vidas através de cada detalhe.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Globe, title: "Curadoria de Destinos", desc: "Exploramos o mundo para selecionar apenas os cenários perfeitos para o seu próximo grande capítulo.", color: "bg-blue-50 text-blue-600" },
              { icon: Sparkles, title: "Experiências com Alma", desc: "Cada detalhe é planejado para transformar uma simples viagem em uma memória que atravessa gerações.", color: "bg-orange-50 text-orange-600" },
              { icon: HeartPulse, title: "Acolhimento Real", desc: "Aqui você não é um passageiro, é parte da nossa história. Cuidamos de cada detalhe como se fosse para nossa família.", color: "bg-green-50 text-green-600" },
              { icon: Trophy, title: "Legado de Paixão", desc: "Décadas realizando sonhos com o brilho nos olhos de quem ama transformar destinos em encontros inesquecíveis.", color: "bg-red-50 text-red-600" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500">
                <div className={`${feature.color} p-5 rounded-2xl mb-8 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-brand mb-4">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Próximas Excursões */}
      <section className="py-24 bg-white" id="proximas-saidas">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
               <h2 className="text-4xl md:text-5xl font-black text-brand tracking-tight">Próximas Excursões</h2>
               <div className="h-1.5 w-24 bg-action rounded-full mt-4" />
            </div>
            <button onClick={onSeeAll} className="text-action font-black uppercase tracking-widest text-[10px] hover:underline flex items-center gap-2">
              Ver todas <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {trips.slice(0, 4).map(trip => (
                <TripCard key={trip.id} trip={trip} onSelect={onSelectTrip} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Vozes de Nossos Viajantes */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-brand mb-4 tracking-tight">Vozes de Nossos Viajantes</h2>
            <div className="h-1 w-12 bg-action mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Dona Mercedes", info: "VIAJANTE HÃ 5 ANOS", text: "Viajar com a Sandra é como viajar em família. O cuidado e a atenção aos detalhes fazem toda a diferença para nós da melhor idade." },
              { name: "Sr. José Carlos", info: "FÃ DE CALDAS NOVAS", text: "Roteiros tranquilos e muito bem organizados. Finalmente encontrei uma agência que entende o que realmente buscamos em uma excursão." },
              { name: "Maria Helena", info: "ENTUSIASTA DE CRUZEIROS", text: "As amizades que fiz nessas viagens valem ouro. Sandra tem um dom especial para unir as pessoas e criar momentos mágicos." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-start hover:shadow-xl transition-all duration-500 group relative">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-action text-action" />)}
                </div>
                <p className="text-base md:text-lg text-slate-500 italic mb-8 leading-relaxed font-medium">"{item.text}"</p>
                <div className="mt-auto">
                   <h4 className="text-xl font-black text-brand mb-1 tracking-tight">{item.name}</h4>
                   <p className="text-[10px] font-black tracking-widest text-action uppercase">{item.info}</p>
                </div>
                <Quote className="absolute top-10 right-10 text-slate-100 w-16 h-16 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria de Fotos */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4">
           <div className="text-center mb-16">
              <h2 className="text-[2.5rem] md:text-5xl lg:text-6xl font-black text-brand mb-6 tracking-tighter leading-tight">
                Sua Próxima Memória<br className="hidden md:block" /> Inesquecível Começa Aqui
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
                Não são apenas viagens, são reencontros, sorrisos compartilhados e a alegria de descobrir o novo com quem você confia.
              </p>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-start">
              <div className="md:row-span-2 rounded-[2rem] overflow-hidden group relative shadow-2xl">
                <img src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 min-h-[400px]" />
                <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Instagram className="text-white w-10 h-10" />
                </div>
              </div>
              <div className="rounded-[2rem] overflow-hidden group relative shadow-xl">
                 <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80" className="w-full h-64 object-cover transition-transform duration-1000 group-hover:scale-110" />
                 <div className="absolute inset-0 bg-action/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="md:row-span-2 rounded-[2rem] overflow-hidden group relative shadow-xl">
                 <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 min-h-[400px]" />
              </div>
              <div className="rounded-[2rem] overflow-hidden group relative shadow-xl">
                 <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80" className="w-full h-48 object-cover transition-transform duration-1000 group-hover:scale-110" />
              </div>
              <div className="col-span-2 md:col-span-1 rounded-[2rem] overflow-hidden group relative shadow-xl">
                 <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80" className="w-full h-64 object-cover transition-transform duration-1000 group-hover:scale-110" />
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32 pt-12 bg-white text-center">
        <div className="container mx-auto max-w-4xl px-4 flex flex-col items-center">
           <h3 className="text-3xl md:text-4xl font-bold text-brand italic mb-12 leading-tight tracking-tight">
             "A vida é feita de momentos.<br />
             O próximo registro desse mural <span className="text-action font-black not-italic">pode ser o seu.</span>"
           </h3>
           <Button 
             className="inline-flex bg-action hover:bg-action/90 px-12 py-6 text-xl h-auto rounded-full font-black shadow-[0_20px_40px_rgba(233,69,96,0.3)] transform hover:scale-105 active:scale-95 transition-all text-white border-none"
             onClick={() => window.open('https://wa.me/5511988458885', '_blank')}
           >
             <MessageCircle className="mr-3 fill-white" size={24} /> Garantir minha próxima aventura
           </Button>
        </div>
      </section>
    </main>
  );
};

export default HomeView;
