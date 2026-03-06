-- Sprint 7+: defect 스키마 생성 — DL(Data Lake) 전용
-- 2개 테이블: defect_record, inspection_record
-- DW 테이블은 008_create_analytics_schema.sql로 이동 (Sprint 2)
-- Timezone: Asia/Seoul (KST)

-- ============================================================
-- 0. 의존 함수 보장 (이미 존재하면 덮어쓰기, 없으면 생성)
--    다른 migration(001~006)에서 생성되지만, 007 단독 실행 안전성 확보
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. defect 스키마 생성
-- ============================================================
CREATE SCHEMA IF NOT EXISTS defect;

-- 트랜잭션 시작 (스키마 생성 이후)
BEGIN;

-- ============================================================
-- 2. defect.defect_record — 불량 기록 원본 (Teams Excel → ETL)
-- ============================================================
CREATE TABLE IF NOT EXISTS defect.defect_record (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(255),
    -- qr_doc_id FK 제거: Teams Excel/QMS에 없는 값이므로 ETL 시 항상 NULL
    -- 필요 시 serial_number → qr_registry JOIN으로 조회 가능

    -- Teams Excel / QMS 원본 필드 (Excel 19컬럼 중 No 제외 전부)
    product_code VARCHAR(100),                     -- 제품코드
    model_name VARCHAR(255) NOT NULL,              -- 제품명 (GAIA-I, DRAGON 등)
    supplier_mechanical VARCHAR(255),              -- 협력사(기구)명
    supplier_electrical VARCHAR(255),              -- 협력사(전장)명
    chamber VARCHAR(100),                          -- Chamber
    component_name VARCHAR(255),                   -- 부품명 (NULL 허용: 일부 행에서 누락)
    component_code VARCHAR(100),                   -- 부품코드
    defect_location VARCHAR(255),                  -- 불량위치
    defect_detail TEXT NOT NULL,                   -- 상세불량내용
    action_detail TEXT,                            -- 상세조치내용
    defect_category_major VARCHAR(100),            -- 대분류 (부품불량, 기구작업불량, 전장작업불량)
    defect_category_minor VARCHAR(100),            -- 중분류
    detection_stage VARCHAR(100),                  -- 검출단계 (가압검사, 제조품질검사, 공정검사)
    action_person_outsource VARCHAR(100),          -- 조치자(외주)
    worker VARCHAR(100),                           -- 작업자
    occurrence_date DATE NOT NULL,                 -- 발생일
    remarks TEXT,                                  -- 비고

    -- 메타데이터
    source_worksheet VARCHAR(100),                 -- 소스 워크시트 (가압 불량내역 / 제조품질 불량내역)
    source_file_name VARCHAR(255),                 -- Teams Excel 파일명
    etl_loaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- 중복 방지: Functional Unique Index로 대체 (component_name NULL 허용)
);

-- 중복 방지 Functional Unique Index (NULL 컬럼 대응)
-- Sprint 2: defect_location + chamber 추가 — Chamber/위치 다른 불량을 별도 행으로 인식
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_defect_record
ON defect.defect_record(
    COALESCE(serial_number, '__NULL__'),
    COALESCE(component_name, '__NULL__'),
    COALESCE(defect_location, '__NULL__'),
    COALESCE(chamber, '__NULL__'),
    occurrence_date,
    defect_detail
);

-- 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_defect_record_sn ON defect.defect_record(serial_number);
CREATE INDEX IF NOT EXISTS idx_defect_record_model ON defect.defect_record(model_name);
CREATE INDEX IF NOT EXISTS idx_defect_record_component ON defect.defect_record(component_name);
CREATE INDEX IF NOT EXISTS idx_defect_record_date ON defect.defect_record(occurrence_date DESC);
CREATE INDEX IF NOT EXISTS idx_defect_record_category ON defect.defect_record(defect_category_major, defect_category_minor);
CREATE INDEX IF NOT EXISTS idx_defect_record_stage ON defect.defect_record(detection_stage);
CREATE INDEX IF NOT EXISTS idx_defect_record_etl ON defect.defect_record(etl_loaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_defect_record_supplier ON defect.defect_record(supplier_mechanical);
CREATE INDEX IF NOT EXISTS idx_defect_record_worker ON defect.defect_record(worker);

-- updated_at 트리거
CREATE TRIGGER update_defect_record_updated_at
    BEFORE UPDATE ON defect.defect_record
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. defect.inspection_record — 검사 실적 (날짜별 실적 시트 → ETL)
--    불량률 분모: COUNT(*) 또는 SUM(CASE DUAL→2 ELSE 1 END) = CH수
--    S/N + 검사일자 기준 deduplicate (재검사 허용)
-- ============================================================
CREATE TABLE IF NOT EXISTS defect.inspection_record (
    id SERIAL PRIMARY KEY,

    -- plan.product_info와 동일 컬럼명
    sales_order VARCHAR(255),                      -- 오더번호
    product_code VARCHAR(255),                     -- 품번
    serial_number VARCHAR(255),                    -- S/N (product_info FK 후보)
    customer VARCHAR(255),                         -- 고객사
    model VARCHAR(255) NOT NULL,                   -- MODEL (GAIA-I DUAL, DRAGON AB 등)

    -- 검사 정보
    inspection_date DATE NOT NULL,                 -- 검사일자
    inspection_type VARCHAR(50) NOT NULL,          -- 가압검사 / 제조품질검사 (시트 기반)

    -- 메타데이터
    source_worksheet VARCHAR(100),                 -- 소스 워크시트명
    source_file_name VARCHAR(255),                 -- Teams Excel 파일명
    etl_loaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- S/N + 검사유형 + 검사일자 기준 중복 방지 (같은 제품은 가압/제조품질 각각 날짜별 1건)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_inspection_record
ON defect.inspection_record(
    COALESCE(serial_number, '__NULL__'),
    inspection_type,
    inspection_date
);

-- 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_inspection_record_sn ON defect.inspection_record(serial_number);
CREATE INDEX IF NOT EXISTS idx_inspection_record_model ON defect.inspection_record(model);
CREATE INDEX IF NOT EXISTS idx_inspection_record_date ON defect.inspection_record(inspection_date DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_record_type ON defect.inspection_record(inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspection_record_customer ON defect.inspection_record(customer);

COMMIT;
