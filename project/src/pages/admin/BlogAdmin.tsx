import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';

interface Post {
  id: number;
  titulo: string;
  conteudo: string;
  imagem: string;
  created_at?: string;
  updated_at?: string;
}

export default function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    novaImagem: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      console.log('Buscando posts...');
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Erro ao buscar posts:', postsError);
        throw postsError;
      }

      if (!posts || posts.length === 0) {
        setPosts([]);
        return;
      }

      const postsProcessados = posts.map((post) => {
        let imagemUrl = '';
        
        if (post.imagem) {
          const { data } = supabase.storage
            .from('posts')
            .getPublicUrl(post.imagem);
          imagemUrl = data?.publicUrl || '';
        }

        return {
          id: post.id,
          titulo: post.titulo || '',
          conteudo: post.conteudo || '',
          imagem: imagemUrl,
          created_at: post.created_at,
          updated_at: post.updated_at
        };
      });

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
      let imagemUrl = editingPost ? editingPost.imagem : '';

      if (formData.novaImagem) {
        const fileExt = formData.novaImagem.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        if (editingPost?.imagem) {
          const imagemAntiga = editingPost.imagem.split('/').pop();
          if (imagemAntiga) {
            await supabase.storage
              .from('posts')
              .remove([imagemAntiga]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, formData.novaImagem);

        if (uploadError) throw uploadError;

        imagemUrl = fileName;
      }

      const postData = {
        titulo: formData.titulo,
        conteudo: formData.conteudo,
        imagem: imagemUrl
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);

        if (error) throw error;
      }

      setModalOpen(false);
      setEditingPost(null);
      setFormData({ titulo: '', conteudo: '', novaImagem: null });
      setImagePreview('');
      await fetchPosts();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      alert('Erro ao salvar post. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      alert('Erro ao excluir post. Por favor, tente novamente.');
    }
  }

  function handleEdit(post: Post) {
    setEditingPost(post);
    setFormData({
      titulo: post.titulo,
      conteudo: post.conteudo,
      novaImagem: null,
    });
    setModalOpen(true);
  }

  return (
    <div className="pl-0">
      <div className="flex justify-between items-center mb-6 px-6">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-gray-600">Gerencie as postagens do blog</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setFormData({ titulo: '', conteudo: '', novaImagem: null });
            setImagePreview('');
            setModalOpen(true);
          }}
          className="bg-[#D4AF37] text-white px-4 py-2 rounded-md hover:bg-[#B4941F] flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Adicionar Post
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mx-6">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Imagem</th>
              <th className="text-left p-4">Título</th>
              <th className="text-left p-4">Conteúdo</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-4">
                  <div className="flex gap-2">
                    {post.imagem ? (
                      <img
                        src={post.imagem}
                        alt={post.titulo}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          console.error('Erro ao carregar imagem:', post.imagem);
                          e.currentTarget.src = 'https://via.placeholder.com/100?text=Erro';
                        }}
                      />
                    ) : (
                      <span className="text-gray-400">Sem imagem</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{post.titulo}</td>
                <td className="p-4">{post.conteudo}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleEdit(post)}
                    className="text-[#D4AF37] hover:text-[#B4941F] mr-4"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
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
              {editingPost ? 'Editar Post' : 'Novo Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Título</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Conteúdo</label>
                <textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
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
                  ) : editingPost?.imagem ? (
                    <div className="relative inline-block">
                      <img
                        src={editingPost.imagem}
                        alt={editingPost.titulo}
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
                    setEditingPost(null);
                    setFormData({ titulo: '', conteudo: '', novaImagem: null });
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