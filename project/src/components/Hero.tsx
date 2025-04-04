import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Hero = () => {
  const handleButtonClick = async (buttonName: string) => {
    try {
      console.log('Clique no botão:', buttonName);
      const { error } = await supabase
        .from('analytics')
        .insert({
          tipo: buttonName,
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
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://diariotocantinense.com.br/wp-content/uploads/2025/01/closeup-man-having-back-massage-spa-treatment-wellness-center-696x464.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100%',
          width: '100%'
        }}
      >
        {/* Overlay escuro para melhorar a legibilidade do texto */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-48 pb-32 md:pt-64 md:pb-48">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Descubra o prazer do relaxamento absoluto
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              Massagens e terapias que renovam corpo e mente
            </p>
            <div className="flex flex-col items-center gap-8">
              <div className="space-x-4">
                <Link 
                  to="/servicos" 
                  className="bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-bold py-2 px-4 rounded transition-all duration-300"
                  onClick={() => handleButtonClick('servicos_superior')}
                >
                  Nossos Serviços
                </Link>
                <Link 
                  to="/profissionais"
                  className="bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white font-bold py-2 px-4 rounded transition-all duration-300"
                  onClick={() => handleButtonClick('profissionais_superior')}
                >
                  Profissionais
                </Link>
              </div>
              
              {/* Botão WhatsApp */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4"
              >
                <a
                  href="https://wa.me/5515988340100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 border-2 border-[#D4AF37] text-xl font-medium rounded-full text-white bg-transparent hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-lg group"
                  onClick={() => handleButtonClick('agendar_massagem')}
                >
                  <MessageSquare className="mr-3 h-6 w-6 animate-bounce" />
                  AGENDE SUA MASSAGEM
                  <span className="ml-2 transform transition-transform group-hover:translate-x-1 animate-bounce-right">→</span>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 