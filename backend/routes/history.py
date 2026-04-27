from flask import Blueprint, jsonify, request
from extensions import db
from models.analysis import Analysis

history_bp = Blueprint('history', __name__)

@history_bp.route('/api/history', methods=['GET'])
def get_history():
    page = request.args.get('page', 1, type=int)
    analyses = Analysis.query.order_by(Analysis.created_at.desc()).paginate(page=page, per_page=10)
    return jsonify({
        'items': [{
            'id': a.id,
            'product_name': a.product_name,
            'platform': a.platform,
            'mode': a.mode,
            'sentiment_score': a.sentiment_score,
            'verdict_decision': a.verdict_decision,
            'created_at': a.created_at.isoformat()
        } for a in analyses.items],
        'total': analyses.total,
        'pages': analyses.pages
    })

@history_bp.route('/api/history/<id>', methods=['DELETE'])
def delete_analysis(id):
    analysis = Analysis.query.get_or_404(id)
    db.session.delete(analysis)
    db.session.commit()
    return jsonify({'deleted': True})
