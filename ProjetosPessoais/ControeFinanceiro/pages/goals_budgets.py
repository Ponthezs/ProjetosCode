import streamlit as st
from datetime import date
from controllers.app_controller import AppController
from models.goal import Goal
from models.budget import Budget
from utils.formatters import format_currency, format_percentage

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🎯 Metas Financeiras & Teto de Orçamento</h1>
        <div class="header-subtitle">Defina limites por categoria e acompanhe o progresso dos seus objetivos de economia</div>
    </div>
    """, unsafe_allow_html=True)

    tab_budgets, tab_goals = st.tabs(["📊 Orçamento Mensal por Categoria", "🎯 Metas de Economia & Investimentos"])

    # TAB 1: Orçamentos por Categoria
    with tab_budgets:
        st.subheader("Orçamento do Mês Atual")
        today = date.today()
        first_day = today.replace(day=1)

        budgets = controller.budgets.get_all_for_month(today.month, today.year)
        categories = controller.categories.get_all()

        if budgets:
            for b in budgets:
                # Obter gastos atuais da categoria
                trans_cat = controller.transactions.trans_repo.get_filtered(
                    start_date=first_day, end_date=today, category_id=b.category_id, type_="Despesa"
                )
                spent = sum(t.amount for t in trans_cat)
                pct = min(1.0, spent / b.limit_amount) if b.limit_amount > 0 else 0.0

                st.markdown(f"**{b.category.icon} {b.category.name}**: {format_currency(spent)} / {format_currency(b.limit_amount)}")
                
                # Barra de progresso com alerta visual
                if spent > b.limit_amount:
                    st.progress(1.0)
                    st.error(f"⚠️ Orçamento ultrapassado em {format_currency(spent - b.limit_amount)}!")
                elif pct >= 0.8:
                    st.progress(pct)
                    st.warning(f"⚠️ {format_percentage(pct*100)} do orçamento atingido.")
                else:
                    st.progress(pct)
                st.write("")
        else:
            st.info("Nenhum teto de orçamento definido para este mês.")

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Definir Novo Orçamento")
        cat_dict = {f"{c.icon} {c.name}": c.id for c in categories}
        with st.form("new_budget_form"):
            c1, c2 = st.columns(2)
            with c1:
                sel_cat = st.selectbox("Categoria", list(cat_dict.keys()))
            with c2:
                limit = st.number_input("Limite Máximo Mensal (R$)", min_value=50.0, value=500.0, step=100.0)

            if st.form_submit_button("💾 Salvar Orçamento"):
                cat_id = cat_dict[sel_cat]
                existing_b = controller.budgets.get_budget(cat_id, today.month, today.year)
                if existing_b:
                    existing_b.limit_amount = limit
                    controller.budgets.update(existing_b)
                else:
                    new_b = Budget(category_id=cat_id, month=today.month, year=today.year, limit_amount=limit)
                    controller.budgets.add(new_b)
                st.success(f"Orçamento para '{sel_cat}' definido com sucesso!")
                st.rerun()

    # TAB 2: Metas de Economia
    with tab_goals:
        st.subheader("Metas Cadastradas")
        goals = controller.goals.get_all()

        if goals:
            for g in goals:
                pct = min(1.0, g.current_amount / g.target_amount) if g.target_amount > 0 else 0.0
                st.markdown(f"🎯 **{g.title}** ({g.category_type})")
                st.write(f"Progresso: **{format_currency(g.current_amount)}** de **{format_currency(g.target_amount)}** ({format_percentage(g.progress_percentage)})")
                st.progress(pct)
                st.write("")
        else:
            st.info("Nenhuma meta cadastrada.")

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Nova Meta")
        with st.form("new_goal_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                g_title = st.text_input("Título da Meta*", placeholder="Ex: Reserva de Emergência, Viagem Europa")
            with c2:
                g_target = st.number_input("Valor Alvo (R$)*", min_value=100.0, value=5000.0, step=500.0)
            with c3:
                g_current = st.number_input("Valor Já Salvo (R$)", value=0.0)

            if st.form_submit_button("💾 Salvar Meta"):
                if not g_title:
                    st.error("Título é obrigatório.")
                else:
                    new_g = Goal(title=g_title, target_amount=g_target, current_amount=g_current)
                    controller.goals.add(new_g)
                    st.success(f"Meta '{g_title}' criada com sucesso!")
                    st.rerun()
