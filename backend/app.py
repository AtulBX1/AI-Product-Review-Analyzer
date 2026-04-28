print("STARTING APP...")
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db
load_dotenv()

def create_app():
    print("CREATING APP...")
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///reviews.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://ai-product-review-analyzer-a607.onrender.com"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    db.init_app(app)

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin", "")
        allowed = [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://ai-product-review-analyzer-a607.onrender.com"
        ]
        if origin in allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.route("/api/<path:path>", methods=["OPTIONS"])
    def handle_options(path):
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "https://ai-product-review-analyzer-a607.onrender.com"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    from routes.analyze import analyze_bp
    from routes.history import history_bp
    from routes.compare import compare_bp
    from routes.export import export_bp
    from routes.catalog import catalog_bp

    app.register_blueprint(analyze_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(compare_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(catalog_bp)

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'model': 'llama-3.3-70b-versatile'}

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5002)


