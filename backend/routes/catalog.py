from flask import Blueprint, request, jsonify
from backend.utils.ai_client import AIClient

catalog_bp = Blueprint('catalog', __name__)
client = AIClient()

@catalog_bp.route('/api/catalog', methods=['POST'])
def get_catalog():
    """Generate dynamic personalization catalog for a product."""
    data = request.json
    product = data.get('product', '').strip()

    if not product or len(product) < 2:
        return jsonify({'error': 'Product name is required'}), 400

    try:
        print(f"[CATALOG] Generating catalog for: {product}")
        result = client.generate_catalog(product)
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate catalog', 'detail': str(e)}), 500
