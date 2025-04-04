import ReactGA from 'react-ga4';

// ID do Google Analytics 4
const TRACKING_ID = "G-YM8K2DJDH2";

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID, {
    testMode: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    gaOptions: {
      siteSpeedSampleRate: 100,
      allowLinker: true,
      cookieDomain: 'nirvanainstitute.com.br'
    }
  });
};

export const logPageView = () => {
  ReactGA.send({ 
    hitType: "pageview", 
    page: window.location.pathname,
    location: window.location.href,
    title: document.title
  });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label
  });
};

export const trackUserEngagement = () => {
  // Rastreia tempo na página
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - startTime;
    logEvent('Engagement', 'TimeOnPage', `${Math.round(timeSpent / 1000)}s`);
  });

  // Rastreia rolagem da página
  let maxScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollPercentage = Math.round(
      (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
    );
    if (scrollPercentage > maxScroll) {
      maxScroll = scrollPercentage;
      if (maxScroll % 25 === 0) { // Registra a cada 25%
        logEvent('Engagement', 'ScrollDepth', `${maxScroll}%`);
      }
    }
  });
};

export const logUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.city) {
      logEvent('User', 'Location', `${data.city}, ${data.region}`);
      return data;
    }
  } catch (error) {
    console.error('Erro ao obter localização:', error);
  }
  return null;
};

export const trackUserInteraction = (elementType: string, elementName: string) => {
  logEvent('Interaction', elementType, elementName);
};

// Função para buscar dados analíticos
export const getAnalyticsData = async () => {
  try {
    // Busca dados básicos de visualizações de página
    const pageViews = await ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname,
    });

    // Busca dados de eventos
    const events = await ReactGA.event({
      category: "All",
      action: "All",
    });

    // Busca dados de localização
    const locationData = await logUserLocation();

    // Busca dados de dispositivos
    const deviceData = {
      desktop: await ReactGA.event({
        category: "Device",
        action: "Desktop",
      }).then(data => data?.length || 0),
      mobile: await ReactGA.event({
        category: "Device",
        action: "Mobile",
      }).then(data => data?.length || 0),
      tablet: await ReactGA.event({
        category: "Device",
        action: "Tablet",
      }).then(data => data?.length || 0),
    };

    // Busca dados de engajamento
    const engagementData = {
      avgTimeOnPage: await ReactGA.event({
        category: "Engagement",
        action: "TimeOnPage",
      }).then(data => {
        if (!data?.length) return 0;
        const times = data.map(event => parseInt(event.label || "0"));
        return times.reduce((a, b) => a + b, 0) / times.length;
      }),
      bounceRate: await ReactGA.event({
        category: "Engagement",
        action: "Bounce",
      }).then(data => {
        if (!data?.length) return 0;
        return (data.length / (pageViews?.length || 1)) * 100;
      }),
      scrollDepth: await ReactGA.event({
        category: "Engagement",
        action: "ScrollDepth",
      }).then(data => {
        const depths: { [key: string]: number } = {};
        data?.forEach(event => {
          if (event.label) {
            depths[event.label] = (depths[event.label] || 0) + 1;
          }
        });
        return depths;
      }),
    };

    // Busca dados de fonte de tráfego
    const trafficSource = {
      direct: await ReactGA.event({
        category: "Traffic",
        action: "Direct",
      }).then(data => data?.length || 0),
      organic: await ReactGA.event({
        category: "Traffic",
        action: "Organic",
      }).then(data => data?.length || 0),
      referral: await ReactGA.event({
        category: "Traffic",
        action: "Referral",
      }).then(data => data?.length || 0),
      social: await ReactGA.event({
        category: "Traffic",
        action: "Social",
      }).then(data => data?.length || 0),
    };

    // Busca dados de retenção de usuários
    const userRetention = {
      newUsers: await ReactGA.event({
        category: "User",
        action: "New",
      }).then(data => data?.length || 0),
      returningUsers: await ReactGA.event({
        category: "User",
        action: "Returning",
      }).then(data => data?.length || 0),
    };

    // Busca páginas mais visitadas
    const mostVisitedPages = await ReactGA.event({
      category: "Page",
      action: "View",
    }).then(data => {
      const pages: { [key: string]: number } = {};
      data?.forEach(event => {
        if (event.label) {
          pages[event.label] = (pages[event.label] || 0) + 1;
        }
      });
      return pages;
    });

    return {
      pageViews: pageViews?.length || 0,
      events: events?.length || 0,
      location: locationData,
      deviceData,
      engagementData,
      trafficSource,
      userRetention,
      mostVisitedPages,
    };
  } catch (error) {
    console.error('Erro ao buscar dados do analytics:', error);
    return null;
  }
};

// Rastreia o tipo de dispositivo
export const trackDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  let deviceType = "Desktop";

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = "Tablet";
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = "Mobile";
  }

  logEvent("Device", deviceType);
};

// Rastreia fonte de tráfego
export const trackTrafficSource = () => {
  const referrer = document.referrer;
  let source = "Direct";

  if (referrer) {
    if (referrer.includes("google") || referrer.includes("bing")) {
      source = "Organic";
    } else if (referrer.includes("facebook") || referrer.includes("instagram") || referrer.includes("twitter")) {
      source = "Social";
    } else {
      source = "Referral";
    }
  }

  logEvent("Traffic", source);
};

// Rastreia tipo de usuário (novo ou retornante)
export const trackUserType = () => {
  const hasVisited = localStorage.getItem("hasVisitedBefore");
  
  if (!hasVisited) {
    localStorage.setItem("hasVisitedBefore", "true");
    logEvent("User", "New");
  } else {
    logEvent("User", "Returning");
  }
};

// Rastreia visualização de página
export const trackPageView = (pageName: string) => {
  logEvent("Page", "View", pageName);
};

// Rastreia bounce (saída sem interação)
export const trackBounce = () => {
  let hasBounced = true;

  const unbounce = () => {
    hasBounced = false;
    window.removeEventListener('scroll', unbounce);
    window.removeEventListener('click', unbounce);
  };

  window.addEventListener('scroll', unbounce);
  window.addEventListener('click', unbounce);

  window.addEventListener('beforeunload', () => {
    if (hasBounced) {
      logEvent("Engagement", "Bounce");
    }
  });
};

// Inicializa todos os rastreamentos
export const initializeTracking = () => {
  trackDevice();
  trackTrafficSource();
  trackUserType();
  trackPageView(window.location.pathname);
  trackBounce();
  trackUserEngagement();
}; 