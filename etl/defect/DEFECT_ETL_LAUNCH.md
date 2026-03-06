# Defect ETL 실행 가이드

## 사전 조건
- ✅ `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` = "1" 설정 완료
- ✅ 5-Tier 스키마 아키텍처 (plan, public, partner, defect, analytics)
- ✅ 2025年 검사 통합 Sheet [ 수정 금지 ].xlsm 파일 Defect/ 디렉토리에 존재

---

## 실행 순서

### Step 1: tmux 세션 시작 (멀티창 보기)
```bash
# tmux 세션 생성
tmux new -s defect

# 3분할 레이아웃 설정
# 1) 세로 분할
Ctrl+B, %

# 2) 왼쪽 패널에서 가로 분할
Ctrl+B, 방향키(←)로 왼쪽 이동
Ctrl+B, "
```

결과: 3개 패널
```
┌──────────┬──────────┐
│  Lead    │          │
├──────────┤   BE     │
│  TEST    │          │
└──────────┴──────────┘
```

tmux 패널 이동: `Ctrl+B, 방향키`

### Step 2: 왼쪽 상단 패널(Lead)에서 Claude Code 시작
```bash
cd ~/Desktop/GST/AXIS-VIEW/Defect
claude
```

### Step 3: accept edits on 확인
- 하단에 `accept edits on` 표시 확인
- 아니면 **Shift+Tab** 으로 전환

### Step 4: Sprint 프롬프트 입력 (아래 해당 Sprint 복사)

---

## 아키텍처

### 5-Tier DB 스키마

```
plan       → 생산 메타데이터 (product_info: serial_number, model, prod_date...)
public     → 제조 운영 (workers, tasks, alerts, qr_registry, model_config...)
partner    → 협력사 관리 (attendance_log)
defect     → DL: 원본 데이터 (Teams Excel → ETL 적재)
analytics  → DW: 파생/집계/ML (DL 적재 완료 후 자동 연동)
```

> **같은 DB, 다른 스키마** — PostgreSQL cross-schema JOIN 가능.
> 별도 DB는 K8s/Airflow 규모에서 고려. 현재는 스키마 분리로 충분.

### 데이터 파이프라인

```
[Teams Excel] (담당자가 매일 퇴근 전 업데이트)
      ↓ ETL
[defect 스키마 — DL]
  ├── defect_record        ← 불량 원본
  └── inspection_record    ← 검사 실적 원본
      ↓ DL 적재 완료 → 자동 트리거
[analytics 스키마 — DW]
  ├── defect_statistics    ← 기간별 집계
  ├── defect_keyword       ← MeCab 형태소 분석
  ├── ml_prediction        ← ML 예측 결과
  ├── component_priority   ← 부품 우선순위
  └── (향후 확장)          ← 협력사 평가, 트렌드 등
      ↓ API (Read Only)
[React — AXIS-VIEW 대시보드]
```

### FK 정책

| 관계 | FK | 이유 |
|------|:---:|------|
| defect_record.serial_number → product_info | ❌ | DL은 소스 그대로 적재. 시스템 간 적재 시점 다름 |
| defect_keyword → defect_record | ✅ | 같은 파이프라인 내, 순서 보장 |
| component_priority → workers | ✅ | 관리자 수정 시 유효성 필요 |
| S/N 추적 | JOIN | serial_number를 공통 키로 cross-schema JOIN |

### 테이블 역할

| 스키마 | 테이블 | 역할 | Write 주체 |
|--------|--------|------|-----------|
| defect (DL) | defect_record | 불량 원본 | ETL |
| defect (DL) | inspection_record | 검사 실적 원본 | ETL |
| analytics (DW) | defect_statistics | 기간별 집계 | ETL 후처리 |
| analytics (DW) | defect_keyword | 키워드 분석 | ETL 후처리 / ML |
| analytics (DW) | ml_prediction | ML 예측 | ML 파이프라인 |
| analytics (DW) | component_priority | 부품 우선순위 | ETL 후처리 + VIEW |

---

## Sprint 구성

| Sprint | 내용 | 상태 |
|--------|------|:----:|
| Sprint 1 | FK 제거 + DL ETL 재실행 + 1분기 정합성 검증 + 테스트 | ✅ 완료 |
| Sprint 2 | DL/DW 스키마 분리 + 데이터 품질 수정 + 연간 검증 | ✅ 완료 |
| Sprint 3 | BE API 엔드포인트 + React 대시보드 연결 | 대기 |

---

## Sprint 1: FK 제거 + DL ETL + 정합성 검증 + 테스트

### Sprint 1 프롬프트 (VSCode에서 실행)

```
AXIS-VIEW/Defect 디렉토리를 읽고, FK 제거 + DL ETL 재실행 + 1분기 정합성 검증 + 테스트를 진행해줘.

⚠️ 사전 확인 필수 파일:
- DEFECT_ETL_LAUNCH.md — 아키텍처 + 1분기 기준값 (이 문서)
- DEFECT_SCHEMA_DESIGN.md (v2.2) — 테이블 설계
- 007_create_defect_schema.sql — FK 제거 대상
- run_migration_and_etl.py — FK 재시도 로직 제거 대상
- defect_record.py — DefectRecord dataclass + CRUD

⚠️ Sprint 1 이전 상태:
- Railway DB에 defect 스키마 6개 테이블 생성됨 (이전 실행)
- defect_record에 FK 위반으로 serial_number가 NULL 처리되어 UNIQUE 충돌 발생
- 데이터 부정확 → 스키마 DROP 후 재생성 필요

## 팀 구성
2명의 teammate를 생성해줘. 모든 teammate는 Sonnet 모델 사용:

1. **BE** (Backend 담당) - 소유: migrations/**, models/**, run_migration_and_etl.py
2. **TEST** (테스트 담당) - 소유: tests/**

Lead(너)는 전체 진행 관리 + 코드 리뷰 + 최종 결과 보고 담당.

## BE 작업 순서 (반드시 이 순서대로)

### Phase A: FK 제거 + FK 재시도 로직 제거

**1. 007_create_defect_schema.sql 수정**
- `serial_number VARCHAR(255) REFERENCES plan.product_info(serial_number) ON DELETE SET NULL`
  → `serial_number VARCHAR(255)` (FK 제거, 일반 VARCHAR만 유지)
- 나머지 테이블/인덱스/트리거는 절대 변경하지 말 것

**2. run_migration_and_etl.py 수정**
- FK 재시도 로직 제거 (아래 코드 블록 전체 삭제):
```python
# 이 부분을 제거:
except Exception as e:
    # FK 제약 위반 시 serial_number를 NULL로 재시도
    if "defect_record_serial_number_fkey" in str(e):
        conn.rollback()
        data["serial_number"] = None
        try:
            cur.execute(query, data)
            result = cur.fetchone()
            if result:
                inserted += 1
            else:
                skipped += 1
        except Exception as retry_e:
            conn.rollback()
            print(f"     ⚠️ 적재 실패 (행 {idx}): {retry_e}")
            skipped += 1
    else:
        conn.rollback()
        print(f"     ⚠️ 적재 실패 (행 {idx}): {e}")
        skipped += 1
    continue
```
- 원래의 단순 에러 처리로 복원:
```python
except Exception as e:
    conn.rollback()
    print(f"     ⚠️ 적재 실패 (행 {idx}): {e}")
    skipped += 1
    continue
```

### Phase B: 기존 스키마 DROP + 재생성 + ETL 재실행

**3. 기존 defect 스키마 DROP 스크립트 실행**
run_migration_and_etl.py의 run_migration() 실행 전에, 기존 스키마를 먼저 DROP:
```sql
DROP SCHEMA IF EXISTS defect CASCADE;
```
이 DROP은 run_migration() 함수 시작 부분에 추가하거나, 별도 스크립트로 실행.
단, DROP은 이번 1회만 실행 (정상 운영 시에는 불필요). 주석으로 명시할 것.

**4. `python run_migration_and_etl.py` 실행**
- defect 스키마 6개 테이블 재생성 (FK 없이)
- defect_record ETL: 가압 + 제조품질 적재
- inspection_record ETL: 가압 날짜별 실적 + 제조품질 날짜별 실적 적재
- 콘솔 출력에서 에러 확인

### Phase C: 1분기 정합성 검증
ETL 완료 후 Python(psycopg2) 스크립트로 아래 쿼리 실행하여 DEFECT_ETL_LAUNCH.md 기준값과 비교:

```sql
-- 1. 테이블 6개 존재 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'defect' ORDER BY table_name;

-- 2. serial_number FK 없음 확인 (FK 목록에 defect_record 없어야 함)
SELECT tc.constraint_name, tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'defect' AND tc.constraint_type = 'FOREIGN KEY';

-- 3. serial_number NULL이 아닌 실제값 존재 확인
SELECT COUNT(*) as total,
       COUNT(serial_number) as has_sn,
       COUNT(*) - COUNT(serial_number) as null_sn
FROM defect.defect_record;
-- 기대값: null_sn ≈ 0 (FK 없으므로 원본 S/N 유지)

-- 4. 1분기 전체 건수 (기대값: 158)
SELECT COUNT(*) as q1_total
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31';

-- 5. 1분기 워크시트별 (기대값: 가압 143, 제조품질 15)
SELECT source_worksheet, COUNT(*) as cnt
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY source_worksheet ORDER BY cnt DESC;

-- 6. 1분기 검출단계별 (기대값: 가압검사 143, 제조품질검사 15)
SELECT detection_stage, COUNT(*) as cnt
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY detection_stage ORDER BY cnt DESC;

-- 7. 1분기 모델 TOP 5 (기대값: GAIA-I DUAL 57, GAIA-I 27, GAIA-P 16, DRAGON AB DUAL 15, GAIA-II 9)
SELECT model_name, COUNT(*) as cnt
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY model_name ORDER BY cnt DESC LIMIT 5;

-- 8. 1분기 대분류 (기대값: 기구작업불량 88, 부품불량 66, 전장작업불량 4)
SELECT defect_category_major, COUNT(*) as cnt
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY defect_category_major ORDER BY cnt DESC;

-- 9. 1분기 중분류 TOP 5 (기대값: Leak 137, 오조립 8, 동작불량 4, 조립불량 3, 파손 2)
SELECT defect_category_minor, COUNT(*) as cnt
FROM defect.defect_record
WHERE occurrence_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY defect_category_minor ORDER BY cnt DESC LIMIT 5;

-- 10. 1분기 검사 실적 (기대값: 가압 412대/607CH, 제조품질 402대/601CH)
SELECT
    inspection_type,
    COUNT(*) as inspection_count,
    SUM(CASE WHEN model LIKE '%DUAL%' THEN 2 ELSE 1 END) as total_ch
FROM defect.inspection_record
WHERE inspection_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY inspection_type;

-- 11. 1분기 월별 불량률 — 제조품질검사
-- 기대값: 01월 0.70%, 02월 3.75%, 03월 1.83%
SELECT
    DATE_TRUNC('month', ir.inspection_date) as month,
    SUM(CASE WHEN ir.model LIKE '%DUAL%' THEN 2 ELSE 1 END) as total_ch,
    COUNT(DISTINCT dr.serial_number) as defect_sn_count,
    ROUND(COUNT(DISTINCT dr.serial_number)::numeric /
          NULLIF(SUM(CASE WHEN ir.model LIKE '%DUAL%' THEN 2 ELSE 1 END), 0) * 100, 2) as defect_rate
FROM defect.inspection_record ir
LEFT JOIN defect.defect_record dr
    ON ir.serial_number = dr.serial_number
    AND dr.detection_stage = '제조품질검사'
WHERE ir.inspection_type = '제조품질검사'
    AND ir.inspection_date BETWEEN '2025-01-01' AND '2025-03-31'
GROUP BY DATE_TRUNC('month', ir.inspection_date)
ORDER BY month;
```

## TEST 작업 순서

### Phase D: 테스트 코드 작성

tests/ 디렉토리를 생성하고 아래 테스트를 구현:

**1. tests/test_007_schema.py — 스키마 검증 테스트**
```python
# psycopg2로 Railway DB 직접 쿼리하여 검증
# DATABASE_URL은 run_migration_and_etl.py에서 가져올 것

def test_defect_schema_exists():
    """defect 스키마 존재 확인"""

def test_defect_tables_count():
    """defect 스키마에 6개 테이블 존재 (Sprint 1 기준)"""

def test_defect_record_columns():
    """defect_record 컬럼 23개 확인"""

def test_inspection_record_columns():
    """inspection_record 컬럼 11개 확인"""

def test_no_fk_on_serial_number():
    """defect_record.serial_number에 FK 제약 없음 확인"""
    # information_schema.table_constraints에서 FK 없음 검증

def test_unique_index_defect_record():
    """UNIQUE 인덱스 동작 확인 (중복 INSERT → DO NOTHING)"""
    # TEST-DUPE 삽입 2회 → 두 번째는 None 반환
    # 테스트 후 cleanup

def test_unique_index_inspection_record():
    """inspection_record UNIQUE 인덱스 동작 확인"""
```

**2. tests/test_etl_data.py — ETL 데이터 정합성 테스트**
```python
# 1분기(2025-01~03) 기준값과 DB 쿼리 결과 비교

def test_q1_defect_total():
    """1분기 defect 전체 건수 = 158"""

def test_q1_defect_by_worksheet():
    """1분기 워크시트별: 가압 143, 제조품질 15"""

def test_q1_defect_by_stage():
    """1분기 검출단계별: 가압검사 143, 제조품질검사 15"""

def test_q1_model_top1():
    """1분기 모델 TOP1 = GAIA-I DUAL(57)"""

def test_q1_category_major_top1():
    """1분기 대분류 TOP1 = 기구작업불량(88)"""

def test_q1_category_minor_top1():
    """1분기 중분류 TOP1 = Leak(137)"""

def test_q1_inspection_pressure():
    """1분기 가압검사 실적 = 412대, 607CH"""

def test_q1_inspection_quality():
    """1분기 제조품질검사 실적 = 402대, 601CH"""

def test_q1_defect_rate_jan():
    """1분기 01월 제조품질검사 불량률 = 0.70%"""

def test_q1_defect_rate_feb():
    """1분기 02월 제조품질검사 불량률 = 3.75%"""

def test_q1_defect_rate_mar():
    """1분기 03월 제조품질검사 불량률 = 1.83%"""

def test_serial_number_not_null():
    """FK 제거 후 serial_number에 실제값 존재 (NULL 아님)"""
    # COUNT(serial_number) ≈ COUNT(*) 검증
```

**3. tests/conftest.py — 공통 fixture**
```python
import pytest
import psycopg2
import psycopg2.extras

DATABASE_URL = "postgresql://postgres:aemQKKvZhddWGlLUsAghiWAlzFkoWugL@maglev.proxy.rlwy.net:38813/railway"

@pytest.fixture(scope="session")
def db_conn():
    conn = psycopg2.connect(DATABASE_URL)
    yield conn
    conn.close()

@pytest.fixture(scope="session")
def db_cursor(db_conn):
    cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    yield cur
    cur.close()
```

**4. 테스트 실행**
```bash
cd ~/Desktop/GST/AXIS-VIEW/Defect
pip install pytest
pytest tests/ -v
```

## Phase E: 결과 보고

### BE 보고: 정합성 결과 테이블

| 검증 항목 | 기대값 | 실제값 | 상태 |
|-----------|--------|--------|------|
| defect 스키마 테이블 수 | 6 | ? | ✅/❌ |
| defect_record 컬럼 수 | 23 | ? | ✅/❌ |
| inspection_record 컬럼 수 | 11 | ? | ✅/❌ |
| serial_number FK | 없음 | ? | ✅/❌ |
| serial_number NULL 건수 | ≈0 | ? | ✅/❌ |
| Q1 defect 전체 | 158 | ? | ✅/❌ |
| Q1 가압 불량 | 143 | ? | ✅/❌ |
| Q1 제조품질 불량 | 15 | ? | ✅/❌ |
| Q1 모델 TOP1 | GAIA-I DUAL(57) | ? | ✅/❌ |
| Q1 대분류 TOP1 | 기구작업불량(88) | ? | ✅/❌ |
| Q1 중분류 TOP1 | Leak(137) | ? | ✅/❌ |
| Q1 가압검사 실적 | 412대/607CH | ? | ✅/❌ |
| Q1 제조품질검사 실적 | 402대/601CH | ? | ✅/❌ |
| Q1 01월 불량률 | 0.70% | ? | ✅/❌ |
| Q1 02월 불량률 | 3.75% | ? | ✅/❌ |
| Q1 03월 불량률 | 1.83% | ? | ✅/❌ |

### TEST 보고: 테스트 결과

```
pytest tests/ -v 실행 결과:
  test_007_schema.py — ?개 통과 / ?개 실패
  test_etl_data.py — ?개 통과 / ?개 실패
  전체: ?개 통과 / ?개 실패
```

## Lead 진행 순서
1. DEFECT_ETL_LAUNCH.md + DEFECT_SCHEMA_DESIGN.md 전체 읽기
2. BE에게 Phase A~B 작업 지시
3. BE 완료 → Lead가 코드 리뷰 (FK 제거 확인, 기존 로직 변경 없는지 확인)
4. BE Phase C 정합성 검증 결과 확인
5. TEST에게 Phase D 작업 지시
6. TEST 완료 → Lead가 테스트 결과 확인
7. Phase E 결과 보고 취합 → Sprint 1 완료 선언

## 규칙
- Lead가 전체 흐름 관리, BE/TEST에 순차적으로 작업 지시
- BE가 코드를 완성하면 Lead가 먼저 코드 리뷰 진행
- 리뷰 통과 후 TEST가 테스트 코드 작성
- 007에서 FK 제거 외 다른 테이블/인덱스/트리거 절대 변경 금지
- run_migration_and_etl.py에서 FK 재시도 로직 제거 외 기존 ETL 로직 변경 금지
- 각 teammate는 자신의 소유 파일만 수정 가능
- Sprint 1 완료 시 DEFECT_SCHEMA_DESIGN.md에 FK 정책 섹션 추가
```

---

## Sprint 2: DL/DW 스키마 분리 + DW 후처리 (Sprint 1 완료 후)

### Sprint 2 프롬프트 (VSCode에서 실행)

```
AXIS-VIEW/Defect 디렉토리를 읽고, DL/DW 스키마 분리를 진행해줘.

⚠️ 사전 확인 필수:
- DEFECT_ETL_LAUNCH.md — 아키텍처 + Sprint 구성 (이 문서)
- DEFECT_SCHEMA_DESIGN.md — 테이블 설계
- 007_create_defect_schema.sql — Sprint 1에서 FK 제거 완료 상태
- run_migration_and_etl.py — Sprint 1에서 FK 재시도 로직 제거 완료 상태

⚠️ Sprint 1 완료 전제:
- defect 스키마에 6개 테이블 + DL 데이터 적재 완료
- 1분기 정합성 검증 통과 + 테스트 전체 PASS

## 팀 구성
2명의 teammate를 생성해줘. 모든 teammate는 Sonnet 모델 사용:

1. **BE** (Backend 담당) - 소유: migrations/**, models/**, run_migration_and_etl.py
2. **TEST** (테스트 담당) - 소유: tests/**

Lead(너)는 전체 진행 관리 + 코드 리뷰 + 최종 결과 보고 담당.

## BE 작업 순서

### Phase A: 007 수정 (DL만 남김)
1. 007_create_defect_schema.sql에서 DW 테이블 4개 제거:
   - defect_keyword, ml_prediction, defect_statistics, component_priority
2. DL 테이블 2개만 유지: defect_record, inspection_record
3. 기존 인덱스, 트리거, UNIQUE 제약조건 그대로 유지

### Phase B: 008 신규 생성 (DW)
1. 008_create_analytics_schema.sql 생성
2. CREATE SCHEMA IF NOT EXISTS analytics;
3. 007에서 제거한 4개 테이블을 analytics 스키마로 이동:
   - analytics.defect_statistics
   - analytics.defect_keyword (FK → defect.defect_record cross-schema 참조)
   - analytics.ml_prediction
   - analytics.component_priority (FK → public.workers 유지)
4. 컬럼/인덱스/트리거 동일, 스키마명만 변경
5. 기존 defect 스키마의 DW 테이블 DROP 포함:
```sql
DROP TABLE IF EXISTS defect.defect_keyword CASCADE;
DROP TABLE IF EXISTS defect.ml_prediction CASCADE;
DROP TABLE IF EXISTS defect.defect_statistics CASCADE;
DROP TABLE IF EXISTS defect.component_priority CASCADE;
```

### Phase C: run_migration_and_etl.py 수정
1. run_migration() 함수에서 008 migration도 연속 실행
2. DL ETL 완료 후 DW 후처리 자동 연동 (Phase 5 추가):
   - defect_statistics: DL JOIN 집계 INSERT
     (aggregation_period별: daily/weekly/monthly/yearly, 모델별/부품별/대분류별)
   - component_priority: GROUP BY component_name 기반 초기값
     (total_defect_count, last_defect_date 자동 계산)
   - defect_keyword, ml_prediction: 테이블만 생성, 데이터 스킵
3. verify_data()에 DW 검증 추가

### Phase D: DEFECT_SCHEMA_DESIGN.md 업데이트
- 5-Tier 스키마: plan → public → partner → defect(DL) → analytics(DW)
- DL/DW 역할 분리 + 파이프라인 다이어그램
- DL → DW 자동 연동 방식 명시

## TEST 작업 순서

### Phase E: 테스트 추가/수정
1. tests/test_007_schema.py 수정:
   - defect 스키마 테이블 수: 6 → 2 변경
   - analytics 스키마 테이블 수 4개 확인 추가
2. tests/test_008_analytics.py 신규:
   - analytics 스키마 4개 테이블 존재 확인
   - defect_statistics 데이터 > 0건 확인
   - component_priority 데이터 > 0건 확인
   - cross-schema JOIN 동작 확인
3. tests/test_etl_data.py:
   - DL 데이터 Sprint 1과 동일한지 재검증 (회귀 테스트)
4. pytest tests/ -v 실행

## Lead 진행 순서
1. Sprint 1 결과 확인 (전체 테스트 PASS 전제)
2. BE에게 Phase A~C 작업 지시
3. BE 완료 → Lead가 코드 리뷰 (DL 테이블 변경 없는지, DW 스키마 정상 생성 확인)
4. TEST에게 Phase E 작업 지시
5. TEST 완료 → Lead가 테스트 결과 확인
6. 전체 테스트 PASS → Sprint 2 완료 선언

## 규칙
- Lead가 전체 흐름 관리, BE/TEST에 순차적으로 작업 지시
- DL 테이블(defect_record, inspection_record)의 구조/인덱스/데이터는 절대 변경 금지
- run_migration_and_etl.py의 기존 DL ETL 로직 변경 금지
- DW 후처리는 DL ETL 완료 후 자동 연속 실행
- BE 완료 후 Lead가 코드 리뷰 → 통과 후 TEST가 테스트 작성
- Sprint 2 완료 시 전체 테스트 PASS 확인
```

---

## Sprint 3: BE API + React (Sprint 2 완료 후)

DW 테이블 기반 API 엔드포인트 설계 → React 대시보드 연결.
(Sprint 2 완료 후 별도 프롬프트 작성 예정)

---

## 1분기 기준값 (2025-01 ~ 2025-03)

### defect_record

| 항목 | 기대값 |
|------|--------|
| **전체 건수** | **158건** |
| 가압 불량내역 | 143건 |
| 제조품질 불량내역 | 15건 |
| 모델 TOP 5 | GAIA-I DUAL(57), GAIA-I(27), GAIA-P(16), DRAGON AB DUAL(15), GAIA-II(9) |
| 부품 TOP 5 | SPEED CONTROLLER(36), MALE CONNECTOR (SUS)(12), MALE ELBOW (PP)(9), REDUCER DOUBLE Y UNION(7), UNEQUAL UNION Y(7) |
| 대분류 | 기구작업불량(88), 부품불량(66), 전장작업불량(4) |
| 중분류 TOP 5 | Leak(137), 오조립(8), 동작불량(4), 조립불량(3), 파손(2) |

### inspection_record

| 항목 | 기대값 |
|------|--------|
| **전체** | **814건, 1,208 CH** |
| 가압검사 | 412대 (DUAL=195, SINGLE=217, CH=607) |
| 제조품질검사 | 402대 (DUAL=199, SINGLE=203, CH=601) |

### 월별 불량률 — 제조품질검사

| 월 | CH수 | 불량 S/N | 불량률 |
|----|------|----------|--------|
| 2025-01 | 142 | 1 | 0.70% |
| 2025-02 | 240 | 9 | 3.75% |
| 2025-03 | 219 | 4 | 1.83% |

---

## 연간 데이터 현황 (Sprint 2 실측값)

| 항목 | 값 |
|------|---|
| defect_record 전체 | 917건 (UNIQUE: SN+component+location+chamber+date+detail) |
| 가압검사 | 543건 |
| 제조품질검사 | 365건 |
| 공정검사 | 9건 |
| inspection_record 전체 | 3,517건 (S/N+검사일자 dedup) |
| 가압검사 CH | 2,737 |
| 제조품질검사 CH | 2,576 |
| 기간 | 2025-01-02 ~ 2025-12-30 |
| defect_statistics | 122건 (monthly+yearly 집계) |
| component_priority | 139건 (부품별 초기값) |

### Sprint 2 데이터 품질 수정 사항

1. **UNIQUE 인덱스**: `defect_location` + `chamber` 추가
   - Sprint 1: (SN, component, date, detail) → 837건
   - Sprint 2: (SN, component, location, chamber, date, detail) → 917건
   - 15건은 Excel 원본 완전 중복 (모든 컬럼 동일) → UNIQUE 정상 제거

2. **inspection_record dedup**: `S/N` → `(S/N, 검사일자)`
   - Sprint 1: 3,450건 (S/N only → 재검사 누락)
   - Sprint 2: 3,517건 (재검사 67건 복원)

---

**작성일**: 2026-03-04
**기준 데이터**: 2025年 검사 통합 Sheet [ 수정 금지 ].xlsm
**아키텍처**: defect(DL) + analytics(DW) 스키마 분리
**테스트**: 29개 전체 PASS
