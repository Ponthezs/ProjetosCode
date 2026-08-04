import streamlit as st
import pandas as pd
from typing import List, Callable
from models.transaction import Transaction
from utils.formatters import format_currency, format_date

def render_transaction_table(
    transactions: List[Transaction],
    on_edit_click: Callable[[Transaction], None] = None,
    on_delete_click: Callable[[int], None] = None
):
    """Renderiza tabela estilizada de movimentações financeiras."""
    if not transactions:
        st.info("Nenhuma movimentação encontrada com os filtros selecionados.")
        return

    table_data = []
    for t in transactions:
        cat_name = t.category.name if t.category else "Geral"
        acc_name = t.account.name if t.account else "N/A"
        owner_name = t.owner.name if t.owner else "Meu"
        status_badge = f"🟢 {t.status}" if t.status == "Pago" else f"🟠 {t.status}"

        table_data.append({
            "ID": t.id,
            "Data": format_date(t.transaction_date),
            "Descrição": t.description,
            "Tipo": t.type,
            "Valor": format_currency(t.amount),
            "Categoria": cat_name,
            "Conta": acc_name,
            "Proprietário": owner_name,
            "Status": status_badge,
            "Forma Pagto": t.payment_method,
            "Parcela": f"{t.installment_number}/{t.total_installments}" if t.total_installments > 1 else "1/1"
        })

    df = pd.DataFrame(table_data)
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "ID": st.column_config.NumberColumn("ID", width="small"),
            "Valor": st.column_config.TextColumn("Valor", width="medium"),
            "Descrição": st.column_config.TextColumn("Descrição", width="large")
        }
    )
