import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Pencil, Trash2, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface Servico {
  id: number;
  titulo: string;
  descricao: string;
  imagem: string;
  created_at?: string;
  updated_at?: string;
}

export default function ServicosAdmin() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    novaImagem: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>([]);

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      console.log('Buscando serviços...');
      const { data: servicos, error: servicosError } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (servicosError) {
        console.error('Erro ao buscar serviços:', servicosError);
        throw servicosError;
      }

      if (!servicos || servicos.length === 0) {
        setServicos([]);
        return;
      }

      const servicosProcessados = servicos.map((servico) => {
        let imagemUrl = '';
        
        if (servico.imagem) {
          if (servico.imagem.startsWith('http')) {
            imagemUrl = servico.imagem;
          } else {
            const { data } = supabase.storage
              .from('servicos')
              .getPublicUrl(servico.imagem);
            imagemUrl = data?.publicUrl || '';
          }
        }

        console.log('Processando serviço:', {
          id: servico.id,
          titulo: servico.titulo,
          imagem_original: servico.imagem,
          imagem_processada: imagemUrl,
          updated_at: servico.updated_at
        });

        return {
          id: servico.id,
          titulo: servico.titulo || '',
          descricao: servico.descricao || '',
          imagem: imagemUrl,
          created_at: servico.created_at,
          updated_at: servico.updated_at
        };
      });

      console.log('Serviços processados:', servicosProcessados);
      setServicos(servicosProcessados);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      alert('Erro ao carregar serviços. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando salvamento do serviço...');
      console.log('Dados do formulário:', formData);

      let imagemUrl = editingServico ? editingServico.imagem : '';

      if (formData.novaImagem) {
        console.log('Processando upload de nova imagem...');
        const fileExt = formData.novaImagem.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        if (editingServico?.imagem) {
          console.log('Removendo imagem antiga:', editingServico.imagem);
          const imagemAntiga = editingServico.imagem.split('/').pop();
          if (imagemAntiga) {
            const { error: deleteError } = await supabase.storage
              .from('servicos')
              .remove([imagemAntiga]);
            
            if (deleteError) {
              console.error('Erro ao remover imagem antiga:', deleteError);
            }
          }
        }

        console.log('Fazendo upload da nova imagem:', fileName);
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('servicos')
          .upload(fileName, formData.novaImagem);

        if (uploadError) {
          console.error('Erro no upload da imagem:', uploadError);
          throw new Error(`Erro no upload da imagem: ${uploadError.message}`);
        }

        imagemUrl = fileName;
        console.log('Upload concluído. URL da imagem:', imagemUrl);
      }

      const servicoData = {
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        imagem: imagemUrl
      };

      console.log('Dados do serviço a serem salvos:', servicoData);

      if (editingServico) {
        console.log('Atualizando serviço existente:', editingServico.id);
        const { error: updateError, data: updateData } = await supabase
          .from('servicos')
          .update(servicoData)
          .eq('id', editingServico.id);

        if (updateError) {
          console.error('Erro ao atualizar serviço:', updateError);
          throw new Error(`Erro ao atualizar serviço: ${updateError.message}`);
        }

        console.log('Serviço atualizado com sucesso:', updateData);
      } else {
        console.log('Criando novo serviço');
        const { error: insertError, data: insertData } = await supabase
          .from('servicos')
          .insert([{
            ...servicoData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error('Erro ao criar serviço:', insertError);
          throw new Error(`Erro ao criar serviço: ${insertError.message}`);
        }

        console.log('Novo serviço criado com sucesso:', insertData);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchServicos();

      setModalOpen(false);
      setEditingServico(null);
      setFormData({ titulo: '', descricao: '', novaImagem: null });
      setImagePreview('');
      
      alert('Serviço salvo com sucesso!');
    } catch (error) {
      console.error('Erro detalhado ao salvar serviço:', error);
      alert(`Erro ao salvar serviço: ${error instanceof Error ? error.message : 'Por favor, tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchServicos();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      alert('Erro ao excluir serviço. Por favor, tente novamente.');
    }
  }

  function handleEdit(servico: Servico) {
    setEditingServico(servico);
    setFormData({
      titulo: servico.titulo,
      descricao: servico.descricao,
      novaImagem: null,
    });
    setModalOpen(true);
  }

  const toggleDescription = (id: number) => {
    setExpandedDescriptions(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="pl-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Serviços</h1>
          <p className="text-gray-600">Gerencie os serviços oferecidos</p>
        </div>
        <button
          onClick={() => {
            setEditingServico(null);
            setFormData({ titulo: '', descricao: '', novaImagem: null });
            setImagePreview('');
            setModalOpen(true);
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-md hover:bg-[#B4941F] flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Adicionar Serviço
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 w-[200px]">Imagem e Nome</th>
              <th className="text-left p-4">Descrição</th>
              <th className="text-right p-4 w-[150px]">Data</th>
              <th className="text-right p-4 w-[100px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map((servico) => (
              <tr key={servico.id} className="border-b">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    {servico.imagem ? (
                      <img
                        src={servico.imagem}
                        alt={servico.titulo}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-lg">{servico.titulo}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-600">
                  <div className="max-w-lg">
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {servico.descricao.length > 190 && !expandedDescriptions.includes(servico.id)
                        ? `${servico.descricao.substring(0, 190)}...`
                        : servico.descricao}
                    </p>
                    {servico.descricao.length > 190 && (
                      <button
                        onClick={() => toggleDescription(servico.id)}
                        className="text-[#D4AF37] hover:text-[#B4941F] mt-2 flex items-center gap-1 text-sm"
                      >
                        {expandedDescriptions.includes(servico.id) ? (
                          <>
                            Ver menos
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            Ver mais
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right text-gray-500 text-sm">
                  {new Date(servico.created_at || Date.now()).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(servico)}
                    className="text-[#D4AF37] hover:text-[#B4941F] mr-2"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(servico.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full border rounded p-2 h-32"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, novaImagem: file });
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, novaImagem: null });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : editingServico?.imagem ? (
                    <div className="relative inline-block">
                      <img
                        src={editingServico.imagem}
                        alt={editingServico.titulo}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingServico(null);
                    setFormData({ titulo: '', descricao: '', novaImagem: null });
                    setImagePreview('');
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded hover:bg-[#B4941F] disabled:opacity-50"
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