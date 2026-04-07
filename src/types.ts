export interface Trip {
  id: number;
  title: string;
  date: string;
  duration: string;
  price: number;
  image: string;
  spots: number;
  description: string;
  included: string[];
  destination: string;
  payment_link?: string;
  is_active?: boolean;
  is_featured?: boolean;
  max_installments?: number;
  return_date?: string;
  images?: string[];
}


export interface Booking {
  id: string;
  tripTitle: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed';
  seats: number;
  ticketUrl: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  is_active: boolean;
}

export interface HomeBanner extends Banner {}

export interface User {
  name: string;
  email: string;
  bookings: Booking[];
}

export enum ViewState {
  HOME = 'HOME',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  MY_TRIPS = 'MY_TRIPS',
  TRIP_DETAILS = 'TRIP_DETAILS',
  ALL_TRIPS = 'ALL_TRIPS',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN = 'ADMIN'
}