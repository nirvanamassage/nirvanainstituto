import React from 'react';

const PoliticaPrivacidade = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Política de Privacidade</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Informações Gerais</h2>
          <p className="text-gray-700 mb-4">
            Esta Política de Privacidade descreve como o Nirvana Spa Institute ("nós", "nosso" ou "spa") coleta, usa, armazena e protege suas informações pessoais. Ao utilizar nossos serviços, você concorda com a coleta e uso de informações de acordo com esta política.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Coleta de Informações</h2>
          <p className="text-gray-700 mb-4">
            Coletamos informações que você nos fornece diretamente ao:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Agendar serviços em nosso spa</li>
            <li>Criar uma conta em nosso site</li>
            <li>Preencher formulários de contato</li>
            <li>Assinar nossa newsletter</li>
            <li>Interagir com nossas redes sociais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Uso das Informações</h2>
          <p className="text-gray-700 mb-4">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Processar agendamentos e pagamentos</li>
            <li>Enviar confirmações e lembretes de agendamento</li>
            <li>Comunicar promoções e novidades (mediante seu consentimento)</li>
            <li>Personalizar sua experiência em nosso spa</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Proteção de Dados</h2>
          <p className="text-gray-700 mb-4">
            Implementamos medidas de segurança apropriadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Criptografia de dados sensíveis</li>
            <li>Acesso restrito a informações pessoais</li>
            <li>Monitoramento regular de nossos sistemas</li>
            <li>Treinamento de funcionários sobre práticas de privacidade</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
          <p className="text-gray-700 mb-4">
            Você tem direito a:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados imprecisos</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Retirar seu consentimento para comunicações de marketing</li>
            <li>Solicitar uma cópia de seus dados pessoais</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Cookies e Tecnologias Similares</h2>
          <p className="text-gray-700 mb-4">
            Utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site, analisar o tráfego e personalizar o conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contato</h2>
          <p className="text-gray-700 mb-4">
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Telefone: 15 98834-0100</li>
            <li>Endereço: Rua Brigadeiro Faria Lima, 231 Eltonville - Sorocaba/SP</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Atualizações da Política</h2>
          <p className="text-gray-700 mb-4">
            Podemos atualizar esta Política de Privacidade periodicamente. A versão mais recente estará sempre disponível em nosso site, com a data da última atualização.
          </p>
          <p className="text-gray-700">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade; 