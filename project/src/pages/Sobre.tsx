import { motion } from 'framer-motion';

const Sobre = () => {
  return (
    <div className="relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 h-[40vh]"
        style={{
          backgroundImage: 'url(https://diariotocantinense.com.br/wp-content/uploads/2025/01/closeup-man-having-back-massage-spa-treatment-wellness-center-696x464.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Header Content */}
      <div className="relative z-10 h-[40vh] flex items-center justify-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white text-center"
        >
          Quem Somos
        </motion.h1>
      </div>

      {/* Main Content */}
      <div className="relative z-10 bg-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="prose prose-lg mx-auto space-y-8"
            >
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                O Nirvana Spa é um refúgio exclusivo para homens que desejam relaxamento, prazer e bem-estar em um ambiente de luxo, discrição e total privacidade. Criamos um espaço sofisticado, onde cada detalhe foi pensado para proporcionar uma experiência inesquecível, aliando conforto, anonimato e um atendimento impecável.
              </p>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Nossas terapeutas são belíssimas, altamente qualificadas e especializadas em massagens terapêuticas e sensoriais, incluindo tantra, relaxante, desportiva e outras técnicas que elevam corpo e mente a um novo nível de conexão e prazer.
              </p>

              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Aqui, você encontra um ambiente seguro, elegante e acolhedor, onde suas preferências são respeitadas e sua privacidade é nossa prioridade. No Nirvana Spa, o tempo desacelera, as preocupações desaparecem e você se entrega a uma jornada única de sensações.
              </p>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-16 flex justify-center"
            >
              <div className="h-0.5 w-24 bg-[#D4AF37]"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre; 