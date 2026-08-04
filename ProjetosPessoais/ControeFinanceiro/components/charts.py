import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import streamlit as st
from utils.formatters import format_currency

def plot_cashflow_bar(df_monthly: pd.DataFrame):
    """Gera gráfico de barras interativo para Fluxo de Caixa Mensal (Receitas vs Despesas)."""
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=df_monthly["Mês"],
        y=df_monthly["Receitas"],
        name="Receitas",
        marker_color="#10B981"
    ))
    fig.add_trace(go.Bar(
        x=df_monthly["Mês"],
        y=df_monthly["Despesas"],
        name="Despesas",
        marker_color="#EF4444"
    ))
    fig.add_trace(go.Scatter(
        x=df_monthly["Mês"],
        y=df_monthly["Saldo"],
        name="Saldo Líquido",
        line=dict(color="#38BDF8", width=3, dash='dot')
    ))

    fig.update_layout(
        title="Fluxo de Caixa Mensal (Receitas, Despesas e Saldo)",
        template="plotly_dark",
        barmode="group",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=50, b=20),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig

def plot_category_pie(df_category: pd.DataFrame):
    """Gera gráfico de rosca de despesas por categoria."""
    if df_category.empty:
        return None
    fig = px.pie(
        df_category,
        names="Categoria",
        values="Valor",
        hole=0.5,
        title="Distribuição de Despesas por Categoria",
        color_discrete_sequence=px.colors.qualitative.Pastel
    )
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=50, b=20)
    )
    return fig

def plot_owner_split_bar(df_splits: pd.DataFrame):
    """Gera gráfico de barras por Proprietário da despesa (Meu, Esposa, Empresa, etc.)."""
    if df_splits.empty:
        return None
    fig = px.bar(
        df_splits,
        x="Proprietário",
        y="Valor",
        color="Proprietário",
        title="Despesas Totais por Proprietário",
        template="plotly_dark"
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=50, b=20)
    )
    return fig

def plot_daily_heatmap(df_daily: pd.DataFrame):
    """Gera Heatmap de gastos por dia do mês."""
    if df_daily.empty:
        return None
    fig = px.density_heatmap(
        df_daily,
        x="Dia",
        y="Semana",
        z="Valor",
        title="Heatmap de Gastos por Dia",
        color_continuous_scale="Viridis",
        template="plotly_dark"
    )
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=50, b=20)
    )
    return fig
