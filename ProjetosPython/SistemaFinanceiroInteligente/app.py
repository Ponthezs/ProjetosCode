"""
Aplicação Principal - Sistema de Controle Financeiro Inteligente
Interface web usando Streamlit
"""

import streamlit as st
import pandas as pd
from datetime import datetime, date
import plotly.graph_objects as go
from database import Database
from calculos import CalculadoraFinanceira
from visualizacao import GeradorGraficos
from importacao import ImportadorExtratos

# Configuração da página
st.set_page_config(
    page_title="Sistema Financeiro Inteligente",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inicialização do banco de dados
@st.cache_resource
def init_database():
    return Database()

@st.cache_resource
def init_calculadora(_db):
    return CalculadoraFinanceira(_db)

@st.cache_resource
def init_visualizacao(_calc):
    return GeradorGraficos(_calc)

@st.cache_resource
def init_importador(_db):
    return ImportadorExtratos(_db)

# Inicializa componentes
db = init_database()
calculadora = init_calculadora(db)
visualizacao = init_visualizacao(calculadora)
importador = init_importador(db)

# CSS personalizado
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #2c3e50;
        text-align: center;
        margin-bottom: 2rem;
    }
    .kpi-card {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #3498db;
    }
    .alert-card {
        background-color: #fff3cd;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #ffc107;
        margin: 1rem 0;
    }
    </style>
""", unsafe_allow_html=True)

# Header
st.markdown('<h1 class="main-header">💰 Sistema de Controle Financeiro Inteligente</h1>', unsafe_allow_html=True)

# Sidebar - Navegação
st.sidebar.title("📊 Navegação")
pagina = st.sidebar.radio(
    "Selecione uma página:",
    ["🏠 Dashboard", "➕ Nova Transação", "📋 Transações", "📊 Orçamentos", "🎯 Metas", "📥 Importar Extrato"]
)

# ========== DASHBOARD ==========
if pagina == "🏠 Dashboard":
    st.header("Dashboard Financeiro")
    
    # Filtros de data
    col1, col2 = st.columns(2)
    with col1:
        mes_selecionado = st.selectbox("Mês", range(1, 13), index=datetime.now().month - 1)
    with col2:
        ano_selecionado = st.selectbox("Ano", range(2020, datetime.now().year + 2), index=datetime.now().year - 2020)
    
    # KPIs
    kpis = calculadora.calcular_kpis(mes_selecionado, ano_selecionado)
    fluxo_caixa = calculadora.calcular_fluxo_caixa(mes_selecionado, ano_selecionado)
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("💰 Receita Total", f"R$ {kpis['receita_total']:,.2f}")
    
    with col2:
        st.metric("💸 Despesa Total", f"R$ {kpis['despesa_total']:,.2f}")
    
    with col3:
        st.metric("💵 Saldo Mensal", f"R$ {kpis['saldo_mensal']:,.2f}", 
                 delta=f"{kpis['taxa_poupanca']:.1f}% poupança")
    
    with col4:
        st.metric("📊 Saldo Atual", f"R$ {fluxo_caixa['saldo_atual']:,.2f}")
    
    # Alertas de categoria
    alertas = calculadora.verificar_alertas_categoria(mes_selecionado, ano_selecionado)
    if alertas:
        st.markdown("### ⚠️ Alertas")
        for alerta in alertas:
            st.warning(
                f"**{alerta['categoria']}**: R$ {alerta['valor']:,.2f} "
                f"({alerta['percentual']:.1f}% da renda) - "
                f"Ultrapassou 30% da renda!"
            )
    
    # Gráficos
    col1, col2 = st.columns(2)
    
    with col1:
        st.plotly_chart(
            visualizacao.grafico_rosca_categorias(mes_selecionado, ano_selecionado),
            use_container_width=True
        )
    
    with col2:
        st.plotly_chart(
            visualizacao.grafico_barras_comparativo_mensal(6),
            use_container_width=True
        )
    
    # Evolução Patrimonial
    st.plotly_chart(
        visualizacao.grafico_evolucao_patrimonial(12),
        use_container_width=True
    )
    
    # Informações adicionais
    col1, col2, col3 = st.columns(3)
    with col1:
        st.info(f"📈 Projeção Final do Mês: R$ {fluxo_caixa['projecao_final_mes']:,.2f}")
    with col2:
        st.warning(f"⏳ Contas Pendentes: R$ {fluxo_caixa['total_pendente']:,.2f}")
    with col3:
        st.success(f"💾 Taxa de Poupança: {kpis['taxa_poupanca']:.2f}%")

# ========== NOVA TRANSAÇÃO ==========
elif pagina == "➕ Nova Transação":
    st.header("Adicionar Nova Transação")
    
    with st.form("nova_transacao"):
        col1, col2 = st.columns(2)
        
        with col1:
            data = st.date_input("Data *", value=date.today())
            descricao = st.text_input("Descrição *", placeholder="Ex: Compra no supermercado")
            tipo = st.selectbox("Tipo *", ["Receita", "Despesa", "Transferência"])
        
        with col2:
            valor = st.number_input("Valor (R$) *", min_value=0.0, step=0.01, format="%.2f")
            status = st.selectbox("Status *", ["Pago", "Pendente"])
            forma_pagamento = st.selectbox("Forma de Pagamento *", ["Cartão", "Pix", "Dinheiro", "Transferência"])
        
        # Seleção de categoria
        categorias_df = db.obter_categorias(tipo=tipo)
        categorias_principais = categorias_df[categorias_df['categoria_pai_id'].isna()]
        
        if not categorias_principais.empty:
            categoria_nome = st.selectbox(
                "Categoria *",
                categorias_principais['nome'].tolist()
            )
            categoria_id = int(categorias_principais[categorias_principais['nome'] == categoria_nome]['id'].iloc[0])
            
            # Subcategorias
            subcategorias = db.obter_subcategorias(categoria_id)
            subcategoria_id = None
            if subcategorias:
                subcategoria_nome = st.selectbox(
                    "Subcategoria (opcional)",
                    ["Nenhuma"] + [s['nome'] for s in subcategorias]
                )
                if subcategoria_nome != "Nenhuma":
                    subcategoria_id = next(s['id'] for s in subcategorias if s['nome'] == subcategoria_nome)
        else:
            st.error("Nenhuma categoria disponível para este tipo")
            categoria_id = None
        
        observacoes = st.text_area("Observações (opcional)", placeholder="Notas adicionais...")
        
        submitted = st.form_submit_button("💾 Salvar Transação", use_container_width=True)
        
        if submitted:
            if not descricao or valor <= 0 or not categoria_id:
                st.error("⚠️ Preencha todos os campos obrigatórios!")
            else:
                try:
                    db.adicionar_transacao(
                        data=data.strftime("%d/%m/%Y"),
                        descricao=descricao,
                        categoria_id=categoria_id,
                        subcategoria_id=subcategoria_id,
                        valor=valor,
                        tipo=tipo,
                        status=status,
                        forma_pagamento=forma_pagamento,
                        observacoes=observacoes if observacoes else None
                    )
                    st.success("✅ Transação adicionada com sucesso!")
                    st.balloons()
                except Exception as e:
                    st.error(f"❌ Erro ao adicionar transação: {str(e)}")

# ========== TRANSAÇÕES ==========
elif pagina == "📋 Transações":
    st.header("Transações Registradas")
    
    # Filtros
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        mes_filtro = st.selectbox("Mês", ["Todos"] + list(range(1, 13)), index=0)
    with col2:
        ano_filtro = st.selectbox("Ano", ["Todos"] + list(range(2020, datetime.now().year + 2)), index=0)
    with col3:
        tipo_filtro = st.selectbox("Tipo", ["Todos", "Receita", "Despesa", "Transferência"], index=0)
    with col4:
        status_filtro = st.selectbox("Status", ["Todos", "Pago", "Pendente"], index=0)
    
    # Obtém transações
    mes = mes_filtro if mes_filtro != "Todos" else None
    ano = ano_filtro if ano_filtro != "Todos" else None
    tipo = tipo_filtro if tipo_filtro != "Todos" else None
    status = status_filtro if status_filtro != "Todos" else None
    
    transacoes = db.obter_transacoes(mes=mes, ano=ano, tipo=tipo, status=status)
    
    if transacoes.empty:
        st.info("📭 Nenhuma transação encontrada com os filtros selecionados.")
    else:
        # Formatação para exibição
        transacoes_display = transacoes.copy()
        transacoes_display['data'] = pd.to_datetime(transacoes_display['data']).dt.strftime('%d/%m/%Y')
        transacoes_display['valor'] = transacoes_display['valor'].apply(lambda x: f"R$ {x:,.2f}")
        transacoes_display = transacoes_display.drop(columns=['id'])
        
        st.dataframe(
            transacoes_display,
            use_container_width=True,
            hide_index=True
        )
        
        # Estatísticas rápidas
        st.markdown("### 📊 Estatísticas")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total de Transações", len(transacoes))
        with col2:
            total_valor = transacoes['valor'].sum()
            st.metric("Valor Total", f"R$ {total_valor:,.2f}")
        with col3:
            pendentes = len(transacoes[transacoes['status'] == 'Pendente'])
            st.metric("Pendentes", pendentes)

# ========== ORÇAMENTOS ==========
elif pagina == "📊 Orçamentos":
    st.header("Orçamentos Mensais")
    
    tab1, tab2 = st.tabs(["📋 Gerenciar Orçamentos", "📊 Visualizar Orçamentos"])
    
    with tab1:
        st.subheader("Definir Novo Orçamento")
        
        with st.form("novo_orcamento"):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                mes_orc = st.selectbox("Mês", range(1, 13), index=datetime.now().month - 1)
            with col2:
                ano_orc = st.selectbox("Ano", range(2020, datetime.now().year + 2), index=datetime.now().year - 2020)
            
            categorias_df = db.obter_categorias(tipo="Despesa", apenas_principais=True)
            categoria_nome = st.selectbox("Categoria", categorias_df['nome'].tolist())
            categoria_id = int(categorias_df[categorias_df['nome'] == categoria_nome]['id'].iloc[0])
            
            valor_limite = st.number_input("Valor Limite (R$)", min_value=0.0, step=0.01, format="%.2f")
            
            submitted = st.form_submit_button("💾 Salvar Orçamento", use_container_width=True)
            
            if submitted:
                try:
                    db.adicionar_orcamento(categoria_id, mes_orc, ano_orc, valor_limite)
                    st.success("✅ Orçamento salvo com sucesso!")
                except Exception as e:
                    st.error(f"❌ Erro: {str(e)}")
    
    with tab2:
        st.subheader("Orçamentos e Gastos")
        
        col1, col2 = st.columns(2)
        with col1:
            mes_vis = st.selectbox("Mês para Visualizar", range(1, 13), index=datetime.now().month - 1, key="mes_vis")
        with col2:
            ano_vis = st.selectbox("Ano para Visualizar", range(2020, datetime.now().year + 2), index=datetime.now().year - 2020, key="ano_vis")
        
        orcamentos = db.obter_orcamentos(mes=mes_vis, ano=ano_vis)
        
        if orcamentos.empty:
            st.info("📭 Nenhum orçamento definido para este período.")
        else:
            for _, orcamento in orcamentos.iterrows():
                categoria_id = int(orcamento['categoria_id'])
                info = calculadora.calcular_orcamento_disponivel(categoria_id, mes_vis, ano_vis)
                
                st.markdown(f"### {orcamento['categoria']}")
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("Limite", f"R$ {info['limite']:,.2f}")
                with col2:
                    st.metric("Gasto Atual", f"R$ {info['gasto_atual']:,.2f}")
                with col3:
                    cor = "normal" if info['disponivel'] > 0 else "inverse"
                    st.metric("Disponível", f"R$ {info['disponivel']:,.2f}", delta=f"{info['percentual_usado']:.1f}% usado")
                
                st.plotly_chart(
                    visualizacao.grafico_orcamento_vs_gasto(categoria_id, mes_vis, ano_vis),
                    use_container_width=True
                )
                st.divider()

# ========== METAS ==========
elif pagina == "🎯 Metas":
    st.header("Metas Financeiras")
    
    tab1, tab2 = st.tabs(["➕ Nova Meta", "📊 Minhas Metas"])
    
    with tab1:
        st.subheader("Criar Nova Meta")
        
        with st.form("nova_meta"):
            nome_meta = st.text_input("Nome da Meta *", placeholder="Ex: Reserva de Emergência")
            tipo_meta = st.selectbox("Tipo *", ["Reserva de Emergência", "Outro"])
            valor_objetivo = st.number_input("Valor Objetivo (R$) *", min_value=0.0, step=0.01, format="%.2f")
            valor_atual = st.number_input("Valor Atual (R$)", min_value=0.0, step=0.01, format="%.2f", value=0.0)
            data_objetivo = st.date_input("Data Objetivo (opcional)", value=None)
            descricao = st.text_area("Descrição (opcional)")
            
            submitted = st.form_submit_button("💾 Criar Meta", use_container_width=True)
            
            if submitted:
                if not nome_meta or valor_objetivo <= 0:
                    st.error("⚠️ Preencha todos os campos obrigatórios!")
                else:
                    try:
                        db.adicionar_meta(
                            nome=nome_meta,
                            tipo=tipo_meta,
                            valor_objetivo=valor_objetivo,
                            valor_atual=valor_atual,
                            data_objetivo=data_objetivo.strftime("%d/%m/%Y") if data_objetivo else None,
                            descricao=descricao if descricao else None
                        )
                        st.success("✅ Meta criada com sucesso!")
                    except Exception as e:
                        st.error(f"❌ Erro: {str(e)}")
    
    with tab2:
        st.subheader("Progresso das Metas")
        
        metas = db.obter_metas()
        
        if metas.empty:
            st.info("📭 Nenhuma meta cadastrada ainda.")
        else:
            for _, meta in metas.iterrows():
                progresso = calculadora.calcular_progresso_meta(int(meta['id']))
                
                st.markdown(f"### {meta['nome']}")
                
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    st.plotly_chart(
                        visualizacao.grafico_progresso_meta(
                            progresso['valor_atual'],
                            progresso['valor_objetivo'],
                            meta['nome']
                        ),
                        use_container_width=True
                    )
                
                with col2:
                    st.metric("Objetivo", f"R$ {progresso['valor_objetivo']:,.2f}")
                    st.metric("Atual", f"R$ {progresso['valor_atual']:,.2f}")
                    st.metric("Faltando", f"R$ {progresso['faltando']:,.2f}")
                    st.metric("Progresso", f"{progresso['progresso_percentual']:.1f}%")
                
                if meta['descricao']:
                    st.caption(f"📝 {meta['descricao']}")
                
                st.divider()

# ========== IMPORTAR EXTRATO ==========
elif pagina == "📥 Importar Extrato":
    st.header("Importar Extrato Bancário")
    
    tipo_arquivo = st.radio("Tipo de Arquivo", ["CSV", "OFX"])
    
    arquivo = st.file_uploader(
        f"Selecione o arquivo {tipo_arquivo}",
        type=[tipo_arquivo.lower()]
    )
    
    if arquivo:
        st.info("💡 Dica: O sistema tentará identificar automaticamente as colunas. "
                "Se necessário, você pode revisar e ajustar após a importação.")
        
        try:
            # Salva arquivo temporariamente
            import tempfile
            import os
            import pandas as pd
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{tipo_arquivo.lower()}") as tmp_file:
                tmp_file.write(arquivo.getvalue())
                tmp_path = tmp_file.name
            
            # Importa
            if tipo_arquivo == "CSV":
                # Primeiro, tenta ler o arquivo bruto para debug
                try:
                    # Tenta diferentes separadores para mostrar preview
                    separadores = [';', ',', '\t']
                    df_preview = None
                    separador_encontrado = None
                    
                    for sep in separadores:
                        try:
                            df_teste = pd.read_csv(tmp_path, sep=sep, encoding='utf-8', nrows=5, on_bad_lines='skip')
                            if len(df_teste.columns) >= 2:
                                df_preview = df_teste
                                separador_encontrado = sep
                                break
                        except:
                            try:
                                df_teste = pd.read_csv(tmp_path, sep=sep, encoding='latin-1', nrows=5, on_bad_lines='skip')
                                if len(df_teste.columns) >= 2:
                                    df_preview = df_teste
                                    separador_encontrado = sep
                                    break
                            except:
                                continue
                    
                    if df_preview is not None:
                        with st.expander("🔍 Preview do arquivo bruto (primeiras 5 linhas)"):
                            st.dataframe(df_preview, use_container_width=True)
                            st.caption(f"Separador detectado: '{separador_encontrado}' | Colunas: {', '.join(df_preview.columns.tolist())}")
                except Exception as preview_error:
                    st.warning(f"⚠️ Não foi possível fazer preview do arquivo: {str(preview_error)}")
                
                df_transacoes = importador.importar_csv(tmp_path)
            else:
                df_transacoes = importador.importar_ofx(tmp_path)
            
            # Remove arquivo temporário
            os.unlink(tmp_path)
            
            if df_transacoes.empty:
                st.warning("⚠️ Nenhuma transação encontrada no arquivo.")
                st.info("""
                **Possíveis causas:**
                - Formato de data não reconhecido
                - Colunas com nomes diferentes do esperado
                - Valores em formato não numérico
                - Arquivo vazio ou apenas cabeçalhos
                
                **Dica:** Verifique o preview acima para ver como o arquivo está estruturado.
                """)
            else:
                st.success(f"✅ {len(df_transacoes)} transações encontradas!")
                
                # Preview
                st.subheader("Preview das Transações Processadas")
                st.dataframe(df_transacoes.head(10), use_container_width=True)
                
                # Estatísticas
                col1, col2, col3 = st.columns(3)
                with col1:
                    receitas = len(df_transacoes[df_transacoes['tipo'] == 'Receita'])
                    st.metric("Receitas", receitas)
                with col2:
                    despesas = len(df_transacoes[df_transacoes['tipo'] == 'Despesa'])
                    st.metric("Despesas", despesas)
                with col3:
                    total_valor = df_transacoes['valor'].sum()
                    st.metric("Valor Total", f"R$ {total_valor:,.2f}")
                
                # Opção de salvar
                if st.button("💾 Importar Transações", use_container_width=True):
                    resultado = importador.salvar_transacoes_importadas(df_transacoes)
                    
                    st.success(f"""
                    ✅ Importação concluída!
                    - Total processadas: {resultado['total']}
                    - Importadas: {resultado['importadas']}
                    - Duplicadas ignoradas: {resultado['duplicadas']}
                    - Erros: {resultado['erros']}
                    """)
                    
                    if resultado['importadas'] > 0:
                        st.balloons()
        
        except Exception as e:
            st.error(f"❌ Erro ao importar arquivo: {str(e)}")
            with st.expander("🔍 Detalhes do erro"):
                st.exception(e)
            
            st.info("""
            **Sugestões para resolver:**
            1. Verifique se o arquivo está no formato CSV válido
            2. Tente abrir o arquivo em um editor de texto para verificar o formato
            3. Certifique-se de que o arquivo contém colunas de Data, Descrição e Valor
            4. Se o arquivo usar vírgula como separador decimal, pode ser necessário ajustar
            """)

# Rodapé
st.sidebar.markdown("---")
st.sidebar.markdown("### 💡 Dicas")
st.sidebar.info(
    "• Use a importação de extratos para adicionar múltiplas transações de uma vez\n"
    "• Configure orçamentos para receber alertas quando estiver próximo do limite\n"
    "• Monitore a taxa de poupança para alcançar seus objetivos financeiros"
)
