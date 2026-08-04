import streamlit as st
from utils.formatters import format_currency, format_percentage

def render_metric_cards(kpis: dict):
    """Renderiza a grade de cards de KPIs com efeito glassmorphism."""
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Patrimônio Total</div>
            <div class="metric-value" style="color: #38BDF8;">{format_currency(kpis.get('patrimonio_total', 0.0))}</div>
            <div class="metric-trend trend-neutral">Soma de todas as contas</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Receitas do Período</div>
            <div class="metric-value" style="color: #10B981;">{format_currency(kpis.get('receitas', 0.0))}</div>
            <div class="metric-trend trend-positive">▲ Entradas</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Despesas do Período</div>
            <div class="metric-value" style="color: #EF4444;">{format_currency(kpis.get('despesas', 0.0))}</div>
            <div class="metric-trend trend-negative">▼ Saídas</div>
        </div>
        """, unsafe_allow_html=True)

    with col4:
        saldo = kpis.get('saldo', 0.0)
        color = "#10B981" if saldo >= 0 else "#EF4444"
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Saldo do Período</div>
            <div class="metric-value" style="color: {color};">{format_currency(saldo)}</div>
            <div class="metric-trend trend-neutral">Economia: {format_percentage(kpis.get('taxa_economia', 0.0))}</div>
        </div>
        """, unsafe_allow_html=True)
