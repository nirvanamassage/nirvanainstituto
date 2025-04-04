import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Calendar, Users, Clock, MousePointer, Smartphone, MapPin } from 'lucide-react';
import ReactGA from 'react-ga4';
import { getAnalyticsData, logEvent } from '../../lib/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  pageViews: number;
  visitors: number;
  // Dados demográficos
  demographics: {
    age: { [key: string]: number };
    gender: { [key: string]: number };
  };
  // Dispositivos
  devices: {
    type: { [key: string]: number };
    browser: { [key: string]: number };
    os: { [key: string]: number };
  };
  // Comportamento
  behavior: {
    avgSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
    clickEvents: { [key: string]: number };
    professionalClicks: { [key: string]: number };
  };
  // Tempo
  timing: {
    hourlyTraffic: { [key: string]: number };
    weekdayTraffic: { [key: string]: number };
  };
  // Localização
  location: {
    city: { [key: string]: number };
    country: { [key: string]: number };
  };
}

export default function Analytics() {
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    pageViews: 0,
    visitors: 0,
    demographics: {
      age: {},
      gender: {},
    },
    devices: {
      type: {},
      browser: {},
      os: {},
    },
    behavior: {
      avgSessionDuration: 0,
      bounceRate: 0,
      pagesPerSession: 0,
      clickEvents: {},
      professionalClicks: {},
    },
    timing: {
      hourlyTraffic: {},
      weekdayTraffic: {},
    },
    location: {
      city: {},
      country: {},
    },
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const analyticsData = await getAnalyticsData(days);
        if (analyticsData) {
          setData(analyticsData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do Analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#D4AF37]">Google Analytics</h1>
        <div className="flex items-center gap-4">
          <label className="text-gray-600">Período em dias:</label>
          <input
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(Math.min(365, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Visitantes</h2>
          </div>
          <p className="text-3xl font-bold text-[#D4AF37] mb-2">{data.visitors}</p>
          <p className="text-sm text-gray-500">
            Número total de usuários únicos que visitaram o site no período selecionado.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Visualizações</h2>
          </div>
          <p className="text-3xl font-bold text-[#D4AF37] mb-2">{data.pageViews}</p>
          <p className="text-sm text-gray-500">
            Total de páginas visualizadas, incluindo visualizações repetidas da mesma página.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Tempo Médio</h2>
          </div>
          <p className="text-3xl font-bold text-[#D4AF37] mb-2">
            {Math.floor(data.behavior.avgSessionDuration / 60)}min
          </p>
          <p className="text-sm text-gray-500">
            Duração média das sessões dos usuários no site.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Taxa de Rejeição</h2>
          </div>
          <p className="text-3xl font-bold text-[#D4AF37] mb-2">{data.behavior.bounceRate}%</p>
          <p className="text-sm text-gray-500">
            Porcentagem de visitantes que saem do site após visualizar apenas uma página.
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Dispositivos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Dispositivos</h2>
          </div>
          <div className="h-[300px]">
            <Pie
              data={{
                labels: Object.keys(data.devices.type),
                datasets: [{
                  data: Object.values(data.devices.type),
                  backgroundColor: [
                    'rgba(212, 175, 55, 0.7)',
                    'rgba(169, 140, 44, 0.7)',
                    'rgba(127, 105, 33, 0.7)',
                  ],
                  borderColor: [
                    'rgba(212, 175, 55, 1)',
                    'rgba(169, 140, 44, 1)',
                    'rgba(127, 105, 33, 1)',
                  ],
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Distribuição dos tipos de dispositivos (mobile, desktop, tablet) usados para acessar o site.
          </p>
        </div>

        {/* Demografia - Idade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Faixa Etária</h2>
          </div>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: Object.keys(data.demographics.age),
                datasets: [{
                  label: 'Visitantes por Idade',
                  data: Object.values(data.demographics.age),
                  backgroundColor: 'rgba(212, 175, 55, 0.7)',
                  borderColor: 'rgba(212, 175, 55, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Análise demográfica mostrando a distribuição de idade dos visitantes do site.
          </p>
        </div>

        {/* Horários de Acesso */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Horários de Acesso</h2>
          </div>
          <div className="h-[300px]">
            <Line
              data={{
                labels: Object.keys(data.timing.hourlyTraffic),
                datasets: [{
                  label: 'Visitas por Horário',
                  data: Object.values(data.timing.hourlyTraffic),
                  borderColor: 'rgba(212, 175, 55, 1)',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  tension: 0.4,
                  fill: true,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Padrões de tráfego ao longo do dia, mostrando os horários de pico de acesso ao site.
          </p>
        </div>

        {/* Localização */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Cidades</h2>
          </div>
          <div className="h-[300px]">
            <Bar
              data={{
                labels: Object.keys(data.location.city),
                datasets: [{
                  label: 'Visitas por Cidade',
                  data: Object.values(data.location.city),
                  backgroundColor: 'rgba(212, 175, 55, 0.7)',
                  borderColor: 'rgba(212, 175, 55, 1)',
                  borderWidth: 1,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Distribuição geográfica dos visitantes, mostrando as principais cidades de origem do tráfego.
          </p>
        </div>
      </div>

      {/* Eventos de Clique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eventos Gerais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Eventos de Clique</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(data.behavior.clickEvents)
              .sort(([, a], [, b]) => b - a)
              .map(([event, count]) => (
                <div key={event} className="flex items-center justify-between">
                  <span className="text-gray-700">{event}</span>
                  <span className="text-[#D4AF37] font-bold">{count} cliques</span>
                </div>
              ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Monitoramento dos elementos mais clicados no site, incluindo menu, botões e links.
          </p>
        </div>

        {/* Eventos de Profissionais */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-lg font-semibold text-gray-900">Cliques em Profissionais</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(data.behavior.professionalClicks)
              .sort(([, a], [, b]) => b - a)
              .map(([professional, count]) => (
                <div key={professional} className="flex items-center justify-between">
                  <span className="text-gray-700">{professional}</span>
                  <span className="text-[#D4AF37] font-bold">{count} cliques</span>
                </div>
              ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Análise de interesse nos profissionais, mostrando quais perfis recebem mais interações dos visitantes.
          </p>
        </div>
      </div>
    </div>
  );
} 