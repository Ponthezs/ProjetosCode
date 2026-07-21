# app/routes.py
from flask import Blueprint, render_template, request, redirect, url_for, flash, send_from_directory, current_app, abort
from flask_login import login_required, current_user
from .models import db, Ticket, PriorityEnum, StatusEnum, CategoryEnum, Message, Attachment, User
import random
import string
import os
from werkzeug.utils import secure_filename

main_bp = Blueprint('main', __name__)

def generate_protocol():
    """Gera um protocolo único de 6 dígitos numéricos pré-fixado."""
    while True:
        num = ''.join(random.choices(string.digits, k=6))
        protocol = f"TK-{num}"
        if not Ticket.query.filter_by(protocol=protocol).first():
            return protocol

@main_bp.route('/')
@login_required
def dashboard():
    # Base query de acordo com o nível de acesso
    if current_user.is_admin:
        base_query = Ticket.query
    else:
        base_query = Ticket.query.filter_by(user_id=current_user.id)

    total_tickets = base_query.count()
    open_tickets = base_query.filter_by(status=StatusEnum.ABERTO).count()
    in_progress_tickets = base_query.filter_by(status=StatusEnum.EM_ANDAMENTO).count()
    waiting_tickets = base_query.filter_by(status=StatusEnum.AGUARDANDO_RESPOSTA).count()
    closed_tickets = base_query.filter_by(status=StatusEnum.FECHADO).count()

    # Dados para os gráficos
    stats_status = db.session.query(Ticket.status, db.func.count(Ticket.id))
    stats_priority = db.session.query(Ticket.priority, db.func.count(Ticket.id))
    stats_category = db.session.query(Ticket.category, db.func.count(Ticket.id))

    if not current_user.is_admin:
        stats_status = stats_status.filter(Ticket.user_id == current_user.id)
        stats_priority = stats_priority.filter(Ticket.user_id == current_user.id)
        stats_category = stats_category.filter(Ticket.user_id == current_user.id)

    stats_status = stats_status.group_by(Ticket.status).all()
    stats_priority = stats_priority.group_by(Ticket.priority).all()
    stats_category = stats_category.group_by(Ticket.category).all()

    chart_data = {
        'status': {
            'labels': [s.value for s, _ in stats_status],
            'data': [count for _, count in stats_status]
        },
        'priority': {
            'labels': [p.value for p, _ in stats_priority],
            'data': [count for _, count in stats_priority]
        },
        'category': {
            'labels': [c.value for c, _ in stats_category],
            'data': [count for _, count in stats_category]
        }
    }

    recent_tickets = base_query.order_by(Ticket.updated_at.desc()).limit(5).all()

    return render_template(
        'dashboard.html',
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        waiting_tickets=waiting_tickets,
        closed_tickets=closed_tickets,
        chart_data=chart_data,
        recent_tickets=recent_tickets
    )

@main_bp.route('/ticket/new', methods=['GET', 'POST'])
@login_required
def create_ticket():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        category_str = request.form.get('category')
        priority_str = request.form.get('priority')

        if not title or not description:
            flash('Título e descrição são obrigatórios.', 'warning')
            return redirect(url_for('main.create_ticket'))

        try:
            category = CategoryEnum[category_str]
            priority = PriorityEnum[priority_str]
        except KeyError:
            flash('Opções de categoria ou prioridade inválidas.', 'danger')
            return redirect(url_for('main.create_ticket'))

        new_ticket = Ticket(
            protocol=generate_protocol(),
            title=title,
            description=description,
            category=category,
            priority=priority,
            user_id=current_user.id
        )
        db.session.add(new_ticket)
        db.session.commit()

        # Upload de arquivos
        files = request.files.getlist('attachments')
        upload_folder = current_app.config['UPLOAD_FOLDER']

        for file in files:
            if file and file.filename != '':
                raw_filename = secure_filename(file.filename)
                unique_filename = f"{new_ticket.protocol}_{raw_filename}"
                filepath = os.path.join(upload_folder, unique_filename)
                file.save(filepath)

                attachment = Attachment(
                    filename=file.filename,
                    filepath=unique_filename,
                    ticket_id=new_ticket.id
                )
                db.session.add(attachment)

        db.session.commit()
        flash(f'Atendimento #{new_ticket.protocol} criado com sucesso!', 'success')
        return redirect(url_for('main.view_ticket', protocol=new_ticket.protocol))

    return render_template('create_ticket.html', priorities=PriorityEnum, categories=CategoryEnum)

@main_bp.route('/tickets')
@login_required
def my_tickets():
    search_query = request.args.get('q', '').strip()
    status_filter = request.args.get('status', '').strip()
    priority_filter = request.args.get('priority', '').strip()
    category_filter = request.args.get('category', '').strip()

    if current_user.is_admin:
        query = Ticket.query
    else:
        query = Ticket.query.filter_by(user_id=current_user.id)

    if search_query:
        query = query.filter(
            (Ticket.protocol.ilike(f'%{search_query}%')) |
            (Ticket.title.ilike(f'%{search_query}%')) |
            (Ticket.description.ilike(f'%{search_query}%'))
        )

    if status_filter and status_filter in StatusEnum.__members__:
        query = query.filter(Ticket.status == StatusEnum[status_filter])

    if priority_filter and priority_filter in PriorityEnum.__members__:
        query = query.filter(Ticket.priority == PriorityEnum[priority_filter])

    if category_filter and category_filter in CategoryEnum.__members__:
        query = query.filter(Ticket.category == CategoryEnum[category_filter])

    tickets = query.order_by(Ticket.updated_at.desc()).all()

    return render_template(
        'my_tickets.html',
        tickets=tickets,
        statuses=StatusEnum,
        priorities=PriorityEnum,
        categories=CategoryEnum,
        current_status=status_filter,
        current_priority=priority_filter,
        current_category=category_filter,
        search_query=search_query
    )

@main_bp.route('/ticket/<protocol>', methods=['GET', 'POST'])
@login_required
def view_ticket(protocol):
    ticket = Ticket.query.filter_by(protocol=protocol).first_or_404()

    if not current_user.is_admin and ticket.user_id != current_user.id:
        flash('Acesso negado a este atendimento.', 'danger')
        return redirect(url_for('main.my_tickets'))

    if request.method == 'POST':
        content = request.form.get('message', '').strip()
        new_status = request.form.get('status')
        new_priority = request.form.get('priority')

        if content:
            message = Message(content=content, user_id=current_user.id, ticket_id=ticket.id)
            db.session.add(message)
            
            # Se for admin respondendo, altera status para AGUARDANDO_RESPOSTA
            # Se for usuário comum, altera status para EM_ANDAMENTO
            if current_user.is_admin and ticket.status != StatusEnum.FECHADO:
                ticket.status = StatusEnum.AGUARDANDO_RESPOSTA
            elif not current_user.is_admin and ticket.status != StatusEnum.FECHADO:
                ticket.status = StatusEnum.EM_ANDAMENTO

        if current_user.is_admin:
            if new_status and new_status in StatusEnum.__members__:
                ticket.status = StatusEnum[new_status]
            if new_priority and new_priority in PriorityEnum.__members__:
                ticket.priority = PriorityEnum[new_priority]

        db.session.commit()
        flash('Atendimento atualizado com sucesso!', 'success')
        return redirect(url_for('main.view_ticket', protocol=protocol))

    return render_template('view_ticket.html', ticket=ticket, statuses=StatusEnum, priorities=PriorityEnum)

@main_bp.route('/uploads/<filename>')
@login_required
def download_file(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    return send_from_directory(upload_folder, filename)

@main_bp.route('/admin/users')
@login_required
def admin_users():
    if not current_user.is_admin:
        abort(403)
    users = User.query.order_by(User.name.asc()).all()
    return render_template('admin_users.html', users=users)

@main_bp.route('/admin/user/<int:user_id>/toggle-admin', methods=['POST'])
@login_required
def toggle_admin(user_id):
    if not current_user.is_admin:
        abort(403)
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('Você não pode alterar sua própria função.', 'warning')
    else:
        user.is_admin = not user.is_admin
        db.session.commit()
        role = "Administrador" if user.is_admin else "Usuário"
        flash(f'Função de {user.name} alterada para {role}.', 'success')
    return redirect(url_for('main.admin_users'))