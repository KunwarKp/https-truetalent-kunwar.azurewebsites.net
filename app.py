import os
from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.', template_folder='.')
CORS(app)

@app.route('/')
def index():
    """Serve the main landing page of EcoSync."""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    """Serve static asset files (styles, scripts)."""
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
