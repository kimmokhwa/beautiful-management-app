-- Supabase 테이블 생성 SQL
-- 이 쿼리들을 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 재료 테이블
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    cost DECIMAL(10, 0) NOT NULL,
    description TEXT,
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 시술 테이블
CREATE TABLE IF NOT EXISTS procedures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    customer_price DECIMAL(10, 0) NOT NULL,
    is_recommended BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 시술-재료 연결 테이블
CREATE TABLE IF NOT EXISTS procedure_materials (
    id SERIAL PRIMARY KEY,
    procedure_id INTEGER NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity DECIMAL(8, 2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(procedure_id, material_id)
);

-- 5. 업로드 작업 테이블
CREATE TABLE IF NOT EXISTS upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'materials' | 'procedures'
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    original_data JSONB,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed' | 'rollback'
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    error_details JSONB,
    upload_options JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 가격 변경 이력 테이블
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL REFERENCES materials(id),
    old_price DECIMAL(10, 0) NOT NULL,
    new_price DECIMAL(10, 0) NOT NULL,
    changed_by VARCHAR(255),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_materials_cost ON materials(cost);
CREATE INDEX IF NOT EXISTS idx_procedures_name ON procedures(name);
CREATE INDEX IF NOT EXISTS idx_procedures_category_id ON procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_procedures_customer_price ON procedures(customer_price);
CREATE INDEX IF NOT EXISTS idx_procedures_is_recommended ON procedures(is_recommended);
CREATE INDEX IF NOT EXISTS idx_procedure_materials_procedure_id ON procedure_materials(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_materials_material_id ON procedure_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_status ON upload_jobs(status);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_type ON upload_jobs(type);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_created_at ON upload_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_price_history_material_id ON price_history(material_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON price_history(changed_at);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_procedures_updated_at BEFORE UPDATE ON procedures FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO categories (name, description) VALUES
    ('보톡스', '보툴리눔 톡신 관련 시술'),
    ('필러', '히알루론산 필러 관련 시술'),
    ('레이저', '레이저 치료 관련 시술')
ON CONFLICT (name) DO NOTHING;

INSERT INTO materials (name, cost, description, supplier) VALUES
    ('보톡스 100U', 120000, '보툴리눔 톡신 A형', '앨러간'),
    ('레스틸렌 0.5cc', 77000, '히알루론산 필러', '갈데르마')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (RLS) 활성화 (선택사항)
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE procedure_materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- 기본 정책 생성 (모든 사용자가 모든 작업 가능)
-- CREATE POLICY "Enable all operations for all users" ON categories FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for all users" ON materials FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for all users" ON procedures FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for all users" ON procedure_materials FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for all users" ON upload_jobs FOR ALL USING (true);
-- CREATE POLICY "Enable all operations for all users" ON price_history FOR ALL USING (true);