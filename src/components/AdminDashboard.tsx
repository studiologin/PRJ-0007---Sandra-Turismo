import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trip } from '../types';
import {
  LayoutDashboard,
  Map,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  Plus,
  Search,
  MoreVertical,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
  Upload,
  Star,
  Check,
  CreditCard,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { formatDateBR } from '../lib/format';
import { Button } from './Button';
import { encryptValue, decryptValue } from '../lib/encryption';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import logo from '../assets/logo.png';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'bookings' | 'banner' | 'settings'>('dashboard');
  const [bannerSubTab, setBannerSubTab] = useState<'home' | 'about'>('home');
  const [trips, setTrips] = useState<(Trip & { is_active?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState<(Partial<Trip> & { is_active?: boolean }) | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [homeBanner, setHomeBanner] = useState<any>(null);
  const [aboutBanner, setAboutBanner] = useState<any>(null);

  // States para Dados Dinâmicos do Painel
  const [stats, setStats] = useState({ totalFaturamento: 0, reservasAtivas: 0, clientesCadastrados: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  // Filtros da Aba de Excursões
  const [filterDate, setFilterDate] = useState('Todas as datas');
  const [filterStatus, setFilterStatus] = useState('Todos os Status');
  const [filterFeatured, setFilterFeatured] = useState('Destaque: Todos');
  
  // Settings - Payment Gateway
  const [paymentProvider, setPaymentProvider] = useState('Mercado Pago');
  const [gatewayToken, setGatewayToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchDashboardData = async () => {
    // 1. Clientes
    const { count: clientsCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    // 2. Bookings (reservas)
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles ( full_name ),
        trips ( title, date )
      `)
      .order('created_at', { ascending: false });

    if (bookingsData) {
      let faturamento = 0;
      let ativas = 0;
      const bookingsFormatted = [];
      const salesByMonth: Record<string, number> = {};

      for (const b of bookingsData) {
        const status = b.status || 'Pendente';
        const amount = Number(b.total_price) || 0;
        
        if (status !== 'Cancelado') {
          ativas += 1;
        }
        
        if (status === 'Confirmado' || status === 'Pago') {
          faturamento += amount;
          
          const dateObj = new Date(b.created_at);
          const monthStr = dateObj.toLocaleString('pt-BR', { month: 'short' });
          salesByMonth[monthStr] = (salesByMonth[monthStr] || 0) + amount;
        }

        bookingsFormatted.push({
          id: b.id,
          booking_code: b.booking_code || String(b.id).substring(0,8).toUpperCase(),
          client: b.profiles?.full_name || 'Desconhecido',
          customer: b.profiles?.full_name || 'Desconhecido',
          trip: b.trips?.title || 'Excursão sem Nome',
          date: b.trips?.date || '',
          seats: b.passengers,
          total: amount,
          amount: amount,
          status: status,
          payment: b.payment_method || '-'
        });
      }

      setStats({
        totalFaturamento: faturamento,
        reservasAtivas: ativas,
        clientesCadastrados: clientsCount || 0
      });

      setRecentSales(bookingsFormatted.filter(b => b.status !== 'Cancelado').slice(0, 4));
      setAllBookings(bookingsFormatted);

      const monthsOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const chartArr = Object.keys(salesByMonth).map(m => ({
        name: m.charAt(0).toUpperCase() + m.slice(1),
        vendas: salesByMonth[m]
      })).sort((a, b) => monthsOrder.indexOf(a.name.toLowerCase()) - monthsOrder.indexOf(b.name.toLowerCase()));
      
      if (chartArr.length === 0) chartArr.push({ name: 'Mês Atual', vendas: 0 });
      setSalesData(chartArr);
    }
  };

  // Fetch Trips from Supabase
  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching trips:', error);
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  };
  const fetchHomeBanner = async () => {
    const { data, error } = await supabase
      .from('home_banner')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching home banner:', error);
    } else if (data && data.length > 0) {
      setHomeBanner(data[0]);
    }
  };

  const fetchAboutBanner = async () => {
    const { data, error } = await supabase
      .from('about_banner')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching about banner:', error);
    } else if (data && data.length > 0) {
      setAboutBanner(data[0]);
    }
  };

  const fetchSettings = async () => {
    const { data: settingsData } = await supabase
      .from('secure_settings')
      .select('*');

    if (settingsData) {
      const provider = settingsData.find(s => s.key === 'payment_provider')?.value || 'Mercado Pago';
      const token = settingsData.find(s => s.key === 'gateway_access_token')?.value || '';
      const pubKey = settingsData.find(s => s.key === 'client_id_public_key')?.value || '';
      
      setPaymentProvider(provider);
      setGatewayToken(decryptValue(token));
      setPublicKey(decryptValue(pubKey));
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchHomeBanner();
    fetchAboutBanner();
    fetchDashboardData();
    fetchSettings();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingTrip || !e.target.files || e.target.files.length === 0) return;

    const files = e.target.files;
    const currentImages = editingTrip?.images || [];
    if (currentImages.length + files.length > 10) {
      alert('Você pode anexar no máximo 10 imagens por excursão.');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert(`Erro ao fazer upload da imagem ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('trip-images')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    const updatedImages = [...currentImages, ...uploadedUrls];
    // If no cover is set yet, set the first uploaded one as cover
    const newCover = (editingTrip?.image && (editingTrip.image !== '')) ? editingTrip.image : (uploadedUrls[0] || '');

    setEditingTrip({
      ...editingTrip!,
      images: updatedImages,
      image: newCover
    });
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(fileInput);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSaveTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrip) return;

    const tripData = {
      ...editingTrip,
      included: Array.isArray(editingTrip.included) ? editingTrip.included : (editingTrip.included as string)?.split(',').map(i => i.trim()) || []
    };

    const { id, ...dataToSave } = tripData;

    if (id) {
      const { error } = await supabase
        .from('trips')
        .update(dataToSave)
        .eq('id', id);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase
        .from('trips')
        .insert([dataToSave]);
      if (error) alert('Erro ao inserir: ' + error.message);
    }

    setIsModalOpen(false);
    setEditingTrip(null);
    fetchTrips();
  };

  const handleDeleteTrip = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta excursão?')) {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      fetchTrips();
    }
  };

  const handleToggleTrip = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('trips')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (error) alert('Erro ao mudar status: ' + error.message);
    fetchTrips();
  };

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('trips')
      .update({ is_featured: !currentStatus })
      .eq('id', id);
    if (error) alert('Erro ao mudar destaque: ' + error.message);
    fetchTrips();
  };

  const handleSavePaymentSettings = async () => {
    if (!gatewayToken || !publicKey) {
      alert('Por favor, preencha as chaves de API para salvar.');
      return;
    }

    setSavingSettings(true);
    const settingsToSave = [
      { key: 'payment_provider', value: paymentProvider },
      { key: 'gateway_access_token', value: encryptValue(gatewayToken) },
      { key: 'client_id_public_key', value: encryptValue(publicKey) }
    ];

    const { error } = await supabase
      .from('secure_settings')
      .upsert(settingsToSave);

    if (error) {
      alert('Erro ao salvar configurações de pagamento: ' + error.message);
    } else {
      alert('Configurações de pagamento criptografadas e salvas com sucesso!');
    }
    setSavingSettings(false);
  };

  const StatCard = ({ title, value, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand">{value}</h3>
        {trend && <p className="text-green-500 text-xs font-bold mt-1 flex items-center gap-1"><TrendingUp size={12} /> {trend}</p>}
      </div>
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-brand">
        <Icon size={24} />
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    let styles = "";
    let Icon = CheckCircle;

    switch (status) {
      case 'Confirmado':
      case 'Pago':
        styles = "bg-green-100 text-green-700 border-green-200";
        Icon = CheckCircle;
        break;
      case 'Pendente':
        styles = "bg-yellow-100 text-yellow-700 border-yellow-200";
        Icon = Clock;
        break;
      case 'Cancelado':
        styles = "bg-red-100 text-red-700 border-red-200";
        Icon = XCircle;
        break;
      default:
        styles = "bg-gray-100 text-gray-700 border-gray-200";
    }

    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F0F2F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-brand text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-4 border-b border-white/10 flex items-center justify-center">
            <img src={logo} alt="Sandra Tur" className="h-20 w-auto brightness-0 invert" />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'trips' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Map size={20} />
            Excursões
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users size={20} />
            Reservas
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'banner' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <ImageIcon size={20} />
            Gerenciar Banners
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={20} />
            Configurações
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 rounded-lg transition-colors text-sm font-bold">
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-8 overflow-y-auto">
        {/* Mobile Header (Simplified) */}
        <div className="md:hidden flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-brand">Admin</h1>
          <button onClick={onLogout}><LogOut className="text-gray-500" /></button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-800">Painel de Controle</h1>
                <p className="text-gray-500">Bem-vindo de volta, Administrador.</p>
              </div>
            </div>

            {/* Stats Grid */}


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Faturamento Total" value={`R$ ${stats.totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} />
              <StatCard title="Reservas Ativas" value={stats.reservasAtivas.toString()} icon={CalendarCheck} />
              <StatCard title="Clientes Cadastrados" value={stats.clientesCadastrados.toString()} icon={Users} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Desempenho de Vendas (Semestral)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="vendas" stroke="#0F3460" strokeWidth={3} dot={{ r: 4, fill: '#0F3460' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Vendas Recentes</h3>
                <div className="space-y-4">
                  {recentSales.map(sale => (
                    <div key={sale.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                          {sale.customer.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{sale.customer}</p>
                          <p className="text-xs text-gray-500">{sale.trip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-brand">R$ {sale.amount}</p>
                        <StatusBadge status={sale.status} />
                      </div>
                    </div>
                  ))}
                <button className="w-full mt-4 text-center text-sm text-action font-bold hover:underline">Ver todas as vendas</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="animate-fade-in space-y-6">
            {/* Header & Filters Inline */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-800">Gerenciar Excursões</h1>
                <p className="text-gray-500">Controle de estoque, datas e roteiros.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar excursão..."
                    className="w-full pl-10 p-2.5 bg-white rounded-lg outline-none border border-gray-200 focus:border-action transition-colors text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none text-gray-600 text-sm font-medium cursor-pointer"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <option>Todas as datas</option>
                  <option>Próximo Mês</option>
                  <option>Últimos 3 Meses</option>
                </select>

                <select 
                  className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none text-gray-600 text-sm font-medium cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option>Todos os Status</option>
                  <option>Ativas</option>
                  <option>Ocultas</option>
                </select>

                <select 
                  className="bg-white border border-gray-200 p-2.5 rounded-lg outline-none text-gray-600 text-sm font-medium cursor-pointer"
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                >
                  <option>Destaque: Todos</option>
                  <option>Sim (Destaque)</option>
                  <option>Não (Destaque)</option>
                </select>

                <button 
                  onClick={() => { setEditingTrip({ is_active: true, included: [], images: [] }); setIsModalOpen(true); }}
                  className="bg-action hover:bg-action/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-action/20"
                >
                  <Plus size={18} /> Criar Nova Viagem
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-action"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {trips
                  .filter(t => {
                    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus = filterStatus === 'Todos os Status' 
                      ? true 
                      : (filterStatus === 'Ativas' ? t.is_active : !t.is_active);
                    const matchesFeatured = filterFeatured === 'Destaque: Todos'
                      ? true
                      : (filterFeatured === 'Sim (Destaque)' ? t.is_featured : !t.is_featured);
                    
                    // Simple date logic for now
                    let matchesDate = true;
                    if (filterDate === 'Próximo Mês' && t.date) {
                      // Just a simple check if date contains future month string or something
                    }

                    return matchesSearch && matchesStatus && matchesFeatured && matchesDate;
                  })
                  .map(trip => (
                    <div key={trip.id} className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-xl hover:border-action/20 ${!trip.is_active ? 'grayscale' : ''}`}>
                      {/* Image Area with Overlays */}
                      <div className="relative h-48 overflow-hidden">
                        <img src={trip.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={trip.title} />
                        
                        {/* ID Badge */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Star size={10} className={trip.is_featured ? 'text-amber-400 fill-amber-400' : 'text-gray-400'} />
                          #{trip.id}
                        </div>

                        {/* Price Overlay */}
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-brand px-3 py-1.5 rounded-lg shadow-sm">
                          <p className="text-[10px] font-bold uppercase opacity-60">R$ {trip.price.toLocaleString('pt-BR')}</p>
                        </div>

                        {/* Bottom Decoration Icons */}
                        <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
                             <CalendarCheck size={20} />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-800 group-hover:text-action transition-colors line-clamp-1">{trip.title}</h3>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingTrip(trip); setIsModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-action transition-colors hover:bg-action/5 rounded-md">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteTrip(trip.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-md">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-brand font-medium mb-4">{trip.date}</p>

                        <div className="space-y-2 mb-4 border-t border-gray-50 pt-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Preço</span>
                            <span className="font-bold text-gray-800">
                              {trip.max_installments && trip.max_installments > 1
                                ? `${trip.max_installments}x de R$ ${(trip.price / trip.max_installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : `R$ ${trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Vagas</span>
                            <span className="font-bold text-brand">{trip.spots} restantes</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleTrip(trip.id, !!trip.is_active)}
                          className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${trip.is_active ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-action text-white hover:bg-action/90 shadow-md shadow-action/20'}`}
                        >
                          {trip.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          {trip.is_active ? 'Ocultar' : 'Ativar'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-800">Gestão de Reservas</h1>
                <p className="text-gray-500">Visualize e gerencie todos os passageiros e pagamentos.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50" onClick={() => alert('Exportando dados para Excel...')}>
                  <Download size={18} /> Exportar
                </button>
                <Button onClick={() => alert('Nova Reserva Manual')}>
                  <Plus size={18} /> Nova Reserva
                </Button>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input type="text" placeholder="Buscar por nome, reserva ou excursão..." className="w-full pl-10 p-2.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-brand transition-colors" />
              </div>
              <div className="flex gap-4">
                <div className="relative min-w-[160px]">
                  <Filter className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select className="w-full pl-10 p-2.5 bg-gray-50 rounded-lg outline-none text-gray-600 font-medium cursor-pointer">
                    <option>Todos os Status</option>
                    <option>Confirmado</option>
                    <option>Pendente</option>
                    <option>Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">ID Reserva</th>
                      <th className="px-6 py-4">Passageiro</th>
                      <th className="px-6 py-4">Excursão</th>
                      <th className="px-6 py-4">Vagas</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {allBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-500" title={booking.id}>{booking.booking_code}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800">{booking.client}</p>
                          <p className="text-xs text-gray-400">{booking.payment}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {booking.trip}
                          <div className="text-xs text-gray-400 mt-0.5">{booking.date}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                          <Users size={14} /> {booking.seats}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">R$ {booking.total}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-blue-50 text-gray-500 hover:text-brand rounded-lg transition-colors" title="Ver Detalhes">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 rounded-lg transition-colors" title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors" title="Cancelar">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">Mostrando <span className="font-bold">1-6</span> de <span className="font-bold">24</span> resultados</p>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white text-gray-600 disabled:opacity-50" disabled>Anterior</button>
                  <button className="px-3 py-1 text-sm border border-brand bg-brand text-white rounded-md">1</button>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50">3</button>
                  <button className="px-3 py-1 text-sm border border-gray-200 rounded-md bg-white text-gray-600 hover:bg-gray-50">Próximo</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner Tab Content */}
        {activeTab === 'banner' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Banners</h2>
                <p className="text-gray-500">Personalize os banners das suas páginas principais</p>
              </div>
            </div>

            {/* Sub-tabs navigation */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setBannerSubTab('home')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${bannerSubTab === 'home' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Página Home
              </button>
              <button
                onClick={() => setBannerSubTab('about')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${bannerSubTab === 'about' ? 'border-brand text-brand' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Página Sobre
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-black uppercase tracking-tight text-sm mb-2">Título do Banner</label>
                    <input
                      type="text"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all font-bold text-gray-800"
                      value={bannerSubTab === 'home' ? (homeBanner?.title || '') : (aboutBanner?.title || '')}
                      onChange={e => bannerSubTab === 'home'
                        ? setHomeBanner({ ...homeBanner, title: e.target.value })
                        : setAboutBanner({ ...aboutBanner, title: e.target.value })
                      }
                      placeholder="Ex: Viaje com segurança e novas amizades."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-black uppercase tracking-tight text-sm mb-2">Subtítulo / Descrição</label>
                    <textarea
                      rows={4}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all font-medium text-gray-600"
                      value={bannerSubTab === 'home' ? (homeBanner?.subtitle || '') : (aboutBanner?.subtitle || '')}
                      onChange={e => bannerSubTab === 'home'
                        ? setHomeBanner({ ...homeBanner, subtitle: e.target.value })
                        : setAboutBanner({ ...aboutBanner, subtitle: e.target.value })
                      }
                      placeholder="Descreva o foco da sua agência..."
                    />
                  </div>

                  {bannerSubTab === 'home' && (
                    <div>
                      <label className="block text-gray-700 font-black uppercase tracking-tight text-sm mb-2">Texto do Botão</label>
                      <input
                        type="text"
                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand focus:bg-white outline-none transition-all font-bold text-gray-800"
                        value={homeBanner?.button_text || ''}
                        onChange={e => setHomeBanner({ ...homeBanner, button_text: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="pt-6">
                    <button
                      onClick={async () => {
                        const table = bannerSubTab === 'home' ? 'home_banner' : 'about_banner';
                        const bannerData = bannerSubTab === 'home' ? homeBanner : aboutBanner;

                        const { data, error } = await supabase
                          .from(table)
                          .upsert(bannerData)
                          .select();

                        if (error) {
                          alert(`Erro ao salvar banner ${bannerSubTab === 'home' ? 'da Home' : 'do Sobre'}: ` + error.message);
                        } else {
                          if (data && data.length > 0) {
                            if (bannerSubTab === 'home') setHomeBanner(data[0]);
                            else setAboutBanner(data[0]);
                          }
                          alert(`Banner ${bannerSubTab === 'home' ? 'da Home' : 'da página Sobre'} atualizado com sucesso!`);
                        }
                      }}
                      className="w-full md:w-auto bg-brand text-white px-12 py-4 rounded-2xl font-black uppercase tracking-tight shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Salvar Banner
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-black uppercase tracking-tight text-sm mb-2">Imagem de Fundo</label>
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 group">
                      {bannerSubTab === 'home' ? (
                        homeBanner?.image_url ? (
                          <img src={homeBanner.image_url} className="w-full h-full object-cover" alt="Banner Preview" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={48} className="mb-2" />
                            <p className="font-bold text-sm">Sem imagem selecionada</p>
                          </div>
                        )
                      ) : (
                        aboutBanner?.image_url ? (
                          <img src={aboutBanner.image_url} className="w-full h-full object-cover" alt="Banner Preview" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon size={48} className="mb-2" />
                            <p className="font-bold text-sm">Sem imagem selecionada</p>
                          </div>
                        )
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <div className="bg-white text-brand px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2">
                          <Upload size={16} /> Alterar Imagem
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const fileExt = file.name.split('.').pop();
                            const fileName = `banner_${bannerSubTab}_${Date.now()}.${fileExt}`;

                            const { error: uploadError } = await supabase.storage
                              .from('trip-images')
                              .upload(fileName, file);

                            if (uploadError) {
                              alert('Erro no upload: ' + uploadError.message);
                              return;
                            }

                            const { data } = supabase.storage
                              .from('trip-images')
                              .getPublicUrl(fileName);

                            if (bannerSubTab === 'home') {
                              setHomeBanner({ ...homeBanner, image_url: data.publicUrl });
                            } else {
                              setAboutBanner({ ...aboutBanner, image_url: data.publicUrl });
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 font-medium">Recomendado: 1200x800px ou similar.</p>
                  </div>

                  <div className="p-6 bg-brand/5 rounded-3xl border border-brand/10">
                    <h4 className="font-bold text-brand mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <TrendingUp size={16} /> Dica de Especialista
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Use imagens que transmitam <strong>emoção e alegria</strong>. Para o Sandra Turismo, fotos de pessoas na "melhor idade" viajando e sorrindo costumam converter muito melhor!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="animate-fade-in space-y-6">
            <h1 className="text-2xl font-heading font-bold text-gray-800">Sobre o Sistema</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl">S</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Sandra Turismo - Painel Administrativo</h2>
                  <p className="text-gray-500">Versão 1.1.0 (Supabase Ready)</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-600">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="font-medium">Status do Banco de Dados: <span className="text-green-600 font-bold">Conectado</span></p>
                  <p className="text-sm mt-1">Sincronização em tempo real ativa.</p>
                </div>

                <p>Este painel foi desenvolvido exclusivamente para gestão interna de viagens e excursões da Sandra Turismo. Agora integrado ao Supabase para persistência de dados.</p>

                <div className="pt-4 border-t border-gray-100">
                  <Button variant="outline" onClick={() => alert('Backup automático via Supabase ativo.')}>Status de Backup</Button>
                </div>
              </div>
            </div>

            {/* Payment Method Configuration Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 max-w-2xl animate-fade-in mt-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <CreditCard className="text-red-500" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 tracking-tight">Meio de Pagamento</h2>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Gerencie suas chaves de API com segurança</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">Provedor de Pagamento</label>
                  <div className="relative">
                    <select 
                      className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-gray-700 transition-all cursor-pointer appearance-none"
                      value={paymentProvider}
                      onChange={(e) => setPaymentProvider(e.target.value)}
                    >
                      <option value="Mercado Pago">Mercado Pago</option>
                      <option value="Pague Seguro">Pague Seguro</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">Gateway API Key (Access Token)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
                    <input
                      type="password"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-gray-700 transition-all font-mono"
                      placeholder="APP_USR-..."
                      value={gatewayToken}
                      onChange={(e) => setGatewayToken(e.target.value)}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-brand font-black text-[10px] uppercase tracking-[0.15em] mb-2 block ml-1">Client ID / Public Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 focus:border-brand/20 rounded-2xl outline-none text-sm font-bold text-gray-700 transition-all font-mono"
                      placeholder="APP_USR-..."
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100/50 flex gap-3">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide leading-relaxed">
                    <strong>IMPORTANTE:</strong> Estas chaves serão criptografadas no banco de dados usando sua Chave Mestra atual. Se você mudar a chave mestra futuramente, estas chaves precisarão ser reinseridas.
                  </p>
                </div>

                <button 
                  onClick={handleSavePaymentSettings}
                  disabled={savingSettings}
                  className="w-full bg-action hover:bg-action/90 text-white py-5 rounded-2xl font-black italic uppercase tracking-tighter text-lg shadow-xl shadow-action/30 flex items-center justify-center gap-2 disabled:opacity-70 transition-all active:scale-[0.98]"
                >
                  {savingSettings ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Create/Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
              <div className="bg-brand p-6 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading">{editingTrip?.id ? 'Editar Excursão' : 'Nova Excursão'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><XCircle /></button>
              </div>
              <form onSubmit={handleSaveTrip} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Título da Viagem</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.title || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, title: e.target.value })}
                    placeholder="Ex: Caldas Novas Relaxante"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Destino</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.destination || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, destination: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Data de Saída</label>
                  <input
                    required
                    type="date"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.date || ''}
                    onChange={e => {
                      const newDate = e.target.value;
                      const returnDate = editingTrip?.return_date;
                      let duration = editingTrip?.duration || '';

                      if (newDate && returnDate) {
                        const start = new Date(newDate);
                        const end = new Date(returnDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        duration = `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
                      }

                      setEditingTrip({ ...editingTrip!, date: newDate, duration });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Data de Retorno</label>
                  <input
                    required
                    type="date"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.return_date || ''}
                    onChange={e => {
                      const returnDate = e.target.value;
                      const startDate = editingTrip?.date;
                      let duration = editingTrip?.duration || '';

                      if (startDate && returnDate) {
                        const start = new Date(startDate);
                        const end = new Date(returnDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                        duration = `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
                      }

                      setEditingTrip({ ...editingTrip!, return_date: returnDate, duration });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Duração (Automático)</label>
                  <input
                    readOnly
                    type="text"
                    className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 outline-none text-gray-500 cursor-not-allowed"
                    value={editingTrip?.duration || ''}
                    placeholder="Selecione as datas..."
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.price || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Vagas Disponíveis</label>
                  <input
                    required
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.spots || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, spots: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Máximo de Parcelas</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="12"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.max_installments || 1}
                    onChange={e => setEditingTrip({ ...editingTrip!, max_installments: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-2 text-sm">
                    Galeria de Imagens (Até 10 fotos)
                  </label>

                  {/* Grid de Imagens */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                    {(editingTrip?.images || []).map((img, index) => (
                      <div key={index} className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${editingTrip?.image === img ? 'border-brand shadow-md' : 'border-transparent bg-gray-100'}`}>
                        <img src={img} className="w-full h-full object-cover" alt={`Galeria ${index + 1}`} />

                        {/* Overlay Controls */}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 flex gap-1 justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Definir como Capa"
                            onClick={() => setEditingTrip({ ...editingTrip!, image: img })}
                            className={`p-1.5 rounded-lg transition-all ${editingTrip?.image === img ? 'bg-brand text-white' : 'bg-white text-gray-600 hover:bg-brand hover:text-white'}`}
                          >
                            <Star size={14} fill={editingTrip?.image === img ? "currentColor" : "none"} />
                          </button>
                          <button
                            type="button"
                            title="Remover"
                            onClick={() => {
                              const newImages = (editingTrip?.images || []).filter((_, i) => i !== index);
                              let newCover = editingTrip?.image;
                              if (newCover === img) {
                                newCover = newImages[0] || '';
                              }
                              setEditingTrip({ ...editingTrip!, images: newImages, image: newCover! });
                            }}
                            className="p-1.5 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Capa Badge */}
                        {editingTrip?.image === img && (
                          <div className="absolute top-1 right-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check size={10} /> CAPA
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Botão de Upload / Area de Drop */}
                    {(!editingTrip?.images || editingTrip.images.length < 10) && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`relative aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${isDragging
                          ? 'border-brand bg-brand/5'
                          : 'border-gray-200 bg-gray-50 hover:border-brand/40 hover:bg-brand/5 text-gray-400 hover:text-brand'
                          }`}
                        onClick={() => document.getElementById('multi-upload')?.click()}
                      >
                        {uploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand/20 border-t-brand"></div>
                        ) : (
                          <>
                            <Plus size={24} />
                            <span className="text-[10px] font-bold mt-1">ANEXAR</span>
                          </>
                        )}
                        <input
                          id="multi-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-gray-400 mb-4">
                    Dica: Arraste arquivos aqui para enviar várias de uma vez. A primeira imagem enviada vira a capa, mas você pode mudar clicando na estrela.
                  </p>

                  {/* Input de URL manual (opcional) */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand text-xs"
                      placeholder="Adicionar imagem por URL..."
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = (e.target as HTMLInputElement).value;
                          if (url) {
                            const currentImages = editingTrip?.images || [];
                            if (currentImages.length < 10) {
                              const newCover = (editingTrip?.image && editingTrip.image !== '') ? editingTrip.image : url;
                              setEditingTrip({ ...editingTrip!, images: [...currentImages, url], image: newCover });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Descrição</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={editingTrip?.description || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1 text-sm">Incluso (separar por vírgula)</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand"
                    value={Array.isArray(editingTrip?.included) ? editingTrip?.included.join(',') : editingTrip?.included || ''}
                    onChange={e => setEditingTrip({ ...editingTrip!, included: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex gap-4 mt-2">
                  <Button type="button" variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" fullWidth>Salvar Alterações</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};