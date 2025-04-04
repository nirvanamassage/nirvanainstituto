import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-0">
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div className="pl-0">
            <Logo />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 pr-4 mt-8">
            <Link to="/" className="text-white hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <Link to="/servicos" className="text-white hover:text-[#D4AF37] transition-colors">
              Serviços
            </Link>
            <Link to="/profissionais" className="text-white hover:text-[#D4AF37] transition-colors">
              Profissionais
            </Link>
            <Link to="/blog" className="text-white hover:text-[#D4AF37] transition-colors">
              Blog
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white mt-8 pr-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 bg-[#000080]">
            <Link to="/" className="block py-2 px-4 text-white hover:text-[#D4AF37]">
              Home
            </Link>
            <Link to="/servicos" className="block py-2 px-4 text-white hover:text-[#D4AF37]">
              Serviços
            </Link>
            <Link to="/profissionais" className="block py-2 px-4 text-white hover:text-[#D4AF37]">
              Profissionais
            </Link>
            <Link to="/blog" className="block py-2 px-4 text-white hover:text-[#D4AF37]">
              Blog
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;