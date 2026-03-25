import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import HomeView from './components/HomeView';
import { AllTripsView } from './components/AllTripsView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import FlightsView from './components/FlightsView';
import { TripDetails } from './components/TripDetails';
import UnifiedLoginPage from './components/UnifiedLoginPage';
import AdminLoginForm from './components/AdminLoginForm';
import { AdminDashboard } from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Trip, ViewState, Banner, HomeBanner } from './types';
import { supabase } from './lib/supabase';
import logo from './assets/logo.png';
import { LogOut } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [homeBanner, setHomeBanner] = useState<HomeBanner | null>(null);
  const [aboutBanner, setAboutBanner] = useState<HomeBanner | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [session, setSession] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoggedIn(!!session);
    });

    const fetchPublicTrips = async () => {
      setLoadingTrips(true);
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public trips:', error);
      } else {
        setTrips(data || []);
      }
      setLoadingTrips(false);
    };

    const fetchHomeBanner = async () => {
      const { data, error } = await supabase
        .from('home_banner')
        .select('*')
        .eq('is_active', true)
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
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching about banner:', error);
      } else if (data && data.length > 0) {
        setAboutBanner(data[0]);
      }
    };

    fetchPublicTrips();
    fetchHomeBanner();
    fetchAboutBanner();

    return () => subscription.unsubscribe();
  }, []);

  // Sync currentView with location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentView(ViewState.HOME);
    else if (path === '/sobre') setCurrentView(ViewState.ABOUT);
    else if (path === '/contato') setCurrentView(ViewState.CONTACT);
    else if (path === '/pacotes') setCurrentView(ViewState.ALL_TRIPS);
    else if (path === '/login') setCurrentView(ViewState.LOGIN);
    else if (path === '/cadastro') setCurrentView(ViewState.REGISTER);
    else if (path === '/painel') setCurrentView(ViewState.MY_TRIPS);
    else if (path === '/aereo') setCurrentView(ViewState.FLIGHTS);
  }, [location]);

  const handleLogin = (adminUser = false) => {
    if (adminUser) {
      setIsAdmin(true);
      setCurrentView(ViewState.ADMIN);
    } else {
      setIsLoggedIn(true);
      setIsAdmin(false);
      navigate('/painel');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };

  const navigateToAdminLogin = () => {
    setCurrentView(ViewState.ADMIN_LOGIN);
  };

  const onNavigateHandler = (view: ViewState) => {
    setCurrentView(view);
    const paths: Record<string, string> = {
      [ViewState.HOME]: '/',
      [ViewState.ABOUT]: '/sobre',
      [ViewState.CONTACT]: '/contato',
      [ViewState.ALL_TRIPS]: '/pacotes',
      [ViewState.LOGIN]: '/login',
      [ViewState.REGISTER]: '/cadastro',
      [ViewState.MY_TRIPS]: '/painel',
      [ViewState.FLIGHTS]: '/aereo'
    };
    if (paths[view]) navigate(paths[view]);
  };

  // If Admin View or Admin Login, return full screen layout
  if ((currentView === ViewState.ADMIN && isAdmin) || currentView === ViewState.ADMIN_LOGIN) {
    return (
      <div className="min-h-screen bg-surface font-sans text-gray-800 antialiased selection:bg-action selection:text-white">
        {currentView === ViewState.ADMIN_LOGIN ? (
          <AdminLoginForm
            onLogin={() => handleLogin(true)}
            onCancel={() => {
              setCurrentView(ViewState.HOME);
              navigate('/');
            }}
            logo={logo}
          />
        ) : (
          <AdminDashboard onLogout={handleLogout} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-gray-800 antialiased selection:bg-action selection:text-white">
      <Navigation currentView={currentView} onNavigate={onNavigateHandler} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <HomeView
              trips={trips}
              loading={loadingTrips}
              banner={homeBanner}
              onSelectTrip={(trip) => {
                setSelectedTrip(trip);
                navigate(`/detalhes/${trip.id}`);
                window.scrollTo(0, 0);
              }}
              onSeeAll={() => navigate('/pacotes')}
            />
          } />
          <Route path="/sobre" element={<AboutView banner={aboutBanner} />} />
          <Route path="/contato" element={<ContactView />} />
          <Route path="/pacotes" element={
            <AllTripsView
              trips={trips}
              onBack={() => navigate('/')}
              onSelectTrip={(trip) => {
                setSelectedTrip(trip);
                navigate(`/detalhes/${trip.id}`);
                window.scrollTo(0, 0);
              }}
            />
          } />
          <Route path="/detalhes/:id" element={
            <TripDetails
              trip={selectedTrip || trips.find(t => t.id.toString() === location.pathname.split('/').pop()) || null}
              onBack={() => navigate('/')}
            />
          } />
          <Route path="/login" element={
            <UnifiedLoginPage 
              onLogin={() => handleLogin(false)} 
              defaultSignUp={false}
            />
          } />
          <Route path="/cadastro" element={
            <UnifiedLoginPage 
              onLogin={() => handleLogin(false)} 
              defaultSignUp={true}
            />
          } />
          <Route path="/painel" element={
            isLoggedIn ? <ClientDashboard onLogout={handleLogout} /> : <Navigate to="/login" />
          } />
          <Route path="/aereo" element={<FlightsView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer onAdminClick={navigateToAdminLogin} />
      <FloatingWhatsApp />
    </div>
  );
}

export default App;