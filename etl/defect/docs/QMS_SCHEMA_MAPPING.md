# QMS 스키마 매핑 문서

## 목적

현재 Teams Excel 기반 ETL을 Phase 2에서 QMS API pull로 전환할 때,
**컬럼명/값을 QMS 기준으로 통일**하여 이중 작업을 방지한다.

**원칙**: QMS가 SoR (System of Record) → DB 컬럼명은 QMS 기준으로 정의

---

## 현재 상태: 3-Layer 매핑

```
[QMS 원천]  →  [Teams Excel 수동입력]  →  [DB 컬럼]
  (SoR)          (현재 ETL 소스)          (defect 스키마)
```

Phase 2 목표:
```
[QMS API]  →  [DB 컬럼]     ← 중간 Excel 제거
  (SoR)       (QMS 기준 정의)
```

---

## 1. defect_record — 불량 기록

### 현재 매핑 (Excel → DB)

| # | Excel 컬럼 (한글) | DB 컬럼 (현재) | 타입 | NOT NULL | QMS 필드명 | QMS 값 예시 | 비고 |
|---|---|---|---|---|---|---|---|
| 1 | 제품S/N | `serial_number` | VARCHAR(255) | | `❓ TBD` | | S/N 형식 QMS와 동일 여부 확인 |
| 2 | 제품코드 | `product_code` | VARCHAR(100) | | `❓ TBD` | | 품번 체계 확인 |
| 3 | 제품명 | `model_name` | VARCHAR(255) | ✅ | `❓ TBD` | GAIA-I DUAL | QMS에서 모델명 표기 방식 확인 |
| 4 | 협력사(기구)명 | `supplier_mechanical` | VARCHAR(255) | | `❓ TBD` | BAT, FNI, TMS(M) | QMS에 협력사 구분 있는지 |
| 5 | 협력사(전장)명 | `supplier_electrical` | VARCHAR(255) | | `❓ TBD` | C&A, P&S, TMS(E) | 기구/전장 분리 vs 통합 |
| 6 | Chamber | `chamber` | VARCHAR(100) | | `❓ TBD` | A, B | |
| 7 | 부품명 | `component_name` | VARCHAR(255) | | `❓ TBD` | | NULL 허용 — QMS에도 빈 값 있는지 |
| 8 | 부품코드 | `component_code` | VARCHAR(100) | | `❓ TBD` | | 부품코드 체계 확인 |
| 9 | 불량위치 | `defect_location` | VARCHAR(255) | | `❓ TBD` | | 자유 텍스트 vs 코드화 |
| 10 | 상세불량내용 | `defect_detail` | TEXT | ✅ | `❓ TBD` | | QMS에서 자유 텍스트인지 구조화인지 |
| 11 | 상세조치내용 | `action_detail` | TEXT | | `❓ TBD` | | |
| 12 | 대분류 | `defect_category_major` | VARCHAR(100) | | `❓ TBD` | 부품불량, 기구작업불량, 전장작업불량 | QMS 분류 코드 체계 확인 |
| 13 | 중분류 | `defect_category_minor` | VARCHAR(100) | | `❓ TBD` | | QMS 하위 분류 존재 여부 |
| 14 | 검출단계 | `detection_stage` | VARCHAR(100) | | `❓ TBD` | 가압검사, 제조품질검사, 공정검사 | QMS 검출단계 코드 확인 |
| 15 | 조치자(외주) | `action_person_outsource` | VARCHAR(100) | | `❓ TBD` | | QMS에 작업자 ID 체계 있는지 |
| 16 | 작업자 | `worker` | VARCHAR(100) | | `❓ TBD` | | 이름 vs 사번 vs ID |
| 17 | 발생일 | `occurrence_date` | DATE | ✅ | `❓ TBD` | 2025-01-15 | 날짜 포맷 확인 (KST) |
| 18 | 비고 | `remarks` | TEXT | | `❓ TBD` | | |

### 메타 컬럼 (ETL 전용 — QMS 전환 시 변경)

| DB 컬럼 | 현재 용도 | Phase 2 변경 |
|---|---|---|
| `source_worksheet` | Excel 시트명 (가압 불량내역 등) | → `source_system` = 'QMS' |
| `source_file_name` | Excel 파일명 | → `qms_record_id` (QMS 원본 PK) |
| `etl_loaded_at` | ETL 적재 시각 | 유지 |

---

## 2. inspection_record — 검사 실적

### 현재 매핑 (Excel → DB)

| # | Excel 컬럼 (한글) | DB 컬럼 (현재) | 타입 | NOT NULL | QMS 필드명 | 비고 |
|---|---|---|---|---|---|---|
| 1 | 오더번호 | `sales_order` | VARCHAR(255) | | `❓ TBD` | |
| 2 | 품번 | `product_code` | VARCHAR(255) | | `❓ TBD` | defect_record.product_code와 통일 |
| 3 | S/N | `serial_number` | VARCHAR(255) | | `❓ TBD` | |
| 4 | 고객사 | `customer` | VARCHAR(255) | | `❓ TBD` | |
| 5 | MODEL | `model` | VARCHAR(255) | ✅ | `❓ TBD` | DUAL 모델 → CH수 2배 로직 |
| 6 | 검사일자 | `inspection_date` | DATE | ✅ | `❓ TBD` | |
| 7 | (시트명 기반) | `inspection_type` | VARCHAR(50) | ✅ | `❓ TBD` | 가압검사/제조품질검사 — QMS에서 직접 제공? |

---

## 3. QMS 전환 시 확인 필요 사항

### 3-1. 값(Value) 매핑

현재 Excel에서 사용하는 값과 QMS에서 제공하는 값이 다를 수 있다.

| 항목 | 현재 Excel 값 | QMS 값 (확인 필요) | 영향 범위 |
|---|---|---|---|
| **검출단계** | `가압검사`, `제조품질검사`, `공정검사` | 코드? 영문? | 불량률 계산 WHERE절 |
| **대분류** | `부품불량`, `기구작업불량`, `전장작업불량` | | defect_statistics 집계 |
| **모델명** | `GAIA-I DUAL`, `DRAGON AB` 등 | 정확히 동일? | CH수 계산 (DUAL LIKE 매칭) |
| **협력사명** | `BAT`, `FNI`, `TMS(M)` 등 | 코드? 정식명칭? | 협력사 평가 JOIN |
| **작업자** | 이름 (문자열) | 사번? ID? | analytics.component_priority FK |

### 3-2. 구조 차이

| 항목 | 현재 (Excel 기반) | QMS에서 가능한 차이 |
|---|---|---|
| 협력사 구분 | 기구/전장 별도 컬럼 2개 | 단일 supplier + type 컬럼? |
| 검사 유형 | 시트명으로 구분 | 레코드 내 필드? |
| 불량 분류 | 대분류/중분류 2단계 | 3단계 이상? 코드 체계? |
| S/N 형식 | 자유 텍스트 | 정규 패턴 + 체크섬? |
| 날짜/시간 | DATE only | TIMESTAMP with TZ? |

### 3-3. QMS에만 존재할 수 있는 추가 필드

QMS가 SoR이므로 Excel에는 없지만 QMS에는 있을 수 있는 필드들:

- `qms_defect_id` — QMS 내부 불량 PK (중복 방지 + 추적용)
- `qms_inspection_id` — QMS 검사 PK
- `defect_severity` — 불량 심각도 (Critical/Major/Minor)
- `root_cause_code` — 근본 원인 코드
- `corrective_action_code` — 시정 조치 코드
- `approval_status` — 승인 상태
- `inspector_id` — 검사자 사번
- `line_id` / `station_id` — 라인/스테이션 코드
- `lot_number` — 로트 번호
- `rework_count` — 재작업 횟수
- `defect_image_url` — 불량 사진 경로

---

## 4. 제안: QMS-First 컬럼 정의 전략

### Phase 1.5 (지금 할 일)

QMS 스키마/API 스펙을 확보한 뒤:

1. **매핑 테이블 완성** — 위 `❓ TBD` 칸을 QMS 필드명으로 채움
2. **값 매핑 테이블** — Excel 값 ↔ QMS 코드 대조표 작성
3. **DB 컬럼 리네이밍 판단** — QMS 필드명이 더 표준적이면 DB 컬럼명 변경
4. **추가 컬럼 반영** — QMS에만 있는 유용한 필드를 DB에 선추가 (NULL 허용)

### ETL 어댑터 패턴

```python
# 현재: Excel 어댑터
class ExcelAdapter:
    COLUMN_MAP = {
        "제품S/N": "serial_number",
        "제품코드": "product_code",
        ...
    }

# Phase 2: QMS 어댑터 (같은 DB 컬럼에 적재)
class QmsAdapter:
    COLUMN_MAP = {
        "qms_serial_no": "serial_number",   # QMS 필드명 → DB 컬럼
        "qms_product_id": "product_code",
        ...
    }
    VALUE_MAP = {
        "detection_stage": {
            "PRESS_TEST": "가압검사",         # QMS 코드 → 기존 한글 값
            "MFG_QC": "제조품질검사",         # (또는 DB를 QMS 코드로 통일)
        }
    }
```

### 컬럼명 변경 시 영향도

| 변경 대상 | 영향 파일 |
|---|---|
| defect_record 컬럼명 | 007_create_defect_schema.sql, defect_record.py, run_migration_and_etl.py |
| inspection_record 컬럼명 | 007_create_defect_schema.sql, run_migration_and_etl.py |
| analytics 참조 | 008_create_analytics_schema.sql, populate_analytics() |
| AXIS-VIEW API | Sprint 3 BE 엔드포인트 (미구현) |
| AXIS-VIEW FE | Sprint 3 대시보드 (미구현) |

→ **Sprint 3 (BE API + FE) 착수 전에 컬럼명을 확정하면 이중 작업 최소화**

---

## 5. 액션 아이템

| # | 할 일 | 담당 | 우선순위 |
|---|---|---|---|
| 1 | QMS 스키마/API 스펙 확보 | 사용자 | 🔴 High |
| 2 | 위 매핑 테이블 `❓ TBD` 채우기 | 사용자 + Claude | 🔴 High |
| 3 | 값 매핑 대조표 작성 (검출단계, 대분류 등) | 사용자 + Claude | 🟡 Medium |
| 4 | DB 컬럼 리네이밍 여부 확정 | 사용자 | 🟡 Medium |
| 5 | QMS 추가 필드 반영 (ALTER TABLE) | Claude | 🟢 Low (스펙 확보 후) |
| 6 | QmsAdapter 클래스 구현 | Claude | 🟢 Low (스펙 확보 후) |
| 7 | Sprint 3 API 엔드포인트 설계 | Claude | ⏳ 매핑 확정 후 |

---

**작성일**: 2026-03-12
**버전**: v1.0 (초안 — QMS 스펙 확보 전)
**관련 문서**: DEFECT_SCHEMA_DESIGN.md (v3.0), DEFECT_ETL_LAUNCH.md
