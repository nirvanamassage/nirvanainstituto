import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Servico {
  id: number;
  titulo: string;
  imagem: string;
  descricao: string;
}

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>([]);

  const toggleDescription = async (id: number) => {
    // Registrar o clique no analytics
    try {
      await supabase
        .from('analytics')
        .insert([
          {
            tipo: 'servico_view',
            servico_id: id,
            timestamp: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }

    // Expandir/recolher a descrição
    setExpandedDescriptions(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const servicosProcessados = data?.map(servico => {
        let imagemUrl = '';
        
        if (servico.imagem) {
          if (servico.imagem.startsWith('http')) {
            imagemUrl = servico.imagem;
          } else {
            const { data } = supabase.storage
              .from('servicos')
              .getPublicUrl(servico.imagem);
            imagemUrl = data?.publicUrl || '';
          }
        }

        return {
          ...servico,
          imagem: imagemUrl
        };
      }) || [];

      console.log('Serviços carregados:', servicosProcessados);
      setServicos(servicosProcessados);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop')`,
              backgroundPosition: 'center 40%',
              backgroundSize: 'cover'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center w-full"
          >
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Nossos Serviços
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Descubra nossa seleção exclusiva de massagens terapêuticas para relaxamento e bem-estar.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : servicos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum serviço encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {servicos.map((servico) => (
              <motion.div
                key={servico.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 bg-gray-100">
                  <img
                    src={servico.imagem}
                    alt={servico.titulo}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-service.jpg';
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {servico.titulo}
                  </h3>
                  <div className="text-gray-600">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {servico.descricao.length > 190 && !expandedDescriptions.includes(servico.id)
                        ? `${servico.descricao.substring(0, 190)}...`
                        : servico.descricao}
                    </p>
                    {servico.descricao.length > 190 && (
                      <button
                        onClick={() => toggleDescription(servico.id)}
                        className="text-[#D4AF37] hover:text-[#B4941F] mt-2 flex items-center gap-1 text-sm"
                      >
                        {expandedDescriptions.includes(servico.id) ? (
                          <>
                            Ver menos
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            Ver mais
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Informações Adicionais */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conforto e Comodidade
          </h2>
          <p className="text-gray-600 text-lg">
            Todas as nossas salas são equipadas com banheiro privativo, chuveiro e toalhas limpas,
            garantindo total privacidade e conforto para sua experiência.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 