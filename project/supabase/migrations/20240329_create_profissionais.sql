-- Criar a tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    especialidade TEXT NOT NULL,
    descricao TEXT NOT NULL,
    imagens TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura pública de profissionais"
    ON profissionais
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
    ON profissionais
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
    ON profissionais
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir exclusão para usuários autenticados"
    ON profissionais
    FOR DELETE
    TO authenticated
    USING (true);

-- Criar bucket para armazenamento de imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('profissionais', 'profissionais', true);

-- Criar políticas de armazenamento
CREATE POLICY "Permitir acesso público às imagens"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profissionais');

CREATE POLICY "Permitir upload de imagens para usuários autenticados"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'profissionais');

CREATE POLICY "Permitir atualização de imagens para usuários autenticados"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'profissionais');

CREATE POLICY "Permitir exclusão de imagens para usuários autenticados"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'profissionais');

-- Insert initial profissionais
insert into profissionais (nome, especialidade, descricao, imagens) values
    ('Ana Silva', 'Massagista Terapêutica', 'Especialista em massagem relaxante e terapêutica, com mais de 10 anos de experiência. Formada em fisioterapia e especializada em técnicas orientais de massagem.', ARRAY['/ana-silva-1.jpg', '/ana-silva-2.jpg', '/ana-silva-3.jpg']),
    ('Carlos Santos', 'Massoterapeuta', 'Profissional certificado em diversas técnicas de massagem, incluindo shiatsu e reflexologia. Dedicado a proporcionar bem-estar e alívio do estresse através de tratamentos personalizados.', ARRAY['/carlos-santos-1.jpg', '/carlos-santos-2.jpg', '/carlos-santos-3.jpg']); 