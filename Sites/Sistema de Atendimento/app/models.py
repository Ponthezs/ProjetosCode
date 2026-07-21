# app/models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum
import hashlib

db = SQLAlchemy()

class PriorityEnum(enum.Enum):
    MINIMA = 'Mínima'
    MEDIA = 'Média'
    ALTA = 'Alta'
    MAXIMA = 'Máxima'

class StatusEnum(enum.Enum):
    ABERTO = 'Aberto'
    EM_ANDAMENTO = 'Em Andamento'
    AGUARDANDO_RESPOSTA = 'Aguardando Resposta'
    FECHADO = 'Fechado'

class CategoryEnum(enum.Enum):
    TECNICO = 'Suporte Técnico'
    FINANCEIRO = 'Financeiro & Faturamento'
    COMERCIAL = 'Vendas & Planos'
    DUVIDAS = 'Dúvidas Gerais'
    OUTROS = 'Outros Assuntos'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    tickets = db.relationship('Ticket', backref='requester', lazy=True)
    messages = db.relationship('Message', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def avatar_url(self, size=80):
        digest = hashlib.md5(self.email.lower().encode('utf-8')).hexdigest()
        return f'https://www.gravatar.com/avatar/{digest}?d=mp&s={size}'

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    protocol = db.Column(db.String(10), unique=True, nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.Enum(CategoryEnum), nullable=False, default=CategoryEnum.TECNICO)
    priority = db.Column(db.Enum(PriorityEnum), nullable=False, default=PriorityEnum.MEDIA)
    status = db.Column(db.Enum(StatusEnum), nullable=False, default=StatusEnum.ABERTO)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.relationship('Message', backref='ticket', lazy=True, cascade="all, delete-orphan", order_by="Message.created_at.asc()")
    attachments = db.relationship('Attachment', backref='ticket', lazy=True, cascade="all, delete-orphan")

    @property
    def status_badge(self):
        mapping = {
            StatusEnum.ABERTO: 'badge-amber',
            StatusEnum.EM_ANDAMENTO: 'badge-blue',
            StatusEnum.AGUARDANDO_RESPOSTA: 'badge-purple',
            StatusEnum.FECHADO: 'badge-emerald'
        }
        return mapping.get(self.status, 'badge-slate')

    @property
    def priority_badge(self):
        mapping = {
            PriorityEnum.MINIMA: 'badge-slate',
            PriorityEnum.MEDIA: 'badge-blue',
            PriorityEnum.ALTA: 'badge-amber',
            PriorityEnum.MAXIMA: 'badge-rose'
        }
        return mapping.get(self.priority, 'badge-slate')

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)

class Attachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)