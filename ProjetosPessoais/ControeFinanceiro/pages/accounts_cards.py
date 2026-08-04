import streamlit as st
from controllers.app_controller import AppController
from utils.formatters import format_currency

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🏦 Gestão de Contas & Cartões de Crédito</h1>
        <div class="header-subtitle">Controle de saldos bancários, limites de crédito, fechamentos e vencimentos</div>
    </div>
    """, unsafe_allow_html=True)

    tab_acc, tab_card = st.tabs(["🏦 Contas Bancárias & Carteiras", "💳 Cartões de Crédito"])

    # TAB 1: Contas Bancárias
    with tab_acc:
        st.subheader("Contas Cadastradas")
        accounts = controller.accounts.get_all_accounts()

        cols = st.columns(3)
        for idx, acc in enumerate(accounts):
            with cols[idx % 3]:
                st.markdown(f"""
                <div class="metric-card" style="border-left: 5px solid {acc.color};">
                    <div style="font-size: 1.5rem;">{acc.icon} {acc.name}</div>
                    <div style="color: #94A3B8; font-size: 0.85rem;">Tipo: {acc.account_type}</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: #38BDF8; margin-top: 0.5rem;">
                        {format_currency(acc.current_balance)}
                    </div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Nova Conta Bancária")
        with st.form("new_account_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                acc_name = st.text_input("Nome da Conta*", placeholder="Ex: C6 Bank, XP Investimentos")
            with c2:
                acc_type = st.selectbox("Tipo de Conta", ["Conta Corrente", "Poupança", "Investimentos", "Dinheiro", "PJ"])
            with c3:
                acc_bal = st.number_input("Saldo Inicial (R$)", value=0.0)

            c4, c5 = st.columns(2)
            with c4:
                acc_icon = st.text_input("Ícone Emoji", value="🏦")
            with c5:
                acc_color = st.color_picker("Cor Indicativa", value="#3498DB")

            if st.form_submit_button("💾 Salvar Conta"):
                if not acc_name:
                    st.error("O nome da conta é obrigatório.")
                else:
                    controller.accounts.create_account(acc_name, acc_type, acc_bal, acc_icon, acc_color)
                    st.success(f"Conta '{acc_name}' criada com sucesso!")
                    st.rerun()

    # TAB 2: Cartões de Crédito
    with tab_card:
        st.subheader("Cartões de Crédito Cadastrados")
        cards = controller.accounts.get_all_cards()

        cols_c = st.columns(2)
        for idx, card in enumerate(cards):
            with cols_c[idx % 2]:
                st.markdown(f"""
                <div class="metric-card" style="border-top: 4px solid {card.color};">
                    <div style="font-size: 1.3rem; font-weight: 700;">💳 {card.name} ({card.brand})</div>
                    <div style="margin-top: 0.5rem; font-size: 1.2rem; color: #10B981; font-weight: 700;">
                        Limite: {format_currency(card.credit_limit)}
                    </div>
                    <div style="color: #94A3B8; font-size: 0.85rem; margin-top: 0.4rem;">
                        📅 Fechamento: Dia {card.closing_day} | 🔔 Vencimento: Dia {card.due_day}
                    </div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Novo Cartão de Crédito")
        with st.form("new_card_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                card_name = st.text_input("Nome do Cartão*", placeholder="Ex: Itaú Personalité")
            with c2:
                card_brand = st.selectbox("Bandeira", ["Mastercard", "Visa", "Elo", "Amex", "Outro"])
            with c3:
                card_limit = st.number_input("Limite Total (R$)", value=1000.0, step=500.0)

            c4, c5, c6 = st.columns(3)
            with c4:
                closing_day = st.number_input("Dia Fechamento Fatura", min_value=1, max_value=31, value=1)
            with c5:
                due_day = st.number_input("Dia Vencimento Fatura", min_value=1, max_value=31, value=10)
            with c6:
                card_color = st.color_picker("Cor do Cartão", value="#8A05BE")

            if st.form_submit_button("💾 Salvar Cartão"):
                if not card_name:
                    st.error("O nome do cartão é obrigatório.")
                else:
                    controller.accounts.create_card(card_name, card_brand, card_limit, closing_day, due_day, card_color)
                    st.success(f"Cartão '{card_name}' cadastrado com sucesso!")
                    st.rerun()
