from flask import Blueprint, jsonify, make_response
from models.analysis import Analysis
from extensions import db
import csv, io, json

export_bp = Blueprint('export', __name__)

@export_bp.route('/api/export/<id>/csv', methods=['GET'])
def export_csv(id):
    analysis = Analysis.query.get_or_404(id)
    result = json.loads(analysis.result_json) if analysis.result_json else {}

    output = io.StringIO()
    writer = csv.writer(output)

    # Header info
    writer.writerow(['Product', analysis.product_name])
    writer.writerow(['Mode', analysis.mode])
    writer.writerow(['Platform', analysis.platform])
    writer.writerow(['Date', analysis.created_at.isoformat()])
    writer.writerow([])

    # Sentiment
    sentiment = result.get('sentiment_summary', {})
    writer.writerow(['Sentiment', 'Percentage'])
    writer.writerow(['Positive', f"{sentiment.get('positive', 0)}%"])
    writer.writerow(['Negative', f"{sentiment.get('negative', 0)}%"])
    writer.writerow(['Neutral', f"{sentiment.get('neutral', 0)}%"])
    writer.writerow([])

    # Trust Score (advanced mode)
    trust = result.get('trust_score', {})
    if trust:
        writer.writerow(['Trust Score', trust.get('score', 'N/A')])
        writer.writerow(['Trust Label', trust.get('label', 'N/A')])
        writer.writerow([])

    # Pros
    writer.writerow(['Pros'])
    for p in result.get('pros', []):
        text = p if isinstance(p, str) else p.get('text', str(p))
        writer.writerow([text])
    writer.writerow([])

    # Cons
    writer.writerow(['Cons'])
    for c in result.get('cons', []):
        text = c if isinstance(c, str) else c.get('text', str(c))
        writer.writerow([text])
    writer.writerow([])

    # Pain Points (advanced mode)
    pain_points = result.get('pain_points', [])
    if pain_points:
        writer.writerow(['Pain Point', 'Category', 'Frequency', 'Severity', 'Quote'])
        for pp in pain_points:
            writer.writerow([
                pp.get('description', ''),
                pp.get('category', ''),
                pp.get('frequency', ''),
                pp.get('severity', ''),
                pp.get('example_quote', ''),
            ])
        writer.writerow([])

    # Verdict
    verdict = result.get('final_verdict', {})
    if verdict:
        writer.writerow(['Verdict', verdict.get('decision', 'N/A')])
        writer.writerow(['Confidence', verdict.get('confidence', 'N/A')])
        writer.writerow(['One-line', verdict.get('one_line_verdict', '')])
        for reason in verdict.get('key_reasons', []):
            writer.writerow(['Reason', reason])

    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename={analysis.product_name}_analysis.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response

@export_bp.route('/api/export/<id>/pdf', methods=['GET'])
def export_pdf(id):
    analysis = Analysis.query.get_or_404(id)
    result = json.loads(analysis.result_json) if analysis.result_json else {}

    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    import io as bio

    buf = bio.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    y = 750

    # Title
    c.setFont('Helvetica-Bold', 18)
    c.drawString(50, y, f'Analysis: {analysis.product_name}')
    y -= 30

    c.setFont('Helvetica', 11)
    c.drawString(50, y, f'Mode: {analysis.mode.upper()} | Platform: {analysis.platform.upper()} | Date: {analysis.created_at.strftime("%B %d, %Y")}')
    y -= 30

    # Overall Summary
    summary = result.get('overall_summary', result.get('summary', ''))
    if summary:
        c.setFont('Helvetica-Bold', 13)
        c.drawString(50, y, 'Overall Summary')
        y -= 18
        c.setFont('Helvetica', 10)
        # Word-wrap summary
        words = summary.split()
        line = ''
        for word in words:
            test = line + ' ' + word if line else word
            if c.stringWidth(test, 'Helvetica', 10) > 500:
                c.drawString(50, y, line)
                y -= 14
                line = word
                if y < 60:
                    c.showPage()
                    y = 750
            else:
                line = test
        if line:
            c.drawString(50, y, line)
            y -= 20

    # Sentiment
    sentiment = result.get('sentiment_summary', {})
    c.setFont('Helvetica-Bold', 13)
    c.drawString(50, y, 'Sentiment')
    y -= 18
    c.setFont('Helvetica', 11)
    c.drawString(50, y, f'Positive: {sentiment.get("positive", 0)}%  |  Negative: {sentiment.get("negative", 0)}%  |  Neutral: {sentiment.get("neutral", 0)}%')
    y -= 25

    # Trust Score
    trust = result.get('trust_score', {})
    if trust and trust.get('score') is not None:
        c.setFont('Helvetica-Bold', 13)
        c.drawString(50, y, f'Trust Score: {trust.get("score")}/100 ({trust.get("label", "")})')
        y -= 25

    # Verdict
    verdict = result.get('final_verdict', {})
    if verdict:
        c.setFont('Helvetica-Bold', 14)
        c.drawString(50, y, f'Verdict: {verdict.get("decision", "N/A")}')
        y -= 18
        c.setFont('Helvetica', 11)
        one_line = verdict.get('one_line_verdict', '')
        if one_line:
            c.drawString(50, y, one_line)
            y -= 18
        for reason in verdict.get('key_reasons', []):
            c.drawString(60, y, f'• {reason}')
            y -= 14
            if y < 60:
                c.showPage()
                y = 750

    c.save()
    buf.seek(0)
    response = make_response(buf.read())
    response.headers['Content-Disposition'] = f'attachment; filename={analysis.product_name}_report.pdf'
    response.headers['Content-Type'] = 'application/pdf'
    return response
