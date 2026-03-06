"""
Defect Schema Migration + 2025 Excel ETL 실행 스크립트
로컬 환경에서 실행: python run_migration_and_etl.py

1단계: Railway DB에 defect 스키마 생성 (007 migration — DL)
2단계: Railway DB에 analytics 스키마 생성 (008 migration — DW)
3단계: Excel 파일 (가압 불량내역 + 제조품질 불량내역) → defect.defect_record 적재
4단계: 검사 실적 → defect.inspection_record 적재
5단계: DW 후처리 (analytics.defect_statistics, component_priority 집계)
6단계: 검증
"""

import psycopg2
import psycopg2.extras
import pandas as pd
import os
from datetime import datetime

# ============================================================
# Railway DB 접속 정보
# ============================================================
DATABASE_URL = "postgresql://postgres:aemQKKvZhddWGlLUsAghiWAlzFkoWugL@maglev.proxy.rlwy.net:38813/railway"

# Excel 파일 경로
EXCEL_FILENAME = "2025年 검사 통합 Sheet [ 수정 금지 ].xlsm"

# 불량내역 워크시트
DEFECT_WORKSHEETS = ["가압 불량내역", "제조품질 불량내역"]

# 검사 실적 워크시트 → inspection_type 매핑
INSPECTION_WORKSHEETS = {
    "가압 날짜별 실적": "가압검사",
    "제조품질 날짜별 실적": "제조품질검사",
}

# 검사 실적 Excel → DB 컬럼 매핑
INSPECTION_COLUMN_MAP = {
    "오더번호":   "sales_order",
    "품번":       "product_code",
    "S/N":       "serial_number",
    "고객사":     "customer",
    "MODEL":     "model",
    "검사일자":   "inspection_date",
}

# Excel → DB 컬럼 매핑 (No 제외, 나머지 전부)
COLUMN_MAP = {
    "제품S/N":       "serial_number",
    "제품코드":       "product_code",
    "제품명":         "model_name",
    "협력사(기구)명":  "supplier_mechanical",
    "협력사(전장)명":  "supplier_electrical",
    "Chamber":       "chamber",
    "부품명":         "component_name",
    "부품코드":       "component_code",
    "불량위치":       "defect_location",
    "상세불량내용":    "defect_detail",
    "상세조치내용":    "action_detail",
    "대분류":         "defect_category_major",
    "중분류":         "defect_category_minor",
    "검출단계":       "detection_stage",
    "조치자(외주)":    "action_person_outsource",
    "작업자":         "worker",
    "발생일":         "occurrence_date",
    "비고":           "remarks",
}


def run_migration(conn):
    """007 + 008 migration SQL 실행"""
    base_dir = os.path.dirname(__file__)
    migration_007 = os.path.join(base_dir, "migrations", "007_create_defect_schema.sql")
    migration_008 = os.path.join(base_dir, "migrations", "008_create_analytics_schema.sql")

    # DROP CASCADE: 매회 재생성 (Sprint 2 한정)
    try:
        drop_cur = conn.cursor()
        drop_cur.execute("DROP SCHEMA IF EXISTS analytics CASCADE;")
        drop_cur.execute("DROP SCHEMA IF EXISTS defect CASCADE;")
        drop_cur.close()
        conn.commit()
        print("  기존 defect + analytics 스키마 DROP 완료")
    except Exception as e:
        print(f"  DROP 실패 (무시): {e}")
        conn.rollback()

    from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    old_isolation_level = conn.isolation_level

    try:
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()

        # --- 007: defect (DL) ---
        with open(migration_007, "r", encoding="utf-8") as f:
            sql_007 = f.read()

        sql_clean_007 = _clean_sql(sql_007)
        cur.execute(sql_clean_007)
        print("  defect 스키마 생성 완료 (DL 2개 테이블)")

        # --- 008: analytics (DW) ---
        with open(migration_008, "r", encoding="utf-8") as f:
            sql_008 = f.read()

        sql_clean_008 = _clean_sql(sql_008)
        cur.execute(sql_clean_008)
        print("  analytics 스키마 생성 완료 (DW 4개 테이블)")

        cur.close()

    except Exception as e:
        print(f"  Migration 실패: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        conn.set_isolation_level(old_isolation_level)


def _clean_sql(sql: str) -> str:
    """SQL에서 BEGIN/COMMIT 및 단독 주석 라인 제거"""
    sql_lines = []
    in_function = False

    for line in sql.split('\n'):
        stripped = line.strip()
        if stripped in ('BEGIN;', 'COMMIT;'):
            continue
        if '$$' in line:
            in_function = not in_function
        if stripped.startswith('--') and not in_function:
            continue
        sql_lines.append(line)

    return '\n'.join(sql_lines)


def load_excel_to_db(conn, excel_path: str):
    """Excel 파일의 두 워크시트를 defect.defect_record에 적재

    워크시트: 가압 불량내역, 제조품질 불량내역
    ETL 규칙:
    - 첫 번째 행 NaN 제거 (dropna)
    - No/NO 컬럼 제외 (행번호)
    - 컬럼명 정규화 후 DB 매핑
    - 발생일 파싱 실패 행 스킵
    """
    file_basename = os.path.basename(excel_path)
    total_inserted = 0
    total_skipped = 0

    cur = conn.cursor()

    for sheet_name in DEFECT_WORKSHEETS:
        print(f"\n  워크시트: {sheet_name}")

        try:
            df = pd.read_excel(excel_path, sheet_name=sheet_name, engine="openpyxl")
        except Exception as e:
            print(f"  시트 읽기 실패: {e}")
            continue

        # 첫 번째 행 NaN 제거
        df = df.dropna(how='all')
        print(f"     원본: {len(df)}건 (NaN 행 제거 후)")

        # No/NO 컬럼 제거 (행번호)
        for col in ['No', 'NO']:
            if col in df.columns:
                df = df.drop(columns=[col])

        inserted = 0
        skipped = 0

        for idx, row in df.iterrows():
            # 발생일 파싱
            try:
                occurrence_date = pd.to_datetime(row.get("발생일")).date()
            except Exception:
                skipped += 1
                continue

            # Excel → DB 매핑
            data = {}
            for excel_col, db_col in COLUMN_MAP.items():
                val = row.get(excel_col)
                if pd.isna(val):
                    data[db_col] = None
                elif db_col == "occurrence_date":
                    data[db_col] = occurrence_date
                else:
                    data[db_col] = str(val).strip() if val is not None else None

            # 필수 NOT NULL 필드 체크 (매핑 후 실제 DB 값 기준)
            if not data.get("model_name"):
                skipped += 1
                continue
            if not data.get("defect_detail"):
                skipped += 1
                continue

            # 메타데이터 추가
            data["source_worksheet"] = sheet_name
            data["source_file_name"] = file_basename

            query = """
                INSERT INTO defect.defect_record (
                    serial_number, product_code, model_name,
                    supplier_mechanical, supplier_electrical, chamber,
                    component_name, component_code, defect_location,
                    defect_detail, action_detail,
                    defect_category_major, defect_category_minor,
                    detection_stage, action_person_outsource, worker,
                    occurrence_date, remarks,
                    source_worksheet, source_file_name
                )
                VALUES (
                    %(serial_number)s, %(product_code)s, %(model_name)s,
                    %(supplier_mechanical)s, %(supplier_electrical)s, %(chamber)s,
                    %(component_name)s, %(component_code)s, %(defect_location)s,
                    %(defect_detail)s, %(action_detail)s,
                    %(defect_category_major)s, %(defect_category_minor)s,
                    %(detection_stage)s, %(action_person_outsource)s, %(worker)s,
                    %(occurrence_date)s, %(remarks)s,
                    %(source_worksheet)s, %(source_file_name)s
                )
                ON CONFLICT DO NOTHING
                RETURNING id;
            """

            try:
                cur.execute("SAVEPOINT row_sp")
                cur.execute(query, data)
                result = cur.fetchone()
                if result:
                    inserted += 1
                else:
                    skipped += 1
                cur.execute("RELEASE SAVEPOINT row_sp")
            except Exception as e:
                cur.execute("ROLLBACK TO SAVEPOINT row_sp")
                print(f"     적재 실패 (행 {idx}): {e}")
                skipped += 1
                continue

        conn.commit()
        print(f"     {inserted}건 적재, {skipped}건 스킵")
        total_inserted += inserted
        total_skipped += skipped

    cur.close()
    print(f"\n  전체 ETL: {total_inserted}건 적재, {total_skipped}건 스킵")


def load_inspection_to_db(conn, excel_path: str):
    """검사 실적 시트를 defect.inspection_record에 적재

    워크시트: 가압 날짜별 실적, 제조품질 날짜별 실적
    ETL 규칙:
    - (S/N, 검사일자) 기준 deduplicate (재검사 허용)
    - 필수: S/N, MODEL, 검사일자
    """
    file_basename = os.path.basename(excel_path)
    total_inserted = 0
    total_skipped = 0

    cur = conn.cursor()

    for sheet_name, inspection_type in INSPECTION_WORKSHEETS.items():
        print(f"\n  워크시트: {sheet_name} -> {inspection_type}")

        try:
            df = pd.read_excel(excel_path, sheet_name=sheet_name, engine="openpyxl")
        except Exception as e:
            print(f"  시트 읽기 실패: {e}")
            continue

        # NaN 행 제거
        df = df.dropna(how='all')
        original_count = len(df)

        # (S/N, 검사일자) 기준 deduplicate (재검사 허용)
        df = df.drop_duplicates(subset=['S/N', '검사일자'], keep='first')
        print(f"     원본: {original_count}건 -> (S/N, 검사일자) 중복 제거 후: {len(df)}건")

        inserted = 0
        skipped = 0

        for idx, row in df.iterrows():
            # 필수 필드 체크
            sn = row.get("S/N")
            model = row.get("MODEL")
            inspection_date_val = row.get("검사일자")

            if pd.isna(sn) or pd.isna(model):
                skipped += 1
                continue

            try:
                inspection_date = pd.to_datetime(inspection_date_val).date()
            except Exception:
                skipped += 1
                continue

            # Excel → DB 매핑
            data = {}
            for excel_col, db_col in INSPECTION_COLUMN_MAP.items():
                val = row.get(excel_col)
                if pd.isna(val):
                    data[db_col] = None
                elif db_col == "inspection_date":
                    data[db_col] = inspection_date
                else:
                    data[db_col] = str(val).strip()

            # 메타데이터
            data["inspection_type"] = inspection_type
            data["source_worksheet"] = sheet_name
            data["source_file_name"] = file_basename

            query = """
                INSERT INTO defect.inspection_record (
                    sales_order, product_code, serial_number,
                    customer, model, inspection_date, inspection_type,
                    source_worksheet, source_file_name
                )
                VALUES (
                    %(sales_order)s, %(product_code)s, %(serial_number)s,
                    %(customer)s, %(model)s, %(inspection_date)s, %(inspection_type)s,
                    %(source_worksheet)s, %(source_file_name)s
                )
                ON CONFLICT DO NOTHING
                RETURNING id;
            """

            try:
                cur.execute("SAVEPOINT row_sp")
                cur.execute(query, data)
                result = cur.fetchone()
                if result:
                    inserted += 1
                else:
                    skipped += 1
                cur.execute("RELEASE SAVEPOINT row_sp")
            except Exception as e:
                cur.execute("ROLLBACK TO SAVEPOINT row_sp")
                print(f"     적재 실패 (행 {idx}): {e}")
                skipped += 1
                continue

        conn.commit()
        print(f"     {inserted}건 적재, {skipped}건 스킵")
        total_inserted += inserted
        total_skipped += skipped

    cur.close()
    print(f"\n  검사 실적 ETL: {total_inserted}건 적재, {total_skipped}건 스킵")


def populate_analytics(conn):
    """DW 후처리: DL 데이터 기반으로 analytics 스키마 집계 테이블 채움

    - defect_statistics: monthly/yearly 집계
    - component_priority: GROUP BY component_name 초기값
    - defect_keyword, ml_prediction: 테이블만 생성 (데이터 스킵)
    """
    cur = conn.cursor()

    # --- defect_statistics: monthly 집계 (전체) ---
    print("\n  defect_statistics: 월별 집계...")
    cur.execute("""
        INSERT INTO analytics.defect_statistics (
            aggregation_period, period_start_date, period_end_date,
            model_name, component_name, defect_category_major,
            defect_count, inspection_count, defect_rate
        )
        SELECT
            'monthly',
            DATE_TRUNC('month', dr.occurrence_date)::date,
            (DATE_TRUNC('month', dr.occurrence_date) + INTERVAL '1 month' - INTERVAL '1 day')::date,
            NULL, NULL, NULL,
            COUNT(*),
            NULL,
            NULL
        FROM defect.defect_record dr
        GROUP BY DATE_TRUNC('month', dr.occurrence_date)
        ON CONFLICT DO NOTHING;
    """)
    monthly_count = cur.rowcount
    conn.commit()
    print(f"     monthly: {monthly_count}건")

    # --- defect_statistics: yearly 집계 (전체) ---
    cur.execute("""
        INSERT INTO analytics.defect_statistics (
            aggregation_period, period_start_date, period_end_date,
            model_name, component_name, defect_category_major,
            defect_count, inspection_count, defect_rate
        )
        SELECT
            'yearly',
            DATE_TRUNC('year', dr.occurrence_date)::date,
            (DATE_TRUNC('year', dr.occurrence_date) + INTERVAL '1 year' - INTERVAL '1 day')::date,
            NULL, NULL, NULL,
            COUNT(*),
            NULL,
            NULL
        FROM defect.defect_record dr
        GROUP BY DATE_TRUNC('year', dr.occurrence_date)
        ON CONFLICT DO NOTHING;
    """)
    yearly_count = cur.rowcount
    conn.commit()
    print(f"     yearly: {yearly_count}건")

    # --- defect_statistics: monthly 모델별 집계 ---
    cur.execute("""
        INSERT INTO analytics.defect_statistics (
            aggregation_period, period_start_date, period_end_date,
            model_name, component_name, defect_category_major,
            defect_count, inspection_count, defect_rate
        )
        SELECT
            'monthly',
            DATE_TRUNC('month', dr.occurrence_date)::date,
            (DATE_TRUNC('month', dr.occurrence_date) + INTERVAL '1 month' - INTERVAL '1 day')::date,
            dr.model_name, NULL, NULL,
            COUNT(*),
            NULL,
            NULL
        FROM defect.defect_record dr
        GROUP BY DATE_TRUNC('month', dr.occurrence_date), dr.model_name
        ON CONFLICT DO NOTHING;
    """)
    model_monthly = cur.rowcount
    conn.commit()
    print(f"     monthly (모델별): {model_monthly}건")

    # --- component_priority: 초기값 ---
    print("\n  component_priority: 초기값 생성...")
    cur.execute("""
        INSERT INTO analytics.component_priority (
            component_name, priority,
            total_defect_count, last_defect_date
        )
        SELECT
            component_name,
            CASE
                WHEN COUNT(*) >= 50 THEN 'CRITICAL'
                WHEN COUNT(*) >= 20 THEN 'HIGH'
                WHEN COUNT(*) >= 5  THEN 'MEDIUM'
                ELSE 'LOW'
            END,
            COUNT(*),
            MAX(occurrence_date)
        FROM defect.defect_record
        WHERE component_name IS NOT NULL
        GROUP BY component_name
        ON CONFLICT (component_name) DO NOTHING;
    """)
    comp_count = cur.rowcount
    conn.commit()
    print(f"     {comp_count}건")

    # defect_keyword, ml_prediction: 테이블만 생성, 데이터 스킵
    print("\n  defect_keyword: 테이블만 생성 (데이터 스킵)")
    print("  ml_prediction: 테이블만 생성 (데이터 스킵)")

    cur.close()


def verify_data(conn):
    """적재 결과 확인"""
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    cur.execute("SELECT COUNT(*) FROM defect.defect_record;")
    total = cur.fetchone()[0]

    cur.execute("""
        SELECT source_worksheet, COUNT(*) as cnt
        FROM defect.defect_record
        GROUP BY source_worksheet
        ORDER BY cnt DESC;
    """)
    by_sheet = cur.fetchall()

    cur.execute("""
        SELECT model_name, COUNT(*) as cnt
        FROM defect.defect_record
        GROUP BY model_name
        ORDER BY cnt DESC
        LIMIT 5;
    """)
    top_models = cur.fetchall()

    cur.execute("""
        SELECT detection_stage, COUNT(*) as cnt
        FROM defect.defect_record
        GROUP BY detection_stage
        ORDER BY cnt DESC;
    """)
    by_stage = cur.fetchall()

    cur.execute("""
        SELECT MIN(occurrence_date) as min_date, MAX(occurrence_date) as max_date
        FROM defect.defect_record;
    """)
    date_range = cur.fetchone()

    print(f"\n  === DL 적재 결과 ===")
    print(f"  전체: {total}건")
    print(f"  기간: {date_range['min_date']} ~ {date_range['max_date']}")
    print(f"\n  워크시트별:")
    for row in by_sheet:
        print(f"    {row['source_worksheet']}: {row['cnt']}건")
    print(f"\n  검출단계별:")
    for row in by_stage:
        print(f"    {row['detection_stage']}: {row['cnt']}건")
    print(f"\n  모델별 TOP 5:")
    for row in top_models:
        print(f"    {row['model_name']}: {row['cnt']}건")

    # 검사 실적 검증
    cur.execute("SELECT COUNT(*) FROM defect.inspection_record;")
    insp_total = cur.fetchone()[0]

    if insp_total > 0:
        cur.execute("""
            SELECT inspection_type, COUNT(*) as cnt,
                   SUM(CASE WHEN model LIKE '%%DUAL%%' THEN 2 ELSE 1 END) as total_ch
            FROM defect.inspection_record
            GROUP BY inspection_type
            ORDER BY cnt DESC;
        """)
        by_type = cur.fetchall()

        print(f"\n  검사 실적:")
        print(f"  전체: {insp_total}건")
        for row in by_type:
            print(f"    {row['inspection_type']}: {row['cnt']}대 ({row['total_ch']} CH)")

    # DW 검증
    print(f"\n  === DW 적재 결과 ===")

    cur.execute("SELECT COUNT(*) FROM analytics.defect_statistics;")
    stats_total = cur.fetchone()[0]
    print(f"  defect_statistics: {stats_total}건")

    cur.execute("SELECT COUNT(*) FROM analytics.component_priority;")
    comp_total = cur.fetchone()[0]
    print(f"  component_priority: {comp_total}건")

    cur.execute("SELECT COUNT(*) FROM analytics.defect_keyword;")
    kw_total = cur.fetchone()[0]
    print(f"  defect_keyword: {kw_total}건 (빈 테이블)")

    cur.execute("SELECT COUNT(*) FROM analytics.ml_prediction;")
    ml_total = cur.fetchone()[0]
    print(f"  ml_prediction: {ml_total}건 (빈 테이블)")

    cur.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Defect Schema Migration + Excel ETL (Sprint 2)")
    print("=" * 60)

    # 1단계: DB 접속
    print("\n1) Railway DB 접속...")
    conn = psycopg2.connect(DATABASE_URL)
    print("  접속 성공")

    # 2단계: Migration 실행 (007 DL + 008 DW)
    print("\n2) 스키마 생성 (007 DL + 008 DW)...")
    run_migration(conn)

    # 3단계: Excel ETL (DL)
    print("\n3) Excel -> defect.defect_record 적재...")
    excel_path = os.path.join(os.path.dirname(__file__), EXCEL_FILENAME)

    if not os.path.exists(excel_path):
        # 대체 경로 탐색
        for root, dirs, files in os.walk(os.path.dirname(__file__)):
            for f in files:
                if f.endswith('.xlsm') and '검사' in f and '통합' in f:
                    excel_path = os.path.join(root, f)
                    break

    if os.path.exists(excel_path):
        print(f"  파일: {os.path.basename(excel_path)}")
        load_excel_to_db(conn, excel_path)

        # 4단계: 검사 실적 ETL
        print("\n4) 검사 실적 -> defect.inspection_record 적재...")
        load_inspection_to_db(conn, excel_path)

        # 5단계: DW 후처리
        print("\n5) DW 후처리 (analytics 집계)...")
        populate_analytics(conn)

        # 6단계: 검증
        print("\n6) 검증...")
        verify_data(conn)
    else:
        print(f"  Excel 파일 없음")
        print(f"  -> '{EXCEL_FILENAME}' 파일을 Defect/ 폴더에 넣어주세요")

    conn.close()
    print("\n완료!")
