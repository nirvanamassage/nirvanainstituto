import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image_url: string;
}

interface ProfessionalInput {
  name: string;
  specialty: string;
  bio: string;
  image: File | null;
}

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;

      setProfessionals(data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfessional = async (input: ProfessionalInput) => {
    try {
      let image_url = null;

      if (input.image) {
        const fileExt = input.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('professionals')
          .upload(filePath, input.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('professionals')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('professionals')
        .insert([
          {
            name: input.name,
            specialty: input.specialty,
            bio: input.bio,
            image_url,
          },
        ]);

      if (error) throw error;

      await fetchProfessionals();
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      throw error;
    }
  };

  const updateProfessional = async (id: string, input: ProfessionalInput) => {
    try {
      let image_url = null;

      if (input.image) {
        const fileExt = input.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('professionals')
          .upload(filePath, input.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('professionals')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('professionals')
        .update({
          name: input.name,
          specialty: input.specialty,
          bio: input.bio,
          ...(image_url && { image_url }),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProfessionals();
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw error;
    }
  };

  const deleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProfessionals();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      throw error;
    }
  };

  return {
    professionals,
    loading,
    createProfessional,
    updateProfessional,
    deleteProfessional,
  };
} 