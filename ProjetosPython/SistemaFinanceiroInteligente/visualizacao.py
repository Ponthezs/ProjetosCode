"""
Módulo de Visualização - Sistema de Controle Financeiro Inteligente
Gera gráficos e visualizações usando Plotly
"""

import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from typing import Optional
from calculos import CalculadoraFinanceira

class GeradorGraficos:
    """Classe para gerar gráficos e visualizações"""
    
    def __init__(self, calculadora: CalculadoraFinanceira):
        self.calculadora = calculadora
    
    def grafico_rosca_categorias(self, mes: Optional[int] = None, ano: Optional[int] = None) -> go.Figure:
        """
        Gera gráfico de rosca (donut chart) para distribuição de gastos por categoria
        """
        gastos = self.calculadora.calcular_gastos_por_categoria(mes, ano)
        
        if gastos.empty:
            # Gráfico vazio
            fig = go.Figure()
            fig.add_annotation(
                text="Nenhum dado disponível",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(
                title="Distribuição de Gastos por Categoria",
                showlegend=False
            )
            return fig
        
        # Cores personalizadas
        cores = px.colors.qualitative.Set3
        
        fig = go.Figure(data=[go.Pie(
            labels=gastos['categoria'],
            values=gastos['valor'],
            hole=0.4,  # Cria o efeito de rosca
            marker=dict(colors=cores[:len(gastos)]),
            textinfo='label+percent',
            textposition='outside',
            hovertemplate='<b>%{label}</b><br>' +
                         'Valor: R$ %{value:,.2f}<br>' +
                         'Percentual: %{percent}<extra></extra>'
        )])
        
        fig.update_layout(
            title={
                'text': "Distribuição de Gastos por Categoria",
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 20}
            },
            font=dict(size=12),
            showlegend=True,
            legend=dict(
                orientation="v",
                yanchor="middle",
                y=0.5,
                xanchor="left",
                x=1.1
            ),
            margin=dict(l=20, r=150, t=50, b=20),
            height=500
        )
        
        return fig
    
    def grafico_barras_comparativo_mensal(self, meses: int = 6) -> go.Figure:
        """
        Gera gráfico de barras comparativo mensal de entradas vs saídas
        """
        comparativo = self.calculadora.calcular_comparativo_mensal(meses)
        
        if comparativo.empty:
            fig = go.Figure()
            fig.add_annotation(
                text="Nenhum dado disponível",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(
                title="Comparativo Mensal de Entradas vs Saídas",
                showlegend=False
            )
            return fig
        
        fig = go.Figure()
        
        # Barras de Receitas (verde)
        fig.add_trace(go.Bar(
            name='Receitas',
            x=comparativo['mes_ano'],
            y=comparativo['receitas'],
            marker_color='#2ecc71',
            hovertemplate='<b>%{x}</b><br>Receitas: R$ %{y:,.2f}<extra></extra>'
        ))
        
        # Barras de Despesas (vermelho)
        fig.add_trace(go.Bar(
            name='Despesas',
            x=comparativo['mes_ano'],
            y=comparativo['despesas'],
            marker_color='#e74c3c',
            hovertemplate='<b>%{x}</b><br>Despesas: R$ %{y:,.2f}<extra></extra>'
        ))
        
        # Linha de Saldo (azul)
        fig.add_trace(go.Scatter(
            name='Saldo',
            x=comparativo['mes_ano'],
            y=comparativo['saldo'],
            mode='lines+markers',
            line=dict(color='#3498db', width=3),
            marker=dict(size=8, color='#3498db'),
            yaxis='y2',
            hovertemplate='<b>%{x}</b><br>Saldo: R$ %{y:,.2f}<extra></extra>'
        ))
        
        fig.update_layout(
            title={
                'text': "Comparativo Mensal de Entradas vs Saídas",
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 20}
            },
            xaxis=dict(
                title="Mês/Ano",
                tickangle=-45
            ),
            yaxis=dict(
                title="Valor (R$)",
                side='left'
            ),
            yaxis2=dict(
                title="Saldo (R$)",
                overlaying='y',
                side='right'
            ),
            barmode='group',
            hovermode='x unified',
            legend=dict(
                orientation="h",
                yanchor="bottom",
                y=1.02,
                xanchor="right",
                x=1
            ),
            height=500,
            margin=dict(l=60, r=60, t=80, b=80)
        )
        
        return fig
    
    def grafico_evolucao_patrimonial(self, meses: int = 12) -> go.Figure:
        """
        Gera gráfico de linha para evolução patrimonial mensal
        """
        evolucao = self.calculadora.calcular_evolucao_patrimonial(meses)
        
        if evolucao.empty:
            fig = go.Figure()
            fig.add_annotation(
                text="Nenhum dado disponível",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(
                title="Evolução Patrimonial",
                showlegend=False
            )
            return fig
        
        fig = go.Figure()
        
        # Linha de evolução
        fig.add_trace(go.Scatter(
            x=evolucao['mes_ano'],
            y=evolucao['patrimonio'],
            mode='lines+markers',
            name='Patrimônio',
            line=dict(color='#9b59b6', width=3),
            marker=dict(size=10, color='#9b59b6'),
            fill='tozeroy',
            fillcolor='rgba(155, 89, 182, 0.2)',
            hovertemplate='<b>%{x}</b><br>Patrimônio: R$ %{y:,.2f}<extra></extra>'
        ))
        
        # Linha de referência zero
        fig.add_hline(
            y=0,
            line_dash="dash",
            line_color="gray",
            annotation_text="Zero",
            annotation_position="right"
        )
        
        fig.update_layout(
            title={
                'text': "Evolução Patrimonial Mensal",
                'x': 0.5,
                'xanchor': 'center',
                'font': {'size': 20}
            },
            xaxis=dict(
                title="Mês/Ano",
                tickangle=-45
            ),
            yaxis=dict(
                title="Patrimônio Acumulado (R$)",
                tickformat='R$ ,.2f'
            ),
            hovermode='x unified',
            height=400,
            margin=dict(l=60, r=40, t=80, b=80)
        )
        
        return fig
    
    def grafico_progresso_meta(self, valor_atual: float, valor_objetivo: float, 
                               nome_meta: str = "Meta") -> go.Figure:
        """
        Gera gráfico de progresso circular para uma meta
        """
        progresso = (valor_atual / valor_objetivo * 100) if valor_objetivo > 0 else 0
        progresso = min(100, max(0, progresso))
        
        fig = go.Figure()
        
        # Círculo de progresso
        fig.add_trace(go.Indicator(
            mode="gauge+number+delta",
            value=progresso,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': nome_meta},
            delta={'reference': 100},
            gauge={
                'axis': {'range': [None, 100]},
                'bar': {'color': "#2ecc71" if progresso >= 100 else "#3498db"},
                'steps': [
                    {'range': [0, 50], 'color': "lightgray"},
                    {'range': [50, 100], 'color': "gray"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 100
                }
            },
            number={'suffix': '%'}
        ))
        
        fig.update_layout(
            title={
                'text': f"Progresso: R$ {valor_atual:,.2f} / R$ {valor_objetivo:,.2f}",
                'x': 0.5,
                'xanchor': 'center'
            },
            height=300
        )
        
        return fig
    
    def grafico_orcamento_vs_gasto(self, categoria_id: int, mes: Optional[int] = None,
                                   ano: Optional[int] = None) -> go.Figure:
        """
        Gera gráfico comparando orçamento vs gasto real de uma categoria
        """
        orcamento_info = self.calculadora.calcular_orcamento_disponivel(categoria_id, mes, ano)
        
        if not orcamento_info['tem_orcamento']:
            fig = go.Figure()
            fig.add_annotation(
                text="Nenhum orçamento definido para esta categoria",
                xref="paper", yref="paper",
                x=0.5, y=0.5, showarrow=False,
                font=dict(size=16, color="gray")
            )
            fig.update_layout(showlegend=False)
            return fig
        
        fig = go.Figure()
        
        # Barra de limite
        fig.add_trace(go.Bar(
            name='Limite do Orçamento',
            x=['Orçamento'],
            y=[orcamento_info['limite']],
            marker_color='#95a5a6',
            hovertemplate='Limite: R$ %{y:,.2f}<extra></extra>'
        ))
        
        # Barra de gasto atual
        cor_gasto = '#e74c3c' if orcamento_info['gasto_atual'] > orcamento_info['limite'] else '#2ecc71'
        fig.add_trace(go.Bar(
            name='Gasto Atual',
            x=['Orçamento'],
            y=[orcamento_info['gasto_atual']],
            marker_color=cor_gasto,
            hovertemplate='Gasto: R$ %{y:,.2f}<br>Percentual: %{customdata:.1f}%<extra></extra>',
            customdata=[orcamento_info['percentual_usado']]
        ))
        
        fig.update_layout(
            title=f"Orçamento vs Gasto Real ({orcamento_info['percentual_usado']:.1f}% usado)",
            barmode='overlay',
            height=300,
            yaxis=dict(title="Valor (R$)"),
            showlegend=True
        )
        
        return fig
