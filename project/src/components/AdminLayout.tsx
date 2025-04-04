import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import { Users, Image, Settings, LogOut, FileText, Sparkles, LayoutDashboard, BarChart, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const { pathname } = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleMenu = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    window.dispatchEvent(new CustomEvent('menuStateChange', { detail: { open: newMenuState } }));
  };

  if (loading) {
    return (
      <div className="min-h-screen !bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? '!bg-gray-900' : '!bg-white'}`}>
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-[#D4AF37]/20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center pt-4">
                <img
                  src="/nirvana-logo.png"
                  alt="Nirvana Spa"
                  className="h-24 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`${
                  darkMode 
                    ? 'text-white hover:text-[#D4AF37]' 
                    : 'text-[#B4941F] hover:text-[#D4AF37]'
                } px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
              >
                <span>Modo Escuro</span>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={logout}
                className={`${
                  darkMode 
                    ? 'text-white hover:text-[#D4AF37]' 
                    : 'text-[#B4941F] hover:text-[#D4AF37]'
                } px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2`}
              >
                <span>Sair</span>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className={`py-10 ${darkMode ? '!bg-gray-900' : '!bg-white'}`}>
        <div className="max-w-7xl mx-0">
          <div className="flex gap-0 pl-0">
            {/* Botão do Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${
                darkMode 
                  ? 'text-white hover:text-[#D4AF37]' 
                  : 'text-[#B4941F] hover:text-[#D4AF37]'
              } rounded-md h-fit`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Sidebar */}
            <div className={`${menuOpen ? 'w-48' : 'w-0'} flex-shrink-0 transition-all duration-300`}>
              <nav className={`space-y-1 overflow-hidden ${menuOpen ? 'opacity-100' : 'opacity-0'}`}>
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === '/admin' 
                      ? 'bg-[#D4AF37] text-white' 
                      : darkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {/* Sub-botões do Dashboard */}
                <div className="pl-6 space-y-1">
                  <Link
                    to="/admin/analytics"
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md ${
                      pathname === '/admin/analytics' 
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                        : darkMode
                          ? 'text-gray-400 hover:bg-gray-800'
                          : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current" />
                    Google Analytics
                  </Link>
                  <Link
                    to="/admin/site"
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md ${
                      pathname === '/admin/site' 
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
                        : darkMode
                          ? 'text-gray-400 hover:bg-gray-800'
                          : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current" />
                    Site
                  </Link>
                </div>
                <Link
                  to="/admin/profissionais"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === '/admin/profissionais' 
                      ? 'bg-[#D4AF37] text-white' 
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Profissionais
                </Link>
                <Link
                  to="/admin/servicos"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === '/admin/servicos' 
                      ? 'bg-[#D4AF37] text-white' 
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Serviços
                </Link>
                <Link
                  to="/admin/blog"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === '/admin/blog' 
                      ? 'bg-[#D4AF37] text-white' 
                      : darkMode
                        ? 'text-gray-300 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Blog
                </Link>
              </nav>
            </div>

            {/* Main content - ajustando padding */}
            <div className={`flex-1 ${darkMode ? '!bg-gray-900' : '!bg-white'}`}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 