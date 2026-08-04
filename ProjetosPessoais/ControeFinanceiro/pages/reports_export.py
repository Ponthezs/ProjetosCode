import streamlit as st
from datetime import date
from controllers.app_controller import AppController

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">📑 Relatórios & Exportações de Dados</h1>
        <div class="header-subtitle">Gere relatórios completos e exporte em Excel (multi-aba), PDF formatado ou CSV</div>
    </div>
    """, unsafe_allow_html=True)

    st.subheader("⚙️ Configurações do Relatório")

    c1, c2 = st.columns(2)
    with c1:
        start_date = st.date_input("Data Inicial", value=date(date.today().year, 1, 1))
    with c2:
        end_date = st.date_input("Data Final", value=date.today())

    st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)

    col_ex1, col_ex2, col_ex3 = st.columns(3)

    with col_ex1:
        st.markdown("### 📊 Relatório em Excel")
        st.write("Gera uma planilha `.xlsx` estilizada com abas de Resumo Executivo e Movimentações.")
        excel_data = controller.reports.export_to_excel(start_date, end_date)
        st.download_button(
            label="📥 Baixar Excel (.xlsx)",
            data=excel_data,
            file_name=f"relatorio_financeiro_{start_date}_{end_date}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True
        )

    with col_ex2:
        st.markdown("### 📄 Relatório em PDF")
        st.write("Gera um documento `.pdf` formatado para impressão com cabeçalho, KPIs e tabela de lançamentos.")
        pdf_data = controller.reports.export_to_pdf(start_date, end_date)
        st.download_button(
            label="📥 Baixar PDF (.pdf)",
            data=pdf_data,
            file_name=f"relatorio_financeiro_{start_date}_{end_date}.pdf",
            mime="application/pdf",
            use_container_width=True
        )

    with col_ex3:
        st.markdown("### 📝 Dados Brutos em CSV")
        st.write("Exporta os lançamentos filtrados em formato `.csv` compatível com Excel e Google Sheets.")
        df_csv = controller.reports.get_transactions_dataframe(start_date, end_date)
        csv_bytes = df_csv.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 Baixar CSV (.csv)",
            data=csv_bytes,
            file_name=f"movimentacoes_{start_date}_{end_date}.csv",
            mime="text/csv",
            use_container_width=True
        )
