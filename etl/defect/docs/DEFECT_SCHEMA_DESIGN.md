# Defect Schema 설계 문서

## 프로젝트 개요

**목적**: 공장 불량 데이터를 DB화하여 AXIS-VIEW 대시보드에서 인사이트 도출

**데이터 소스**: QMS가 SoR (System of Record)
- **SoR**: 사내 QMS (품질관리시스템) — 검사 실적 + 불량 데이터 원천
- **현재 운영**: QMS → 수동 다운로드(주1~2회) → Teams Excel → ETL → DB
- 현재 파일: `▶2026年 검사 통합 Sheet.xlsm`
- 2025년 파일: `2025年 검사 통합 Sheet [ 수정 금지 ].xlsm` (917건)

---

## 시스템 아키텍처

```
[SoR — QMS (사내 품질관리시스템)]
  검사 실적 + 불량 데이터 원천
        ↓ 수동 다운로드 (주1~2회) → Phase 2에서 API pull 자동화

[데이터 소스 — Teams Excel]
  현재:     Teams Excel (QMS에서 수동 입력)
  Phase 2:  QMS API pull (사내 DB로 직접)
  → 둘 다 같은 불량 데이터, 소스만 다름

        ↓ ETL (run_migration_and_etl.py)

[defect 스키마 — DL (Data Lake)]
  defect_record        ← 불량 원본
  inspection_record    ← 검사 실적 원본

        ↓ DL 적재 완료 → 자동 후처리

[analytics 스키마 — DW (Data Warehouse)]
  defect_statistics    ← 기간별 집계
  defect_keyword       ← MeCab 형태소 분석
  ml_prediction        ← ML 예측 결과
  component_priority   ← 부품 우선순위

        ↓ API (Read Only)

[화면 출력]
  AXIS-OPS:  입력 시스템 + 간단 알림/뷰
  AXIS-VIEW: 상세 대시보드 + 인사이트 + 우선순위 관리 (React)
```

### 역할 분담

| 시스템 | 역할 | Write/Read |
|--------|------|:---:|
| ETL 스크립트 | DL 적재 + DW 집계 | Write |
| PDA_ML CI/CD | ML 분석 + DB 적재 | Write |
| AXIS-OPS | 작업자 입력 + 간단 뷰/알림 | Write + Read |
| AXIS-VIEW | 상세 대시보드 + 인사이트 도출 | Read + component_priority 수정 |

### DB 스키마 (5-Tier)

```
plan       → 생산 메타데이터 (product_info: serial_number, model, prod_date...)
public     → 제조 운영 (workers, tasks, alerts, qr_registry, model_config...)
partner    → 협력사 관리 (attendance_log)
defect     → DL: 불량/검사 원본 (Teams Excel → ETL)
analytics  → DW: 파생/집계/ML (DL 적재 후 자동 연동)
```

---

### FK 정책 (Sprint 1 확정 → Sprint 2 유지)

| 관계 | FK | 스키마 | 이유 |
|------|:---:|--------|------|
| defect_record.serial_number → product_info | **없음** | defect | DL은 소스 그대로 적재. S/N 추적은 JOIN |
| analytics.defect_keyword → defect.defect_record | ✅ FK | cross-schema | 같은 파이프라인 내, 순서 보장 (CASCADE) |
| analytics.component_priority → public.workers | ✅ FK | cross-schema | 관리자 수정 시 유효성 (ON DELETE SET NULL) |
| S/N 기반 cross-schema 조회 | JOIN | — | serial_number를 공통 키로 JOIN |

---

## defect 스키마 (DL) — 2개 테이블

### 1. `defect.defect_record` — 불량 기록 원본

**용도**: Teams Excel 불량내역 시트(19컬럼, No 제외) 전부 적재
**소스 시트**: `가압 불량내역`, `제조품질 불량내역`

주요 컬럼: serial_number, product_code, model_name, supplier_mechanical/electrical,
chamber, component_name(NULL 허용), component_code, defect_location, defect_detail,
action_detail, defect_category_major/minor, detection_stage, action_person_outsource,
worker, occurrence_date, remarks + 메타(source_worksheet, source_file_name, timestamps)

- **UNIQUE** (Sprint 2): Functional Index —
  `COALESCE(serial_number,'__NULL__'), COALESCE(component_name,'__NULL__'), COALESCE(defect_location,'__NULL__'), COALESCE(chamber,'__NULL__'), occurrence_date, defect_detail`
- **Sprint 1→2 변경**: `defect_location` + `chamber` 추가 — Chamber/위치 다른 불량을 별도 행으로 인식

### 2. `defect.inspection_record` — 검사 실적

**용도**: 날짜별 실적 시트에서 검사 대수 적재 (불량률 분모)
**소스 시트**: `가압 날짜별 실적`, `제조품질 날짜별 실적`

- **UNIQUE**: `COALESCE(serial_number,'__NULL__'), inspection_type, inspection_date`
- **S/N deduplicate** (Sprint 2): `(S/N, 검사일자)` 기준 — 재검사 허용
  - Sprint 1: `S/N` only → 재검사 61건 누락
  - Sprint 2: `(S/N, 검사일자)` → 3,517건 적재

---

## analytics 스키마 (DW) — 4개 테이블

### 3. `analytics.defect_keyword` — 키워드 분석 (ML 전처리)

MeCab 형태소 분석 + TF-IDF 점수 저장. FK → defect.defect_record (cross-schema).

### 4. `analytics.ml_prediction` — ML 예측 결과

RandomForest + TF-IDF 기반 불량 확률 예측.
UNIQUE: `(model_name, component_name, prediction_date)`

### 5. `analytics.defect_statistics` — 통계 집계

모델별, 부품별, 기간별 불량 집계 (대시보드용).
Functional Unique Index (COALESCE 사용).

### 6. `analytics.component_priority` — 부품 우선순위

AXIS-VIEW에서 관리자가 수정 가능. FK → public.workers(id).

---

## DL → DW 파이프라인

```
run_migration_and_etl.py 실행 순서:

1) DB 접속
2) 스키마 생성 (007 DL + 008 DW) — DROP CASCADE → 재생성
3) Excel → defect.defect_record 적재 (불량 원본)
4) Excel → defect.inspection_record 적재 (검사 실적)
5) DW 후처리 (analytics 집계)
   ├── defect_statistics: monthly/yearly 전체 + 모델별
   ├── component_priority: GROUP BY component_name 초기값
   ├── defect_keyword: 테이블만 생성 (ML 파이프라인에서 채움)
   └── ml_prediction: 테이블만 생성 (ML 파이프라인에서 채움)
6) 검증
```

---

## 2025년 데이터 현황 (Sprint 2 실측값)

**소스**: `2025年 검사 통합 Sheet [ 수정 금지 ].xlsm`

| 항목 | 값 |
|------|---|
| defect_record 전체 | 917건 |
| 가압검사 | 543건 |
| 제조품질검사 | 365건 |
| 공정검사 | 9건 |
| 기간 | 2025-01-02 ~ 2025-12-30 |
| inspection_record | 3,517건 |
| 가압검사 CH | 2,737 |
| 제조품질검사 CH | 2,576 |

**모델 TOP 5**: GAIA-I DUAL(392), GAIA-I(158), GAIA-II(62), DRAGON AB DUAL(61), GAIA-II DUAL(59)

**가압 불량률**: 543건 / 2,737CH = 19.84%
**제조품질 불량률**: 365건 / 2,576CH = 14.17%

---

## 실행 방법

### 1. DB 스키마 생성 + 데이터 적재

```bash
cd /Users/kdkyu311/Desktop/GST/AXIS-VIEW/etl/defect
python run_migration_and_etl.py
```

### 2. 테스트

```bash
cd /Users/kdkyu311/Desktop/GST/AXIS-VIEW/etl/defect
python -m pytest tests/ -v
```

---

## 파일 구조

```
AXIS-VIEW/etl/defect/
├── docs/
│   └── DEFECT_SCHEMA_DESIGN.md     ← 이 문서
├── migrations/
│   ├── 007_create_defect_schema.sql ← DL 2개 테이블
│   └── 008_create_analytics_schema.sql ← DW 4개 테이블
├── models/
│   └── defect_record.py             ← DefectRecord dataclass + CRUD
├── tests/
│   ├── conftest.py                  ← DB fixture
│   ├── test_007_schema.py           ← 스키마 검증 (8개)
│   ├── test_008_analytics.py        ← analytics 검증 (5개)
│   └── test_etl_data.py             ← ETL 정합성 (18개)
├── run_migration_and_etl.py         ← ETL 실행 스크립트 (6단계)
├── DEFECT_ETL_LAUNCH.md             ← Sprint 가이드
└── 2025年 검사 통합 Sheet [ 수정 금지 ].xlsm
```

---

## 검사 CH수 및 불량률 계산

CH수는 inspection_record.model에서 파생:

```sql
-- 월별 불량률 계산 (제조품질검사 기준 — 협력사 평가용)
SELECT
    DATE_TRUNC('month', ir.inspection_date) as month,
    SUM(CASE WHEN ir.model LIKE '%DUAL%' THEN 2 ELSE 1 END) as total_ch,
    COUNT(DISTINCT dr.serial_number) as defect_sn_count,
    ROUND(COUNT(DISTINCT dr.serial_number)::numeric /
          NULLIF(SUM(CASE WHEN ir.model LIKE '%DUAL%' THEN 2 ELSE 1 END), 0) * 100, 2) as defect_rate
FROM defect.inspection_record ir
LEFT JOIN (
    SELECT DISTINCT serial_number, DATE_TRUNC('month', occurrence_date) as defect_month
    FROM defect.defect_record
    WHERE detection_stage = '제조품질검사'
) dr ON ir.serial_number = dr.serial_number
    AND dr.defect_month = DATE_TRUNC('month', ir.inspection_date)
WHERE ir.inspection_type = '제조품질검사'
GROUP BY DATE_TRUNC('month', ir.inspection_date)
ORDER BY month;
```

---

## 로드맵

```
Phase 1 (현재):
  ✅ Sprint 1: FK 제거 + DL ETL + Q1 정합성 검증
  ✅ Sprint 2: DL/DW 스키마 분리 + 데이터 품질 수정
  → Sprint 3: BE API 엔드포인트 + React 대시보드 연결

Phase 2: 사내 DB 마이그레이션 + QMS API pull 연동
  → Railway DB → 사내 DB 이관 (보안)
  → QMS API pull (수동 Excel 대체, SoR 직접 연결)
```

---

**작성일**: 2026-03-04
**버전**: v3.0 (5-Tier 아키텍처: defect(DL) + analytics(DW) 반영)
