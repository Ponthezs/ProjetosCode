# app/routes.py
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash
from flask_login import login_required, current_user
from .models import db, Ticket, PriorityEnum, StatusEnum, Message, Attachment
import random
import string
import os
from werkzeug.utils import secure_filename

main_bp = Blueprint('main', __name__)

def generate_protocol():
    """Gera um protocolo único de 6 dígitos numéricos."""
    while True:
        protocol = ''.join(random.choices(string.digits, k=6))
        if not Ticket.query.filter_by(protocol=protocol).first():
            return protocol

@main_bp.route('/')
@login_required
def dashboard():
    # Lógica para buscar dados para os gráficos
    stats_status = db.session.query(Ticket.status, db.func.count(Ticket.id)).group_by(Ticket.status).all()
    stats_priority = db.session.query(Ticket.priority, db.func.count(Ticket.id)).group_by(Ticket.priority).all()
    
    # Converte os enums para strings para passar ao template/JS
    chart_data = {
        'status': {'labels': [s.name for s, count in stats_status], 'data': [count for s, count in stats_status]},
        'priority': {'labels': [p.name for p, count in stats_priority], 'data': [count for p, count in stats_priority]}
    }
    return render_template('dashboard.html', chart_data=chart_data)

@main_bp.route('/ticket/new', methods=['GET', 'POST'])
@login_required
def create_ticket():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        priority = request.form.get('priority')
        
        new_ticket = Ticket(
            protocol=generate_protocol(),
            title=title,
            description=description,
            priority=PriorityEnum[priority],
            user_id=current_user.id
        )
        db.session.add(new_ticket)
        db.session.commit()

        # Lógica para upload de anexos
        files = request.files.getlist('attachments')
        for file in files:
            if file:
                filename = secure_filename(file.filename)
                filepath = os.path.join('app', 'static', 'uploads', filename)
                file.save(filepath)
                attachment = Attachment(filename=filename, filepath=f'uploads/{filename}', ticket_id=new_ticket.id)
                db.session.add(attachment)
        
        db.session.commit()
        flash('Atendimento criado com sucesso!', 'success')
        return redirect(url_for('main.my_tickets'))
        
    return render_template('create_ticket.html', priorities=PriorityEnum)

@main_bp.route('/tickets')
@login_required
def my_tickets():
    if current_user.is_admin:
        tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()
    else:
        tickets = Ticket.query.filter_by(user_id=current_user.id).order_by(Ticket.created_at.desc()).all()
    return render_template('my_tickets.html', tickets=tickets)

@main_bp.route('/ticket/<protocol>', methods=['GET', 'POST'])
@login_required
def view_ticket(protocol):
    ticket = Ticket.query.filter_by(protocol=protocol).first_or_404()
    
    # Lógica de permissão (usuário só pode ver seu ticket, a menos que seja admin)
    if not current_user.is_admin and ticket.user_id != current_user.id:
        return "Acesso Negado", 403

    if request.method == 'POST':
        # Adicionar nova mensagem
        content = request.form.get('message')
        if content:
            message = Message(content=content, user_id=current_user.id, ticket_id=ticket.id)
            db.session.add(message)
            # Notificação (lógica a ser implementada)
            ticket.status = StatusEnum.AGUARDANDO_RESPOSTA if current_user.is_admin else StatusEnum.EM_ANDAMENTO
            db.session.commit()
        
        # Admin pode alterar status e prioridade
        if current_user.is_admin:
            new_status = request.form.get('status')
            if new_status:
                ticket.status = StatusEnum[new_status]
            db.session.commit()

        return redirect(url_for('main.view_ticket', protocol=protocol))

    return render_template('view_ticket.html', ticket=ticket, statuses=StatusEnum)