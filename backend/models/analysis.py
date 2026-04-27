from extensions import db
from datetime import datetime
import uuid
import json

class Analysis(db.Model):
    __tablename__ = 'analyses'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_name = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(50), default='all')
    mode = db.Column(db.String(20), default='advanced')
    sentiment_score = db.Column(db.Integer, default=0)
    verdict_decision = db.Column(db.String(50), default='')
    result_json = db.Column(db.Text, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        result = json.loads(self.result_json) if self.result_json else {}
        return {
            'id': self.id,
            'product_name': self.product_name,
            'platform': self.platform,
            'mode': self.mode,
            'sentiment_score': self.sentiment_score,
            'verdict_decision': self.verdict_decision,
            'created_at': self.created_at.isoformat(),
            **result,
        }
