import streamlit as st

def inject_custom_css():
    """Injeta estilos CSS modernos inspirados no Notion, YNAB e Mobills com suporte a visual Dark/Light sofisticado."""
    css = """
    <style>
    /* Estilo Global */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Container Principal */
    .main .block-container {
        padding-top: 1.5rem;
        padding-bottom: 3rem;
        max-width: 95%;
    }
    
    /* Header Principal */
    .header-container {
        background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
        padding: 1.5rem 2rem;
        border-radius: 16px;
        color: #F8FAFC;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .header-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .header-subtitle {
        font-size: 0.95rem;
        color: #94A3B8;
        margin-top: 0.4rem;
    }

    /* Cards Métricos Estilizados */
    .metric-card {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.25);
    }

    .metric-title {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94A3B8;
        margin-bottom: 0.5rem;
    }

    .metric-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #F8FAFC;
    }

    .metric-trend {
        font-size: 0.8rem;
        font-weight: 500;
        margin-top: 0.4rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .trend-positive { color: #10B981; }
    .trend-negative { color: #EF4444; }
    .trend-neutral { color: #3B82F6; }

    /* Badges de Categoria e Tag */
    .badge {
        display: inline-block;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #FFFFFF;
        margin-right: 0.3rem;
    }

    /* Tabelas Personalizadas */
    .stDataFrame {
        border-radius: 12px;
        overflow: hidden;
    }

    /* Status Badges */
    .status-pago {
        background-color: rgba(16, 185, 129, 0.2);
        color: #10B981;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    .status-pendente {
        background-color: rgba(245, 158, 11, 0.2);
        color: #F59E0B;
        border: 1px solid rgba(245, 158, 11, 0.4);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    /* Alerta Inteligente IA */
    .ai-insight-box {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
        border-left: 4px solid #8B5CF6;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        color: #E2E8F0;
    }
    .ai-insight-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #C084FC;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    /* Esconder branding padrão do Streamlit */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    </style>
    """
    st.markdown(css, unsafe_allow_html=True)
