-- Sprint 2: analytics 스키마 생성 — DW(Data Warehouse)
-- 4개 테이블: defect_statistics, defect_keyword, ml_prediction, component_priority
-- defect(DL) 스키마에서 분리된 파생/집계/ML 테이블
-- Timezone: Asia/Seoul (KST)

-- ============================================================
-- 1. analytics 스키마 생성
-- ============================================================
CREATE SCHEMA IF NOT EXISTS analytics;

BEGIN;

-- ============================================================
-- 2. analytics.defect_keyword — 불량 키워드 분석 (ML 전처리)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics.defect_keyword (
    id SERIAL PRIMARY KEY,
    defect_record_id INTEGER NOT NULL REFERENCES defect.defect_record(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,                 -- 추출된 키워드 (MeCab 형태소)
    keyword_type VARCHAR(20),                      -- korean / english / mixed
    tfidf_score DECIMAL(10,6),                     -- TF-IDF 점수
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_defect_keyword_record ON analytics.defect_keyword(defect_record_id);
CREATE INDEX IF NOT EXISTS idx_defect_keyword_word ON analytics.defect_keyword(keyword);
CREATE INDEX IF NOT EXISTS idx_defect_keyword_score ON analytics.defect_keyword(tfidf_score DESC);

-- ============================================================
-- 3. analytics.ml_prediction — ML 예측 결과
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics.ml_prediction (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,              -- 제품 모델명
    component_name VARCHAR(255) NOT NULL,          -- 부품명

    -- 예측 결과
    defect_probability DECIMAL(5,2) NOT NULL,      -- 예상 불량률 (%)
    production_weight DECIMAL(5,3),                -- 생산 가중치
    priority VARCHAR(20),                          -- CRITICAL / HIGH / MEDIUM / LOW / IMMEDIATE

    -- ML 메타데이터
    ml_model_version VARCHAR(50),                  -- 모델 버전 (v2.4.0)
    ml_accuracy DECIMAL(5,2),                      -- 모델 정확도 (%)
    prediction_date DATE NOT NULL,                 -- 예측 기준일

    -- 개선 제안
    suggestion TEXT,                               -- Pin Point 개선 제안
    top_keywords JSONB,                            -- 주요 키워드 배열 ["누수", "체결불량"]

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- 같은 날짜에 같은 모델+부품 조합은 1건만 (재예측 시 UPDATE)
    CONSTRAINT unique_ml_prediction UNIQUE(model_name, component_name, prediction_date)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_ml_prediction_model ON analytics.ml_prediction(model_name);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_component ON analytics.ml_prediction(component_name);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_prob ON analytics.ml_prediction(defect_probability DESC);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_priority ON analytics.ml_prediction(priority);
CREATE INDEX IF NOT EXISTS idx_ml_prediction_date ON analytics.ml_prediction(prediction_date DESC);

-- updated_at 트리거
CREATE TRIGGER update_ml_prediction_updated_at
    BEFORE UPDATE ON analytics.ml_prediction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. analytics.defect_statistics — 불량 통계 집계 (월별/연별)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics.defect_statistics (
    id SERIAL PRIMARY KEY,
    aggregation_period VARCHAR(20) NOT NULL,       -- daily / weekly / monthly / yearly
    period_start_date DATE NOT NULL,               -- 집계 시작일
    period_end_date DATE NOT NULL,                 -- 집계 종료일

    -- 집계 필터 (NULL = 전체)
    model_name VARCHAR(255),                       -- 제품 모델명
    component_name VARCHAR(255),                   -- 부품명
    defect_category_major VARCHAR(100),            -- 대분류

    -- 통계 수치
    defect_count INTEGER NOT NULL DEFAULT 0,       -- 불량 건수
    inspection_count INTEGER,                      -- 검사 대수
    defect_rate DECIMAL(5,2),                      -- 불량률 (%)

    -- 메타데이터
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Functional Unique Index (NULL=전체를 유지하면서 중복 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_defect_statistics
ON analytics.defect_statistics(
    aggregation_period,
    period_start_date,
    COALESCE(model_name, '__ALL__'),
    COALESCE(component_name, '__ALL__'),
    COALESCE(defect_category_major, '__ALL__')
);
CREATE INDEX IF NOT EXISTS idx_defect_stats_period ON analytics.defect_statistics(aggregation_period, period_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_defect_stats_model ON analytics.defect_statistics(model_name);
CREATE INDEX IF NOT EXISTS idx_defect_stats_component ON analytics.defect_statistics(component_name);
CREATE INDEX IF NOT EXISTS idx_defect_stats_rate ON analytics.defect_statistics(defect_rate DESC);

-- ============================================================
-- 5. analytics.component_priority — 부품별 우선순위 관리
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics.component_priority (
    id SERIAL PRIMARY KEY,
    component_name VARCHAR(255) UNIQUE NOT NULL,   -- 부품명

    -- 우선순위 설정
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- CRITICAL / HIGH / MEDIUM / LOW / IMMEDIATE
    priority_reason TEXT,                          -- 우선순위 사유

    -- 개선 제안 (관리자 수정 가능)
    improvement_suggestion TEXT,                   -- 개선 방안
    action_items JSONB,                            -- 조치 사항 배열

    -- 실제 데이터 기반 메트릭
    total_defect_count INTEGER DEFAULT 0,          -- 전체 누적 불량 건수
    last_defect_date DATE,                         -- 최근 불량 발생일

    -- 메타데이터
    updated_by INTEGER REFERENCES public.workers(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_component_priority_name ON analytics.component_priority(component_name);
CREATE INDEX IF NOT EXISTS idx_component_priority_level ON analytics.component_priority(priority);
CREATE INDEX IF NOT EXISTS idx_component_priority_count ON analytics.component_priority(total_defect_count DESC);

-- updated_at 트리거
CREATE TRIGGER update_component_priority_updated_at
    BEFORE UPDATE ON analytics.component_priority
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;
