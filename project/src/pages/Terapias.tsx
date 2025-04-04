import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const terapias = [
  {
    id: 1,
    nome: 'Massagem Relaxante',
    descricao: 'Uma experiência única de relaxamento profundo que combina movimentos suaves e precisos para aliviar tensões e promover bem-estar total.',
    imagem: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '60 minutos',
  },
  {
    id: 2,
    nome: 'Massagem Relaxante Plus',
    descricao: 'Uma versão aprimorada da massagem relaxante tradicional, com técnicas exclusivas e maior atenção aos pontos de tensão.',
    imagem: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '90 minutos',
  },
  {
    id: 3,
    nome: 'Massagem Tântrica',
    descricao: 'Uma jornada sensorial que combina técnicas milenares para despertar a energia vital e promover um profundo relaxamento.',
    imagem: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '90 minutos',
  },
  {
    id: 4,
    nome: 'Tantra Intensive',
    descricao: 'Uma experiência transformadora que integra técnicas avançadas de massagem tântrica para um despertar energético profundo.',
    imagem: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '120 minutos',
  },
  {
    id: 5,
    nome: 'Massagem Tailandesa',
    descricao: 'Uma terapia milenar que combina alongamentos suaves e pressão em pontos específicos para restaurar o equilíbrio energético.',
    imagem: 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '90 minutos',
  },
  {
    id: 6,
    nome: 'Nuru',
    descricao: 'Uma técnica exclusiva de massagem que proporciona uma experiência única de relaxamento e conexão energética.',
    imagem: 'https://images.unsplash.com/photo-1620733723572-11c53f73a416?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    duracao: '90 minutos',
  },
];

export default function Terapias() {
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
            Nossas Terapias
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra nossa seleção exclusiva de terapias, cuidadosamente desenvolvidas
            para proporcionar momentos únicos de bem-estar e relaxamento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {terapias.map((terapia, index) => (
            <motion.div
              key={terapia.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{ backgroundImage: `url(${terapia.imagem})` }}
              />
              <div className="p-6">
                <h3 className="text-xl font-serif text-gray-900 mb-2">
                  {terapia.nome}
                </h3>
                <p className="text-gray-600 mb-4">{terapia.descricao}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Duração: {terapia.duracao}
                  </span>
                  <a
                    href="https://wa.me/message/MUVHUAOCXTITF1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    Agendar
                    <ArrowRight size={16} className="ml-1" />
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