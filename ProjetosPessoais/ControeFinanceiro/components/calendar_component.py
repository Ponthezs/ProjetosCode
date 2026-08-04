import calendar
from datetime import date
import streamlit as st
from utils.formatters import format_currency

def render_financial_calendar(year: int, month: int, transactions: list):
    """Renderiza a visão de Calendário Financeiro com totais diários de Receitas, Despesas e Saldo."""
    st.subheader(f"📅 Calendário Financeiro - {calendar.month_name[month]} / {year}")

    # Agrupar transações por dia
    daily_summary = {}
    for t in transactions:
        d_day = t.transaction_date.day
        if d_day not in daily_summary:
            daily_summary[d_day] = {"receitas": 0.0, "despesas": 0.0, "items": []}
        
        if t.type == "Receita":
            daily_summary[d_day]["receitas"] += t.amount
        elif t.type in ["Despesa", "Investimento"]:
            daily_summary[d_day]["despesas"] += t.amount
        daily_summary[d_day]["items"].append(t)

    cal = calendar.monthcalendar(year, month)
    days_header = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    # Header da semana
    cols = st.columns(7)
    for i, h in enumerate(days_header):
        cols[i].markdown(f"**{h}**")

    # Renderizar semanas
    for week in cal:
        cols = st.columns(7)
        for i, day in enumerate(week):
            if day == 0:
                cols[i].write("")
            else:
                summary = daily_summary.get(day, {"receitas": 0.0, "despesas": 0.0})
                rec = summary["receitas"]
                desp = summary["despesas"]

                rec_html = f"<div style='color: #10B981; font-size: 0.75rem;'>+{format_currency(rec)}</div>" if rec > 0 else ""
                desp_html = f"<div style='color: #EF4444; font-size: 0.75rem;'>-{format_currency(desp)}</div>" if desp > 0 else ""

                cols[i].markdown(f"""
                <div style="background: rgba(30, 41, 59, 0.6); border-radius: 8px; padding: 0.5rem; min-height: 70px; margin-bottom: 0.5rem;">
                    <div style="font-weight: 700; font-size: 0.9rem; color: #F8FAFC;">{day}</div>
                    {rec_html}
                    {desp_html}
                </div>
                """, unsafe_allow_html=True)
