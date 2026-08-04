import streamlit as st
from datetime import date
from controllers.app_controller import AppController
from models.fixed_expense import FixedExpense
from models.subscription import Subscription
from utils.formatters import format_currency

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🔁 Gastos Fixos Recorrentes & Assinaturas</h1>
        <div class="header-subtitle">Gestão de pagamentos recorrentes e projeção de custos anuais de serviços</div>
    </div>
    """, unsafe_allow_html=True)

    tab_fixed, tab_sub = st.tabs(["📌 Gastos Fixos Recorrentes", "📱 Assinaturas & Serviços"])

    # TAB 1: Gastos Fixos
    with tab_fixed:
        st.subheader("Despesas Recorrentes Mensais")
        col_act1, col_act2 = st.columns([3, 1])
        with col_act2:
            if st.button("⚡ Gerar Lançamentos do Mês"):
                today = date.today()
                count = controller.recurring.process_monthly_recurring(today.month, today.year)
                st.success(f"{count} lançamentos de gastos fixos gerados para o mês {today.month}/{today.year}!")

        fixed_items = controller.recurring.fixed_repo.get_active()
        if fixed_items:
            for item in fixed_items:
                col_f1, col_f2, col_f3 = st.columns([4, 3, 2])
                with col_f1:
                    st.write(f"📌 **{item.description}** (Dia {item.due_day})")
                with col_f2:
                    st.write(f"Valor: **{format_currency(item.amount)}**")
                with col_f3:
                    cat_name = item.category.name if item.category else "Geral"
                    st.write(f"`{cat_name}`")
        else:
            st.info("Nenhum gasto fixo cadastrado.")

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Adicionar Gasto Fixo")
        with st.form("new_fixed_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                desc = st.text_input("Descrição*", placeholder="Ex: Aluguel, Academia")
            with c2:
                amount = st.number_input("Valor Mensal (R$)*", min_value=1.0, value=100.0)
            with c3:
                due_day = st.number_input("Dia do Vencimento", min_value=1, max_value=31, value=10)

            if st.form_submit_button("💾 Salvar Gasto Fixo"):
                if not desc:
                    st.error("Descrição é obrigatória.")
                else:
                    new_fixed = FixedExpense(description=desc, amount=amount, due_day=due_day)
                    controller.recurring.fixed_repo.add(new_fixed)
                    st.success(f"Gasto fixo '{desc}' cadastrado!")
                    st.rerun()

    # TAB 2: Assinaturas
    with tab_sub:
        st.subheader("Assinaturas & Serviços Recorrentes")
        subs = controller.recurring.sub_repo.get_all_with_relations()

        total_monthly = sum(s.monthly_cost for s in subs if s.is_active)
        total_annual = sum(s.annual_cost for s in subs if s.is_active)

        c_kpi1, c_kpi2 = st.columns(2)
        with c_kpi1:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-title">Custo Total Mensal de Assinaturas</div>
                <div class="metric-value" style="color: #F59E0B;">{format_currency(total_monthly)}</div>
            </div>
            """, unsafe_allow_html=True)
        with c_kpi2:
            st.markdown(f"""
            <div class="metric-card">
                <div class="metric-title">Custo Projetado Anual de Assinaturas</div>
                <div class="metric-value" style="color: #EC4899;">{format_currency(total_annual)}</div>
            </div>
            """, unsafe_allow_html=True)

        for s in subs:
            st.markdown(f"""
            <div class="metric-card">
                <div style="font-size: 1.2rem; font-weight: 700;">📱 {s.name}</div>
                <div style="color: #10B981; font-size: 1.1rem; font-weight: 600; margin-top: 0.3rem;">
                    {format_currency(s.monthly_cost)} / mês | Projeção Anual: {format_currency(s.annual_cost)}
                </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Nova Assinatura")
        with st.form("new_sub_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                sub_name = st.text_input("Nome do Serviço*", placeholder="Ex: Spotify Premium, Netflix, iCloud")
            with c2:
                sub_cost = st.number_input("Valor Mensal (R$)*", min_value=1.0, value=29.90)
            with c3:
                sub_cycle = st.selectbox("Ciclo de Cobrança", ["Mensal", "Anual"])

            if st.form_submit_button("💾 Salvar Assinatura"):
                if not sub_name:
                    st.error("Nome da assinatura é obrigatório.")
                else:
                    new_sub = Subscription(name=sub_name, monthly_cost=sub_cost, billing_cycle=sub_cycle)
                    controller.recurring.sub_repo.add(new_sub)
                    st.success(f"Assinatura '{sub_name}' salva com sucesso!")
                    st.rerun()
