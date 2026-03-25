import React from 'react';
import { ShieldCheck, Heart, Star, Users, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { HomeBanner } from '../types';

interface AboutViewProps {
    banner: HomeBanner | null;
}

export const AboutView: React.FC<AboutViewProps> = ({ banner }) => {
    return (
        <main className="flex-1 animate-fade-in">
            {/* Hero Section */}
            <section className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden bg-brand">
                <div className="absolute inset-0 z-0">
                    <img
                        src={banner?.image_url || "https://iaewrojuatewdebifnrv.supabase.co/storage/v1/object/public/Imagem%20Site/Logo%20Sandra%20Tur%20-%20Branca.png"}
                        alt="Viagem e Trajetória"
                        className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand/60 via-brand/40 to-brand/90 z-10" />
                </div>

                <div className="relative z-20 container mx-auto px-4 text-center -mt-12 md:-mt-20">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-7xl font-heading font-black text-white mb-6 leading-tight drop-shadow-2xl">
                            {banner?.title || "Nossa História"}
                        </h1>
                        <p className="text-lg md:text-2xl text-white/90 font-medium leading-relaxed drop-shadow-lg">
                            {banner?.subtitle || "Conheça a trajetória de quem dedica a vida a transformar sonhos em roteiros inesquecíveis."}
                        </p>
                    </div>
                </div>
            </section>

            {/* Trajetória de Sandra Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-action/10 rounded-[3rem] blur-2xl group-hover:bg-action/20 transition-all duration-700" />
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                                <img
                                    src="https://iaewrojuatewdebifnrv.supabase.co/storage/v1/object/public/Imagem%20Site/Sandra%20Tur.png"
                                    alt="Sandra - Sandra Turismo"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-brand text-white p-6 rounded-2xl shadow-xl hidden md:block">
                                <p className="font-heading text-2xl font-black italic">"Viajar é renovar a alma."</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-action/10 rounded-full text-action font-bold text-sm uppercase tracking-widest">
                                <Star size={16} fill="currentColor" /> A Idealizadora
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl text-brand font-black leading-tight">
                                Sandra: Uma vida dedicada ao Turismo
                            </h2>
                            <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                                <p>
                                    Com mais de 20 anos de experiência no setor de viagens, Sandra começou sua trajetória movida por uma paixão genuína: conectar pessoas a novos destinos e culturas.
                                </p>
                                <p>
                                    Especialista em turismo para a melhor idade, ela compreende que viajar nessa fase da vida exige mais do que apenas um bilhete; exige cuidado, segurança, paciência e, acima de tudo, carinho.
                                </p>
                                <p>
                                    Sua trajetória é marcada por milhares de quilômetros percorridos e, mais importante, por milhares de sorrisos colhidos em cada retorno de excursão.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* A Empresa Section */}
            <section className="py-20 bg-surface">
                <div className="container mx-auto max-w-6xl px-4 text-center mb-16">
                    <h2 className="font-heading text-3xl md:text-5xl text-brand font-black mb-6">
                        Sandra Turismo & Excursões
                    </h2>
                    <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                        Mais que uma agência, somos uma família que viaja com você. Nossa estrutura foi desenhada para oferecer o máximo de conforto e tranquilidade.
                    </p>
                </div>

                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                            <div className="w-14 h-14 bg-brand/5 rounded-2xl flex items-center justify-center text-brand mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-brand mb-4">Segurança Total</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Trabalhamos apenas com transporte credenciado e guias experientes para garantir que sua única preocupação seja aproveitar.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                            <div className="w-14 h-14 bg-action/5 rounded-2xl flex items-center justify-center text-action mb-6">
                                <Heart size={32} />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-brand mb-4">Atendimento Humanizado</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Nossa equipe é treinada para dar suporte total, desde o fechamento do pacote até o retorno para casa.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-500">
                            <div className="w-14 h-14 bg-brand/5 rounded-2xl flex items-center justify-center text-brand mb-6">
                                <Users size={32} />
                            </div>
                            <h3 className="font-heading text-xl font-bold text-brand mb-4">Novas Amizades</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Nossas excursões são famosas por unir grupos que se tornam amigos para a vida toda. Viajar sozinho nunca mais!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Vision Values Section */}
            <section className="py-20 bg-brand text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-action/5 -skew-x-12 translate-x-1/2" />

                <div className="container mx-auto max-w-6xl px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="font-heading text-3xl md:text-5xl font-black mb-10 leading-tight">
                                Nosso compromisso com você
                            </h2>
                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-12 h-12 rounded-full border-2 border-action flex items-center justify-center font-bold text-action">01</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Missão</h4>
                                        <p className="text-white/70 leading-relaxed">Proporcionar experiências de viagem seguras, alegres e repletas de novas amizades, focando no bem-estar e na realização pessoal de nossos clientes.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-12 h-12 rounded-full border-2 border-action flex items-center justify-center font-bold text-action">02</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Visão</h4>
                                        <p className="text-white/70 leading-relaxed">Ser a principal referência em excursões rodoviárias e aéreas para o público da melhor idade, reconhecida pelo carinho e excelência no serviço.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-12 h-12 rounded-full border-2 border-action flex items-center justify-center font-bold text-action">03</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Valores</h4>
                                        <p className="text-white/70 leading-relaxed">Transparência, Ética, Cuidado Humano, Respeito à Maturidade e Alegria em Servir.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl animate-pulse" />
                                <div className="relative w-80 h-80 rounded-full border-2 border-white/20 flex items-center justify-center p-8 text-center ring-8 ring-white/5">
                                    <div>
                                        <p className="text-4xl font-black text-action mb-2">+2.000</p>
                                        <p className="font-bold text-xl uppercase tracking-widest">Viajantes Felizes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-4xl px-4 text-center">
                    <div className="bg-surface p-12 rounded-[3rem] border-2 border-brand/5 shadow-2xl">
                        <h2 className="font-heading text-3xl md:text-5xl text-brand font-black mb-6">
                            Pronto para sua próxima aventura?
                        </h2>
                        <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                            Seja por terra ou pelo ar, estamos prontos para cuidar de cada detalhe da sua viagem. Fale conosco e comece a planejar seus próximos momentos de felicidade.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                className="bg-action hover:bg-brand px-12 py-6 text-xl h-auto shadow-xl"
                                onClick={() => window.open('https://wa.me/551198845-8885', '_blank')}
                            >
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={24} />
                                    Falar no WhatsApp
                                </div>
                            </Button>
                            <Button
                                variant="outline"
                                className="border-brand text-brand hover:bg-brand hover:text-white px-12 py-6 text-xl h-auto"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <div className="flex items-center gap-2">
                                    <Phone size={24} />
                                    Ver Contatos
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
