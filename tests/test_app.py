import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    """Verify that the EcoSync home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"EcoSync" in response.data or b"Carbon" in response.data

def test_static_style(client):
    """Verify that style.css resolves properly."""
    response = client.get('/style.css')
    assert response.status_code == 200

def test_static_script(client):
    """Verify that main.js resolves properly."""
    response = client.get('/main.js')
    assert response.status_code == 200

def test_static_tests(client):
    """Verify that tests.js resolves properly."""
    response = client.get('/tests.js')
    assert response.status_code == 200
