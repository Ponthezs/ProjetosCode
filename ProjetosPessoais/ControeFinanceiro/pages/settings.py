import streamlit as st
from controllers.app_controller import AppController
from config.settings import DB_PATH

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">⚙️ Configurações & Backup do Sistema</h1>
        <div class="header-subtitle">Gerenciamento de pontos de restauração do banco SQLite, moedas e preferências</div>
    </div>
    """, unsafe_allow_html=True)

    tab_backup, tab_pref = st.tabs(["💾 Backup & Restauração", "🎨 Preferências do Sistema"])

    # TAB 1: Backup & Restauração
    with tab_backup:
        st.subheader("Cópia de Segurança do Banco de Dados SQLite")
        st.write("O banco de dados armazena absolutamente tudo de forma local e segura.")

        col_b1, col_b2 = st.columns(2)
        with col_b1:
            if st.button("📦 Gerar Backup Agora mesmo", use_container_width=True):
                res = controller.backups.create_backup()
                if res["success"]:
                    st.success(res["message"])
                else:
                    st.error(res["message"])
                st.rerun()

        with col_b2:
            if DB_PATH.exists():
                with open(DB_PATH, "rb") as f:
                    db_bytes = f.read()
                st.download_button(
                    label="📥 Baixar Banco SQLite (.db)",
                    data=db_bytes,
                    file_name="finance_control.db",
                    mime="application/x-sqlite3",
                    use_container_width=True
                )

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("Pontos de Restauração Salvos")
        backups = controller.backups.list_backups()

        if not backups:
            st.info("Nenhum backup encontrado na pasta backups/.")
        else:
            for b in backups:
                col_r1, col_r2, col_r3 = st.columns([4, 3, 2])
                with col_r1:
                    st.write(f"📁 **{b['filename']}** ({b['size_kb']} KB)")
                with col_r2:
                    st.write(f"Criado em: {b['created_at']}")
                with col_r3:
                    if st.button("🔄 Restaurar", key=f"rest_{b['filename']}"):
                        res = controller.backups.restore_backup(b['filename'])
                        if res["success"]:
                            st.success(res["message"])
                        else:
                            st.error(res["message"])
                        st.rerun()

    # TAB 2: Preferências
    with tab_pref:
        st.subheader("Configurações Gerais")
        st.selectbox("Moeda Padrão", ["Real Brasileiro (R$ - BRL)", "Dólar Americano ($ - USD)", "Euro (€ - EUR)"])
        st.selectbox("Tema do Aplicativo", ["Escuro (Dark Mode)", "Claro (Light Mode)", "Automático do Sistema"])
        st.text_input("Nome do Usuário Principal", value="Felipe")
