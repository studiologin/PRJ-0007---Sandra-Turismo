import { Trip, FlightResult } from './types';

export const TRIPS: Trip[] = [
  {
    id: 1,
    title: "Caldas Novas Relax",
    date: "15 de Março, 2026",
    duration: "4 dias",
    price: 1250,
    image: "https://picsum.photos/id/1015/800/600",
    spots: 5,
    destination: "Caldas Novas, GO",
    description: "Desfrute das águas termais com todo o conforto que você merece. Hotel 4 estrelas com pensão completa.",
    included: ["Transporte Leito", "Hospedagem", "Café da Manhã", "Seguro Viagem"]
  },
  {
    id: 2,
    title: "Aparecida da Fé",
    date: "22 de Abril, 2026",
    duration: "3 dias",
    price: 890,
    image: "https://picsum.photos/id/1047/800/600",
    spots: 12,
    destination: "Aparecida, SP",
    description: "Uma jornada espiritual e emocionante. Visita ao Santuário Nacional e missa solene.",
    included: ["Ônibus Executivo", "Guia Credenciado", "Lanche de Bordo"]
  },
  {
    id: 3,
    title: "Serra Gaúcha Especial",
    date: "10 de Junho, 2026",
    duration: "6 dias",
    price: 2400,
    image: "https://picsum.photos/id/1036/800/600",
    spots: 2,
    destination: "Gramado e Canela, RS",
    description: "O charme europeu no sul do Brasil. Inclui visita às fábricas de chocolate e vinícolas.",
    included: ["Aéreo + Transfer", "Hotel Centro", "City Tour"]
  }
];

export const MOCK_FLIGHTS: FlightResult[] = [
  {
    id: 'f1',
    airline: 'Azul',
    departure: '08:00',
    arrival: '10:30',
    duration: '2h 30m',
    stops: 0,
    price: 850
  },
  {
    id: 'f2',
    airline: 'Latam',
    departure: '14:00',
    arrival: '17:45',
    duration: '3h 45m',
    stops: 1,
    price: 720
  },
  {
    id: 'f3',
    airline: 'Gol',
    departure: '09:15',
    arrival: '11:45',
    duration: '2h 30m',
    stops: 0,
    price: 910
  }
];