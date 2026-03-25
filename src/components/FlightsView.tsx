import React, { useState } from 'react';
import { Plane, AlertCircle, MapPin as MapPinIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from './Button';
import { FlightResult } from '../types';
import { MOCK_FLIGHTS } from '../constants';

const FlightsView: React.FC = () => {
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FlightResult[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setResults(MOCK_FLIGHTS);
      setSearching(false);
    }, 1500);
  };

  const chartData = [
    { name: 'Seg', price: 900 },
    { name: 'Ter', price: 720 },
    { name: 'Qua', price: 750 },
    { name: 'Qui', price: 850 },
    { name: 'Sex', price: 1100 },
    { name: 'Sáb', price: 1200 },
    { name: 'Dom', price: 1050 },
  ];

  return (
    <main className="pb-12 pt-6 px-4 container mx-auto max-w-4xl flex-1 animate-fade-in">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
        <h2 className="font-heading text-2xl text-brand font-bold mb-6 flex items-center gap-2">
          <Plane className="text-action" />
          Buscar Passagens Aéreas
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Origem</label>
              <div className="relative">
                <input type="text" placeholder="Sua cidade" className="w-full p-4 bg-surface rounded-lg border-2 border-transparent focus:border-brand outline-none font-medium text-lg" />
                <MapPinIcon className="absolute right-4 top-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Destino</label>
              <div className="relative">
                <input type="text" placeholder="Para onde vamos?" className="w-full p-4 bg-surface rounded-lg border-2 border-transparent focus:border-brand outline-none font-medium text-lg" />
                <MapPinIcon className="absolute right-4 top-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Data de Ida</label>
              <input type="date" className="w-full p-4 bg-surface rounded-lg border-2 border-transparent focus:border-brand outline-none font-medium text-lg text-gray-600" />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm uppercase tracking-wide">Passageiros</label>
              <select className="w-full p-4 bg-surface rounded-lg border-2 border-transparent focus:border-brand outline-none font-medium text-lg text-gray-600">
                <option>1 Adulto</option>
                <option>2 Adultos</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 my-2 bg-blue-50 p-3 rounded-lg text-brand text-sm">
            <AlertCircle size={18} />
            <span>Filtro automático: Evitamos voos com escalas longas ou noturnas.</span>
          </div>

          <Button type="submit" fullWidth disabled={searching}>
            {searching ? 'Pesquisando Melhores Preços...' : 'Buscar Voos'}
          </Button>
        </form>
      </div>

      {results.length > 0 && (
        <div className="animate-fade-in">
          {/* Price History Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="font-heading text-lg text-brand font-bold mb-4">Tendência de Preços (Próximos 7 dias)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#F7F9FC' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.price < 800 ? '#10B981' : '#0F3460'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Barras verdes indicam os melhores preços da semana.</p>
          </div>

          <h3 className="font-heading text-xl text-brand font-bold mb-4">Melhores Opções Encontradas</h3>
          <div className="space-y-4">
            {results.map(flight => (
              <div key={flight.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-l-action flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                    {flight.airline[0]}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-brand">{flight.departure} - {flight.arrival}</p>
                    <p className="text-sm text-gray-500">{flight.airline} • {flight.duration} • {flight.stops === 0 ? 'Voo Direto' : `${flight.stops} parada`}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Preço por adulto</p>
                    <p className="text-2xl font-bold text-brand">R$ {flight.price}</p>
                  </div>
                  <Button className="py-2 px-6 text-base" onClick={() => alert(`Iniciando compra da passagem: ${flight.departure} -> ${flight.arrival}`)}>Comprar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default FlightsView;
