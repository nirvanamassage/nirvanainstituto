import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const handleWhatsAppClick = async () => {
    try {
      console.log('Clique no WhatsApp do rodapé');
      const { error } = await supabase
        .from('analytics')
        .insert({
          tipo: 'whatsapp_footer',
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      } else {
        console.log('Clique registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  const handleEnderecoClick = async () => {
    try {
      console.log('Clique no endereço');
      const { error } = await supabase
        .from('analytics')
        .insert({
          tipo: 'endereco',
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      } else {
        console.log('Clique registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  return (
    <footer className="bg-[#000080] border-t border-[#D4AF37]">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Sobre */}
          <div className="col-span-1 -mt-4">
            <Logo className="mb-0" />
            <p className="text-white -mt-4">
              Seu espaço de bem-estar e relaxamento, com profissionais qualificados e ambiente acolhedor.
            </p>
          </div>

          {/* Links Rápidos */}
          <div className="col-span-1 md:ml-16">
            <h3 className="text-lg font-semibold mb-4 text-white">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-white hover:text-[#D4AF37] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-white hover:text-[#D4AF37] transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-white hover:text-[#D4AF37] transition-colors">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="text-white hover:text-[#D4AF37] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="col-span-1 md:ml-8">
            <h3 className="text-lg font-semibold mb-4 text-white">Contato</h3>
            <div className="space-y-2">
              <a 
                href="https://wa.me/5515988340100" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-white hover:text-[#D4AF37] transition-colors"
                onClick={handleWhatsAppClick}
              >
                <Phone className="w-6 h-6 mr-2" />
                15 98834-0100
              </a>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Rua Brigadeiro Faria Lima, 231 Eltonville - Sorocaba/SP')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-white hover:text-[#D4AF37] transition-colors"
                onClick={handleEnderecoClick}
              >
                <MapPin className="w-12 h-12 mr-2" />
                Rua Brigadeiro Faria Lima, 231 Eltonville - Sorocaba/SP
              </a>
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white text-center">Siga-nos</h3>
            <div className="flex justify-center">
              <a
                href="https://www.instagram.com/nirvana.sorocaba?igsh=MXJnMzhvZzZpbmxpdA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#D4AF37]"
              >
                <Instagram className="w-10 h-10" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4AF37] mt-12 pt-8">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-center text-white text-sm">
              © {new Date().getFullYear()} Nirvana Spa Institute. Todos os direitos reservados.
            </p>
            <Link 
              to="/admin/login" 
              className="text-gray-300 hover:text-[#D4AF37] text-xs transition-colors"
            >
              Área Restrita
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;