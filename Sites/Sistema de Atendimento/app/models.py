# app/models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import enum

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    password_hash = db.Column(db.String(256))
    is_admin = db.Column(db.Boolean, default=False)
    tickets = db.relationship('Ticket', backref='requester', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

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

class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    protocol = db.Column(db.String(6), unique=True, nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Enum(PriorityEnum), nullable=False, default=PriorityEnum.MEDIA)
    status = db.Column(db.Enum(StatusEnum), nullable=False, default=StatusEnum.ABERTO)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    messages = db.relationship('Message', backref='ticket', lazy=True, cascade="all, delete-orphan")
    attachments = db.relationship('Attachment', backref='ticket', lazy=True, cascade="all, delete-orphan")

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
    author = db.relationship('User')

class Attachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)