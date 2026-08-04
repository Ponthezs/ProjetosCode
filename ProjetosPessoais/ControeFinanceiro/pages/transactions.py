import streamlit as st
from datetime import date
from controllers.app_controller import AppController
from components.transaction_table import render_transaction_table
from components.modal_forms import render_transaction_form
from utils.validators import validate_transaction_payload
from utils.formatters import format_currency

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">💳 Lançamentos & Edição Completa</h1>
        <div class="header-subtitle">Cadastre, pesquise, edite e gerencie todas as suas movimentações financeiras</div>
    </div>
    """, unsafe_allow_html=True)

    tab_list, tab_add, tab_edit = st.tabs(["🔍 Pesquisa & Listagem", "➕ Novo Lançamento Manual", "✏️ Edição & Exclusão"])

    categories = controller.categories.get_all_with_subcategories()
    accounts = controller.accounts.get_all_accounts()
    cards = controller.accounts.get_all_cards()
    owners = controller.owners.get_all()
    tags = controller.tags.get_all()

    # TAB 1: Pesquisa & Listagem
    with tab_list:
        st.subheader("🔍 Filtros de Pesquisa Instantânea")
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            search_text = st.text_input("Buscar por Texto / Descrição", placeholder="Ex: Mercado, Uber...")
        with c2:
            type_filter = st.selectbox("Tipo", ["Todos", "Despesa", "Receita", "Transferência", "PIX", "Investimento", "Reembolso"])
        with c3:
            status_filter = st.selectbox("Status", ["Todos", "Pago", "Pendente", "Cancelado"])
        with c4:
            owner_opts = {"Todos": None}
            owner_opts.update({o.name: o.id for o in owners})
            sel_owner_name = st.selectbox("Proprietário", list(owner_opts.keys()), key="list_owner")
            sel_owner_id = owner_opts[sel_owner_name]

        c5, c6 = st.columns(2)
        with c5:
            start_date = st.date_input("Data Início", value=date(date.today().year, 1, 1), key="t_start")
        with c6:
            end_date = st.date_input("Data Fim", value=date.today(), key="t_end")

        transactions = controller.transactions.trans_repo.get_filtered(
            start_date=start_date,
            end_date=end_date,
            type_=type_filter,
            status=status_filter,
            owner_id=sel_owner_id,
            search_query=search_text
        )

        st.markdown(f"**Total Encontrado:** {len(transactions)} movimentações")
        render_transaction_table(transactions)

    # TAB 2: Novo Lançamento Manual
    with tab_add:
        form_result = render_transaction_form(categories, accounts, cards, owners, tags)
        if form_result.get("submitted"):
            is_valid, msg = validate_transaction_payload(
                form_result["description"], form_result["amount"], form_result["transaction_date"]
            )
            if not is_valid:
                st.error(msg)
            else:
                controller.transactions.create_transaction(
                    description=form_result["description"],
                    amount=form_result["amount"],
                    transaction_date=form_result["transaction_date"],
                    type_=form_result["type"],
                    payment_method=form_result["payment_method"],
                    status=form_result["status"],
                    category_id=form_result["category_id"],
                    account_id=form_result["account_id"],
                    card_id=form_result["card_id"],
                    owner_id=form_result["owner_id"],
                    installments=form_result["installments"],
                    tags=form_result["tags"],
                    notes=form_result["notes"]
                )
                st.success(f"Movimentação '{form_result['description']}' cadastrada com sucesso!")
                st.rerun()

    # TAB 3: Edição & Exclusão Completa
    with tab_edit:
        st.subheader("✏️ Editar ou Excluir Lançamento")
        all_trans = controller.transactions.trans_repo.get_filtered()
        if not all_trans:
            st.info("Nenhuma movimentação para editar.")
        else:
            trans_dict = {f"#{t.id} - {t.description} ({format_currency(t.amount)}) - {t.transaction_date}": t.id for t in all_trans[:50]}
            selected_label = st.selectbox("Selecione a movimentação para alterar:", list(trans_dict.keys()))
            selected_id = trans_dict[selected_label]
            target_trans = controller.transactions.trans_repo.get_by_id(selected_id)

            if target_trans:
                col_e1, col_e2 = st.columns(2)
                with col_e1:
                    new_desc = st.text_input("Nova Descrição", value=target_trans.description)
                    new_amount = st.number_input("Novo Valor (R$)", value=float(target_trans.amount), min_value=0.01)
                    new_date = st.date_input("Nova Data", value=target_trans.transaction_date)
                with col_e2:
                    new_status = st.selectbox("Novo Status", ["Pago", "Pendente", "Cancelado"], index=["Pago", "Pendente", "Cancelado"].index(target_trans.status))
                    new_notes = st.text_area("Observações", value=target_trans.notes or "")

                col_b1, col_b2 = st.columns(2)
                with col_b1:
                    if st.button("💾 Salvar Alterações", use_container_width=True):
                        controller.transactions.update_transaction(
                            target_trans.id,
                            description=new_desc,
                            amount=new_amount,
                            transaction_date=new_date,
                            status=new_status,
                            notes=new_notes
                        )
                        st.success("Movimentação atualizada no banco SQLite com sucesso!")
                        st.rerun()
                with col_b2:
                    if st.button("🗑️ Excluir Movimentação", use_container_width=True, type="secondary"):
                        controller.transactions.delete_transaction(target_trans.id)
                        st.warning("Movimentação removida do banco de dados.")
                        st.rerun()
