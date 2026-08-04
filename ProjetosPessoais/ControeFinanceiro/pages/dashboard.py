import streamlit as st
from datetime import date, datetime
import pandas as pd
from controllers.app_controller import AppController
from components.metric_cards import render_metric_cards
from components.charts import plot_cashflow_bar, plot_category_pie, plot_owner_split_bar
from components.calendar_component import render_financial_calendar
from utils.formatters import format_currency, format_date

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">📊 Dashboard Executivo & Visão Geral</h1>
        <div class="header-subtitle">Acompanhamento em tempo real das suas finanças pessoais e patrimônio</div>
    </div>
    """, unsafe_allow_html=True)

    # Filtros Globais do Dashboard
    st.subheader("🔍 Filtros Globais")
    col1, col2, col3, col4 = st.columns(4)

    today = date.today()
    first_day_month = today.replace(day=1)

    with col1:
        start_date = st.date_input("Data Inicial", value=first_day_month)
    with col2:
        end_date = st.date_input("Data Final", value=today)

    owners = controller.owners.get_all()
    with col3:
        owner_options = {"Todos": None}
        owner_options.update({o.name: o.id for o in owners})
        selected_owner_name = st.selectbox("Proprietário", list(owner_options.keys()))
        selected_owner_id = owner_options[selected_owner_name]

    accounts = controller.accounts.get_all_accounts()
    with col4:
        acc_options = {"Todas": None}
        acc_options.update({a.name: a.id for a in accounts})
        selected_acc_name = st.selectbox("Conta Bancária", list(acc_options.keys()))
        selected_acc_id = acc_options[selected_acc_name]

    st.markdown("<br>", unsafe_allow_html=True)

    # Obter KPIs
    kpis = controller.analytics.get_summary_kpis(
        start_date=start_date,
        end_date=end_date,
        owner_id=selected_owner_id,
        account_id=selected_acc_id
    )

    # Renderizar Cards Métricos
    render_metric_cards(kpis)

    st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 2rem 0;'>", unsafe_allow_html=True)

    # Gráficos Principais
    col_chart1, col_chart2 = st.columns([7, 5])

    with col_chart1:
        df_monthly = controller.analytics.get_monthly_cashflow(today.year)
        fig_cf = plot_cashflow_bar(df_monthly)
        st.plotly_chart(fig_cf, use_container_width=True)

    with col_chart2:
        df_cat = controller.analytics.get_top_categories(start_date, end_date, limit=7)
        fig_pie = plot_category_pie(df_cat)
        if fig_pie:
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("Sem dados de despesas para o período selecionado.")

    st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 2rem 0;'>", unsafe_allow_html=True)

    # Top Indicadores & Calendário
    col_top1, col_top2 = st.columns(2)

    with col_top1:
        st.subheader("🔥 Top 5 Maiores Despesas do Período")
        top_expenses = controller.transactions.trans_repo.get_filtered(
            start_date=start_date, end_date=end_date, type_="Despesa", owner_id=selected_owner_id, account_id=selected_acc_id
        )
        if top_expenses:
            top_expenses_sorted = sorted(top_expenses, key=lambda x: x.amount, reverse=True)[:5]
            df_top = pd.DataFrame([{
                "Descrição": t.description,
                "Valor": format_currency(t.amount),
                "Data": format_date(t.transaction_date),
                "Categoria": t.category.name if t.category else "Geral",
                "Proprietário": t.owner.name if t.owner else "Meu"
            } for t in top_expenses_sorted])
            st.dataframe(df_top, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhuma despesa registrada no período.")

    with col_top2:
        st.subheader("⭐ Top 5 Maiores Receitas do Período")
        top_incomes = controller.transactions.trans_repo.get_filtered(
            start_date=start_date, end_date=end_date, type_="Receita", owner_id=selected_owner_id, account_id=selected_acc_id
        )
        if top_incomes:
            top_incomes_sorted = sorted(top_incomes, key=lambda x: x.amount, reverse=True)[:5]
            df_inc = pd.DataFrame([{
                "Descrição": t.description,
                "Valor": format_currency(t.amount),
                "Data": format_date(t.transaction_date),
                "Categoria": t.category.name if t.category else "Geral",
                "Proprietário": t.owner.name if t.owner else "Meu"
            } for t in top_incomes_sorted])
            st.dataframe(df_inc, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhuma receita registrada no período.")

    st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 2rem 0;'>", unsafe_allow_html=True)

    # Visão Calendário Financeiro
    all_period_trans = controller.transactions.trans_repo.get_filtered(
        start_date=start_date.replace(day=1),
        end_date=end_date,
        owner_id=selected_owner_id,
        account_id=selected_acc_id
    )
    render_financial_calendar(start_date.year, start_date.month, all_period_trans)
