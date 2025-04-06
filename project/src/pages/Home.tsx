import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MessageSquare, MapPin } from 'lucide-react';
import Blog from './Blog';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Menu } from '@headlessui/react';

interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  imagens: string[];
}

export default function Home() {
  const navigate = useNavigate();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Criar array com itens duplicados para o loop infinito
  const allSlides = [...profissionais, ...profissionais.slice(0, isMobile ? 1 : 3)];

  const fetchProfissionais = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfissionais();

    // Configurar subscription para atualizações em tempo real
    const channel = supabase
      .channel('profissionais_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profissionais' }, 
        () => {
          fetchProfissionais();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProfissionais]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(prev => {
      const next = prev + 1;
      // Se chegou no final dos slides originais, resetar para o início após a transição
      if (next >= profissionais.length) {
        setTimeout(() => {
          setIsTransitioning(false);
          setCurrentSlide(0);
        }, 0);
      } else {
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }
      return next;
    });
  };

  // Configurar intervalo para trocar slides automaticamente
  useEffect(() => {
    if (profissionais.length > (isMobile ? 1 : 3)) {
      const interval = setInterval(nextSlide, 5000); // Muda a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [profissionais.length, isTransitioning, isMobile]);

  const handleProfissionalClick = async (profissional: Profissional) => {
    try {
      console.log('Clicou na profissional:', profissional);
      
      // Registrar o clique no analytics
      const { data, error } = await supabase
        .from('analytics')
        .insert([
          {
            tipo: 'profissional_click',
            profissional_id: profissional.id,
            profissional_nome: profissional.nome,
            timestamp: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Erro ao registrar clique:', error);
        throw error;
      }

      console.log('Clique registrado com sucesso:', data);
      
      // Navegar para a página de profissionais com o nome como parâmetro
      navigate(`/profissionais?nome=${encodeURIComponent(profissional.nome)}`);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
      // Se falhar o registro, ainda navega
      navigate(`/profissionais?nome=${encodeURIComponent(profissional.nome)}`);
    }
  };

  const handleMapClick = async (platform: 'google' | 'waze') => {
    try {
      const { error } = await supabase
        .from('analytics')
        .insert([
          {
            tipo: 'map_click',
            button_name: platform,
            timestamp: new Date().toISOString()
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar clique no mapa:', error);
    }

    // Abrir o mapa na plataforma selecionada
    const address = encodeURIComponent('Rua Brigadeiro Faria Lima, 231 - Eltonville - Sorocaba/SP');
    const url = platform === 'google' 
      ? `https://www.google.com/maps/search/?api=1&query=${address}`
      : `https://waze.com/ul?q=${address}`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-[#fff5e6] pt-12">
        <section className="relative h-[70vh]">
          <div className="absolute inset-0 -top-12 bg-gradient-to-b from-[#D4AF37]/70 via-[#fff5e6] to-[#fff5e6]"></div>
          <div className="relative h-full flex flex-col">
            {/* Carrossel de Imagens */}
            <div className="flex-1 relative flex overflow-hidden px-4 z-10">
              <div 
                className="flex transition-transform duration-500 ease-in-out w-full h-full gap-4"
                style={{
                  transform: `translateX(-${currentSlide * (100 / (isMobile ? 1 : 3))}%)`,
                  width: `${(allSlides.length / (isMobile ? 1 : 3)) * 100}%`,
                  transitionDuration: isTransitioning ? '500ms' : '0ms'
                }}
              >
                {allSlides.map((profissional, index) => (
                  <div
                    key={`${profissional.id}-${index}`}
                    className="w-full md:w-1/3 h-full flex-shrink-0 relative p-2 cursor-pointer"
                    onClick={() => handleProfissionalClick(profissional)}
                  >
                    <div className="relative h-full rounded-lg overflow-hidden">
                      <img
                        src={profissional.imagens[0].startsWith('http') 
                          ? profissional.imagens[0] 
                          : `${supabase.storage.from('profissionais').getPublicUrl(profissional.imagens[0]).data.publicUrl}`}
                        alt={profissional.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-xl font-semibold">{profissional.nome}</h3>
                        <p className="text-gray-200 text-sm">{profissional.especialidade}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão de navegação - apenas para direita */}
              {profissionais.length > (isMobile ? 1 : 3) && (
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                  disabled={isTransitioning}
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Blog Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 pt-8">
            <h2 className="text-5xl text-gray-700 sm:text-5xl font-bold">
              Massagens e Terapias
            </h2>
          </div>
          <div className="max-w-6xl mx-auto">
            <Blog limit={3} showHeader={false} />
          </div>
        </div>
      </div>
    </div>
  );
}