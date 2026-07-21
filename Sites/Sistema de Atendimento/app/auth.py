# app/auth.py
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from .models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = True if request.form.get('remember') else False

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            flash('E-mail ou senha incorretos. Por favor, tente novamente.', 'danger')
            return redirect(url_for('auth.login'))

        login_user(user, remember=remember)
        flash(f'Bem-vindo de volta, {user.name}!', 'success')
        
        next_page = request.args.get('next')
        if not next_page or not next_page.startswith('/'):
            next_page = url_for('main.dashboard')
        return redirect(next_page)

    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        if password != confirm_password:
            flash('As senhas não coincidem.', 'warning')
            return redirect(url_for('auth.register'))

        user_exists = User.query.filter_by(email=email).first()
        if user_exists:
            flash('Este e-mail já está cadastrado no sistema.', 'warning')
            return redirect(url_for('auth.register'))

        new_user = User(
            name=name,
            email=email,
            phone=phone,
            is_admin=False
        )
        new_user.set_password(password)

        db.session.add(new_user)
        db.session.commit()

        flash('Conta criada com sucesso! Você já pode realizar o login.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Você saiu do sistema com segurança.', 'info')
    return redirect(url_for('auth.login'))