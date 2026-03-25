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
  Check
} from 'lucide-react';
import { formatDateBR } from '../lib/format';
import { Button } from './Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Mock Data for Admin
const RECENT_SALES = [
  { id: 1, customer: "Maria Silva", trip: "Caldas Novas Relax", date: "28/01/2026", amount: 1250, status: "Pago" },
  { id: 2, customer: "Joana D'arc", trip: "Aparecida da Fé", date: "28/01/2026", amount: 890, status: "Pendente" },
  { id: 3, customer: "Lúcia Ferreira", trip: "Serra Gaúcha", date: "27/01/2026", amount: 2400, status: "Pago" },
  { id: 4, customer: "Antônia Santos", trip: "Caldas Novas Relax", date: "27/01/2026", amount: 1250, status: "Pago" },
];

const SALES_DATA = [
  { name: 'Jan', vendas: 4000 },
  { name: 'Fev', vendas: 3000 },
  { name: 'Mar', vendas: 2000 },
  { name: 'Abr', vendas: 2780 },
  { name: 'Mai', vendas: 1890 },
  { name: 'Jun', vendas: 2390 },
];

const MOCK_BOOKINGS_ADMIN = [
  { id: 'RES-8832', client: 'Maria Silva', trip: 'Caldas Novas Relax', date: '15/03/2026', seats: 2, total: 2500, status: 'Confirmado', payment: 'Pix' },
  { id: 'RES-8833', client: 'João Souza', trip: 'Aparecida da Fé', date: '22/04/2026', seats: 1, total: 890, status: 'Pendente', payment: 'Boleto' },
  { id: 'RES-8834', client: 'Ana Pereira', trip: 'Serra Gaúcha', date: '10/06/2026', seats: 2, total: 4800, status: 'Confirmado', payment: 'Cartão' },
  { id: 'RES-8835', client: 'Carlos Lima', trip: 'Caldas Novas Relax', date: '15/03/2026', seats: 3, total: 3750, status: 'Cancelado', payment: '-' },
  { id: 'RES-8836', client: 'Fernanda Costa', trip: 'Aparecida da Fé', date: '22/04/2026', seats: 1, total: 890, status: 'Confirmado', payment: 'Pix' },
  { id: 'RES-8837', client: 'Roberto Alves', trip: 'Serra Gaúcha', date: '10/06/2026', seats: 2, total: 4800, status: 'Pendente', payment: 'Cartão' },
];

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

  useEffect(() => {
    fetchTrips();
    fetchHomeBanner();
    fetchAboutBanner();
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
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-action rounded-lg flex items-center justify-center font-bold text-white">S</div>
            <span className="font-heading font-bold text-lg">Admin Panel</span>
          </div>
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
              <Button onClick={() => alert('Funcionalidade de Nova Venda em desenvolvimento')}>
                <Plus size={18} /> Nova Venda
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="flex gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={editingTrip?.is_active !== false}
                    onChange={e => setEditingTrip({ ...editingTrip!, is_active: e.target.checked })}
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-brand transition-colors">Excursão Ativa</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={editingTrip?.is_featured || false}
                    onChange={e => setEditingTrip({ ...editingTrip!, is_featured: e.target.checked })}
                  />
                  <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-amber-600 transition-colors">Em Destaque (Home)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Faturamento Total" value="R$ 48.250" icon={DollarSign} trend="+12% este mês" />
              <StatCard title="Reservas Ativas" value="142" icon={CalendarCheck} trend="+5 novos hoje" />
              <StatCard title="Clientes Cadastrados" value="1.204" icon={Users} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Desempenho de Vendas (Semestral)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SALES_DATA}>
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
                  {RECENT_SALES.map(sale => (
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
                </div>
                <button className="w-full mt-4 text-center text-sm text-action font-bold hover:underline">Ver todas as vendas</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-800">Gerenciar Excursões</h1>
                <p className="text-gray-500">Controle de estoque, datas e roteiros.</p>
              </div>
              <Button onClick={() => { setEditingTrip({ is_active: true, included: [], images: [] }); setIsModalOpen(true); }}>
                <Plus size={18} /> Criar Nova Viagem
              </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar excursão..."
                  className="w-full pl-10 p-2.5 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-brand transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="bg-gray-50 p-2.5 rounded-lg outline-none text-gray-600 font-medium">
                <option>Todas as datas</option>
                <option>Próximo Mês</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {trips.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map(trip => (
                  <div key={trip.id} className={`bg-white rounded-xl shadow-sm border-2 border-action overflow-hidden flex flex-col ${!trip.is_active ? 'opacity-60' : ''}`}>
                    <div className="relative h-40">
                      <img src={trip.image} className="w-full h-full object-cover" alt={trip.title} />
                      <div className="absolute top-2 right-2 flex gap-2">
                        {!trip.is_active && (
                          <div className="bg-gray-800/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                            Oculta
                          </div>
                        )}
                        <div className="bg-white px-2 py-1 rounded text-xs font-bold shadow flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFeatured(trip.id, !!trip.is_featured)}
                            title={trip.is_featured ? "Remover dos Destaques" : "Marcar como Destaque"}
                            className={`transition-colors ${trip.is_featured ? 'text-amber-500 hover:text-amber-600' : 'text-gray-300 hover:text-amber-500'}`}
                          >
                            <Star size={16} fill={trip.is_featured ? "currentColor" : "none"} />
                          </button>
                          <span className="w-px h-3 bg-gray-200" />
                          #{trip.id}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-brand text-lg leading-tight">{trip.title}</h3>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingTrip(trip); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-brand" title="Editar"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteTrip(trip.id)} className="p-2 text-gray-400 hover:text-red-500" title="Excluir"><Trash2 size={18} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{formatDateBR(trip.date)}</p>

                      <div className="mt-auto">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Preço</span>
                          {trip.is_featured && (
                            <div className="bg-amber-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> Destaque
                            </div>
                          )}
                          <span className="font-bold text-brand">
                            {trip.max_installments && trip.max_installments > 1
                              ? `${trip.max_installments}x de R$ ${(trip.price / trip.max_installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : `R$ ${trip.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                          <span className="text-gray-600">Vagas</span>
                          <span className="font-bold text-brand">{trip.spots} restantes</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleTrip(trip.id, !!trip.is_active)}
                            className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"
                          >
                            {trip.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {trip.is_active ? 'Ocultar' : 'Ativar'}
                          </button>
                        </div>
                      </div>
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
                    {MOCK_BOOKINGS_ADMIN.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-500">{booking.id}</td>
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