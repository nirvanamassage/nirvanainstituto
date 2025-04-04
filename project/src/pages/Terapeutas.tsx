import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const terapeutas = [
  {
    id: 1,
    nome: 'Sofia',
    especialidades: ['Massagem Relaxante', 'Massagem Tântrica'],
    descricao: 'Especialista em técnicas de relaxamento profundo, com mais de 5 anos de experiência.',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    fotos_adicionais: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    id: 2,
    nome: 'Luna',
    especialidades: ['Tantra Intensive', 'Nuru'],
    descricao: 'Terapeuta certificada em técnicas orientais avançadas e massagem tântrica.',
    foto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    fotos_adicionais: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    ],
  },
];

export default function Terapeutas() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-serif text-gray-900 mb-4">
            Nossas Terapeutas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça nossa equipe de terapeutas especializadas, dedicadas a proporcionar
            experiências únicas de bem-estar e relaxamento.
          </p>
        </motion.div>

        <div className="space-y-16">
          {terapeutas.map((terapeuta, index) => (
            <motion.div
              key={terapeuta.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                <div className="space-y-4">
                  <div className="aspect-w-3 aspect-h-4">
                    <img
                      src={terapeuta.foto}
                      alt={terapeuta.nome}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {terapeuta.fotos_adicionais.map((foto, i) => (
                      <img
                        key={i}
                        src={foto}
                        alt={`${terapeuta.nome} ${i + 1}`}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-3xl font-serif text-gray-900 mb-4">
                      {terapeuta.nome}
                    </h2>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Especialidades
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {terapeuta.especialidades.map((esp) => (
                          <span
                            key={esp}
                            className="px-3 py-1 bg-secondary text-gray-700 rounded-full text-sm"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-8">{terapeuta.descricao}</p>
                  </div>

                  <a
                    href={`https://wa.me/message/MUVHUAOCXTITF1?text=Olá, gostaria de agendar uma sessão com a ${terapeuta.nome}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors w-full sm:w-auto"
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Agendar com {terapeuta.nome}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}