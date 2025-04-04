export interface Terapeuta {
  id: string;
  nome: string;
  especialidades: string[];
  descricao: string;
  foto_url: string;
  ativo: boolean;
  criado_em: string;
}

export interface Terapia {
  id: string;
  nome: string;
  descricao: string;
  imagem_url: string;
  duracao: number;
  ativo: boolean;
  criado_em: string;
}

export interface PostBlog {
  id: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
  autor: string;
  criado_em: string;
  atualizado_em: string;
}

export interface InformacoesEmpresa {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  instagram: string;
  whatsapp: string;
  sobre: string;
  latitude: number;
  longitude: number;
}

export interface PerguntaFrequente {
  id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
}

export interface MetricaClique {
  id: string;
  terapeuta_id: string;
  servico_id?: string;
  tipo: 'whatsapp' | 'perfil' | 'servico';
  criado_em: string;
  localizacao_usuario?: {
    cidade: string;
    estado: string;
    pais: string;
  };
}