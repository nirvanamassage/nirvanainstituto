import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  imagens: string[];
}

export default function Profissionais() {
  const [searchParams] = useSearchParams();
  const profissionalNome = searchParams.get('nome');
  const profissionalRef = useRef<HTMLDivElement>(null);
  
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlides, setCurrentSlides] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchProfissionais();
  }, []);

  // Efeito para rolar até o profissional quando a página carregar
  useEffect(() => {
    if (profissionalNome && !loading && profissionalRef.current) {
      profissionalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [profissionalNome, loading]);

  async function fetchProfissionais() {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProfissionais(data || []);
      
      // Inicializa o estado dos slides para cada profissional
      const initialSlides = (data || []).reduce((acc: { [key: number]: number }, prof: Profissional) => ({
        ...acc,
        [prof.id]: 0
      }), {});
      setCurrentSlides(initialSlides);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoading(false);
    }
  }

  const nextSlide = (profissionalId: number, totalImages: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [profissionalId]: (prev[profissionalId] + 1) % totalImages
    }));
  };

  const prevSlide = (profissionalId: number, totalImages: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [profissionalId]: (prev[profissionalId] - 1 + totalImages) % totalImages
    }));
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop')`,
              backgroundPosition: 'center',
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
              Nossa Equipe
            </h1>
            <p className="mt-3 text-base text-gray-100 sm:text-lg md:text-xl inline-block">
              Conheça nossas profissionais altamente qualificadas e dedicadas ao seu bem-estar.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="relative bg-gray-50">
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : profissionais.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Nenhum profissional encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {profissionais.map((profissional) => (
                <motion.div
                  key={profissional.id}
                  ref={profissional.nome === profissionalNome ? profissionalRef : null}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    scale: profissional.nome === profissionalNome ? 1.02 : 1
                  }}
                  transition={{ duration: 0.3 }}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                    profissional.nome === profissionalNome 
                      ? 'ring-4 ring-[#D4AF37] shadow-2xl' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  <div className="relative h-[500px] bg-gray-100">
                    {/* Carrossel de Imagens */}
                    <div className="relative h-full">
                      {profissional.imagens.map((imagem, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-500 ${
                            index === currentSlides[profissional.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img
                            src={imagem.startsWith('http') ? imagem : `${supabase.storage.from('profissionais').getPublicUrl(imagem).data.publicUrl}`}
                            alt={`${profissional.nome} - Foto ${index + 1}`}
                            className="w-full h-full object-cover bg-gray-100"
                            loading="lazy"
                          />
                        </div>
                      ))}
                      
                      {/* Botões de navegação */}
                      {profissional.imagens.length > 1 && (
                        <>
                          <button
                            onClick={() => prevSlide(profissional.id, profissional.imagens.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-colors"
                          >
                            <ChevronLeft size={28} />
                          </button>
                          <button
                            onClick={() => nextSlide(profissional.id, profissional.imagens.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-colors"
                          >
                            <ChevronRight size={28} />
                          </button>

                          {/* Indicadores */}
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                            {profissional.imagens.map((_, index) => (
                              <div
                                key={index}
                                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                                  index === currentSlides[profissional.id]
                                    ? 'bg-white'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {profissional.nome}
                    </h3>
                    <p className="text-[#D4AF37] font-semibold mb-4">
                      {profissional.especialidade}
                    </p>
                    <p className="text-gray-600 text-lg mb-6 whitespace-pre-wrap break-words">
                      {profissional.descricao}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          // Registrar o clique no analytics
                          await supabase
                            .from('analytics')
                            .insert({
                              tipo: 'profissional_whatsapp',
                              profissional_id: profissional.id,
                              timestamp: new Date().toISOString()
                            });
                          
                          // Abrir WhatsApp
                          const mensagem = `GOSTARIA DE MARCAR UMA MASSAGEM COM A PROFISSIONAL ${profissional.nome.toUpperCase()}`;
                          window.open(`https://wa.me/5515992432112?text=${encodeURIComponent(mensagem)}`, '_blank');
                        } catch (error) {
                          console.error('Erro ao registrar clique:', error);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md transition-colors"
                    >
                      <MessageCircle size={20} />
                      Agendar por WhatsApp
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 