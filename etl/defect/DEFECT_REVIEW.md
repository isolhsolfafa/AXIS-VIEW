# Defect Schema 검토 결과

**검토일**: 2026-02-23
**검토 대상**: `AXIS-VIEW/Defect/` (docs, migrations, models)
**상태**: 검토 완료 → 코드 수정 완료 → 구현 진행 중

---

## 시스템 아키텍처 (논의 확정)

```
[데이터 소스 — DL (Data Lake)]
  현재:     Teams Excel (수동)
  Phase 3:  QMS API (사내 품질관리시스템, 자동화)

        ↓ ETL (PDA_ML CI/CD)

[데이터 저장소 — DW (Data Warehouse)]
  Phase 1:  Railway DB (개인 클라우드)
  Phase 2:  사내 DB (보안 마이그레이션)

        ↓ Read (API)

[화면 출력]
  AXIS-OPS:  입력 시스템 + 간단 알림/뷰
  AXIS-VIEW: 상세 대시보드 + 인사이트 + 우선순위 관리
```

### 역할 분담

| 시스템 | 역할 | Write/Read |
|--------|------|:---:|
| PDA_ML CI/CD | ETL + ML 분석 + DB 적재 | Write |
| AXIS-OPS | 작업자 입력 + 간단 뷰/알림 | Write + Read |
| AXIS-VIEW | 상세 대시보드 + 인사이트 도출 | Read + component_priority 수정 |

### 온톨로지 (개념 관계도)

```
[제품] serial_number (UNIQUE, 모든 것의 출발점)
  ├── [모델] model_config.model_prefix (GAIA, DRAGON...)
  ├── [부품] component_name
  ├── [불량] defect_record → defect_keyword, ml_prediction
  └── [통계] defect_statistics (집계 데이터, SN 없음)
```

---

## 이슈 검토 결과 (6건)

### #1 UNIQUE 제약 COALESCE — ✅ 수정 완료

**문제**: PostgreSQL UNIQUE constraint 안에 함수 표현식 사용 불가
**결정**: 방안 A (Functional Unique Index) 적용
**수정 내용**: CONSTRAINT 삭제 → `CREATE UNIQUE INDEX ... COALESCE(col, '__ALL__')` 추가

---

### #2 update_updated_at_column() 함수 의존성 — ✅ 수정 완료

**문제**: 007 migration 단독 실행 시 함수 미존재로 실패 가능
**결정**: migration 상단에 `CREATE OR REPLACE FUNCTION` 추가
**수정 내용**: 007 SQL 상단에 함수 정의 블록 추가

---

### #3 INTERVAL 파라미터 바인딩 — ✅ 수정 완료

**문제**: psycopg2가 `INTERVAL '%s days'` 내부의 %s를 올바르게 바인딩 못함
**결정**: `%s * INTERVAL '1 day'` 방식으로 변경
**수정 내용**: `defect_record.py` get_recent_defect_records() 쿼리 수정

---

### #4 나머지 5개 테이블 Python 모델 — ✅ 방향 확정

**결정**: Phase별 순차 구현

- AXIS-VIEW models는 **Read(조회) 중심**으로 작성
- Write(적재)는 PDA_ML ETL이 담당
- `component_priority`만 AXIS-VIEW에서 Write(수정) 기능 포함

```
Phase 2 (ETL):  defect_keyword, ml_prediction, defect_statistics
Phase 3 (API):  component_priority (관리자 수정)
※ dashboard_snapshot 삭제 — React가 DB 실시간 조회하므로 불필요
```

---

### #5 model_config 연동 — ✅ 해결 (추가 작업 불필요)

**결정**: 같은 DB를 공유하므로 JOIN으로 해결

```sql
-- AXIS-OPS의 model_config 테이블과 직접 JOIN
SELECT mc.model_prefix, COUNT(dr.id) as defect_count
FROM defect.defect_record dr
JOIN public.model_config mc ON dr.model_name LIKE mc.model_prefix || '%'
GROUP BY mc.model_prefix;
```

- `get_model_config_for_product()` 함수가 AXIS-OPS에 이미 존재

---

### #6 qr_doc_id FK — ✅ 제거 완료

**결정**: FK 제거

- Teams Excel / QMS에 qr_doc_id 없음 (AXIS-OPS 시스템이 생성하는 값)
- ETL 시 항상 NULL → 불필요한 FK
- 필요 시 `serial_number → qr_registry JOIN`으로 조회 가능

**수정 내용**: 007 SQL에서 qr_doc_id 컬럼 및 FK 제거, Python 모델에서도 제거

---

## 수정된 파일 목록

| 파일 | 수정 내용 |
|------|----------|
| `migrations/007_create_defect_schema.sql` | #1 Functional Unique Index, #2 함수 의존성, #6 qr_doc_id 제거 |
| `models/defect_record.py` | #3 INTERVAL 바인딩, #6 qr_doc_id 제거 |

---

## 로드맵

```
Phase 1 (현재): DB 스키마 + 26년 데이터 적재 + React 불량분석 대시보드
Phase 2:        Railway DB → 사내 DB 마이그레이션 (보안)
Phase 3:        QMS API 연동 (Teams Excel 대체, 진짜 DL)
```

---

**작성일**: 2026-02-23
**검토자**: Twin파파 + Claude
**버전**: v2.0 (검토 반영)
