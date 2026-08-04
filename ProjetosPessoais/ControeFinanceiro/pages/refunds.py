import streamlit as st
from datetime import date
from controllers.app_controller import AppController
from models.refund import Refund
from utils.formatters import format_currency, format_date

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🔄 Central de Reembolsos a Receber</h1>
        <div class="header-subtitle">Controle de valores devidos por terceiros, empresas ou amigos com status de recebimento</div>
    </div>
    """, unsafe_allow_html=True)

    pending_refunds = controller.recurring.refund_repo.get_pending()
    total_pending = sum(r.total_amount for r in pending_refunds)

    st.markdown(f"""
    <div class="metric-card" style="border-left: 5px solid #F59E0B;">
        <div class="metric-title">Total Pendente a Receber</div>
        <div class="metric-value" style="color: #F59E0B;">{format_currency(total_pending)}</div>
        <div class="metric-trend trend-neutral">Acompanhamento de cobranças</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)

    tab_list, tab_add = st.tabs(["📋 Reembolsos Registrados", "➕ Novo Reembolso"])

    with tab_list:
        all_refunds = controller.recurring.refund_repo.get_all()
        if not all_refunds:
            st.info("Nenhum reembolso cadastrado.")
        else:
            for ref in all_refunds:
                col1, col2, col3, col4 = st.columns([3, 2, 2, 2])
                with col1:
                    st.write(f"🔄 **{ref.description}** (Devedor: {ref.debtor_name})")
                with col2:
                    st.write(f"Valor: **{format_currency(ref.total_amount)}**")
                with col3:
                    st.write(f"Data: {format_date(ref.refund_date)}")
                with col4:
                    if ref.status == "Pendente":
                        if st.button("✅ Marcar Recebido", key=f"rec_{ref.id}"):
                            ref.status = "Recebido"
                            controller.recurring.refund_repo.update(ref)
                            st.success("Reembolso marcado como Recebido!")
                            st.rerun()
                    else:
                        st.write(f"Status: **{ref.status}**")

    with tab_add:
        with st.form("new_refund_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                desc = st.text_input("Descrição*", placeholder="Ex: Almoço Reunião Empresa")
            with c2:
                debtor = st.text_input("Devedor / Empresa*", placeholder="Ex: Empresa ACME")
            with c3:
                amount = st.number_input("Valor a Receber (R$)*", min_value=1.0, value=75.0)

            ref_date = st.date_input("Data da Despesa", value=date.today())
            notes = st.text_area("Observações")

            if st.form_submit_button("💾 Salvar Reembolso"):
                if not desc or not debtor:
                    st.error("Descrição e devedor são obrigatórios.")
                else:
                    new_ref = Refund(
                        description=desc,
                        debtor_name=debtor,
                        total_amount=amount,
                        refund_date=ref_date,
                        notes=notes,
                        status="Pendente"
                    )
                    controller.recurring.refund_repo.add(new_ref)
                    st.success("Reembolso cadastrado com sucesso!")
                    st.rerun()
