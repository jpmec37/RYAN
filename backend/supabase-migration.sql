-- ========================================
-- MIGRATION: Create Lost & Found Items Table
-- Execute this in Supabase SQL Editor
-- ========================================

-- Create the lost_found_items table
CREATE TABLE IF NOT EXISTS lost_found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location_found VARCHAR(200) NOT NULL,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'devolvido')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production!)
CREATE POLICY "Allow all operations on lost_found_items" ON lost_found_items
    FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lost_found_status ON lost_found_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_category ON lost_found_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_found_registration_date ON lost_found_items(registration_date DESC);
CREATE INDEX IF NOT EXISTS idx_lost_found_search ON lost_found_items 
    USING gin(to_tsvector('portuguese', description || ' ' || location_found));

-- Optional: Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_lost_found_items_updated_at ON lost_found_items;
CREATE TRIGGER update_lost_found_items_updated_at
    BEFORE UPDATE ON lost_found_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (Optional - for testing)
-- ========================================
/*
INSERT INTO lost_found_items (description, category, location_found, status) VALUES
('Mochila preta com adesivos de bandas', 'Acessórios', 'Biblioteca - 2º andar', 'disponivel'),
('Celular Samsung Galaxy A54 azul', 'Eletrônicos', 'Cantina', 'disponivel'),
('Carteira de couro marrom com documentos', 'Documentos', 'Estacionamento', 'devolvido'),
('Óculos de grau armação preta', 'Acessórios', 'Sala de aula 101', 'disponivel'),
('Chaveiro com 3 chaves e pelúcia', 'Acessórios', 'Corredor principal', 'disponivel'),
('Caderno de anotações capa vermelha', 'Material Escolar', 'Biblioteca', 'devolvido'),
('Jaqueta jeans tamanho M', 'Roupas', 'Quadra de esportes', 'disponivel'),
('Fone de ouvido branco Bluetooth', 'Eletrônicos', 'Laboratório de informática', 'disponivel');
*/