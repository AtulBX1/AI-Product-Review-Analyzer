from flask import Blueprint, request, jsonify
from extensions import db
from models.analysis import Analysis
from backend.utils.ai_client import AIClient
import json

analyze_bp = Blueprint('analyze', __name__)
client = AIClient()

@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.json
    product = data.get('product', '').strip()
    platform = data.get('platform', 'all')
    mode = data.get('mode', 'advanced')
    user_context = data.get('user_context', None)

    if not product or len(product) < 3 or len(product) > 200:
        return jsonify({'error': 'Product name must be between 3 and 200 characters'}), 400

    if mode not in ['basic', 'advanced']:
        mode = 'advanced'

    if platform not in ['all', 'amazon', 'flipkart', 'g2', 'trustpilot']:
        platform = 'all'

    try:
        print(f"[ANALYZE] Product: {product} | Platform: {platform} | Mode: {mode}")

        if mode == 'basic':
            result = client.analyze_basic(product, platform)
        else:
            result = client.analyze_advanced(product, platform, user_context)

        # Extract sentiment score for quick DB access
        sentiment = result.get('sentiment_summary', {})
        sentiment_score = int(sentiment.get('positive', 0))

        # Extract trust score if available (advanced mode)
        trust = result.get('trust_score', {})
        if trust and trust.get('score'):
            sentiment_score = int(trust.get('score', sentiment_score))

        # Extract verdict decision
        verdict = result.get('final_verdict', {})
        verdict_decision = verdict.get('decision', '')

        analysis = Analysis(
            product_name=result.get('product_name', product),
            platform=platform,
            mode=mode,
            sentiment_score=sentiment_score,
            verdict_decision=verdict_decision,
            result_json=json.dumps(result),
        )
        db.session.add(analysis)
        db.session.commit()

        return jsonify(analysis.to_dict())
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Analysis failed', 'detail': str(e)}), 500

@analyze_bp.route('/api/analyze/popular', methods=['GET'])
def popular():
    return jsonify([
        {"name": "Sony WH-1000XM5", "category": "Electronics"},
        {"name": "Samsung Galaxy S24", "category": "Smartphones"},
        {"name": "boAt Airdopes 141", "category": "Earbuds"},
        {"name": "Kindle Paperwhite", "category": "E-readers"},
        {"name": "OnePlus Nord CE4", "category": "Smartphones"},
        {"name": "JBL Flip 6", "category": "Speakers"}
    ])

@analyze_bp.route('/api/analyze/test', methods=['GET'])
def test():
    product = request.args.get('product', 'iPhone 15')
    mode = request.args.get('mode', 'advanced')
    try:
        if mode == 'basic':
            result = client.analyze_basic(product, 'all')
        else:
            result = client.analyze_advanced(product, 'all')
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analyze_bp.route('/api/analyze/<id>', methods=['GET'])
def get_analysis(id):
    analysis = Analysis.query.get_or_404(id)
    return jsonify(analysis.to_dict())
