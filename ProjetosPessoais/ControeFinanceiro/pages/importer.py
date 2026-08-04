import streamlit as st
import pandas as pd
from pathlib import Path
from controllers.app_controller import AppController
from config.settings import DADOS_DIR
from utils.formatters import format_currency, format_date

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">📥 Importador Inteligente & Leitor de Planilhas</h1>
        <div class="header-subtitle">Pré-visualize planilhas CSV/XLSX, valide o mapeamento de colunas e sincronize com o banco de dados</div>
    </div>
    """, unsafe_allow_html=True)

    tab_preview, tab_imported, tab_history = st.tabs([
        "📋 Visualizar & Importar Planilha",
        "💳 Movimentações Importadas (Extrato)",
        "📜 Histórico de Arquivos Importados"
    ])

    accounts = controller.accounts.get_all_accounts()
    owners = controller.owners.get_all()

    # TAB 1: Visualizar & Importar Planilha
    with tab_preview:
        st.subheader("1. Seleção da Planilha")

        available_files = controller.importer.find_all_csv_files()
        
        c_sel1, c_sel2 = st.columns([3, 2])
        with c_sel1:
            file_options = {f.name: f for f in available_files}
            if file_options:
                selected_filename = st.selectbox(
                    "Selecione um arquivo da pasta `dados/`:",
                    list(file_options.keys())
                )
                active_file_path = file_options[selected_filename]
            else:
                active_file_path = None
                st.warning("Nenhum arquivo CSV/XLSX localizado na pasta `dados/`.")

        with c_sel2:
            uploaded = st.file_uploader("Ou faça upload manual de um arquivo (.csv, .xlsx):", type=["csv", "xlsx"])
            if uploaded:
                dest = DADOS_DIR / uploaded.name
                with open(dest, "wb") as f:
                    f.write(uploaded.getbuffer())
                st.success(f"Arquivo `{uploaded.name}` enviado com sucesso!")
                active_file_path = dest

        if active_file_path and active_file_path.exists():
            st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
            st.subheader(f"2. Pré-visualização da Planilha: `{active_file_path.name}`")

            # Gerar pré-visualização inicial com autodetecção de colunas
            preview = controller.importer.preview_csv_content(active_file_path)

            if not preview["success"]:
                st.error(preview["message"])
            else:
                # Indicadores da planilha
                c_k1, c_k2, c_k3 = st.columns(3)
                with c_k1:
                    st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Total de Linhas na Planilha</div>
                        <div class="metric-value">{preview['total_rows']}</div>
                    </div>
                    """, unsafe_allow_html=True)
                with c_k2:
                    st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Novos Lançamentos</div>
                        <div class="metric-value" style="color: #10B981;">{preview['new_count']}</div>
                    </div>
                    """, unsafe_allow_html=True)
                with c_k3:
                    st.markdown(f"""
                    <div class="metric-card">
                        <div class="metric-title">Duplicados (Ignorados)</div>
                        <div class="metric-value" style="color: #F59E0B;">{preview['duplicate_count']}</div>
                    </div>
                    """, unsafe_allow_html=True)

                # Mapeamento Interativo de Colunas
                st.markdown("### 🛠️ Mapeamento de Colunas da Planilha")
                cols = preview["columns"]
                detected = preview["detected_mapping"]

                col_m1, col_m2, col_m3, col_m4 = st.columns(4)
                with col_m1:
                    d_idx = cols.index(detected["date"]) if detected.get("date") in cols else 0
                    sel_date_col = st.selectbox("Coluna de Data*", cols, index=d_idx)
                with col_m2:
                    desc_idx = cols.index(detected["description"]) if detected.get("description") in cols else min(1, len(cols)-1)
                    sel_desc_col = st.selectbox("Coluna de Descrição*", cols, index=desc_idx)
                with col_m3:
                    amt_idx = cols.index(detected["amount"]) if detected.get("amount") in cols else min(2, len(cols)-1)
                    sel_amount_col = st.selectbox("Coluna de Valor*", cols, index=amt_idx)
                with col_m4:
                    cat_opts = ["Nenhuma (Usar Padrão Geral)"] + cols
                    c_idx = cols.index(detected["category"]) + 1 if detected.get("category") in cols else 0
                    sel_cat_col = st.selectbox("Coluna de Categoria", cat_opts, index=c_idx)

                user_mapping = {
                    "date": sel_date_col,
                    "description": sel_desc_col,
                    "amount": sel_amount_col,
                    "category": None if sel_cat_col == "Nenhuma (Usar Padrão Geral)" else sel_cat_col
                }

                # Atualizar pré-visualização se o usuário alterou o mapeamento
                custom_preview = controller.importer.preview_csv_content(active_file_path, custom_mapping=user_mapping)

                # Destino das Movimentações
                st.markdown("### 🎯 Destino dos Lançamentos")
                c_acc, c_own = st.columns(2)
                with c_acc:
                    acc_opts = {a.name: a.id for a in accounts}
                    sel_acc_name = st.selectbox("Vincular à Conta Bancária:", list(acc_opts.keys()))
                    sel_acc_id = acc_opts[sel_acc_name]
                with c_own:
                    own_opts = {o.name: o.id for o in owners}
                    sel_own_name = st.selectbox("Proprietário Inicial:", list(own_opts.keys()))
                    sel_own_id = own_opts[sel_own_name]

                # Tabela com Dados Processados & Status em Tempo Real
                st.markdown("### 🔍 Tabela de Processamento & Extrato da Planilha")
                df_preview = pd.DataFrame(custom_preview["parsed_rows"])
                
                # Exibir tabela formatada
                st.dataframe(
                    df_preview[[
                        "Linha", "Data Formatada", "Descrição", "Tipo",
                        "Valor Processado", "Categoria", "Status Deduplicação"
                    ]],
                    use_container_width=True,
                    hide_index=True,
                    column_config={
                        "Valor Processado": st.column_config.NumberColumn("Valor (R$)", format="R$ %.2f"),
                        "Status Deduplicação": st.column_config.TextColumn("Status no Banco")
                    }
                )

                st.markdown("<br>", unsafe_allow_html=True)
                if st.button("🚀 Confirmar & Importar Movimentações para o Banco SQLite", use_container_width=True, type="primary"):
                    res = controller.importer.import_mapped_csv(
                        active_file_path,
                        user_mapping,
                        sel_acc_id,
                        sel_own_id
                    )
                    if res["success"]:
                        st.success(res["message"])
                    else:
                        st.error(res["message"])
                    st.rerun()

                # Tabela de Dados Brutos Não Processados (Raw DataFrame)
                with st.expander("📄 Ver Dados Brutos da Planilha (Original Sem Tratamento)"):
                    st.dataframe(preview["raw_df"], use_container_width=True)

    # TAB 2: Movimentações Importadas (Extrato)
    with tab_imported:
        st.subheader("💳 Movimentações Oriundas de Planilhas CSV")
        csv_trans = controller.transactions.trans_repo.get_filtered()
        csv_trans = [t for t in csv_trans if t.source == "CSV"]

        if not csv_trans:
            st.info("Nenhuma movimentação importada via CSV encontrada.")
        else:
            st.write(f"Total de movimentações importadas salvas no banco: **{len(csv_trans)}**")
            table_data = []
            for t in csv_trans:
                table_data.append({
                    "ID": t.id,
                    "Data": format_date(t.transaction_date),
                    "Descrição": t.description,
                    "Tipo": t.type,
                    "Valor": format_currency(t.amount),
                    "Categoria": t.category.name if t.category else "Geral",
                    "Conta": t.account.name if t.account else "N/A",
                    "Origem": t.source,
                    "Hash Fingerprint": t.hash_fingerprint[:16] + "..." if t.hash_fingerprint else "N/A"
                })
            st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

    # TAB 3: Histórico de Arquivos Importados
    with tab_history:
        st.subheader("📜 Log Auditado de Arquivos Importados")
        history = controller.import_history.get_latest()
        if not history:
            st.info("Nenhum histórico de importação registrado.")
        else:
            for item in history:
                st.markdown(f"• **{item.filename}** ({format_date(item.imported_at)}): `{item.imported_count} novas adicionadas`, `{item.skipped_count} duplicadas ignoradas`")
