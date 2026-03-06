"""
스키마 검증 테스트 (8개)
- defect 스키마 존재
- DL 테이블 수 (2개)
- 컬럼 수
- FK 부재
- UNIQUE 인덱스 동작
- UNIQUE 인덱스: location 다르면 별도 행
"""
import pytest
import psycopg2
import psycopg2.extras


def test_defect_schema_exists(db_cursor):
    """defect 스키마 존재 확인"""
    db_cursor.execute("""
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = 'defect'
    """)
    row = db_cursor.fetchone()
    assert row is not None, "defect 스키마가 존재하지 않습니다"


def test_defect_tables_count(db_cursor):
    """defect 스키마에 DL 2개 테이블 존재 (Sprint 2: DW 테이블 analytics로 이동)"""
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'defect'
          AND table_type = 'BASE TABLE'
    """)
    row = db_cursor.fetchone()
    count = row[0]
    assert count == 2, f"defect 스키마 테이블 수 기대값 2, 실제값 {count}"


def test_defect_record_columns(db_cursor):
    """defect_record 컬럼 24개 확인 (id 포함)"""
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = 'defect'
          AND table_name = 'defect_record'
    """)
    row = db_cursor.fetchone()
    count = row[0]
    assert count == 24, f"defect_record 컬럼 수 기대값 24, 실제값 {count}"


def test_inspection_record_columns(db_cursor):
    """inspection_record 컬럼 12개 확인 (id 포함)"""
    db_cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.columns
        WHERE table_schema = 'defect'
          AND table_name = 'inspection_record'
    """)
    row = db_cursor.fetchone()
    count = row[0]
    assert count == 12, f"inspection_record 컬럼 수 기대값 12, 실제값 {count}"


def test_no_fk_on_serial_number(db_cursor):
    """defect_record.serial_number에 FK 없음"""
    db_cursor.execute("""
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'defect'
          AND tc.table_name = 'defect_record'
          AND kcu.column_name = 'serial_number'
    """)
    rows = db_cursor.fetchall()
    assert len(rows) == 0, \
        f"defect_record.serial_number에 예상치 못한 FK가 존재합니다: {rows}"


def test_unique_index_defect_record(db_conn):
    """UNIQUE 인덱스 동작: 중복 INSERT → DO NOTHING (None 반환)

    UNIQUE INDEX: (serial_number, component_name, defect_location, chamber, occurrence_date, defect_detail)
    """
    cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    try:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.defect_record WHERE serial_number = 'TEST-DUPE'")
        db_conn.commit()

        # 1. 첫 INSERT → id 반환
        cur.execute("""
            INSERT INTO defect.defect_record (
                serial_number, product_code, model_name,
                supplier_mechanical, supplier_electrical,
                chamber, component_name, component_code,
                defect_location, defect_detail, action_detail,
                defect_category_major, defect_category_minor,
                detection_stage, action_person_outsource,
                worker, occurrence_date, remarks,
                source_worksheet, source_file_name,
                etl_loaded_at, created_at, updated_at
            ) VALUES (
                'TEST-DUPE', 'TEST-CODE', 'TEST-MODEL',
                NULL, NULL,
                'Left', 'TEST-COMP', NULL,
                'TEST-LOC', 'TEST-DETAIL', NULL,
                '기타', '기타',
                '가압검사', NULL,
                NULL, '2025-01-15', NULL,
                '가압 불량내역', 'test.xlsx',
                NOW(), NOW(), NOW()
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        first_result = cur.fetchone()
        db_conn.commit()

        # 2. 동일 데이터 재INSERT → ON CONFLICT DO NOTHING → None
        cur.execute("""
            INSERT INTO defect.defect_record (
                serial_number, product_code, model_name,
                supplier_mechanical, supplier_electrical,
                chamber, component_name, component_code,
                defect_location, defect_detail, action_detail,
                defect_category_major, defect_category_minor,
                detection_stage, action_person_outsource,
                worker, occurrence_date, remarks,
                source_worksheet, source_file_name,
                etl_loaded_at, created_at, updated_at
            ) VALUES (
                'TEST-DUPE', 'TEST-CODE', 'TEST-MODEL',
                NULL, NULL,
                'Left', 'TEST-COMP', NULL,
                'TEST-LOC', 'TEST-DETAIL', NULL,
                '기타', '기타',
                '가압검사', NULL,
                NULL, '2025-01-15', NULL,
                '가압 불량내역', 'test.xlsx',
                NOW(), NOW(), NOW()
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        second_result = cur.fetchone()
        db_conn.commit()

        assert second_result is None, \
            f"중복 INSERT가 DO NOTHING 되어야 하는데 id가 반환됨: {second_result}"

    finally:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.defect_record WHERE serial_number = 'TEST-DUPE'")
        db_conn.commit()
        cur.close()


def test_unique_index_allows_different_location(db_conn):
    """UNIQUE 인덱스: location/chamber 다르면 별도 행으로 INSERT 성공

    Sprint 2: defect_location + chamber 추가로 Chamber/위치 다른 불량 구분
    """
    cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    try:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.defect_record WHERE serial_number = 'TEST-LOC'")
        db_conn.commit()

        # 1. Left chamber INSERT
        cur.execute("""
            INSERT INTO defect.defect_record (
                serial_number, model_name, component_name,
                chamber, defect_location, defect_detail,
                occurrence_date, source_worksheet, source_file_name
            ) VALUES (
                'TEST-LOC', 'TEST-MODEL', 'TEST-COMP',
                'Left', 'LOC-A', 'SAME-DETAIL',
                '2025-01-15', 'test', 'test.xlsx'
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        first_id = cur.fetchone()
        db_conn.commit()

        # 2. Right chamber (same location) → 별도 행
        cur.execute("""
            INSERT INTO defect.defect_record (
                serial_number, model_name, component_name,
                chamber, defect_location, defect_detail,
                occurrence_date, source_worksheet, source_file_name
            ) VALUES (
                'TEST-LOC', 'TEST-MODEL', 'TEST-COMP',
                'Right', 'LOC-A', 'SAME-DETAIL',
                '2025-01-15', 'test', 'test.xlsx'
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        second_id = cur.fetchone()
        db_conn.commit()

        # 3. Same chamber, different location → 별도 행
        cur.execute("""
            INSERT INTO defect.defect_record (
                serial_number, model_name, component_name,
                chamber, defect_location, defect_detail,
                occurrence_date, source_worksheet, source_file_name
            ) VALUES (
                'TEST-LOC', 'TEST-MODEL', 'TEST-COMP',
                'Left', 'LOC-B', 'SAME-DETAIL',
                '2025-01-15', 'test', 'test.xlsx'
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        third_id = cur.fetchone()
        db_conn.commit()

        assert first_id is not None, "첫 번째 INSERT 실패"
        assert second_id is not None, "다른 Chamber INSERT가 실패 (별도 행이어야 함)"
        assert third_id is not None, "다른 location INSERT가 실패 (별도 행이어야 함)"

        # 총 3건 확인
        cur.execute("SELECT COUNT(*) FROM defect.defect_record WHERE serial_number = 'TEST-LOC'")
        count = cur.fetchone()[0]
        assert count == 3, f"Chamber/location 다른 3건이 존재해야 하는데 {count}건"

    finally:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.defect_record WHERE serial_number = 'TEST-LOC'")
        db_conn.commit()
        cur.close()


def test_unique_index_inspection_record(db_conn):
    """inspection_record UNIQUE 인덱스 동작

    UNIQUE INDEX: (serial_number, inspection_type, inspection_date)
    """
    cur = db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    try:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.inspection_record WHERE serial_number = 'TEST-INSP-DUPE'")
        db_conn.commit()

        # 1. 첫 INSERT → id 반환
        cur.execute("""
            INSERT INTO defect.inspection_record (
                sales_order, product_code, serial_number,
                customer, model,
                inspection_date, inspection_type,
                source_worksheet, source_file_name,
                etl_loaded_at, created_at
            ) VALUES (
                'SO-TEST', 'TEST-CODE', 'TEST-INSP-DUPE',
                'TEST-CUSTOMER', 'TEST-MODEL',
                '2025-01-15', '가압검사',
                '가압 검사', 'test.xlsx',
                NOW(), NOW()
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        first_result = cur.fetchone()
        db_conn.commit()

        # 2. 동일 데이터 재INSERT → ON CONFLICT DO NOTHING → None
        cur.execute("""
            INSERT INTO defect.inspection_record (
                sales_order, product_code, serial_number,
                customer, model,
                inspection_date, inspection_type,
                source_worksheet, source_file_name,
                etl_loaded_at, created_at
            ) VALUES (
                'SO-TEST', 'TEST-CODE', 'TEST-INSP-DUPE',
                'TEST-CUSTOMER', 'TEST-MODEL',
                '2025-01-15', '가압검사',
                '가압 검사', 'test.xlsx',
                NOW(), NOW()
            )
            ON CONFLICT DO NOTHING
            RETURNING id
        """)
        second_result = cur.fetchone()
        db_conn.commit()

        assert second_result is None, \
            f"inspection_record 중복 INSERT가 DO NOTHING 되어야 하는데 id가 반환됨: {second_result}"

    finally:
        db_conn.rollback()
        cur.execute("DELETE FROM defect.inspection_record WHERE serial_number = 'TEST-INSP-DUPE'")
        db_conn.commit()
        cur.close()
