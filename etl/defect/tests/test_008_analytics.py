"""
analytics 스키마 검증 테스트 (5개)
- analytics 스키마 존재
- DW 테이블 4개
- defect_statistics 데이터 > 0
- component_priority 데이터 > 0
- cross-schema JOIN 동작
"""
import pytest
import psycopg2
import psycopg2.extras


def test_analytics_schema_exists(db_cursor):
    """analytics 스키마 존재 확인"""
    db_cursor.execute("""
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'analytics'
    """)
    row = db_cursor.fetchone()
    assert row is not None, "analytics 스키마가 존재하지 않습니다"


def test_analytics_tables_count(db_cursor):
    """analytics 스키마에 DW 4개 테이블 존재"""
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'analytics'
          AND table_type = 'BASE TABLE'
    """)
    row = db_cursor.fetchone()
    count = row[0]
    assert count == 4, f"analytics 스키마 테이블 수 기대값 4, 실제값 {count}"


def test_defect_statistics_has_data(db_cursor, db_conn):
    """defect_statistics에 집계 데이터 존재"""
    if db_conn.get_transaction_status() != 0:
        db_conn.rollback()
    db_cursor.execute("SELECT COUNT(*) FROM analytics.defect_statistics")
    count = db_cursor.fetchone()[0]
    assert count > 0, f"defect_statistics 데이터 0건 (기대 > 0)"


def test_component_priority_has_data(db_cursor, db_conn):
    """component_priority에 초기값 존재"""
    if db_conn.get_transaction_status() != 0:
        db_conn.rollback()
    db_cursor.execute("SELECT COUNT(*) FROM analytics.component_priority")
    count = db_cursor.fetchone()[0]
    assert count > 0, f"component_priority 데이터 0건 (기대 > 0)"


def test_cross_schema_join(db_cursor, db_conn):
    """cross-schema JOIN: analytics.defect_statistics ↔ defect.defect_record"""
    if db_conn.get_transaction_status() != 0:
        db_conn.rollback()
    db_cursor.execute("""
        SELECT ds.aggregation_period, ds.defect_count, COUNT(dr.id) as matched
        FROM analytics.defect_statistics ds
        LEFT JOIN defect.defect_record dr
            ON dr.occurrence_date BETWEEN ds.period_start_date AND ds.period_end_date
        WHERE ds.aggregation_period = 'yearly'
          AND ds.model_name IS NULL
        GROUP BY ds.aggregation_period, ds.defect_count
        LIMIT 1
    """)
    row = db_cursor.fetchone()
    assert row is not None, "cross-schema JOIN 결과 없음"
    assert row['matched'] > 0, "cross-schema JOIN matched 0건"
    assert row['defect_count'] > 0, "defect_statistics yearly 집계 0건"
