"""
Módulo de Cálculos - Sistema de Controle Financeiro Inteligente
Gerencia todos os cálculos automáticos, KPIs e regras de negócio
"""

import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional, List
from database import Database

class CalculadoraFinanceira:
    """Classe para realizar cálculos financeiros automáticos"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def calcular_fluxo_caixa(self, mes: Optional[int] = None, ano: Optional[int] = None) -> Dict:
        """
        Calcula o fluxo de caixa:
        - Saldo Atual
        - Projeção de Saldo Final do Mês
        - Total de Contas a Pagar (Pendentes)
        """
        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year
        
        # Obtém todas as transações até o momento atual
        transacoes = self.db.obter_transacoes(mes=mes, ano=ano)
        
        if transacoes.empty:
            return {
                'saldo_atual': 0.0,
                'projecao_final_mes': 0.0,
                'total_pendente': 0.0,
                'receitas_pagas': 0.0,
                'despesas_pagas': 0.0,
                'receitas_pendentes': 0.0,
                'despesas_pendentes': 0.0
            }
        
        # Calcula receitas e despesas pagas
        receitas_pagas = transacoes[
            (transacoes['tipo'] == 'Receita') & 
            (transacoes['status'] == 'Pago')
        ]['valor'].sum()
        
        despesas_pagas = transacoes[
            (transacoes['tipo'] == 'Despesa') & 
            (transacoes['status'] == 'Pago')
        ]['valor'].sum()
        
        # Calcula receitas e despesas pendentes
        receitas_pendentes = transacoes[
            (transacoes['tipo'] == 'Receita') & 
            (transacoes['status'] == 'Pendente')
        ]['valor'].sum()
        
        despesas_pendentes = transacoes[
            (transacoes['tipo'] == 'Despesa') & 
            (transacoes['status'] == 'Pendente')
        ]['valor'].sum()
        
        # Saldo atual (apenas transações pagas)
        saldo_atual = receitas_pagas - despesas_pagas
        
        # Projeção final do mês (incluindo pendentes)
        projecao_final_mes = (receitas_pagas + receitas_pendentes) - (despesas_pagas + despesas_pendentes)
        
        # Total de contas a pagar (pendentes)
        total_pendente = despesas_pendentes
        
        return {
            'saldo_atual': float(saldo_atual),
            'projecao_final_mes': float(projecao_final_mes),
            'total_pendente': float(total_pendente),
            'receitas_pagas': float(receitas_pagas),
            'despesas_pagas': float(despesas_pagas),
            'receitas_pendentes': float(receitas_pendentes),
            'despesas_pendentes': float(despesas_pendentes)
        }
    
    def calcular_kpis(self, mes: Optional[int] = None, ano: Optional[int] = None) -> Dict:
        """
        Calcula os KPIs principais:
        - Receita Total vs Despesa Total
        - Taxa de Poupança (Savings Rate %)
        - Evolução Patrimonial mensal
        """
        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year
        
        transacoes = self.db.obter_transacoes(mes=mes, ano=ano)
        
        if transacoes.empty:
            return {
                'receita_total': 0.0,
                'despesa_total': 0.0,
                'taxa_poupanca': 0.0,
                'saldo_mensal': 0.0
            }
        
        # Receita e Despesa Total (incluindo pendentes)
        receita_total = transacoes[transacoes['tipo'] == 'Receita']['valor'].sum()
        despesa_total = transacoes[transacoes['tipo'] == 'Despesa']['valor'].sum()
        
        # Saldo mensal
        saldo_mensal = receita_total - despesa_total
        
        # Taxa de Poupança (%)
        if receita_total > 0:
            taxa_poupanca = (saldo_mensal / receita_total) * 100
        else:
            taxa_poupanca = 0.0
        
        return {
            'receita_total': float(receita_total),
            'despesa_total': float(despesa_total),
            'taxa_poupanca': float(taxa_poupanca),
            'saldo_mensal': float(saldo_mensal)
        }
    
    def verificar_alertas_categoria(self, mes: Optional[int] = None, ano: Optional[int] = None) -> List[Dict]:
        """
        Verifica se alguma categoria ultrapassou 30% da renda
        Retorna lista de alertas
        """
        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year
        
        # Calcula receita total do mês
        kpis = self.calcular_kpis(mes, ano)
        receita_total = kpis['receita_total']
        
        if receita_total == 0:
            return []
        
        # Obtém gastos por categoria
        transacoes = self.db.obter_transacoes(mes=mes, ano=ano)
        despesas = transacoes[transacoes['tipo'] == 'Despesa']
        
        if despesas.empty:
            return []
        
        # Agrupa por categoria principal
        gastos_por_categoria = despesas.groupby('categoria')['valor'].sum()
        
        # Limite de 30% da renda
        limite_percentual = receita_total * 0.30
        
        alertas = []
        for categoria, valor in gastos_por_categoria.items():
            if valor > limite_percentual:
                percentual = (valor / receita_total) * 100
                alertas.append({
                    'categoria': categoria,
                    'valor': float(valor),
                    'percentual': float(percentual),
                    'limite': float(limite_percentual)
                })
        
        return alertas
    
    def calcular_gastos_por_categoria(self, mes: Optional[int] = None, ano: Optional[int] = None) -> pd.DataFrame:
        """Calcula gastos agrupados por categoria"""
        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year
        
        transacoes = self.db.obter_transacoes(mes=mes, ano=ano)
        despesas = transacoes[transacoes['tipo'] == 'Despesa']
        
        if despesas.empty:
            return pd.DataFrame(columns=['categoria', 'valor', 'percentual'])
        
        gastos = despesas.groupby('categoria')['valor'].sum().reset_index()
        gastos.columns = ['categoria', 'valor']
        gastos = gastos.sort_values('valor', ascending=False)
        
        total = gastos['valor'].sum()
        if total > 0:
            gastos['percentual'] = (gastos['valor'] / total) * 100
        else:
            gastos['percentual'] = 0.0
        
        return gastos
    
    def calcular_comparativo_mensal(self, meses: int = 6) -> pd.DataFrame:
        """
        Calcula comparativo mensal de entradas vs saídas
        para os últimos N meses
        """
        hoje = datetime.now()
        dados_mensais = []
        
        for i in range(meses):
            data_ref = hoje - timedelta(days=30 * i)
            mes = data_ref.month
            ano = data_ref.year
            
            kpis = self.calcular_kpis(mes, ano)
            
            dados_mensais.append({
                'mes': mes,
                'ano': ano,
                'mes_ano': f"{mes:02d}/{ano}",
                'receitas': kpis['receita_total'],
                'despesas': kpis['despesa_total'],
                'saldo': kpis['saldo_mensal']
            })
        
        df = pd.DataFrame(dados_mensais)
        df = df.sort_values(['ano', 'mes'])
        
        return df
    
    def calcular_evolucao_patrimonial(self, meses: int = 12) -> pd.DataFrame:
        """
        Calcula a evolução patrimonial mensal
        (acumulado de saldos mensais)
        """
        comparativo = self.calcular_comparativo_mensal(meses)
        
        if comparativo.empty:
            return pd.DataFrame(columns=['mes_ano', 'patrimonio'])
        
        # Calcula patrimônio acumulado
        comparativo['patrimonio'] = comparativo['saldo'].cumsum()
        
        return comparativo[['mes_ano', 'patrimonio']]
    
    def calcular_orcamento_disponivel(self, categoria_id: int, mes: Optional[int] = None, 
                                     ano: Optional[int] = None) -> Dict:
        """
        Calcula quanto ainda pode ser gasto em uma categoria
        antes de atingir o limite do orçamento
        """
        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year
        
        # Obtém orçamento da categoria
        orcamentos = self.db.obter_orcamentos(mes=mes, ano=ano)
        orcamento_cat = orcamentos[orcamentos['categoria_id'] == categoria_id]
        
        if orcamento_cat.empty:
            return {
                'tem_orcamento': False,
                'limite': 0.0,
                'gasto_atual': 0.0,
                'disponivel': 0.0,
                'percentual_usado': 0.0
            }
        
        limite = float(orcamentos.iloc[0]['valor_limite'])
        
        # Calcula gasto atual na categoria
        transacoes = self.db.obter_transacoes(mes=mes, ano=ano)
        categoria = self.db.obter_categorias()
        categoria_nome = categoria[categoria['id'] == categoria_id]['nome'].iloc[0]
        
        gastos_categoria = transacoes[
            (transacoes['categoria'] == categoria_nome) &
            (transacoes['tipo'] == 'Despesa')
        ]
        
        gasto_atual = float(gastos_categoria['valor'].sum())
        disponivel = limite - gasto_atual
        percentual_usado = (gasto_atual / limite * 100) if limite > 0 else 0.0
        
        return {
            'tem_orcamento': True,
            'limite': limite,
            'gasto_atual': gasto_atual,
            'disponivel': max(0.0, disponivel),
            'percentual_usado': percentual_usado
        }
    
    def calcular_progresso_meta(self, meta_id: int) -> Dict:
        """Calcula o progresso de uma meta"""
        metas = self.db.obter_metas()
        meta = metas[metas['id'] == meta_id]
        
        if meta.empty:
            return {
                'existe': False,
                'progresso_percentual': 0.0,
                'faltando': 0.0
            }
        
        meta_row = meta.iloc[0]
        valor_objetivo = float(meta_row['valor_objetivo'])
        valor_atual = float(meta_row['valor_atual'])
        
        progresso_percentual = (valor_atual / valor_objetivo * 100) if valor_objetivo > 0 else 0.0
        faltando = max(0.0, valor_objetivo - valor_atual)
        
        return {
            'existe': True,
            'nome': meta_row['nome'],
            'valor_objetivo': valor_objetivo,
            'valor_atual': valor_atual,
            'progresso_percentual': min(100.0, progresso_percentual),
            'faltando': faltando
        }
