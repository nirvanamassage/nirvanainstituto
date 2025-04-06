import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { MessageSquare, Users, Sparkles, FileText, Home, MapPin } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

// Verificar e criar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas!');
  console.log('Variáveis disponíveis:', import.meta.env);
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

interface DashboardData {
  whatsapp: {
    [key: string]: {
      clicks: number;
      timestamp: string[];
    };
  };
  blog: Array<{
    id: number;
    title: string;
    clicks: number;
  }>;
  profissionais: Array<{
    id: number;
    nome: string;
    clicks: number;
    whatsappClicks: number;
  }>;
  servicos: Array<{
    id: number;
    nome: string;
    clicks: number;
    whatsappClicks: number;
  }>;
  home: {
    buttons: Array<{
      button_name: string;
      clicks: number;
    }>;
    maps: {
      google: number;
      waze: number;
    };
  };
}

export default function Site() {
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'blog' | 'profissionais' | 'servicos' | 'home'>('home');
  const [selectedDays, setSelectedDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    whatsapp: {
      'Botão Agendamento': { clicks: 0, timestamp: [] },
      'Menu Inferior': { clicks: 0, timestamp: [] },
      'Botão Flutuante': { clicks: 0, timestamp: [] }
    },
    blog: [],
    profissionais: [],
    servicos: [],
    home: {
      buttons: [
        { button_name: 'servicos_superior', clicks: 0 },
        { button_name: 'profissionais_superior', clicks: 0 }
      ],
      maps: {
        google: 0,
        waze: 0
      }
    }
  });

  // Memoize os dados para evitar re-renderizações desnecessárias
  const memoizedData = useMemo(() => data, [JSON.stringify(data)]);

  // Verificar parâmetro da URL para definir a aba ativa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as 'whatsapp' | 'blog' | 'profissionais' | 'servicos' | 'home';
    if (tab && ['whatsapp', 'blog', 'profissionais', 'servicos', 'home'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Função memoizada para buscar dados
  const fetchData = useCallback(async () => {
    try {
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuração do Supabase não encontrada. URL: ' + supabaseUrl);
      }

      // Buscar dados de analytics com filtro de data
      const now = new Date();
      let startDate = new Date();
      
      if (selectedDays === 0) {
        // Se for "Tudo", usar uma data muito antiga
        startDate.setFullYear(2000);
      } else if (selectedDays === 1) {
        // Se for "Hoje", usar o início do dia atual
        startDate.setHours(0, 0, 0, 0);
      } else {
        // Para outros períodos, voltar X dias a partir do início do dia atual
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - selectedDays);
      }
      
      console.log('Período selecionado:', selectedDays);
      console.log('Data inicial:', startDate.toISOString());
      console.log('Data final:', now.toISOString());
      
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', now.toISOString());

      if (analyticsError) throw analyticsError;
      if (!analyticsData) throw new Error('Nenhum dado de analytics encontrado');

      console.log('Dados encontrados:', analyticsData.length);

      // Buscar profissionais
      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('profissionais')
        .select('*');

      if (profissionaisError) {
        console.error('Erro ao buscar profissionais:', profissionaisError);
        throw new Error(`Erro ao buscar profissionais: ${profissionaisError.message}`);
      }

      // Buscar posts do blog
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*');

      if (blogError) throw blogError;

      // Buscar serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('*');

      if (servicosError) throw servicosError;

      // Processar dados de analytics para profissionais
      const profissionaisComClicks = profissionaisData?.map(prof => ({
        id: prof.id,
        nome: prof.nome,
        clicks: analyticsData?.filter(a => 
          a.tipo === 'profissional_click' && 
          a.profissional_id === prof.id
        ).length || 0,
        whatsappClicks: analyticsData?.filter(a => 
          a.tipo === 'profissional_whatsapp' && 
          a.profissional_id === prof.id
        ).length || 0
      })) || [];

      // Processar dados de WhatsApp
      const whatsappClicks = {
        'Botão Agendamento': {
          clicks: analyticsData?.filter(a => 
            a.tipo === 'agendar_massagem'
          ).length || 0,
          timestamp: generateTimeStamps()
        },
        'Menu Inferior': {
          clicks: analyticsData?.filter(a => 
            a.tipo === 'whatsapp_footer'
          ).length || 0,
          timestamp: generateTimeStamps()
        },
        'Botão Flutuante': {
          clicks: analyticsData?.filter(a => 
            a.tipo === 'whatsapp_flutuante'
          ).length || 0,
          timestamp: generateTimeStamps()
        }
      };

      // Processar dados do blog
      const blogComClicks = blogData?.map(post => ({
        id: post.id,
        title: post.title,
        clicks: analyticsData?.filter(a => 
          a.tipo === 'blog_view' && 
          a.post_id === post.id
        ).length || 0
      })) || [];

      // Processar dados dos serviços
      const servicosComClicks = servicosData?.map(servico => ({
        id: servico.id,
        nome: servico.titulo,
        clicks: analyticsData?.filter(a => 
          a.tipo === 'servico_view' && 
          a.servico_id === servico.id
        ).length || 0,
        whatsappClicks: analyticsData?.filter(a => 
          a.tipo === 'servico_whatsapp' && 
          a.servico_id === servico.id
        ).length || 0
      })) || [];

      // Processar dados da home
      const homeButtonClicks = [
        'servicos_superior',
        'profissionais_superior'
      ].map(buttonName => ({
        button_name: buttonName,
        clicks: analyticsData?.filter(a => 
          a.tipo === buttonName
        ).length || 0
      }));

      const mapClicks = {
        google: analyticsData?.filter(a => 
          a.tipo === 'endereco'
        ).length || 0,
        waze: 0
      };

      // Atualizar dados sem causar flash
      setData(prev => {
        const newData = {
          whatsapp: whatsappClicks,
          blog: blogComClicks,
          profissionais: profissionaisComClicks,
          servicos: servicosComClicks,
          home: {
            buttons: homeButtonClicks,
            maps: mapClicks
          }
        };

        // Só atualiza se houver mudança real nos dados
        if (JSON.stringify(prev) === JSON.stringify(newData)) {
          return prev;
        }
        return newData;
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao buscar dados');
    }
  }, [selectedDays]);

  // Efeito para buscar dados iniciais e configurar intervalo
  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Função auxiliar para gerar timestamps
  const generateTimeStamps = () => {
    const timestamps = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      timestamps.push(new Date(now.getTime() - i * 3600000).toISOString());
    }
    return timestamps;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  const renderWhatsAppDashboard = () => {
    console.log('Renderizando WhatsApp Dashboard:', data.whatsapp);
    return (
      <div className="space-y-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data.whatsapp).map(([location, stats]) => (
            <div key={location} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <div className="p-3 rounded-full bg-[#fff5e6]">
                <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total de cliques</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{stats.clicks}</p>
                <p className="text-xs text-gray-500">
                  {location === 'Menu Inferior' ? 'whatsapp no rodapé' :
                  location === 'Botão Flutuante' ? 'WhatsApp flutuante lateral' :
                  'Agende uma Massagem'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de cliques por botão</h3>
          <div className="flex justify-center">
            <div className="w-[400px] h-[300px]">
              <p className="text-sm text-gray-500 text-center mb-2">Proporção de cliques por botão</p>
              <Pie
                data={{
                  labels: Object.entries(data.whatsapp).map(([location]) => 
                    location === 'Menu Inferior' ? 'whatsapp no rodapé' :
                    location === 'Botão Flutuante' ? 'WhatsApp flutuante lateral' :
                    'Agende uma Massagem'
                  ),
                  datasets: [{
                    data: Object.values(data.whatsapp).map(stats => stats.clicks),
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado para Agendamento
                      'rgba(25, 118, 210, 0.8)',    // Azul para WhatsApp rodapé
                      'rgba(76, 175, 80, 0.8)'      // Verde para WhatsApp flutuante
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado para Agendamento
                      'rgba(25, 118, 210, 1)',      // Azul para WhatsApp rodapé
                      'rgba(76, 175, 80, 1)'        // Verde para WhatsApp flutuante
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: 20,
                        font: {
                          size: 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBlogDashboard = () => {
    console.log('Renderizando Blog Dashboard:', data.blog);
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.blog.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
              <div className="p-3 rounded-full bg-[#fff5e6]">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total de visualizações</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{post.clicks}</p>
                <p className="text-xs text-gray-500">{post.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de visualizações por post</h3>
          <div className="flex justify-center">
            <div className="w-[400px] h-[300px]">
              <p className="text-sm text-gray-500 text-center mb-2">Proporção de visualizações por post</p>
              <Pie
                data={{
                  labels: data.blog.map(post => post.title),
                  datasets: [{
                    data: data.blog.map(post => post.clicks),
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado
                      'rgba(25, 118, 210, 0.8)',    // Azul
                      'rgba(76, 175, 80, 0.8)',     // Verde
                      'rgba(244, 67, 54, 0.8)',     // Vermelho
                      'rgba(156, 39, 176, 0.8)',    // Roxo
                      'rgba(255, 152, 0, 0.8)',     // Laranja
                      'rgba(121, 85, 72, 0.8)',     // Marrom
                      'rgba(0, 150, 136, 0.8)',     // Verde-água
                      'rgba(63, 81, 181, 0.8)',     // Índigo
                      'rgba(233, 30, 99, 0.8)'      // Rosa
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado
                      'rgba(25, 118, 210, 1)',      // Azul
                      'rgba(76, 175, 80, 1)',       // Verde
                      'rgba(244, 67, 54, 1)',       // Vermelho
                      'rgba(156, 39, 176, 1)',      // Roxo
                      'rgba(255, 152, 0, 1)',       // Laranja
                      'rgba(121, 85, 72, 1)',       // Marrom
                      'rgba(0, 150, 136, 1)',       // Verde-água
                      'rgba(63, 81, 181, 1)',       // Índigo
                      'rgba(233, 30, 99, 1)'        // Rosa
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: 20,
                        font: {
                          size: 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfissionaisDashboard = () => {
    console.log('Renderizando Profissionais Dashboard:', data.profissionais);
    return (
      <div className="space-y-4 sm:space-y-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Cliques Carrossel Tela Inicial</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
          {data.profissionais.map((profissional) => (
            <div key={profissional.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex items-center space-x-2">
              <div className="p-2 rounded-full bg-[#fff5e6]">
                <Users className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Total de interações</p>
                <p className="text-lg sm:text-xl font-bold text-[#D4AF37]">{profissional.clicks + profissional.whatsappClicks}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500">{profissional.nome}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Cliques WhatsApp Profissional</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-8">
          {data.profissionais.map((profissional) => (
            <div key={profissional.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex items-center space-x-2">
              <div className="p-2 rounded-full bg-[#fff5e6]">
                <MessageSquare className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Cliques WhatsApp</p>
                <p className="text-lg sm:text-xl font-bold text-[#D4AF37]">{profissional.whatsappClicks}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500">{profissional.nome}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">Distribuição de interações por profissional</h3>
          <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-8">
            <div className="w-full lg:w-[350px] h-[250px]">
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-2">Proporção de interações por profissional</p>
              <Pie
                data={{
                  labels: data.profissionais.map(prof => prof.nome),
                  datasets: [{
                    data: data.profissionais.map(prof => prof.clicks + prof.whatsappClicks),
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado
                      'rgba(156, 39, 176, 0.8)',    // Roxo
                      'rgba(76, 175, 80, 0.8)',     // Verde
                      'rgba(25, 118, 210, 0.8)',    // Azul
                      'rgba(244, 67, 54, 0.8)',     // Vermelho
                      'rgba(255, 152, 0, 0.8)',     // Laranja
                      'rgba(0, 150, 136, 0.8)',     // Verde-água
                      'rgba(121, 85, 72, 0.8)',     // Marrom
                      'rgba(63, 81, 181, 0.8)',     // Índigo
                      'rgba(233, 30, 99, 0.8)'      // Rosa
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado
                      'rgba(156, 39, 176, 1)',      // Roxo
                      'rgba(76, 175, 80, 1)',       // Verde
                      'rgba(25, 118, 210, 1)',      // Azul
                      'rgba(244, 67, 54, 1)',       // Vermelho
                      'rgba(255, 152, 0, 1)',       // Laranja
                      'rgba(0, 150, 136, 1)',       // Verde-água
                      'rgba(121, 85, 72, 1)',       // Marrom
                      'rgba(63, 81, 181, 1)',       // Índigo
                      'rgba(233, 30, 99, 1)'        // Rosa
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 768 ? 'bottom' : 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: window.innerWidth < 768 ? 10 : 20,
                        font: {
                          size: window.innerWidth < 768 ? 10 : 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
            <div className="w-full lg:w-[350px] h-[250px]">
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-2">Proporção de cliques WhatsApp por profissional</p>
              <Pie
                data={{
                  labels: data.profissionais.map(prof => prof.nome),
                  datasets: [{
                    data: data.profissionais.map(prof => prof.whatsappClicks),
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado
                      'rgba(156, 39, 176, 0.8)',    // Roxo
                      'rgba(76, 175, 80, 0.8)',     // Verde
                      'rgba(25, 118, 210, 0.8)',    // Azul
                      'rgba(244, 67, 54, 0.8)',     // Vermelho
                      'rgba(255, 152, 0, 0.8)',     // Laranja
                      'rgba(0, 150, 136, 0.8)',     // Verde-água
                      'rgba(121, 85, 72, 0.8)',     // Marrom
                      'rgba(63, 81, 181, 0.8)',     // Índigo
                      'rgba(233, 30, 99, 0.8)'      // Rosa
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado
                      'rgba(156, 39, 176, 1)',      // Roxo
                      'rgba(76, 175, 80, 1)',       // Verde
                      'rgba(25, 118, 210, 1)',      // Azul
                      'rgba(244, 67, 54, 1)',       // Vermelho
                      'rgba(255, 152, 0, 1)',       // Laranja
                      'rgba(0, 150, 136, 1)',       // Verde-água
                      'rgba(121, 85, 72, 1)',       // Marrom
                      'rgba(63, 81, 181, 1)',       // Índigo
                      'rgba(233, 30, 99, 1)'        // Rosa
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 768 ? 'bottom' : 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: window.innerWidth < 768 ? 10 : 20,
                        font: {
                          size: window.innerWidth < 768 ? 10 : 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderServicosDashboard = () => {
    console.log('Renderizando Serviços Dashboard:', data.servicos);
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data.servicos.map((servico) => (
            <div key={servico.id} className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-2">
              <div className="p-2 rounded-full bg-[#fff5e6]">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total de interações</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{servico.clicks + servico.whatsappClicks}</p>
                <p className="text-xs text-gray-500">{servico.nome}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de interações por serviço</h3>
          <div className="w-full max-w-lg mx-auto flex flex-col items-center">
            <div className="w-[400px] h-[300px]">
              <p className="text-sm text-gray-500 text-center mb-2">Proporção de interações por serviço</p>
              <Pie
                data={{
                  labels: data.servicos.map(servico => servico.nome),
                  datasets: [{
                    data: data.servicos.map(servico => servico.clicks + servico.whatsappClicks),
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado
                      'rgba(244, 67, 54, 0.8)',     // Vermelho
                      'rgba(76, 175, 80, 0.8)',     // Verde
                      'rgba(156, 39, 176, 0.8)',    // Roxo
                      'rgba(25, 118, 210, 0.8)',    // Azul
                      'rgba(255, 152, 0, 0.8)',     // Laranja
                      'rgba(63, 81, 181, 0.8)',     // Índigo
                      'rgba(0, 150, 136, 0.8)',     // Verde-água
                      'rgba(121, 85, 72, 0.8)',     // Marrom
                      'rgba(233, 30, 99, 0.8)'      // Rosa
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado
                      'rgba(244, 67, 54, 1)',       // Vermelho
                      'rgba(76, 175, 80, 1)',       // Verde
                      'rgba(156, 39, 176, 1)',      // Roxo
                      'rgba(25, 118, 210, 1)',      // Azul
                      'rgba(255, 152, 0, 1)',       // Laranja
                      'rgba(63, 81, 181, 1)',       // Índigo
                      'rgba(0, 150, 136, 1)',       // Verde-água
                      'rgba(121, 85, 72, 1)',       // Marrom
                      'rgba(233, 30, 99, 1)'        // Rosa
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      top: -50
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: 20,
                        font: {
                          size: 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHomeDashboard = () => {
    console.log('Renderizando Home Dashboard com dados:', data.home);
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.home.buttons.map((button) => (
            <div
              key={button.button_name}
              className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4"
            >
              <div className="p-3 rounded-full bg-[#fff5e6]">
                {button.button_name.includes('servicos') && <Sparkles className="w-4 h-4 text-[#D4AF37]" />}
                {button.button_name.includes('profissionais') && <Users className="w-4 h-4 text-[#D4AF37]" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total de cliques</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{button.clicks}</p>
                <p className="text-xs text-gray-500">
                  {button.button_name === 'servicos_superior' ? 'Botão Nossos Serviços' :
                  button.button_name === 'profissionais_superior' ? 'Botão Profissionais' :
                  button.button_name}
                </p>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-[#fff5e6]">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Total de cliques</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{data.home.maps.google}</p>
              <p className="text-xs text-gray-500">Cliques no link do endereço</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Distribuição de interações na página inicial</h3>
          <div className="w-full max-w-lg mx-auto flex flex-col items-center">
            <div className="w-[350px] h-[250px]">
              <p className="text-sm text-gray-500 text-center mb-2">Proporção de interações na página inicial</p>
              <Pie
                data={{
                  labels: [
                    'Nossos Serviços',
                    'Profissionais',
                    'Endereço'
                  ],
                  datasets: [{
                    data: [
                      data.home.buttons.find(b => b.button_name === 'servicos_superior')?.clicks || 0,
                      data.home.buttons.find(b => b.button_name === 'profissionais_superior')?.clicks || 0,
                      data.home.maps.google
                    ],
                    backgroundColor: [
                      'rgba(212, 175, 55, 0.8)',   // Dourado
                      'rgba(25, 118, 210, 0.8)',    // Azul
                      'rgba(76, 175, 80, 0.8)'      // Verde
                    ],
                    borderColor: [
                      'rgba(212, 175, 55, 1)',      // Dourado
                      'rgba(25, 118, 210, 1)',      // Azul
                      'rgba(76, 175, 80, 1)'        // Verde
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: {
                      top: -50
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'left' as const,
                      align: 'center' as const,
                      labels: {
                        boxWidth: 15,
                        padding: 20,
                        font: {
                          size: 12
                        },
                        color: '#000000'
                      },
                      display: true
                    },
                    title: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-4">Dashboards do Site</h1>

      {/* Filtro de Período */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setSelectedDays(0)}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
            selectedDays === 0
              ? 'bg-[#D4AF37] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Tudo
        </button>
        <button
          onClick={() => setSelectedDays(1)}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
            selectedDays === 1
              ? 'bg-[#D4AF37] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Hoje
        </button>
        <button
          onClick={() => setSelectedDays(5)}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
            selectedDays === 5
              ? 'bg-[#D4AF37] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          5 dias
        </button>
        {[7, 15, 30, 60, 120].map((days) => (
          <button
            key={days}
            onClick={() => setSelectedDays(days)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap ${
              selectedDays === days
                ? 'bg-[#D4AF37] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {days} dias
          </button>
        ))}
      </div>

      {/* Tabs de navegação */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'home' 
              ? 'bg-[#D4AF37] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'whatsapp' 
              ? 'bg-[#D4AF37] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'blog' 
              ? 'bg-[#D4AF37] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Blog
        </button>
        <button
          onClick={() => setActiveTab('profissionais')}
          className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'profissionais' 
              ? 'bg-[#D4AF37] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-4 h-4" />
          Profissionais
        </button>
        <button
          onClick={() => setActiveTab('servicos')}
          className={`px-3 sm:px-4 py-2 rounded-md flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap ${
            activeTab === 'servicos' 
              ? 'bg-[#D4AF37] text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Serviços
        </button>
      </div>

      {/* Conteúdo do dashboard */}
      <div className="mt-6">
        {activeTab === 'home' && renderHomeDashboard()}
        {activeTab === 'whatsapp' && renderWhatsAppDashboard()}
        {activeTab === 'blog' && renderBlogDashboard()}
        {activeTab === 'profissionais' && renderProfissionaisDashboard()}
        {activeTab === 'servicos' && renderServicosDashboard()}
      </div>
    </div>
  );
} 