from typing import List, Dict, Any, Optional
from datetime import date, datetime
import pandas as pd
from sqlalchemy.orm import Session
from repositories.transaction_repo import TransactionRepository
from repositories.account_repo import AccountRepository

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self.trans_repo = TransactionRepository(db)
        self.acc_repo = AccountRepository(db)

    def get_summary_kpis(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        owner_id: Optional[int] = None,
        account_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Calcula os indicadores principais de desempenho (KPIs)."""
        transactions = self.trans_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            owner_id=owner_id,
            account_id=account_id
        )

        total_income = 0.0
        total_expense = 0.0

        for t in transactions:
            if t.status != "Cancelado":
                # Se houver divisão por proprietário e filtro de proprietário ativo, considerar a fração do proprietário
                val = t.amount
                if owner_id and t.splits:
                    user_split = next((s for s in t.splits if s.owner_id == owner_id), None)
                    val = user_split.amount if user_split else 0.0

                if t.type == "Receita":
                    total_income += val
                elif t.type in ["Despesa", "Investimento"]:
                    total_expense += val

        balance = total_income - total_expense
        savings_rate = ((total_income - total_expense) / total_income * 100) if total_income > 0 else 0.0

        accounts = self.acc_repo.get_all()
        net_worth = sum(acc.current_balance for acc in accounts)

        # Média diária e ticket médio
        days = (end_date - start_date).days + 1 if (start_date and end_date) else 30
        days = max(1, days)
        daily_avg_expense = total_expense / days
        expense_count = sum(1 for t in transactions if t.type == "Despesa")
        ticket_avg = total_expense / expense_count if expense_count > 0 else 0.0

        return {
            "receitas": total_income,
            "despesas": total_expense,
            "saldo": balance,
            "taxa_economia": max(0.0, savings_rate),
            "patrimonio_total": net_worth,
            "media_diaria_gasto": daily_avg_expense,
            "ticket_medio_despesa": ticket_avg,
            "qtd_movimentacoes": len(transactions)
        }

    def get_top_categories(self, start_date: date, end_date: date, limit: int = 5) -> pd.DataFrame:
        transactions = self.trans_repo.get_filtered(start_date=start_date, end_date=end_date, type_="Despesa")
        data = []
        for t in transactions:
            cat_name = t.category.name if t.category else "Sem Categoria"
            data.append({"Categoria": cat_name, "Valor": t.amount})
        
        df = pd.DataFrame(data)
        if df.empty:
            return pd.DataFrame(columns=["Categoria", "Valor"])
        return df.groupby("Categoria")["Valor"].sum().reset_index().sort_values(by="Valor", ascending=False).head(limit)

    def get_monthly_cashflow(self, year: int) -> pd.DataFrame:
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        transactions = self.trans_repo.get_filtered(start_date=start_date, end_date=end_date)
        
        months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        df_res = pd.DataFrame({"Mês": months, "Receitas": [0.0]*12, "Despesas": [0.0]*12, "Saldo": [0.0]*12})

        for t in transactions:
            m_idx = t.transaction_date.month - 1
            if t.type == "Receita":
                df_res.at[m_idx, "Receitas"] += t.amount
            elif t.type in ["Despesa", "Investimento"]:
                df_res.at[m_idx, "Despesas"] += t.amount

        df_res["Saldo"] = df_res["Receitas"] - df_res["Despesas"]
        return df_res
