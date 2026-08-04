from typing import List, Dict, Any
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from repositories.transaction_repo import TransactionRepository
from repositories.recurring_repo import SubscriptionRepository
from repositories.goal_budget_repo import BudgetRepository
from utils.formatters import format_currency, format_percentage

class AIFinancialEngineService:
    def __init__(self, db: Session):
        self.db = db
        self.trans_repo = TransactionRepository(db)
        self.sub_repo = SubscriptionRepository(db)
        self.budget_repo = BudgetRepository(db)

    def generate_insights(self, current_date: Optional[date] = None) -> List[Dict[str, Any]]:
        """Gera uma lista de análises e diagnósticos financeiros inteligentes."""
        today = current_date or date.today()
        insights = []

        # 1. Comparativo Mês Atual vs Mês Anterior
        first_current = today.replace(day=1)
        last_current = today
        
        # Mês anterior
        first_prev = (first_current - timedelta(days=1)).replace(day=1)
        last_prev = first_current - timedelta(days=1)

        trans_current = self.trans_repo.get_filtered(start_date=first_current, end_date=last_current, type_="Despesa")
        trans_prev = self.trans_repo.get_filtered(start_date=first_prev, end_date=last_prev, type_="Despesa")

        exp_current = sum(t.amount for t in trans_current)
        exp_prev = sum(t.amount for t in trans_prev)

        if exp_prev > 0:
            var_pct = ((exp_current - exp_prev) / exp_prev) * 100
            if var_pct > 0:
                insights.append({
                    "type": "warning",
                    "title": "Aumento de Gastos",
                    "text": f"Você gastou {format_percentage(var_pct)} a mais neste mês em comparação com o mesmo período do mês passado ({format_currency(exp_current)} vs {format_currency(exp_prev)})."
                })
            else:
                insights.append({
                    "type": "success",
                    "title": "Economia em Relação ao Mês Anterior",
                    "text": f"Parabéns! Seus gastos estão {format_percentage(abs(var_pct))} menores do que no mesmo período do mês anterior."
                })

        # 2. Maior Categoria de Gastos
        cat_totals = {}
        for t in trans_current:
            cat_name = t.category.name if t.category else "Sem Categoria"
            cat_totals[cat_name] = cat_totals.get(cat_name, 0.0) + t.amount

        if cat_totals:
            top_cat = max(cat_totals, key=cat_totals.get)
            top_val = cat_totals[top_cat]
            pct_top = (top_val / exp_current * 100) if exp_current > 0 else 0
            insights.append({
                "type": "info",
                "title": "Categoria Dominante",
                "text": f"Seu maior gasto neste mês foi com **{top_cat}**, representando {format_percentage(pct_top)} dos seus gastos totais ({format_currency(top_val)})."
            })

        # 3. Análise de Finais de Semana
        weekend_spend = sum(t.amount for t in trans_current if t.transaction_date.weekday() in [5, 6])
        if exp_current > 0:
            pct_weekend = (weekend_spend / exp_current) * 100
            if pct_weekend > 35:
                insights.append({
                    "type": "warning",
                    "title": "Pico nos Finais de Semana",
                    "text": f"Atenção: {format_percentage(pct_weekend)} das suas despesas ({format_currency(weekend_spend)}) ocorreram aos finais de semana."
                })

        # 4. Diagnóstico de Assinaturas
        subscriptions = self.sub_repo.get_all_with_relations()
        active_subs = [s for s in subscriptions if s.is_active]
        total_sub_monthly = sum(s.monthly_cost for s in active_subs)
        total_sub_annual = sum(s.annual_cost for s in active_subs)

        if active_subs:
            insights.append({
                "type": "info",
                "title": "Custo de Assinaturas",
                "text": f"Você possui {len(active_subs)} assinaturas ativas. O custo mensal acumulado é {format_currency(total_sub_monthly)} ({format_currency(total_sub_annual)} ao ano)."
            })

        # 5. Previsão de Saldo ao Fim do Mês
        days_in_month = 30
        days_passed = max(1, today.day)
        daily_avg = exp_current / days_passed
        projected_total_exp = daily_avg * 30
        
        inc_current = sum(t.amount for t in self.trans_repo.get_filtered(start_date=first_current, end_date=last_current, type_="Receita"))
        projected_balance = inc_current - projected_total_exp

        insights.append({
            "type": "prediction",
            "title": "Previsão de Fechamento do Mês",
            "text": f"Com base na sua média diária atual ({format_currency(daily_avg)}/dia), a projeção de gastos totais do mês é {format_currency(projected_total_exp)}. O saldo estimado de fechamento é **{format_currency(projected_balance)}**."
        })

        return insights
