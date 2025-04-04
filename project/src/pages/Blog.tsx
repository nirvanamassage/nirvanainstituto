import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

interface BlogProps {
  limit?: number;
  showHeader?: boolean;
}

const Blog = ({ limit, showHeader = true }: BlogProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [limit]);

  const togglePostExpansion = async (postId: number) => {
    // Registrar o clique no analytics
    try {
      await supabase
        .from('analytics')
        .insert([
          {
            tipo: 'blog_view',
            post_id: postId,
            timestamp: new Date().toISOString()
          }
        ]);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }

    // Expandir/recolher o texto
    setExpandedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showHeader && (
        <div 
          className="relative h-[60vh] bg-cover bg-center bg-no-repeat flex items-center justify-center"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80)'
          }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center px-4"
          >
            <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-4 drop-shadow-lg">
              Blog
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto drop-shadow-lg">
              Descubra dicas e novidades sobre bem-estar e qualidade de vida
            </p>
          </motion.div>
        </div>
      )}

      <div className="relative bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#D4AF37]/10 flex flex-col"
              >
                <div className="relative aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">
                    {post.title}
                  </h3>
                  <p className={`text-gray-600 text-sm leading-relaxed ${expandedPosts.includes(post.id) ? '' : 'line-clamp-2'}`}>
                    {post.description}
                  </p>
                  <div className="mt-4">
                    <button 
                      onClick={() => togglePostExpansion(post.id)}
                      className="text-[#D4AF37] hover:text-[#B4941F] text-sm font-medium transition-colors duration-300 inline-flex items-center group"
                    >
                      {expandedPosts.includes(post.id) ? 'ler menos' : 'ler mais'}
                      <span className="ml-1 transform transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog; 