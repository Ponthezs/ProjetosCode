import streamlit as st
from controllers.app_controller import AppController

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🤖 IA Financeira & Diagnóstico Inteligente</h1>
        <div class="header-subtitle">Análises automáticas, identificação de padrões de consumo, alertas e projeções de saldo</div>
    </div>
    """, unsafe_allow_html=True)

    st.subheader("💡 Insights Automáticos do Sistema")

    insights = controller.ai.generate_insights()

    if not insights:
        st.info("Nenhum insight gerado no momento. Continue inserindo movimentações para alimentar a IA.")
    else:
        for item in insights:
            icon = "⚠️" if item["type"] == "warning" else ("✅" if item["type"] == "success" else "🔮")
            color = "#C084FC" if item["type"] == "prediction" else "#38BDF8"

            st.markdown(f"""
            <div class="ai-insight-box">
                <div class="ai-insight-title" style="color: {color};">
                    {icon} {item["title"]}
                </div>
                <div style="color: #E2E8F0; font-size: 0.95rem; line-height: 1.5;">
                    {item["text"]}
                </div>
            </div>
            """, unsafe_allow_html=True)
