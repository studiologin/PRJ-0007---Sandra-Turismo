import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const ContactView: React.FC = () => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simular envio
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setFormState({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setIsSuccess(false), 5000);
        }, 1500);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'Telefone & WhatsApp',
            content: '+55 (11) 98845-8885',
            description: 'Atendimento humanizado via WhatsApp',
            action: 'https://wa.me/5511988458885'
        },
        {
            icon: Mail,
            title: 'E-mail',
            content: 'contato@sandraturismo.com.br',
            description: 'Envie sua dúvida ou sugestão',
            action: 'mailto:contato@sandraturismo.com.br'
        },
        {
            icon: Clock,
            title: 'Horário de Atendimento',
            content: 'Segunda a Sexta: 09h às 18h',
            description: 'Sábados: 09h às 13h',
            action: null
        }
    ];

    return (
        <div className="animate-fade-in bg-gray-50 min-h-screen">
            {/* Header Hero */}
            <section className="bg-brand pt-32 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-action rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6 uppercase tracking-tighter">
                        Vamos conversar?
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        Estamos prontos para planejar sua próxima aventura. Escolha o canal de sua preferência ou envie uma mensagem abaixo.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 -mt-10 mb-20 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-4">
                        {contactInfo.map((info, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-start gap-4 group transition-all hover:scale-[1.02]"
                            >
                                <div className="bg-brand/5 p-4 rounded-2xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                                    <info.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{info.title}</h3>
                                    {info.action ? (
                                        <a href={info.action} className="text-brand font-black block hover:underline" target="_blank" rel="noreferrer">
                                            {info.content}
                                        </a>
                                    ) : (
                                        <p className="text-brand font-black">{info.content}</p>
                                    )}
                                    <p className="text-gray-400 text-sm mt-1">{info.description}</p>
                                </div>
                            </div>
                        ))}

                        {/* Social / WhatsApp Direct */}
                        <div className="bg-action p-8 rounded-3xl text-white shadow-2xl shadow-action/20">
                            <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Atendimento Imediato</h3>
                            <p className="mb-6 text-white/90 font-medium">Prefere falar agora mesmo? Chame um de nossos especialistas no WhatsApp.</p>
                            <Button
                                variant="secondary"
                                className="w-full bg-white text-action hover:bg-white/95 py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border-none shadow-xl"
                                onClick={() => window.open('https://wa.me/5511988458885', '_blank')}
                            >
                                <MessageCircle size={20} className="text-action" />
                                <span className="text-action">Iniciar Conversa</span>
                            </Button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <h2 className="text-2xl font-black text-brand mb-8 uppercase tracking-tight">Envie uma mensagem</h2>

                            {isSuccess ? (
                                <div className="py-12 flex flex-col items-center text-center animate-in zoom-in duration-500">
                                    <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6">
                                        <CheckCircle2 size={64} />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Mensagem Enviada!</h3>
                                    <p className="text-gray-500 font-medium max-w-sm">Obrigado pelo contato. Em breve um de nossos consultores entrará em contato com você.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                                placeholder="Como podemos te chamar?"
                                                value={formState.name}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                                placeholder="seu@email.com"
                                                value={formState.email}
                                                onChange={e => setFormState({ ...formState, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assunto</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl outline-none transition-all font-medium"
                                            placeholder="Sobre o que você deseja falar?"
                                            value={formState.subject}
                                            onChange={e => setFormState({ ...formState, subject: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mensagem</label>
                                        <textarea
                                            required
                                            rows={5}
                                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-brand focus:bg-white rounded-2xl outline-none transition-all font-medium resize-none"
                                            placeholder="Conte-nos mais sobre seus planos de viagem..."
                                            value={formState.message}
                                            onChange={e => setFormState({ ...formState, message: e.target.value })}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        disabled={isSubmitting}
                                        className="w-full md:w-auto px-12 py-5 hover:bg-brand/90 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-brand/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Enviar Mensagem
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
