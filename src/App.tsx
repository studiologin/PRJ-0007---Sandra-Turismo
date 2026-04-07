import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import HomeView from './components/HomeView';
import { AllTripsView } from './components/AllTripsView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
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
  const [authLoading, setAuthLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [homeBanner, setHomeBanner] = useState<HomeBanner | null>(null);
  const [aboutBanner, setAboutBanner] = useState<HomeBanner | null>(null);
  const [packagesBanner, setPackagesBanner] = useState<HomeBanner | null>(null);
  const [contactBanner, setContactBanner] = useState<HomeBanner | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [session, setSession] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = React.useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const checkUserRole = async (uid: string) => {
      console.log("[DEBUG] App: Verificando papel (admin/client) para:", uid);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', uid)
          .single();
        
        if (error) {
           console.warn("[DEBUG] App: Perfil não encontrado ou erro de RLS:", error);
           return false;
        }

        if (data?.role === 'admin') {
          console.log("[DEBUG] App: Admin detectado.");
          setIsAdmin(true);
          return true;
        } else {
          console.log("[DEBUG] App: Cliente detectado.");
          setIsAdmin(false);
          return false;
        }
      } catch (err) {
        console.error("[DEBUG] App: Erro fatal ao verificar papel:", err);
        return false;
      }
    };

    // Single Auth Listener for all lifecycle events (Initial Session, Sign In, Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      console.log("[DEBUG] App: Estado de Autenticação Alterado:", _event);
      
      setSession(currentSession);
      setIsLoggedIn(!!currentSession);

      try {
        if (currentSession?.user) {
          // Identificação Instantânea via Metadados (JWT)
          const userRole = currentSession.user.user_metadata?.role;
          let adminStatus = userRole === 'admin';
          
          if (userRole) {
            console.log("[DEBUG] App: Papel identificado via metadados:", userRole);
            setIsAdmin(adminStatus);
          } else {
            console.log("[DEBUG] App: Metadados ausentes, buscando no banco...");
            adminStatus = await checkUserRole(currentSession.user.id);
          }
          
          const path = locationRef.current.pathname;
          console.log("[DEBUG] App: Path atual no listener:", path);
          
          const isLoginPage = path === '/login' || path === '/admin/login' || path === '/cadastro';
          
          if (isLoginPage) {
            console.log("[DEBUG] App: Redirecionando com base no papel detectado.");
            if (adminStatus) {
              navigate('/admin');
            } else {
              navigate('/painel');
            }
          } else if (adminStatus && path === '/painel') {
             navigate('/admin');
          }

          // Se identificamos via metadados, finalizamos o carregamento mais cedo
          if (userRole) setAuthLoading(false);

          // Ainda verificamos o banco em segundo plano para garantir o estado mais recente
          if (userRole) {
            checkUserRole(currentSession.user.id).then(status => {
               if (status !== adminStatus) {
                  console.log("[DEBUG] App: Papel atualizado via banco (sincronizando...)");
                  // Se o papel mudou no banco mas não no JWT (raro), redirecionamos
                  if (isLoginPage) navigate(status ? '/admin' : '/painel');
               }
            });
          }
        } else {
          setIsAdmin(false);
          const path = locationRef.current.pathname;
          if (path.startsWith('/admin') || path === '/painel') {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("[DEBUG] App: Erro no listener:", error);
      } finally {
        // Garantimos que o loading encerre SEMPRE
        console.log("[DEBUG] App: Finalizando authLoading (false)");
        setAuthLoading(false);
      }
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
         console.log(`[DEBUG] App: ${data?.length || 0} pacotes carregados.`);
        setTrips(data || []);
      }
      setLoadingTrips(false);
    };

    const fetchAllBanners = async () => {
      try {
        const [home, about, packs, contact] = await Promise.all([
          supabase.from('home_banner').select('*').eq('is_active', true).limit(1),
          supabase.from('about_banner').select('*').eq('is_active', true).limit(1),
          supabase.from('packages_banner').select('*').eq('is_active', true).limit(1),
          supabase.from('contact_banner').select('*').eq('is_active', true).limit(1),
        ]);

        if (home.data?.[0]) setHomeBanner(home.data[0]);
        if (about.data?.[0]) setAboutBanner(about.data[0]);
        if (packs.data?.[0]) setPackagesBanner(packs.data[0]);
        if (contact.data?.[0]) setContactBanner(contact.data[0]);
      } catch (err) {
        console.error("Erro ao carregar banners:", err);
      }
    };

    fetchPublicTrips();
    fetchAllBanners();

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
  }, [location]);

  const handleLogin = async () => {
    console.log("[DEBUG] Login confirmado. Verificando sessão para redirecionamento imediato...");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Papel via metadados (rápido)
        const userMetadataRole = session.user.user_metadata?.role;
        let isUserAdmin = userMetadataRole === 'admin';
        
        // Se metadados não tem o papel, busca no banco (seguro)
        if (!userMetadataRole) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          isUserAdmin = profile?.role === 'admin';
        }
        
        console.log("[DEBUG] Redirecionamento Automático: ", isUserAdmin ? '/admin' : '/painel');
        navigate(isUserAdmin ? '/admin' : '/painel');
      } else {
         console.warn("[DEBUG] handleLogin chamado sem uma sessão ativa.");
      }
    } catch (err) {
      console.error("[DEBUG] Falha no redirecionamento automático:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/');
  };

  const navigateToAdminLogin = () => {
    navigate('/admin/login');
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
      [ViewState.MY_TRIPS]: '/login'
    };
    if (paths[view]) navigate(paths[view]);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-gray-800 antialiased selection:bg-action selection:text-white">
      {!isAdminRoute && (
        <Navigation 
          currentView={currentView} 
          onNavigate={onNavigateHandler} 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin}
          onLogout={handleLogout} 
        />
      )}

      <main className={isAdminRoute ? "w-full h-screen" : "flex-grow"}>
        <Routes>
          <Route path="/admin/login" element={
            <div className="min-h-screen bg-surface font-sans text-gray-800 antialiased selection:bg-action selection:text-white">
              <AdminLoginForm
                onLogin={handleLogin}
                onCancel={() => navigate('/')}
                logo={logo}
              />
            </div>
          } />
          <Route path="/admin" element={
            authLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="w-12 h-12 border-4 border-action border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isAdmin ? (
              <div className="min-h-screen bg-surface font-sans text-gray-800 antialiased selection:bg-action selection:text-white">
                <AdminDashboard onLogout={handleLogout} />
              </div>
            ) : (
              <Navigate to="/admin/login" />
            )
          } />
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
          <Route path="/contato" element={<ContactView banner={contactBanner} />} />
          <Route path="/pacotes" element={
            <AllTripsView
              trips={trips}
              banner={packagesBanner}
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
              onBack={() => navigate('/pacotes')}
              isLoggedIn={isLoggedIn}
            />
          } />
          <Route path="/login" element={
            <UnifiedLoginPage 
              onLogin={handleLogin} 
              defaultSignUp={false}
            />
          } />
          <Route path="/cadastro" element={
            <UnifiedLoginPage 
              onLogin={handleLogin} 
              defaultSignUp={true}
            />
          } />
          <Route path="/painel" element={
            authLoading ? (
              <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="w-12 h-12 border-4 border-action border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isLoggedIn ? (
              <ClientDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer onAdminClick={navigateToAdminLogin} />}
      {!isAdminRoute && <FloatingWhatsApp />}
    </div>
  );
}

export default App;