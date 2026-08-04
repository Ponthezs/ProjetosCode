import streamlit as st
from controllers.app_controller import AppController
from utils.validators import validate_split_total
from utils.formatters import format_currency

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">👨‍👩‍👧‍👦 Divisão de Despesas por Pessoa</h1>
        <div class="header-subtitle">Fracione compras únicas em partes proporcionais entre você, esposa, família ou empresa</div>
    </div>
    """, unsafe_allow_html=True)

    owners = controller.owners.get_all()
    transactions = controller.transactions.trans_repo.get_filtered(type_="Despesa")

    if not transactions:
        st.info("Nenhuma despesa registrada para divisão.")
        return

    trans_dict = {f"#{t.id} - {t.description} ({format_currency(t.amount)}) - {t.transaction_date}": t for t in transactions[:30]}
    sel_label = st.selectbox("Selecione a compra para fracionar:", list(trans_dict.keys()))
    selected_trans = trans_dict[sel_label]

    st.markdown(f"### Compra Selecionada: **{selected_trans.description}** | Total: **{format_currency(selected_trans.amount)}**")

    st.subheader("Definir Divisão entre Proprietários")

    splits_input = []
    total_entered = 0.0

    cols = st.columns(len(owners))
    for idx, o in enumerate(owners):
        with cols[idx]:
            st.markdown(f"**{o.name}**")
            val = st.number_input(f"Valor R$ ({o.name})", min_value=0.0, max_value=selected_trans.amount, value=0.0, step=10.0, key=f"split_{o.id}")
            if val > 0:
                splits_input.append({"owner_id": o.id, "amount": val, "percentage": (val/selected_trans.amount)*100})
                total_entered += val

    st.markdown(f"**Soma das partes:** {format_currency(total_entered)} / **Total da compra:** {format_currency(selected_trans.amount)}")

    if st.button("💾 Salvar Divisão da Despesa", use_container_width=True):
        is_valid, msg = validate_split_total(selected_trans.amount, [s["amount"] for s in splits_input])
        if not is_valid:
            st.error(msg)
        else:
            controller.transactions.trans_repo.save_splits(selected_trans.id, splits_input)
            st.success("Divisão salva no banco SQLite com sucesso! As estatísticas agora refletirão as partes de cada pessoa.")
            st.rerun()
