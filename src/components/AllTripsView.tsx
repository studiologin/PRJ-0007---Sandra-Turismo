import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Trip } from '../types';
import { TripCard } from './TripCard';
import {
    ArrowLeft,
    Map,
    Search,
    Calendar,
    X,
    SlidersHorizontal,
    DollarSign,
    Clock,
    MapPin,
    ChevronDown,
    Check,
    Filter
} from 'lucide-react';
import { Button } from './Button';
import { formatMonthBR } from '../lib/format';

interface AllTripsViewProps {
    trips: Trip[];
    banner: any;
    onBack: () => void;
    onSelectTrip: (trip: Trip) => void;
}

export const AllTripsView: React.FC<AllTripsViewProps> = ({ trips, banner, onBack, onSelectTrip }) => {
    const activeTrips = trips.filter(t => t.is_active !== false);

    // Derived Data for Range Initialization
    const { states, durations, absoluteMinPrice, absoluteMaxPrice } = useMemo(() => {
        const stateSet = new Set<string>();
        const durationSet = new Set<string>();
        let min = Infinity;
        let max = 0;

        activeTrips.forEach(trip => {
            const parts = trip.destination.split('-');
            if (parts.length > 1) {
                stateSet.add(parts[parts.length - 1].trim().toUpperCase());
            }
            if (trip.duration) {
                durationSet.add(trip.duration);
            }
            if (trip.price < min) min = trip.price;
            if (trip.price > max) max = trip.price;
        });

        return {
            states: Array.from(stateSet).sort(),
            durations: Array.from(durationSet).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0)),
            absoluteMinPrice: min === Infinity ? 0 : Math.floor(min),
            absoluteMaxPrice: max === 0 ? 10000 : Math.ceil(max)
        };
    }, [activeTrips]);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDuration, setSelectedDuration] = useState('');
    const [priceRange, setPriceRange] = useState({ min: absoluteMinPrice, max: absoluteMaxPrice });

    // UI States
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update price range if trips change significantly (optional, but good for reset)
    useEffect(() => {
        setPriceRange({ min: absoluteMinPrice, max: absoluteMaxPrice });
    }, [absoluteMinPrice, absoluteMaxPrice]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableMonths = useMemo(() => {
        return Array.from(new Set(activeTrips.map(t => t.date.substring(0, 7)))).sort();
    }, [activeTrips]);

    // Filtering Logic
    const filteredTrips = activeTrips.filter(trip => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = trip.title.toLowerCase().includes(searchLower) ||
            trip.destination.toLowerCase().includes(searchLower);

        const matchesMonth = selectedMonth === '' || trip.date.includes(selectedMonth);
        const matchesState = selectedState === '' || trip.destination.toUpperCase().includes(selectedState);
        const matchesDuration = selectedDuration === '' || trip.duration === selectedDuration;
        const matchesPrice = trip.price >= priceRange.min && trip.price <= priceRange.max;

        return matchesSearch && matchesMonth && matchesState && matchesDuration && matchesPrice;
    });


    const hasFilters = searchTerm ||
        selectedMonth ||
        selectedState ||
        selectedDuration ||
        priceRange.min !== absoluteMinPrice ||
        priceRange.max !== absoluteMaxPrice;

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedMonth('');
        setSelectedState('');
        setSelectedDuration('');
        setPriceRange({ min: absoluteMinPrice, max: absoluteMaxPrice });
        setActiveDropdown(null);
    };

    // Helper component for Dropdowns inside the panel
    const FilterItem = ({
        label,
        value,
        id,
        icon: Icon,
        options,
        onSelect,
        type = 'list'
    }: {
        label: string;
        value: any;
        id: string;
        icon: any;
        options?: { label: string, value: string }[];
        onSelect: (val: any) => void;
        type?: 'list' | 'range'
    }) => {
        const isOpen = activeDropdown === id;

        let isFiltered = false;
        let displayValue = "";

        if (type === 'list') {
            isFiltered = value !== '';
            displayValue = isFiltered ? (options?.find(o => o.value === value)?.label || "") : "";
        } else if (type === 'range') {
            isFiltered = value.min !== absoluteMinPrice || value.max !== absoluteMaxPrice;
            displayValue = `R$ ${value.min} - R$ ${value.max}`;
        }

        return (
            <div className="flex-1 min-w-[240px] relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
                <button
                    onClick={() => setActiveDropdown(isOpen ? null : id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${isFiltered
                        ? 'bg-brand/5 border-brand text-brand'
                        : 'bg-gray-50 text-gray-600 border-brand/20 hover:border-brand/50'
                        }`}
                >
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Icon size={18} className={isFiltered ? 'text-brand' : 'text-gray-400'} />
                        <span className="text-sm font-bold truncate">
                            {isFiltered ? displayValue : `Selecionar ${label}`}
                        </span>
                    </div>
                    <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border-2 border-brand py-2 z-[110] animate-in fade-in zoom-in duration-200 origin-top">
                        {type === 'list' ? (
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                <button
                                    onClick={() => { onSelect(''); setActiveDropdown(null); }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
                                >
                                    <span className={value === '' ? 'text-brand font-bold' : 'text-gray-600'}>Ver Todos</span>
                                    {value === '' && <Check size={14} className="text-brand" />}
                                </button>
                                {options?.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onSelect(opt.value); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between text-sm transition-colors"
                                    >
                                        <span className={value === opt.value ? 'text-brand font-bold' : 'text-gray-600'}>{opt.label}</span>
                                        {value === opt.value && <Check size={14} className="text-brand" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex justify-between mb-4">
                                    <span className="text-xs font-bold text-brand">R$ {value.min}</span>
                                    <span className="text-xs font-bold text-brand">R$ {value.max}</span>
                                </div>

                                <div className="relative h-6 flex items-center">
                                    {/* Track Background */}
                                    <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />

                                    {/* Selected Range Bar */}
                                    <div
                                        className="absolute h-1.5 bg-brand rounded-full"
                                        style={{
                                            left: `${((value.min - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100}%`,
                                            right: `${100 - ((value.max - absoluteMinPrice) / (absoluteMaxPrice - absoluteMinPrice)) * 100}%`
                                        }}
                                    />

                                    {/* Min Range Input */}
                                    <input
                                        type="range"
                                        min={absoluteMinPrice}
                                        max={absoluteMaxPrice}
                                        value={value.min}
                                        onChange={(e) => {
                                            const newVal = Math.min(Number(e.target.value), value.max - 1);
                                            onSelect({ ...value, min: newVal });
                                        }}
                                        className="absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-action [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-action [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                                    />

                                    {/* Max Range Input */}
                                    <input
                                        type="range"
                                        min={absoluteMinPrice}
                                        max={absoluteMaxPrice}
                                        value={value.max}
                                        onChange={(e) => {
                                            const newVal = Math.max(Number(e.target.value), value.min + 1);
                                            onSelect({ ...value, max: newVal });
                                        }}
                                        className="absolute w-full h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-action [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-action [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                                    />
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                                    <button
                                        onClick={() => setActiveDropdown(null)}
                                        className="text-[10px] font-bold text-brand uppercase hover:underline"
                                    >
                                        Confirmar Preço
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fade-in pb-20 bg-[#F8FAFC] min-h-screen font-sans">
            {/* Header Hero */}
            <section className="bg-brand relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={banner?.image_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000"}
                        alt="Banner Background"
                        className="w-full h-full object-cover animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-brand/60 backdrop-blur-[2px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 relative z-10 text-center -mt-12 md:-mt-20">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 uppercase tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {banner?.title || "Pacotes e Excursões"}
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        {banner?.subtitle || "Explore diversos destinos com o conforto e a segurança que só a Sandra Turismo oferece."}
                    </p>
                </div>
            </section>


            {/* Sticky Search & Toggle Bar */}
            <div className="bg-white border-b border-gray-100 py-5 sticky top-0 z-40 transition-all shadow-sm">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Unified Search */}
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por destino ou nome..."
                                className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-2 border-brand/20 rounded-2xl outline-none focus:border-brand focus:bg-white focus:shadow-lg transition-all text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                            )}
                        </div>

                        {/* Toggle Panel Button */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${isFilterPanelOpen || hasFilters
                                    ? 'bg-brand text-white shadow-lg'
                                    : 'bg-white text-gray-700 border-2 border-brand/30 hover:border-brand hover:text-brand'
                                    }`}
                            >
                                <Filter size={18} />
                                <span>{hasFilters ? 'Filtros Ativos' : 'Filtrar Excursões'}</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {hasFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="p-3.5 bg-red-50 text-action rounded-2xl hover:bg-red-100 transition-colors"
                                    title="Limpar todos os filtros"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Collapsible Filter Panel with BRAND RED BORDER */}
                    {isFilterPanelOpen && (
                        <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="p-6 bg-white rounded-3xl border-2 border-action shadow-2xl relative overflow-visible" ref={dropdownRef}>
                                {/* Decorative Corner Accent */}
                                <div className="absolute -top-3 left-10 w-6 h-6 bg-white border-l-2 border-t-2 border-action rotate-45" />

                                <div className="flex flex-wrap gap-6 items-end">
                                    <FilterItem
                                        id="month"
                                        label="Mês da Viagem"
                                        icon={Calendar}
                                        value={selectedMonth}
                                        onSelect={setSelectedMonth}
                                        options={availableMonths.map(m => ({ label: formatMonthBR(m), value: m }))}
                                    />

                                    <FilterItem
                                        id="state"
                                        label="Estado"
                                        icon={MapPin}
                                        value={selectedState}
                                        onSelect={setSelectedState}
                                        options={states.map(s => ({ label: s, value: s }))}
                                    />

                                    <FilterItem
                                        id="duration"
                                        label="Duração"
                                        icon={Clock}
                                        value={selectedDuration}
                                        onSelect={setSelectedDuration}
                                        options={durations.map(d => ({ label: d, value: d }))}
                                    />

                                    <FilterItem
                                        id="price"
                                        label="Faixa de Preço"
                                        icon={DollarSign}
                                        value={priceRange}
                                        onSelect={setPriceRange}
                                        type="range"
                                    />

                                    <div className="w-full md:w-auto flex justify-end">
                                        <Button
                                            variant="outline"
                                            className="px-8 py-3 rounded-xl border-2 border-brand hover:bg-brand hover:text-white transition-all"
                                            onClick={() => setIsFilterPanelOpen(false)}
                                        >
                                            Aplicar Filtros
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 pt-12">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-brand tracking-tight mb-2">Conheça nossos Pacotes</h2>
                        <p className="text-gray-500 font-medium">
                            Encontramos <span className="text-brand font-bold">{filteredTrips.length}</span> {filteredTrips.length === 1 ? 'experiência' : 'experiências'} para você.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {filteredTrips.map(trip => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onSelect={onSelectTrip}
                        />
                    ))}
                </div>

                {filteredTrips.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative mt-10">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 mx-auto">
                            <Search size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ops! Nenhum destino encontrado</h3>
                        <p className="text-gray-500 max-w-md mx-auto px-6 mb-8 font-medium">
                            Não encontramos excursões com esses critérios. Experimente trocar os filtros ou pesquisar por outro destino.
                        </p>
                        <Button
                            onClick={clearFilters}
                            className="px-10 py-4 shadow-xl hover:shadow-2xl transition-all"
                        >
                            Ver Todas as Opções
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
