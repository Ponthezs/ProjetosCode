import streamlit as st

# Configuração da página Streamlit (deve ser o primeiro comando Streamlit)
st.set_page_config(
    page_title="FinanceControl - Gestão Financeira Pessoal",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

from config.theme import inject_custom_css
from database.connection import init_db
from controllers.app_controller import AppController
from components.sidebar import render_sidebar

# Importar Páginas
from pages import (
    dashboard,
    transactions,
    accounts_cards,
    categories_tags,
    fixed_subscriptions,
    goals_budgets,
    refunds,
    splits,
    importer,
    ai_assistant,
    reports_export,
    settings
)

def main():
    # Injetar Tema CSS Customizado
    inject_custom_css()

    # Inicializar Banco de Dados SQLite (tabelas e sementes padrão)
    init_db()

    # Instanciar Orquestrador Controller
    controller = AppController()

    try:
        # Sincronização automática em background de novas planilhas na pasta dados/ na primeira inicialização da sessão
        if "auto_synced" not in st.session_state:
            sync_res = controller.importer.auto_sync_all_csvs()
            st.session_state["auto_synced"] = True
            if sync_res.get("imported", 0) > 0:
                st.toast(sync_res["message"], icon="🚀")

        # Renderizar Navegação Sidebar
        page = render_sidebar(controller)

        # Roteamento de Páginas
        if page == "dashboard":
            dashboard.render(controller)
        elif page == "transactions":
            transactions.render(controller)
        elif page == "accounts_cards":
            accounts_cards.render(controller)
        elif page == "categories_tags":
            categories_tags.render(controller)
        elif page == "fixed_subscriptions":
            fixed_subscriptions.render(controller)
        elif page == "goals_budgets":
            goals_budgets.render(controller)
        elif page == "refunds":
            refunds.render(controller)
        elif page == "splits":
            splits.render(controller)
        elif page == "importer":
            importer.render(controller)
        elif page == "ai_assistant":
            ai_assistant.render(controller)
        elif page == "reports":
            reports_export.render(controller)
        elif page == "settings":
            settings.render(controller)
    finally:
        controller.close()

if __name__ == "__main__":
    main()
