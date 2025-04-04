import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import WhatsAppButton from './WhatsAppButton';

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {isHomePage && <Hero />}
      <main className="flex-grow">
        <Outlet />
      </main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
};

export default Layout;