import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  descricao: string;
  imagens: string[];
}

export default function ProfissionaisAdmin() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    descricao: '',
    novasImagens: [] as File[],
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProfissionais();
  }, []);

  async function fetchProfissionais() {
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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!editingProfissional && formData.novasImagens.length === 0) {
        throw new Error('Selecione pelo menos uma imagem');
      }

      const imagensUrls = [];

      // Upload das novas imagens
      for (const imagem of formData.novasImagens) {
        const fileExt = imagem.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('profissionais')
          .upload(fileName, imagem, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw uploadError;
        }

        if (!data?.path) {
          throw new Error('Caminho da imagem não retornado pelo upload');
        }

        imagensUrls.unshift(data.path); // Adiciona no início do array
      }

      console.log('Imagens enviadas:', imagensUrls);

      const profissionalData = {
        nome: formData.nome,
        especialidade: formData.especialidade,
        descricao: formData.descricao,
        imagens: editingProfissional
          ? [...imagensUrls, ...editingProfissional.imagens].slice(0, 3)
          : imagensUrls
      };

      console.log('Dados a serem salvos:', profissionalData);

      if (editingProfissional) {
        const { error } = await supabase
          .from('profissionais')
          .update(profissionalData)
          .eq('id', editingProfissional.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profissionais')
          .insert([profissionalData]);

        if (error) throw error;
      }

      setModalOpen(false);
      setEditingProfissional(null);
      setFormData({ nome: '', especialidade: '', descricao: '', novasImagens: [] });
      setImagePreview([]);
      await fetchProfissionais();
    } catch (error: any) {
      console.error('Erro ao salvar profissional:', error);
      alert(error.message || 'Erro ao salvar profissional. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este profissional?')) return;

    try {
      setDeletingId(id);

      // Primeiro, excluir TODOS os registros relacionados na tabela analytics
      const { error: analyticsError } = await supabase
        .from('analytics')
        .delete()
        .or(`profissional_id.eq.${id},lytics_profissional_id_fkey.eq.${id}`);

      if (analyticsError) {
        console.error('Erro ao excluir analytics:', analyticsError);
        throw analyticsError;
      }

      // Tentar excluir novamente após um pequeno delay para garantir que as referências foram removidas
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Depois, encontrar o profissional e suas imagens
      const profissional = profissionais.find(p => p.id === id);
      if (!profissional) {
        throw new Error('Profissional não encontrado');
      }

      // Excluir as imagens do storage
      if (profissional.imagens && profissional.imagens.length > 0) {
        for (const imagem of profissional.imagens) {
          if (!imagem.startsWith('http')) {
            try {
              const { error: storageError } = await supabase.storage
                .from('profissionais')
                .remove([imagem]);
              
              if (storageError) {
                console.error('Erro ao excluir imagem:', storageError);
              }
            } catch (storageError) {
              console.error('Erro ao excluir imagem:', storageError);
            }
          }
        }
      }

      // Por último, excluir o registro do profissional
      const { error: deleteError } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id)
        .maybeSingle();

      if (deleteError) {
        throw deleteError;
      }

      // Se chegou aqui, a exclusão foi bem sucedida
      setProfissionais(profissionais.filter(p => p.id !== id));
      
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      alert('Erro ao excluir profissional. Por favor, tente novamente.');
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(profissional: Profissional) {
    setEditingProfissional(profissional);
    setFormData({
      nome: profissional.nome,
      especialidade: profissional.especialidade,
      descricao: profissional.descricao,
      novasImagens: [],
    });
    setModalOpen(true);
  }

  async function handleImageDelete(profissionalId: number, imagemIndex: number) {
    const profissional = profissionais.find(p => p.id === profissionalId);
    if (!profissional) return;

    const novasImagens = [...profissional.imagens];
    novasImagens.splice(imagemIndex, 1);

    try {
      const { error } = await supabase
        .from('profissionais')
        .update({ imagens: novasImagens })
        .eq('id', profissionalId);

      if (error) throw error;
      fetchProfissionais();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Profissionais</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os profissionais cadastrados no sistema.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#B4941F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 sm:w-auto"
          >
            Adicionar Profissional
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Nome
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Especialidade
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {profissionais.map((profissional) => (
                    <tr key={profissional.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={profissional.imagens[0].startsWith('http') ? profissional.imagens[0] : `${supabase.storage.from('profissionais').getPublicUrl(profissional.imagens[0]).data.publicUrl}`}
                              alt={`${profissional.nome} - Foto 1`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{profissional.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{profissional.especialidade}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                          Ativo
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(profissional)}
                          className="text-[#D4AF37] hover:text-[#B4941F] mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(profissional.id)}
                          disabled={deletingId === profissional.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === profissional.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-2 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Especialidade</label>
                  <input
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 32) {
                        setFormData({ ...formData, especialidade: text });
                      }
                    }}
                    maxLength={32}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-2 text-gray-900"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.especialidade.length}/32 caracteres
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => {
                      const text = e.target.value;
                      if (text.length <= 190) {
                        setFormData({ ...formData, descricao: text });
                      }
                    }}
                    maxLength={190}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#D4AF37] focus:ring-[#D4AF37] sm:text-sm p-2 text-gray-900 h-32"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.descricao.length}/190 caracteres
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    {editingProfissional ? 'Adicionar Mais Imagens' : 'Imagens'}
                    <span className="text-xs text-gray-500 ml-1">(Máximo 3 imagens)</span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        const totalImagens = (editingProfissional?.imagens?.length || 0) + files.length;
                        if (totalImagens > 3) {
                          alert('O total de imagens não pode exceder 3');
                          return;
                        }
                        const novasImagens = [...files, ...formData.novasImagens];
                        setFormData({ ...formData, novasImagens: novasImagens });
                        const novosPreview = files.map(file => URL.createObjectURL(file));
                        setImagePreview([...novosPreview, ...imagePreview]);
                      }
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 border-2 border-gray-300 rounded-md p-2
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-[#D4AF37] file:text-white
                      hover:file:cursor-pointer hover:file:bg-[#B4941F]
                      hover:file:text-white"
                    required={!editingProfissional}
                  />
                </div>

                {/* Preview das novas imagens */}
                {imagePreview.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Preview das Novas Imagens
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = imagePreview.filter((_, i) => i !== index);
                              const newFiles = Array.from(formData.novasImagens).filter((_, i) => i !== index);
                              setImagePreview(newPreviews);
                              setFormData({ ...formData, novasImagens: newFiles });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Imagens existentes (em modo de edição) */}
                {editingProfissional && editingProfissional.imagens && editingProfissional.imagens.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Imagens Atuais</label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {editingProfissional.imagens.map((imagem, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imagem.startsWith('http') ? imagem : `${supabase.storage.from('profissionais').getPublicUrl(imagem).data.publicUrl}`}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImagens = editingProfissional.imagens.filter((_, i) => i !== index);
                              setEditingProfissional({
                                ...editingProfissional,
                                imagens: newImagens
                              });
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingProfissional(null);
                    setFormData({ nome: '', especialidade: '', descricao: '', novasImagens: [] });
                    setImagePreview([]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border-2 border-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#D4AF37] hover:bg-[#B4941F] rounded-md disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#D4AF37]"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 