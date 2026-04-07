import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Ticket, History, User as UserIcon, Calendar, MapPin, Download, Save, XCircle, ExternalLink, ShieldCheck, MessageCircle, CreditCard, ChevronRight, X, AlertCircle, Plane, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../lib/supabase';
import { PaymentModal } from './PaymentModal';
import { CheckoutModal } from './CheckoutModal';
import { SuccessPaymentModal } from './SuccessPaymentModal';
import { StatusModal } from './StatusModal';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { decryptValue, generateSignature } from '../lib/encryption';
import { generateVoucherPDF } from '../lib/pdf';

interface BookingDetail {
  id: string;
  created_at: string;
  status: string;
  passengers: number;
  total_price: number;
  booking_code: string;
  payment_status: string;
  trips: {
    id: number;
    title: string;
    date: string;
    destination: string;
    image: string;
    description: string;
    payment_link?: string;
  };
}

interface PaymentTransaction {
  id: string;
  mercado_pago_id: string;
  status: string;
  amount: number;
  payment_method_id: string;
  created_at: string;
  booking_id: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
}

interface ClientDashboardProps {
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'checkout' ? 'checkout' : 'trips';
  
  const [activeTab, setActiveTab] = useState<'trips' | 'checkout'>(initialTab);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<BookingDetail | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<{ publicKey: string } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [preparedPreferenceId, setPreparedPreferenceId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isReadyForPayment, setIsReadyForPayment] = useState(false);
  
  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showStatus = (type: 'success' | 'error', title: string, message: string) => {
    setStatusModal({ isOpen: true, type, title, message });
  };

  const formatPhone = (value: string) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) setProfile(profileData);

      // 2. Fetch Bookings with Trip join (filtered by profile_id for security)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          trips (*)
        `)
        .eq('profile_id', session.user.id)
        .order('created_at', { ascending: false });

      if (bookingsData) {
        setBookings(bookingsData as any);
        const bookingIds = bookingsData.map(b => b.id);

        // 3. Fetch Transactions linked to these bookings (ensuring user-specific access)
        if (bookingIds.length > 0) {
          const { data: transData } = await supabase
            .from('payment_transactions')
            .select('*')
            .in('booking_id', bookingIds)
            .order('created_at', { ascending: false });
          
          if (transData) setTransactions(transData);
        }
      }

      // 4. Fetch Payment Config (Public Key)
      const { data: configData } = await supabase
        .from('secure_settings')
        .select('*')
        .eq('key', 'client_id_public_key')
        .single();
      
      if (configData) {
        setPaymentConfig({ publicKey: decryptValue(configData.value) });
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      alert('Nome e telefone são obrigatórios.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: editName,
          phone: editPhone 
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          full_name: editName,
          phone: editPhone
        });
      }
      setIsEditingProfile(false);
      showStatus('success', 'Perfil Atualizado!', 'Suas informações foram salvas com sucesso em nosso sistema.');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      showStatus('error', 'Ops! Algo deu errado', 'Não conseguimos salvar suas alterações. Por favor, tente novamente em instantes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleMercadoPagoPayment = async (booking: BookingDetail) => {
    if (!paymentConfig?.publicKey) {
      showStatus('error', 'Erro de Pagamento', 'Configuração de pagamento não encontrada. Por favor, contate o suporte da Sandra Turismo.');
      return;
    }

    setIsProcessingPayment(true);
    setPreparedPreferenceId(null);
    setIsReadyForPayment(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      // 1. Gerar assinatura de segurança
      const signature = generateSignature(booking.id);

      // 2. Chamar Edge Function para criar preferência
      const { data, error } = await supabase.functions.invoke('create-payment-preference', {
        body: { 
          booking_id: booking.id,
          signature: signature
        }
      });

      // Se o invoke falhou totalmente
      if (error) {
        throw new Error(`Erro de rede: ${error.message}`);
      }

      // Se a função retornou erro no corpo (mesmo com status 200)
      if (data.ok === false) {
        throw new Error(data.error || 'Erro desconhecido na função');
      }

      if (!data.preference_id || !data.checkout_url) {
        throw new Error('Informações de checkout não recebidas do servidor.');
      }

      // 3. Preparar para o próximo passo (clique do usuário)
      setPreparedPreferenceId(data.preference_id);
      setCheckoutUrl(data.checkout_url);
      setIsReadyForPayment(true);
      
    } catch (err: any) {
      console.error('Payment Error Detail:', err);
      alert('⚠️ FALHA NO PAGAMENTO:\n' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openCheckout = () => {
    if (!checkoutUrl) return;
    
    setShowPaymentModal(false);
    setShowCheckoutModal(true);
    setPreparedPreferenceId(null);
    setIsReadyForPayment(false);
  };

  const pendingBookings = bookings.filter(b => b.status === 'Pendente' || b.payment_status === 'Pendente');
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmado' || b.status === 'Pago');
  const pastBookings = bookings.filter(b => b.status === 'Realizada' || (b.trips?.date && new Date(b.trips.date) < new Date()));
  const nextTrip = confirmedBookings[0]; // Assuming first sorted confirmed trip is next

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand border-t-action rounded-full animate-spin" />
          <p className="font-heading font-black text-brand uppercase tracking-widest text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-12 animate-fade-in font-sans">
      <div className="container mx-auto max-w-6xl px-4 pt-10">
        
        {/* Superior Section: Welcome & Navigation Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight font-heading text-brand">
              Olá, {profile?.full_name?.split(' ')[0] || 'Viajante'}!
            </h2>
            <p className="text-gray-500 font-medium mt-0.5 text-sm">Que bom ter você por aqui.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'trips' 
                  ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                  : 'text-gray-400 hover:text-brand'
              }`}
            >
              Minhas Viagens
            </button>
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative ${
                activeTab === 'checkout' 
                  ? 'bg-action text-white shadow-lg shadow-action/20' 
                  : 'text-gray-400 hover:text-action'
              }`}
            >
              <Ticket size={14} className={activeTab === 'checkout' ? '' : 'text-action'} />
              Finalizar Compra
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-action text-white rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white animate-bounce-subtle">
                  {pendingBookings.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {activeTab === 'trips' ? (
              <>
                {/* Next Trip - Premium Ticket Design */}
                <section>
                  <h3 className="text-lg font-black text-brand mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="p-1.5 bg-action/10 rounded-lg"><Ticket className="text-action" size={18} /></span>
                    Sua Próxima Viagem
                  </h3>
                  
                  {nextTrip ? (
                    <div id="voucher-ticket" className="bg-white rounded-[2rem] shadow-xl shadow-brand/5 border border-slate-200 overflow-hidden flex flex-col md:flex-row transform transition-all duration-500 hover:shadow-brand/10 group min-h-[340px]">
                      {/* Left Sidebar Boarding Pass */}
                      <div className="bg-brand w-full md:w-44 p-6 flex flex-col justify-between items-start text-white relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150" />
                        
                        <div className="relative vertical-text hidden md:block opacity-20 font-black text-[9px] tracking-[0.5em] mb-4">
                          BOARDING PASS
                        </div>

                        <div className="relative z-10 space-y-5">
                            <div>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Passagem</p>
                                <p className="font-black text-lg tracking-tight uppercase">{nextTrip.booking_code || nextTrip.id.substring(0, 6)}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Passageiro</p>
                                <p className="font-black text-xs leading-tight uppercase line-clamp-2">{profile?.full_name || 'Passageiro'}</p>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-12">
                            <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                {[...Array(6)].map((_, i) => <div key={i} className="w-1 h-8 bg-white/40 rounded-full" />)}
                            </div>
                        </div>
                      </div>

                      {/* Main Body */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Reserva Confirmada</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                                <span className="text-[8px] font-black text-slate-200">SANDRA TURISMO</span>
                            </div>
                          </div>

                          <h4 className="text-2xl md:text-3xl font-black text-brand mb-1 leading-tight">{nextTrip.trips.title.toUpperCase()}</h4>
                          <p className="text-gray-400 font-bold text-sm mb-6">{nextTrip.trips.date}</p>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6 pt-4 border-t border-slate-100">
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Partida de</p>
                                <p className="font-black text-brand text-sm">SÃO PAULO (SP)</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Passageiros</p>
                                <p className="font-black text-brand text-sm flex items-center gap-1">
                                    <UserIcon size={12} className="text-action" />
                                    {nextTrip.passengers}
                                </p>
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Valor Pago</p>
                                <p className="font-black text-brand text-sm">R$ {nextTrip.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                             </div>
                          </div>

                          <div className="mb-6">
                            <p className="text-[9px] font-bold text-action uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <MapPin size={10} /> ITINERÁRIO DO PACOTE
                            </p>
                            <p className="text-gray-500 text-xs italic font-medium leading-relaxed line-clamp-2">
                                {nextTrip.trips.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                          <button 
                            onClick={() => navigate(`/detalhes/${nextTrip.trips.id}`)}
                            className="flex-1 px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-brand rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-200"
                          >
                            <ExternalLink size={14} /> Ver Roteiro
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                const success = await generateVoucherPDF('voucher-ticket', `Voucher-${nextTrip.booking_code || nextTrip.id.substring(0,6)}.pdf`);
                                if (success) {
                                  showStatus('success', 'Voucher Gerado!', 'Seu ticket de viagem foi gerado com sucesso e o download deve começar agora.');
                                } else {
                                  showStatus('error', 'Ops!', 'Não conseguimos gerar o seu voucher no momento. Por favor, tente novamente.');
                                }
                              } catch (err) {
                                showStatus('error', 'Erro no PDF', 'Houve um problema técnico ao criar o arquivo. Desculpe o transtorno.');
                              }
                            }}
                            className="flex-1 px-6 py-3.5 bg-action hover:bg-action/90 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-action/20"
                          >
                            <Download size={14} /> Baixar Voucher
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-200 shadow-xl shadow-brand/5">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <MapPin size={32} />
                        </div>
                        <h4 className="text-lg font-black text-brand mb-1">Ainda não há novas viagens...</h4>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Explore nossos próximos pacotes e garanta seu lugar na próxima aventura.</p>
                        <Button className="bg-brand px-8 py-3 text-xs">Ver Próximos Destinos</Button>
                    </div>
                  )}
                </section>

                {/* History Section */}
                <section>
                  <h3 className="text-lg font-black text-brand mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="p-1.5 bg-slate-100 rounded-lg"><History className="text-gray-400" size={18} /></span>
                    Histórico de Viagens
                  </h3>
                  <div className="space-y-3">
                    {pastBookings.length > 0 ? (
                      pastBookings.map(booking => (
                        <div key={booking.id} className="bg-white px-5 py-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-brand transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-brand group-hover:text-white transition-all">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h5 className="font-black text-sm text-brand group-hover:text-action transition-colors uppercase tracking-tight">{booking.trips.title}</h5>
                                <p className="text-[10px] font-bold text-gray-400">{booking.trips.date}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                             booking.status === 'Cancelado' 
                                ? 'bg-red-50 text-red-500' 
                                : 'bg-slate-50 text-slate-500'
                          }`}>
                            {booking.status === 'Cancelado' ? 'Cancelada' : 'Realizada'}
                          </span>
                        </div>
                      ))
                    ) : (
                        <p className="text-gray-400 font-medium italic text-center py-6 text-sm">Nenhuma viagem passada registrada.</p>
                    )}
                  </div>
                </section>
                
                {/* Payment History Section */}
                <section className="mt-10">
                  <h3 className="text-lg font-black text-brand mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="p-1.5 bg-brand/5 rounded-lg"><CreditCard className="text-brand" size={18} /></span>
                    Extrato de Pagamentos
                  </h3>
                  <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm shadow-brand/5">
                    <div className="overflow-x-auto overflow-y-hidden">
                      <table className="w-full text-left min-w-[500px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Transação</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions.length > 0 ? (
                            transactions.map(tx => (
                              <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-[11px] font-bold text-slate-600">
                                    {new Date(tx.created_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-[11px] font-black text-brand uppercase">{tx.mercado_pago_id || tx.id.substring(0, 8)}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    tx.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                                    tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                  }`}>
                                    {tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : 'Recusado'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-xs font-black text-brand">
                                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic font-medium text-sm">
                                Nenhuma transação financeira encontrada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </>
            ) : (
                /* Checkout Tab */
                <section className="animate-fade-in-up">
                    <h3 className="text-lg font-black text-brand mb-4 flex items-center gap-3 uppercase tracking-tighter">
                        <span className="p-1.5 bg-action/10 rounded-lg"><CreditCard className="text-action" size={18} /></span>
                        Reservas Aguardando Pagamento
                    </h3>
                    
                    <div className="space-y-4">
                        {pendingBookings.length > 0 ? (
                            pendingBookings.map(booking => (
                                <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg shadow-brand/5 flex flex-col md:flex-row items-center justify-between gap-5 group">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                            <div className="rotate-45"><Plane size={28} /></div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-brand mb-0.5 uppercase tracking-tight">{booking.trips.title}</h4>
                                            <p className="text-gray-400 font-bold text-xs">{booking.trips.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">TOTAL</p>
                                        <p className="text-xl font-black text-brand">R$ {booking.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => {
                                                setSelectedBookingForPayment(booking);
                                                setShowPaymentModal(true);
                                            }}
                                            className="px-6 py-2.5 bg-brand text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-action transition-all"
                                        >
                                            Pagar Agora
                                        </button>
                                        <button 
                                            onClick={async () => {
                                                if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
                                                    const { error } = await supabase
                                                        .from('bookings')
                                                        .update({ status: 'Cancelado' })
                                                        .eq('id', booking.id);
                                                    
                                                    if (!error) fetchUserData();
                                                }
                                            }}
                                            title="Cancelar"
                                            className="p-2.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white p-12 rounded-[2.5rem] text-center border border-slate-200">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                    <ShieldCheck size={32} />
                                </div>
                                <h4 className="text-lg font-black text-brand mb-1">Tudo em dia por aqui!</h4>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">Você não possui pagamentos pendentes no momento.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Ajuda Card */}
            <section className="bg-brand text-white p-8 rounded-[2rem] shadow-xl shadow-brand/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                
                <h4 className="text-lg font-black mb-3 relative z-10">Precisa de ajuda?</h4>
                <p className="text-white/60 text-xs font-medium mb-6 leading-relaxed relative z-10">
                    Dúvidas sobre sua reserva ou voucher? Nossa equipe está pronta para te atender.
                </p>
                <button 
                    onClick={() => window.open('https://wa.me/5511992387001', '_blank')}
                    className="w-full bg-white text-brand p-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-action hover:text-white transition-all shadow-lg"
                >
                    <MessageCircle size={16} />
                    FALAR NO WHATSAPP
                </button>
            </section>

            {/* Meus Dados Card */}
            <section className="bg-white p-8 rounded-[2rem] shadow-lg shadow-brand/5 border border-slate-200 relative">
                <div className="absolute top-6 right-6 text-slate-50"><UserIcon size={48} /></div>
                
                <h4 className="text-[10px] font-black text-brand mb-6 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-action" />
                    MEUS DADOS
                </h4>
                
                <div className="space-y-6">
                    {!isEditingProfile ? (
                        <>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">NOME COMPLETO</p>
                                <p className="font-black text-brand text-base leading-tight uppercase">{profile?.full_name || 'Usuário'}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">E-MAIL DE CONTATO</p>
                                <p className="font-bold text-slate-600 text-[11px] overflow-hidden text-ellipsis whitespace-nowrap">{profile?.email}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-0.5">CELULAR CADASTRADO</p>
                                <p className="font-black text-brand text-sm">{profile?.phone || '(00) 00000-0000'}</p>
                            </div>
                            
                            <div className="pt-2">
                                <button 
                                    onClick={() => {
                                        setEditName(profile?.full_name || '');
                                        setEditPhone(profile?.phone || '');
                                        setIsEditingProfile(true);
                                    }}
                                    className="w-full py-3 bg-slate-50 hover:bg-brand hover:text-white text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <History size={12} /> EDITAR MEUS DADOS
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="text-[9px] font-bold text-action uppercase tracking-widest mb-1.5 block">Nome Completo</label>
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-brand focus:ring-2 focus:ring-action/20 outline-none transition-all uppercase"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-action uppercase tracking-widest mb-1.5 block">Celular</label>
                                    <input 
                                        type="text"
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(formatPhone(e.target.value))}
                                        maxLength={15}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-brand focus:ring-2 focus:ring-action/20 outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button 
                                    onClick={handleUpdateProfile}
                                    disabled={isSavingProfile}
                                    className="w-full py-3 bg-action text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-action/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingProfile ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : <Save size={12} />} 
                                    SALVAR ALTERAÇÕES
                                </button>
                                
                                <button 
                                    onClick={() => setIsEditingProfile(false)}
                                    disabled={isSavingProfile}
                                    className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <XCircle size={12} /> CANCELAR
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

          </div>

        </div>
      </div>
      
      {/* Footer Decoration */}
      <div className="hidden md:block fixed bottom-0 left-0 w-48 h-48 bg-slate-100 rounded-full blur-[100px] opacity-10 pointer-events-none -ml-24 -mb-24" />

      {/* Hidden Printable Voucher - Força proporção 14:5 (1400x500px) */}
      {nextTrip && (
        <div 
          id="printable-voucher" 
          style={{ width: '1400px', height: '500px', position: 'absolute', left: '-9999px', top: '-9999px' }}
          className="bg-white font-sans flex flex-row overflow-hidden border border-gray-200"
        >
          {/* Sidebar */}
          <div className="w-[320px] bg-brand p-12 flex flex-col justify-between text-white border-r border-brand/20">
             <div className="space-y-8">
               <div className="text-[14px] font-black tracking-[0.3em] opacity-30">BOARDING PASS</div>
               <div className="space-y-2">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Código Passagem</p>
                 <p className="text-4xl font-black">{nextTrip.booking_code || nextTrip.id.substring(0, 6).toUpperCase()}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[12px] font-bold text-white/40 uppercase tracking-widest">Passageiro</p>
                 <p className="text-xl font-black uppercase leading-tight line-clamp-2">{profile?.full_name}</p>
               </div>
             </div>
             {/* Barcode elements mimicking */}
             <div className="flex gap-2 opacity-30">
               {[...Array(12)].map((_, i) => <div key={i} className={`w-2 h-16 bg-white rounded-full ${i % 3 === 0 ? 'h-12' : ''}`} />)}
             </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 p-14 flex flex-col justify-between bg-white">
            <div>
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[14px] font-black text-emerald-600 uppercase tracking-widest">Reserva Confirmada</span>
                </div>
                <div className="flex flex-col items-end">
                   <div className="text-[14px] font-black text-brand tracking-widest">SANDRA TURISMO</div>
                   <div className="text-[10px] font-bold text-slate-300">SANDRATURISMO.COM.BR</div>
                </div>
              </div>

              <h1 className="text-6xl font-black text-brand mb-2">{nextTrip.trips.title.toUpperCase()}</h1>
              <p className="text-2xl font-bold text-slate-400 mb-12">{nextTrip.trips.date}</p>

              <div className="grid grid-cols-3 gap-12 pt-8 border-t border-slate-100">
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Origem</p>
                  <p className="text-xl font-black text-brand">SÃO PAULO (SP)</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Passageiros</p>
                  <p className="text-xl font-black text-brand">{nextTrip.passengers} pax</p>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status Pagamento</p>
                  <p className="text-xl font-black text-emerald-500 uppercase tracking-tight">Confirmado</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-8">
               <span>Pague em até 12x via Mercado Pago</span>
               <div className="flex items-center gap-2">
                 <ShieldCheck size={14} className="text-emerald-500" /> 
                 Ambiente Seguro Sandra Turismo
               </div>
            </div>
          </div>
        </div>
      )}
      {/* Payment Summary Modal */}
      {showPaymentModal && selectedBookingForPayment && (
        <PaymentModal 
          booking={selectedBookingForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setPreparedPreferenceId(null);
            setIsReadyForPayment(false);
          }}
          onConfirm={isReadyForPayment ? openCheckout : () => handleMercadoPagoPayment(selectedBookingForPayment)}
          isProcessing={isProcessingPayment}
          isReady={isReadyForPayment}
        />
      )}

      {/* Mercado Pago Popup */}
      {showCheckoutModal && (checkoutUrl || selectedBookingForPayment?.trips?.payment_link) && (
        <CheckoutModal 
          url={checkoutUrl || selectedBookingForPayment!.trips!.payment_link!}
          onClose={() => {
            setShowCheckoutModal(false);
            setCheckoutUrl(null);
          }}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setCheckoutUrl(null);
            setShowSuccessModal(true);
            // Refresh bookings to show updated status
            fetchUserData();
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedBookingForPayment && (
        <SuccessPaymentModal 
          bookingTitle={selectedBookingForPayment.trips.title}
          onClose={() => {
            setShowSuccessModal(false);
            setSelectedBookingForPayment(null);
          }}
        />
      )}

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </main>
  );
};

export default ClientDashboard;
