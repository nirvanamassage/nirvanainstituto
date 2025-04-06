import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Users, FileText, PieChart, BarChart3, Briefcase } from 'lucide-react';
import { getAnalyticsData } from '../../lib/analytics';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  pageViews: number;
  events: number;
  engagementData: {
    avgTimeOnPage: number;
    bounceRate: number;
  };
  userRetention: {
    newUsers: number;
    returningUsers: number;
  };
}

interface SiteAnalytics {
  whatsappClicks: number;
  blogViews: number;
  servicosClicks: number;
  profissionaisClicks: number;
  whatsappProfissionais: number;
  totalViews: number;
}

interface Profissional {
  id: number;
  nome: string;
  imagens: string[];
  cliques: number;
}

interface Blog {
  id: number;
  title: string;
  image: string;
  clicks: number;
}

interface Servico {
  id: number;
  titulo: string;
  imagem: string;
  clicks: number;
}

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [siteData, setSiteData] = useState<SiteAnalytics>({
    whatsappClicks: 0,
    blogViews: 0,
    servicosClicks: 0,
    profissionaisClicks: 0,
    whatsappProfissionais: 0,
    totalViews: 0
  });
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSiteData(),
          fetchProfissionais(),
          fetchBlogPosts(),
          fetchServicos(),
          fetchAnalytics()
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const fetchAnalytics = async () => {
    const data = await getAnalyticsData();
    setAnalyticsData(data);
  };

  const fetchSiteData = async () => {
    try {
      const { data: analyticsData, error } = await supabase
        .from('analytics')
        .select('*');

      if (error) throw error;

      const processedData = {
        whatsappClicks: analyticsData?.filter(a => a.tipo.includes('whatsapp')).length || 0,
        blogViews: analyticsData?.filter(a => a.tipo === 'blog_view').length || 0,
        servicosClicks: analyticsData?.filter(a => a.tipo === 'servico_view').length || 0,
        profissionaisClicks: analyticsData?.filter(a => a.tipo === 'profissional_view' || a.tipo === 'profissional_click').length || 0,
        whatsappProfissionais: analyticsData?.filter(a => a.tipo === 'profissional_whatsapp').length || 0,
        totalViews: analyticsData?.filter(a => a.tipo.includes('view')).length || 0
      };

      setSiteData(processedData);
    } catch (error) {
      console.error('Erro ao buscar dados do site:', error);
    }
  };

  const fetchProfissionais = async () => {
    try {
      const { data: profissionaisData, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('id');

      if (error) throw error;

      if (profissionaisData) {
        const profissionaisComCliques = await Promise.all(
          profissionaisData.map(async (profissional) => {
            // Busca todos os cliques relacionados ao profissional
            const { data: analyticsData } = await supabase
              .from('analytics')
              .select('*')
              .or(`tipo.eq.profissional_click,tipo.eq.profissional_whatsapp`)
              .eq('profissional_id', profissional.id);

            return {
              ...profissional,
              cliques: analyticsData?.length || 0
            };
          })
        );

        setProfissionais(profissionaisComCliques);
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      // Buscar posts do blog
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (blogError) {
        console.error('Erro ao buscar posts:', blogError);
        throw blogError;
      }

      if (!blogData || blogData.length === 0) {
        setBlogPosts([]);
        return;
      }

      // Buscar analytics para cada post
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('*')
        .eq('tipo', 'blog_view');

      console.log('Posts encontrados:', blogData);
      console.log('Analytics encontrados:', analyticsData);

      const postsComClicks = blogData.map(post => {
        return {
          id: post.id,
          title: post.title,
          image: post.image_url,
          clicks: analyticsData?.filter(a => a.post_id === post.id).length || 0
        };
      });

      console.log('Posts processados:', postsComClicks);
      setBlogPosts(postsComClicks);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    }
  };

  const fetchServicos = async () => {
    try {
      const { data: servicosData, error } = await supabase
        .from('servicos')
        .select('*');

      if (error) throw error;

      if (servicosData) {
        const servicosComCliques = await Promise.all(
          servicosData.map(async (servico) => {
            // Busca todos os cliques relacionados ao servico
            const { data: analyticsData } = await supabase
              .from('analytics')
              .select('*')
              .eq('servico_id', servico.id);

            return {
              ...servico,
              clicks: analyticsData?.length || 0
            };
          })
        );

        setServicos(servicosComCliques);
      }
    } catch (error) {
      console.error('Erro ao buscar servicos:', error);
    }
  };

  return (
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#D4AF37] mb-4 sm:mb-8">Dashboard</h1>
      
      {/* Cards do Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Card do Google Analytics */}
        <Link
          to="/admin/analytics"
          className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <BarChart3 className="w-6 sm:w-8 h-6 sm:h-8 text-[#D4AF37]" />
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap">Analytics Google</h3>
              <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Estatísticas Google</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Visualizações</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{analyticsData?.pageViews || 0}</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Usuários Novos</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{analyticsData?.userRetention.newUsers || 0}</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Taxa de Rejeição</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{analyticsData?.engagementData.bounceRate || 0}%</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Tempo Médio</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{Math.floor((analyticsData?.engagementData.avgTimeOnPage || 0) / 60)}min</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Eventos</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{analyticsData?.events || 0}</p>
            </div>
            <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
              <p className="text-[9px] sm:text-[10px] text-gray-500">Usuários Retornantes</p>
              <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{analyticsData?.userRetention.returningUsers || 0}</p>
            </div>
          </div>
        </Link>

        {/* Card de Analytics Site */}
        <Link
          to="/admin/site"
          className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-2 h-full">
            <div className="flex items-center gap-1 sm:gap-2">
              <PieChart className="w-6 sm:w-8 h-6 sm:h-8 text-[#D4AF37]" />
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap">Analytics Site</h3>
                <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Interações</p>
              </div>
            </div>
          
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Cliques WhatsApp</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.whatsappClicks}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Visitas Blog</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.blogViews}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Cliques Serviços</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.servicosClicks}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Cliques Profissionais</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.profissionaisClicks}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">WhatsApp Prof.</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.whatsappProfissionais}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <p className="text-[9px] sm:text-[10px] text-gray-500">Total Visitas</p>
                <p className="text-base sm:text-lg font-semibold text-[#D4AF37]">{siteData.totalViews}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Card do Blog */}
        <Link
          to="/admin/site?tab=blog"
          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <FileText className="w-6 sm:w-8 h-6 sm:h-8 text-[#D4AF37]" />
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-700 whitespace-nowrap">Blog</h3>
                <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Publicações</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {blogPosts && blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <div key={post.id} className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        {post.title.replace('Massagem ', '')}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-[#D4AF37]">{post.clicks} cliques</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Nenhum post encontrado</p>
              )}
            </div>
          </div>
        </Link>

        {/* Card de Serviços */}
        <Link
          to="/admin/site?tab=servicos"
          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Briefcase className="w-6 sm:w-8 h-6 sm:h-8 text-[#D4AF37]" />
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-700 whitespace-nowrap">Serviços</h3>
                <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Terapias</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {servicos && servicos.length > 0 ? (
                servicos.map((servico) => (
                  <div key={servico.id} className="flex items-center gap-2 sm:gap-3">
                    <img
                      src={servico.imagem.startsWith('http') 
                        ? servico.imagem 
                        : `${supabase.storage.from('servicos').getPublicUrl(servico.imagem).data.publicUrl}`}
                      alt={servico.titulo}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">
                        {servico.titulo.replace('Massagem ', '')}
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-[#D4AF37]">{servico.clicks} cliques</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Nenhum serviço encontrado</p>
              )}
            </div>
          </div>
        </Link>

        {/* Card de Profissionais */}
        <Link
          to="/admin/site?tab=profissionais"
          className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-[#D4AF37]" />
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-700 whitespace-nowrap">Profissionais</h3>
                <p className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Equipe</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:gap-3 mt-1 sm:mt-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {profissionais && profissionais.length > 0 ? (
                profissionais.map((profissional) => (
                  <div key={profissional.id} className="flex items-center gap-2 sm:gap-3">
                    <img 
                      src={profissional.imagens[0].startsWith('http') 
                        ? profissional.imagens[0] 
                        : `${supabase.storage.from('profissionais').getPublicUrl(profissional.imagens[0]).data.publicUrl}`
                      }
                      alt={profissional.nome}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">{profissional.nome}</p>
                      <p className="text-xs sm:text-sm font-semibold text-[#D4AF37]">{profissional.cliques} cliques</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">Nenhum profissional encontrado</p>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 