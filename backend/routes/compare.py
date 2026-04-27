from flask import Blueprint, request, jsonify
from backend.utils.ai_client import AIClient
from extensions import db
from models.analysis import Analysis
import json

compare_bp = Blueprint('compare', __name__)
client = AIClient()

@compare_bp.route('/api/compare', methods=['POST'])
def compare():
    data = request.json
    product_a = data.get('product_a', '').strip()
    product_b = data.get('product_b', '').strip()
    platform = data.get('platform', 'all')
    user_context = data.get('user_context', None)

    if not product_a or not product_b:
        return jsonify({'error': 'Both products required'}), 400

    try:
        print(f"[COMPARE] {product_a} vs {product_b} | Platform: {platform}")

        products = [{"name": product_a}, {"name": product_b}]
        result = client.analyze_comparison(products, platform, user_context)

        # Store comparison in DB
        analysis = Analysis(
            product_name=f"{product_a} vs {product_b}",
            platform=platform,
            mode='comparison',
            sentiment_score=0,
            verdict_decision=result.get('winner', {}).get('product_name', ''),
            result_json=json.dumps(result),
        )
        db.session.add(analysis)
        db.session.commit()

        return jsonify({
            'id': analysis.id,
            'created_at': analysis.created_at.isoformat(),
            **result
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Comparison failed', 'detail': str(e)}), 500
