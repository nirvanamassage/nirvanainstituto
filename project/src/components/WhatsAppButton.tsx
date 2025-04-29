import { MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WhatsAppButton() {
  const handleWhatsAppClick = async () => {
    try {
      // Registrar o clique
      const { error } = await supabase
        .from('analytics')
        .insert({
          tipo: 'whatsapp_flutuante',
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar clique:', error);
      } else {
        console.log('Clique registrado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }

    // Abrir WhatsApp
    window.open('https://wa.me/55', '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50"
      aria-label="Abrir WhatsApp"
    >
      <MessageCircle size={24} />
    </button>
  );
}