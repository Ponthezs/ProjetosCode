import streamlit as st

def render_sidebar(controller=None):
    """Renderiza a barra lateral de navegação com ícones, seletor de páginas e botão de sincronização rápida."""
    with st.sidebar:
        st.markdown("""
        <div style="text-align: center; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1.5rem;">
            <h2 style="color: #38BDF8; font-weight: 800; margin: 0;">💰 FinanceControl</h2>
            <p style="color: #94A3B8; font-size: 0.85rem; margin-top: 0.2rem;">Sistema Pessoal Inteligente</p>
        </div>
        """, unsafe_allow_html=True)

        pages = {
            "📊 Dashboard Executivo": "dashboard",
            "💳 Lançamentos & Edição": "transactions",
            "🏦 Contas & Cartões": "accounts_cards",
            "🏷️ Categorias & Tags": "categories_tags",
            "🔁 Gastos Fixos & Assinaturas": "fixed_subscriptions",
            "🎯 Metas & Orçamentos": "goals_budgets",
            "🔄 Central de Reembolsos": "refunds",
            "👨‍👩‍👧‍👦 Divisão de Despesas": "splits",
            "📥 Importador Inteligente": "importer",
            "🤖 IA Financeira": "ai_assistant",
            "📑 Relatórios & Exportação": "reports",
            "⚙️ Configurações & Backup": "settings"
        }

        selected_label = st.radio(
            "Navegação",
            options=list(pages.keys()),
            label_visibility="collapsed"
        )

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.2rem 0;'>", unsafe_allow_html=True)

        if controller:
            if st.button("⚡ Sincronizar Planilhas (dados/)", use_container_width=True, type="secondary"):
                with st.spinner("Lendo e sincronizando planilhas em dados/..."):
                    res = controller.importer.auto_sync_all_csvs()
                    if res.get("imported", 0) > 0:
                        st.toast(f"✅ {res['message']}", icon="🎉")
                        st.rerun()
                    else:
                        st.toast(f"ℹ️ {res['message']}", icon="ℹ️")

        return pages[selected_label]
