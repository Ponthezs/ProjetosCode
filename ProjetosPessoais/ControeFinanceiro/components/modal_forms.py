import streamlit as st
from datetime import date
from typing import Dict, Any, List
from config.constants import TRANSACTION_TYPES, PAYMENT_METHODS, TRANSACTION_STATUS

def render_transaction_form(
    categories: list,
    accounts: list,
    cards: list,
    owners: list,
    tags_list: list,
    default_values: Dict[str, Any] = None
) -> Dict[str, Any]:
    """Renderiza o formulário completo para Cadastro Manual ou Edição de Movimentação."""
    defaults = default_values or {}

    with st.form("transaction_form", clear_on_submit=False):
        st.subheader("📝 Lançamento de Movimentação Financeira")

        col1, col2, col3 = st.columns(3)
        with col1:
            description = st.text_input("Descrição*", value=defaults.get("description", ""))
        with col2:
            amount = st.number_input("Valor (R$)*", min_value=0.01, value=float(defaults.get("amount", 10.0)), step=1.0)
        with col3:
            trans_date = st.date_input("Data*", value=defaults.get("transaction_date", date.today()))

        col4, col5, col6 = st.columns(3)
        with col4:
            type_idx = TRANSACTION_TYPES.index(defaults.get("type", "Despesa")) if defaults.get("type") in TRANSACTION_TYPES else 0
            type_ = st.selectbox("Tipo de Transação*", TRANSACTION_TYPES, index=type_idx)
        with col5:
            pm_idx = PAYMENT_METHODS.index(defaults.get("payment_method", "Cartão de Crédito")) if defaults.get("payment_method") in PAYMENT_METHODS else 0
            payment_method = st.selectbox("Forma de Pagamento*", PAYMENT_METHODS, index=pm_idx)
        with col6:
            status_idx = TRANSACTION_STATUS.index(defaults.get("status", "Pago")) if defaults.get("status") in TRANSACTION_STATUS else 0
            status = st.selectbox("Status*", TRANSACTION_STATUS, index=status_idx)

        col7, col8, col9 = st.columns(3)
        with col7:
            cat_options = {c.id: f"{c.icon} {c.name}" for c in categories}
            cat_ids = list(cat_options.keys())
            selected_cat_id = st.selectbox("Categoria", cat_ids, format_func=lambda x: cat_options[x]) if cat_ids else None
        with col8:
            acc_options = {a.id: f"{a.icon} {a.name}" for a in accounts}
            acc_ids = list(acc_options.keys())
            selected_acc_id = st.selectbox("Conta", acc_ids, format_func=lambda x: acc_options[x]) if acc_ids else None
        with col9:
            card_options = {c.id: f"💳 {c.name}" for c in cards}
            card_ids = list(card_options.keys())
            selected_card_id = st.selectbox("Cartão de Crédito", [None] + card_ids, format_func=lambda x: "Nenhum" if x is None else card_options[x])

        col10, col11, col12 = st.columns(3)
        with col10:
            owner_options = {o.id: o.name for o in owners}
            owner_ids = list(owner_options.keys())
            selected_owner_id = st.selectbox("Proprietário da Despesa", owner_ids, format_func=lambda x: owner_options[x]) if owner_ids else None
        with col11:
            installments = st.number_input("Número de Parcelas", min_value=1, max_value=72, value=int(defaults.get("total_installments", 1)))
        with col12:
            tags = st.multiselect("Tags", options=[t.name for t in tags_list], default=defaults.get("tags", "").split(",") if defaults.get("tags") else [])

        notes = st.text_area("Observações", value=defaults.get("notes", ""))

        submitted = st.form_submit_button("💾 Salvar Movimentação", use_container_width=True)

        if submitted:
            return {
                "submitted": True,
                "description": description,
                "amount": amount,
                "transaction_date": trans_date,
                "type": type_,
                "payment_method": payment_method,
                "status": status,
                "category_id": selected_cat_id,
                "account_id": selected_acc_id,
                "card_id": selected_card_id,
                "owner_id": selected_owner_id,
                "installments": installments,
                "tags": ",".join(tags),
                "notes": notes
            }

    return {"submitted": False}
