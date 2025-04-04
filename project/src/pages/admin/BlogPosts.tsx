import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export default function BlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      console.log('Buscando posts...');
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }

      console.log('Posts recebidos do banco (detalhado):', JSON.stringify(posts, null, 2));

      if (!posts || posts.length === 0) {
        setPosts([]);
        return;
      }

      // Verificar cada post individualmente
      const postsProcessados = posts.map((post) => {
        console.log('Processando post:', post.id, {
          title: post.title,
          description: post.description
        });
        
        return {
          id: post.id,
          title: post.title || '',
          description: post.description || '',
          image_url: post.image_url || '',
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      });
      
      console.log('Posts processados:', postsProcessados);
      setPosts(postsProcessados);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      alert('Erro ao carregar posts. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.title.trim()) {
        throw new Error('O título não pode estar vazio');
      }

      if (!formData.description.trim()) {
        throw new Error('A descrição não pode estar vazia');
      }

      let image_url = editingPost?.image_url || '';

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
          
        image_url = data?.publicUrl || '';
      }

      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url,
        author: 'Admin'
      };

      console.log('Dados a serem salvos:', postData);

      // Garantir que temos descrição
      if (!postData.description) {
        throw new Error('A descrição é obrigatória');
      }

      let savedPost;

      if (editingPost) {
        const { data, error } = await supabase
          .from('blog_posts')
          .update({
            title: postData.title,
            description: postData.description,
            image_url: postData.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id)
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
        console.log('Post atualizado:', data);
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{
            title: postData.title,
            description: postData.description,
            image_url: postData.image_url,
            author: postData.author
          }])
          .select()
          .single();

        if (error) throw error;
        savedPost = data;
        console.log('Novo post criado:', data);
      }

      // Verifica se o post foi salvo corretamente
      if (!savedPost || !savedPost.description) {
        throw new Error('Erro ao salvar o post: dados incompletos');
      }

      setModalOpen(false);
      setEditingPost(null);
      setFormData({ title: '', description: '', image: null });
      setImagePreview('');
      await fetchPosts();
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      alert(error.message || 'Erro ao salvar post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
    }
  }

  function handleEdit(post: BlogPost) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      image: null
    });
    setImagePreview(post.image_url);
    setModalOpen(true);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Blog</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos os posts do blog.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setEditingPost(null);
              setFormData({ title: '', description: '', image: null });
              setImagePreview('');
              setModalOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#D4AF37] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#B4941F] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 sm:w-auto"
          >
            <PlusCircle size={20} className="mr-2" />
            Adicionar Post
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
                      Imagem e Título
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Descrição
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-20 w-20 flex-shrink-0">
                            {post.image_url && (
                              <img
                                className="h-20 w-20 rounded object-cover"
                                src={post.image_url}
                                alt={post.title}
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 text-lg mb-1">{post.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="max-w-lg">
                          <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">
                            {post.description || 'Sem descrição'}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-[#D4AF37] hover:text-[#B4941F] p-1 rounded hover:bg-gray-100"
                            title="Editar"
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-gray-100"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingPost ? 'Editar Post' : 'Novo Post'}
        </h2>

              <div className="space-y-4">
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Digite o título do post"
            />
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    placeholder="Digite a descrição do post"
            />
          </div>

          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem
            </label>
            <div className="flex items-center space-x-4">
                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]">
                      <span>Escolher arquivo</span>
                <input
                  type="file"
                        className="hidden"
                  accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, image: file });
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.image ? formData.image.name : 'Nenhum arquivo escolhido'}
                    </span>
                </div>
                  {imagePreview && (
                    <div className="mt-2">
                <img
                        src={imagePreview}
                  alt="Preview"
                        className="h-32 w-32 object-cover rounded-md"
                />
                    </div>
              )}
            </div>
          </div>

              <div className="mt-6 flex justify-end space-x-3">
          <button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingPost(null);
                    setFormData({ title: '', description: '', image: null });
                    setImagePreview('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                  </button>
                  <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#B4941F]"
                  >
                  Salvar
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
} 