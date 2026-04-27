from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from extensions import db
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///reviews.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, origins=['http://localhost:5173', 'https://*.vercel.app'])
    db.init_app(app)

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

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5002)
app = create_app()
