-- 원가관리 시스템 Supabase SQL Schema
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 재료 테이블 생성
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  cost DECIMAL(10,0) NOT NULL CHECK (cost >= 0),
  description TEXT,
  supplier VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 시술 테이블 생성
CREATE TABLE IF NOT EXISTS procedures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  customer_price DECIMAL(10,0) NOT NULL CHECK (customer_price >= 0),
  is_recommended BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 시술-재료 연결 테이블 생성
CREATE TABLE IF NOT EXISTS procedure_materials (
  id SERIAL PRIMARY KEY,
  procedure_id INTEGER NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity DECIMAL(8,2) DEFAULT 1.0 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(procedure_id, material_id)
);

-- 5. 대량 업로드 작업 테이블 생성
CREATE TABLE IF NOT EXISTS upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('materials', 'procedures')),
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  original_data JSONB,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rollback')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  error_details JSONB,
  upload_options JSONB,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 가격 변경 이력 테이블 생성
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(id),
  old_price DECIMAL(10,0) NOT NULL,
  new_price DECIMAL(10,0) NOT NULL,
  changed_by VARCHAR(255),
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_materials_cost ON materials(cost);
CREATE INDEX IF NOT EXISTS idx_procedures_name ON procedures(name);
CREATE INDEX IF NOT EXISTS idx_procedures_category ON procedures(category_id);
CREATE INDEX IF NOT EXISTS idx_procedures_price ON procedures(customer_price);
CREATE INDEX IF NOT EXISTS idx_procedures_recommended ON procedures(is_recommended);
CREATE INDEX IF NOT EXISTS idx_procedure_materials_procedure ON procedure_materials(procedure_id);
CREATE INDEX IF NOT EXISTS idx_procedure_materials_material ON procedure_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_status ON upload_jobs(status);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_type ON upload_jobs(type);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_created_at ON upload_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_price_history_material ON price_history(material_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(changed_at);

-- 8. 시술 요약 뷰 생성 (마진 계산 포함)
CREATE OR REPLACE VIEW procedure_summary AS
SELECT
  p.id,
  p.name,
  c.name as category_name,
  p.customer_price,
  COALESCE(SUM(m.cost * pm.quantity), 0) as total_cost,
  p.customer_price - COALESCE(SUM(m.cost * pm.quantity), 0) as margin,
  CASE
    WHEN p.customer_price > 0
    THEN ROUND(((p.customer_price - COALESCE(SUM(m.cost * pm.quantity), 0)) * 100.0 / p.customer_price), 1)
    ELSE 0
  END as margin_rate,
  p.is_recommended,
  p.created_at,
  p.updated_at
FROM procedures p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN procedure_materials pm ON p.id = pm.procedure_id
LEFT JOIN materials m ON pm.material_id = m.id
GROUP BY p.id, p.name, c.name, p.customer_price, p.is_recommended, p.created_at, p.updated_at;

-- 9. 대시보드 통계 뷰 생성
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  COUNT(*) as total_procedures,
  ROUND(AVG(margin_rate), 1) as avg_margin_rate,
  MAX(margin) as max_margin,
  COUNT(CASE WHEN is_recommended = TRUE THEN 1 END) as recommended_count,
  ROUND(AVG(customer_price), 0) as avg_price
FROM procedure_summary;

-- 10. 기본 카테고리 데이터 삽입
INSERT INTO categories (name, description) VALUES
  ('필러', '히알루론산 필러 시술'),
  ('보톡스', '보툴리눔 톡신 시술'),
  ('레이저', '레이저 치료 시술'),
  ('스킨케어', '피부 관리 시술'),
  ('기타', '기타 시술')
ON CONFLICT (name) DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '✅ 원가관리 시스템 데이터베이스 스키마가 성공적으로 생성되었습니다!';
    RAISE NOTICE '📊 테이블: categories, materials, procedures, procedure_materials, upload_jobs, price_history';
    RAISE NOTICE '📈 뷰: procedure_summary, dashboard_stats';
    RAISE NOTICE '🔍 인덱스: 검색 성능 최적화 완료';
    RAISE NOTICE '🎯 기본 카테고리 데이터 삽입 완료';
END $$;