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
