"""
ETL 정합성 테스트 (18개)

Q1 기준값 (2025-01~03) — Sprint 2 실측값:
- 전체 불량: 164건
- 가압 불량내역 149, 제조품질 불량내역 15  (source_worksheet 기준)
- 검출단계: 가압검사 149, 제조품질검사 15
- 모델 TOP1: GAIA-I DUAL (60건)
- 대분류 TOP1: 기구작업불량 (90건)
- 중분류 TOP1: Leak (143건)
- 가압검사: 417건/412대/617CH
- 제조품질검사: 405건/402대/606CH
- 01월 불량률: 0.70%
- 02월 불량률: 3.70% (3.5~4.0% 범위)
- 03월 불량률: 1.36% (1.0~2.0% 범위)

연간 기준값 (2025 전체) — Sprint 2 실측값:
- 전체 불량: 917건 (가압 543 + 제조품질 365 + 공정 9)
- inspection_record: 3517건
- 가압 CH: 2737, 제조품질 CH: 2576
"""
import pytest
import psycopg2


Q1_START = '2025-01-01'
Q1_END   = '2025-03-31'
YEAR_START = '2025-01-01'
YEAR_END   = '2025-12-31'


def _rollback_if_needed(db_cursor, db_conn):
    """트랜잭션 오류 상태이면 롤백"""
    if db_conn.get_transaction_status() != 0:
        db_conn.rollback()


# ============================================================
# Q1 테스트 (Sprint 1 → Sprint 2 실측값 갱신)
# ============================================================

def test_q1_defect_total(db_cursor, db_conn):
    """1분기 defect 전체 건수 = 164"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
    """, (Q1_START, Q1_END))
    count = db_cursor.fetchone()[0]
    assert count == 164, f"Q1 전체 불량 건수 기대 164, 실제 {count}"


def test_q1_defect_by_worksheet(db_cursor, db_conn):
    """가압 불량내역 149, 제조품질 불량내역 15 (source_worksheet 기준)"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT source_worksheet, COUNT(*) as cnt
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
        GROUP BY source_worksheet
        ORDER BY source_worksheet
    """, (Q1_START, Q1_END))
    rows = {row[0]: row[1] for row in db_cursor.fetchall()}

    assert rows.get('가압 불량내역') == 149, \
        f"가압 불량내역 기대 149, 실제 {rows.get('가압 불량내역')}"
    assert rows.get('제조품질 불량내역') == 15, \
        f"제조품질 불량내역 기대 15, 실제 {rows.get('제조품질 불량내역')}"


def test_q1_defect_by_stage(db_cursor, db_conn):
    """가압검사 149, 제조품질검사 15 (detection_stage 기준)"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT detection_stage, COUNT(*) as cnt
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
        GROUP BY detection_stage
        ORDER BY detection_stage
    """, (Q1_START, Q1_END))
    rows = {row[0]: row[1] for row in db_cursor.fetchall()}

    assert rows.get('가압검사') == 149, \
        f"가압검사 기대 149, 실제 {rows.get('가압검사')}"
    assert rows.get('제조품질검사') == 15, \
        f"제조품질검사 기대 15, 실제 {rows.get('제조품질검사')}"


def test_q1_model_top1(db_cursor, db_conn):
    """모델 TOP1 = GAIA-I DUAL (60건)"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT model_name, COUNT(*) as cnt
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
        GROUP BY model_name
        ORDER BY cnt DESC
        LIMIT 1
    """, (Q1_START, Q1_END))
    row = db_cursor.fetchone()
    assert row is not None, "결과가 없습니다"
    model, cnt = row[0], row[1]
    assert model == 'GAIA-I DUAL', f"TOP1 모델 기대 'GAIA-I DUAL', 실제 '{model}'"
    assert cnt == 60, f"GAIA-I DUAL 건수 기대 60, 실제 {cnt}"


def test_q1_category_major_top1(db_cursor, db_conn):
    """대분류 TOP1 = 기구작업불량 (90건)"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT defect_category_major, COUNT(*) as cnt
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
        GROUP BY defect_category_major
        ORDER BY cnt DESC
        LIMIT 1
    """, (Q1_START, Q1_END))
    row = db_cursor.fetchone()
    assert row is not None, "결과가 없습니다"
    major, cnt = row[0], row[1]
    assert major == '기구작업불량', f"대분류 TOP1 기대 '기구작업불량', 실제 '{major}'"
    assert cnt == 90, f"기구작업불량 건수 기대 90, 실제 {cnt}"


def test_q1_category_minor_top1(db_cursor, db_conn):
    """중분류 TOP1 = Leak (143건)"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT defect_category_minor, COUNT(*) as cnt
        FROM defect.defect_record
        WHERE occurrence_date BETWEEN %s AND %s
        GROUP BY defect_category_minor
        ORDER BY cnt DESC
        LIMIT 1
    """, (Q1_START, Q1_END))
    row = db_cursor.fetchone()
    assert row is not None, "결과가 없습니다"
    minor, cnt = row[0], row[1]
    assert minor == 'Leak', f"중분류 TOP1 기대 'Leak', 실제 '{minor}'"
    assert cnt == 143, f"Leak 건수 기대 143, 실제 {cnt}"


def test_q1_inspection_pressure(db_cursor, db_conn):
    """가압검사 412대, 617CH"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT
            COUNT(DISTINCT serial_number) as unit_count,
            SUM(CASE WHEN model LIKE '%%DUAL%%' THEN 2 ELSE 1 END) as ch_count
        FROM defect.inspection_record
        WHERE inspection_type = '가압검사'
          AND inspection_date BETWEEN %s AND %s
    """, (Q1_START, Q1_END))
    row = db_cursor.fetchone()
    assert row is not None, "결과가 없습니다"
    units, ch = row[0], row[1]
    assert units == 412, f"가압검사 대수 기대 412, 실제 {units}"
    assert ch == 617, f"가압검사 CH 기대 617, 실제 {ch}"


def test_q1_inspection_quality(db_cursor, db_conn):
    """제조품질검사 402대, 606CH"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT
            COUNT(DISTINCT serial_number) as unit_count,
            SUM(CASE WHEN model LIKE '%%DUAL%%' THEN 2 ELSE 1 END) as ch_count
        FROM defect.inspection_record
        WHERE inspection_type = '제조품질검사'
          AND inspection_date BETWEEN %s AND %s
    """, (Q1_START, Q1_END))
    row = db_cursor.fetchone()
    assert row is not None, "결과가 없습니다"
    units, ch = row[0], row[1]
    assert units == 402, f"제조품질검사 대수 기대 402, 실제 {units}"
    assert ch == 606, f"제조품질검사 CH 기대 606, 실제 {ch}"


def _get_defect_rate_by_month(db_cursor, db_conn, month_start, month_end):
    """수정된 불량률 쿼리: 서브쿼리로 동월 매칭"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT
            ROUND(
                COUNT(DISTINCT dr.serial_number)::numeric /
                NULLIF(SUM(CASE WHEN ir.model LIKE '%%DUAL%%' THEN 2 ELSE 1 END), 0) * 100,
                2
            ) as defect_rate
        FROM defect.inspection_record ir
        LEFT JOIN (
            SELECT DISTINCT serial_number, DATE_TRUNC('month', occurrence_date) as defect_month
            FROM defect.defect_record
            WHERE detection_stage = '제조품질검사'
        ) dr ON ir.serial_number = dr.serial_number
            AND dr.defect_month = DATE_TRUNC('month', ir.inspection_date)
        WHERE ir.inspection_type = '제조품질검사'
          AND ir.inspection_date BETWEEN %s AND %s
    """, (month_start, month_end))
    row = db_cursor.fetchone()
    return float(row[0]) if row and row[0] is not None else None


def test_q1_defect_rate_jan(db_cursor, db_conn):
    """01월 불량률 = 0.70%"""
    rate = _get_defect_rate_by_month(db_cursor, db_conn, '2025-01-01', '2025-01-31')
    assert rate is not None, "01월 불량률 계산 실패"
    assert rate == 0.70, f"01월 불량률 기대 0.70%, 실제 {rate}%"


def test_q1_defect_rate_feb(db_cursor, db_conn):
    """02월 불량률 ~ 3.70% (3.5~4.0% 범위 확인)"""
    rate = _get_defect_rate_by_month(db_cursor, db_conn, '2025-02-01', '2025-02-28')
    assert rate is not None, "02월 불량률 계산 실패"
    assert 3.5 <= rate <= 4.0, \
        f"02월 불량률 기대 3.5~4.0% 범위, 실제 {rate}%"


def test_q1_defect_rate_mar(db_cursor, db_conn):
    """03월 불량률 ~ 1.36% (1.0~2.0% 범위 확인)"""
    rate = _get_defect_rate_by_month(db_cursor, db_conn, '2025-03-01', '2025-03-31')
    assert rate is not None, "03월 불량률 계산 실패"
    assert 1.0 <= rate <= 2.0, \
        f"03월 불량률 기대 1.0~2.0% 범위, 실제 {rate}%"


def test_serial_number_not_null(db_cursor, db_conn):
    """serial_number NULL 건수 = 0"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM defect.defect_record
        WHERE serial_number IS NULL
    """)
    count = db_cursor.fetchone()[0]
    assert count == 0, f"serial_number NULL 건수 기대 0, 실제 {count}"


# ============================================================
# 연간 테스트 (Sprint 2 신규)
# ============================================================

def test_annual_defect_total(db_cursor, db_conn):
    """연간 defect 전체 건수 = 917"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("SELECT COUNT(*) FROM defect.defect_record")
    count = db_cursor.fetchone()[0]
    assert count == 917, f"연간 전체 불량 건수 기대 917, 실제 {count}"


def test_annual_defect_by_stage(db_cursor, db_conn):
    """연간 검출단계별: 가압검사 543, 제조품질검사 365, 공정검사 9"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT detection_stage, COUNT(*) as cnt
        FROM defect.defect_record
        GROUP BY detection_stage
        ORDER BY cnt DESC
    """)
    rows = {row[0]: row[1] for row in db_cursor.fetchall()}
    assert rows.get('가압검사') == 543, f"가압검사 기대 543, 실제 {rows.get('가압검사')}"
    assert rows.get('제조품질검사') == 365, f"제조품질검사 기대 365, 실제 {rows.get('제조품질검사')}"
    assert rows.get('공정검사') == 9, f"공정검사 기대 9, 실제 {rows.get('공정검사')}"


def test_annual_inspection_total(db_cursor, db_conn):
    """연간 inspection_record = 3517건"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("SELECT COUNT(*) FROM defect.inspection_record")
    count = db_cursor.fetchone()[0]
    assert count == 3517, f"연간 검사 실적 기대 3517, 실제 {count}"


def test_annual_inspection_ch(db_cursor, db_conn):
    """연간 가압 CH ~2700-2800, 제조품질 CH ~2500-2600"""
    _rollback_if_needed(db_cursor, db_conn)
    db_cursor.execute("""
        SELECT
            inspection_type,
            SUM(CASE WHEN model LIKE '%%DUAL%%' THEN 2 ELSE 1 END) as ch
        FROM defect.inspection_record
        GROUP BY inspection_type
        ORDER BY inspection_type
    """)
    rows = {row[0]: row[1] for row in db_cursor.fetchall()}

    gap_ch = rows.get('가압검사', 0)
    mfq_ch = rows.get('제조품질검사', 0)

    assert 2700 <= gap_ch <= 2800, f"가압 CH 기대 2700~2800, 실제 {gap_ch}"
    assert 2500 <= mfq_ch <= 2600, f"제조품질 CH 기대 2500~2600, 실제 {mfq_ch}"
