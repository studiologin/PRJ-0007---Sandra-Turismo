import React from 'react';
import { LogOut, Ticket, History, User as UserIcon, Calendar, MapPin, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { User, Booking } from '../types';

interface ClientDashboardProps {
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onLogout }) => {
  // Mock User Data (Ideally fetched from Supabase auth state)
  const user: User = {
    name: "Maria Silva",
    email: "maria.silva@email.com",
    bookings: [
      {
        id: "7B3X92",
        tripTitle: "Caldas Novas Relax",
        date: "15 de Março, 2026",
        status: 'confirmed',
        seats: 2,
        ticketUrl: "#"
      },
      {
        id: "H2J9L1",
        tripTitle: "Campos do Jordão",
        date: "10 de Julho, 2025",
        status: 'completed',
        seats: 1,
        ticketUrl: "#"
      }
    ]
  };

  const activeBookings = user.bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = user.bookings.filter(b => b.status === 'completed');

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20 animate-fade-in">
      {/* Header Deck */}
      <div className="bg-brand text-white pt-12 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <UserIcon size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight font-heading">Olá, Dona {user.name.split(' ')[0]}!</h2>
                <p className="text-white/60 text-sm font-medium">Bem-vinda ao seu painel de viagens</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all border border-white/10"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Total de Viagens</p>
              <p className="text-3xl font-black">08</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Próxima Saída</p>
              <p className="text-3xl font-black">15 Mar</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Pontos Fidelidade</p>
              <p className="text-3xl font-black text-action">1.250</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 -mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Tickets List */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-brand flex items-center gap-2">
                  <Ticket className="text-action" />
                  Seus Cartões de Embarque
                </h3>
                <span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-full">{activeBookings.length} Ativos</span>
              </div>

              <div className="space-y-6">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="relative group perspective-1000">
                    {/* Ticket Design */}
                    <div className="bg-white rounded-[2rem] shadow-xl shadow-brand/5 border border-gray-100 overflow-hidden flex flex-col md:flex-row transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand/10 group-hover:-translate-y-1">
                      {/* Left Part: Destination Info */}
                      <div className="flex-1 p-8 relative">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {booking.status === 'confirmed' ? 'Reserva Confirmada' : 'Aguardando Pagamento'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Boarding Pass</span>
                        </div>

                        <div className="flex items-center gap-8 mb-8">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Origem</p>
                            <h4 className="text-2xl font-black text-brand leading-none">SÃO PAULO</h4>
                          </div>
                          <div className="flex-1 flex flex-col items-center gap-1 group-hover:gap-2 transition-all">
                            <div className="w-full h-px bg-gray-100 relative">
                              <div className="absolute left-0 -top-1 w-2 h-2 rounded-full border border-gray-200 bg-white" />
                              <div className="absolute right-0 -top-1 w-2 h-2 rounded-full border border-gray-200 bg-white" />
                            </div>
                            <MapPin size={16} className="text-action" />
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Destino</p>
                            <h4 className="text-2xl font-black text-brand leading-none">{booking.tripTitle.toUpperCase()}</h4>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-dashed border-gray-100">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Data de Saída</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                              <Calendar size={14} className="text-action" />
                              {booking.date}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Passageiros</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2">
                              <UserIcon size={14} className="text-action" />
                              {booking.seats} Adulto(s)
                            </p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cod. Reserva</p>
                            <p className="font-mono font-black text-action">{booking.id}</p>
                          </div>
                        </div>

                        {/* Ticket Perforation effect */}
                        <div className="absolute right-0 top-0 bottom-0 w-2 overflow-hidden hidden md:block">
                          <div className="absolute top-1/2 -right-4 w-8 h-8 rounded-full bg-[#F8FAFC] border border-gray-100 -translate-y-1/2" />
                        </div>
                      </div>

                      {/* Right Part: QR/Actions (Stub) */}
                      <div className="bg-brand w-full md:w-64 p-8 flex flex-col justify-between items-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        
                        <div className="relative z-10 w-full">
                          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Boarding Token</p>
                          <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-xl">
                            <div className="w-24 h-24 bg-gray-50 flex flex-col items-center justify-center p-2 border border-dashed border-gray-200 rounded-xl">
                                <p className="text-[8px] font-black text-brand break-all leading-tight mb-1 text-center font-mono">ST-{booking.id}-SANDRA</p>
                                <div className="grid grid-cols-4 gap-0.5 w-full opacity-30">
                                    {[...Array(16)].map((_, i) => <div key={i} className={`h-1 w-full bg-brand ${i%3===0 ? 'opacity-100' : 'opacity-40'}`} />)}
                                </div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-2 mt-4">
                          <button className="w-full bg-action hover:bg-white hover:text-brand text-white py-3 rounded-xl font-black text-xs uppercase tracking-tighter transition-all flex items-center justify-center gap-2 border border-transparent">
                            <Download size={14} />
                            Baixar Voucher
                          </button>
                          <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all flex items-center justify-center gap-2 border border-white/10">
                            <ExternalLink size={14} />
                            Roteiro
                          </button>
                        </div>

                        {/* Ticket Perforation effect (left side of stub) */}
                        <div className="absolute left-0 top-0 bottom-0 w-2 overflow-hidden hidden md:block">
                          <div className="absolute top-1/2 -left-4 w-8 h-8 rounded-full bg-[#F8FAFC] border border-gray-100 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {activeBookings.length === 0 && (
                  <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket size={32} className="text-gray-300" />
                    </div>
                    <h4 className="text-lg font-bold text-brand">Nenhuma viagem ativa</h4>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">Você ainda não tem viagens confirmadas. Que tal escolher seu próximo destino?</p>
                    <Button className="mt-6">Explorar Destinos</Button>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-brand mb-6 flex items-center gap-2">
                <History className="text-gray-400" />
                Colecionando Memórias
              </h3>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                            <MapPin size={20} className="text-gray-400 group-hover:text-white" />
                        </div>
                        <div>
                        <p className="font-bold text-gray-800 mb-0.5">{booking.tripTitle}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {booking.date}
                        </p>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full uppercase tracking-widest">Realizada</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-brand/5 border border-gray-100">
              <h4 className="font-black text-brand text-xl mb-6 flex items-center gap-2">
                <UserIcon size={20} className="text-action" />
                Meus Dados
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nome Completo</p>
                  <p className="font-bold text-gray-800">{user.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">E-mail</p>
                  <p className="font-bold text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Telefone Celular</p>
                  <p className="font-bold text-gray-800">(11) 98765-4321</p>
                </div>
                <div className="pt-4">
                  <button className="w-full py-3 border border-gray-100 text-brand font-black text-xs uppercase tracking-tighter rounded-xl hover:bg-gray-50 transition-all">
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#10B981] p-8 rounded-[2rem] shadow-lg shadow-green-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <h4 className="text-white font-black text-lg mb-2 leading-tight">Clube de Fidelidade Sandra Tur</h4>
                <p className="text-white/80 text-xs mb-6">Continue viajando e acumule pontos para trocar por descontos e refeições exclusivas.</p>
                <p className="text-xs font-black text-white uppercase tracking-widest border-b border-white/30 inline-block cursor-pointer hover:border-white transition-all">Saiba mais</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ClientDashboard;
