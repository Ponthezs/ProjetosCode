from datetime import datetime, date
from typing import Union

def format_currency(value: Union[float, int, None]) -> str:
    """Formata valor numérico para padrão BRL (ex: R$ 1.250,50)."""
    if value is None:
        return "R$ 0,00"
    try:
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return f"R$ {value}"

def format_date(value: Union[date, datetime, str]) -> str:
    """Formata data no padrão brasileiro (DD/MM/YYYY)."""
    if not value:
        return ""
    if isinstance(value, str):
        try:
            value = datetime.strptime(value[:10], "%Y-%m-%d").date()
        except ValueError:
            return value
    if isinstance(value, (datetime, date)):
        return value.strftime("%d/%m/%Y")
    return str(value)

def parse_currency_input(value_str: str) -> float:
    """Converte strings com R$, vírgulas e pontos em float."""
    if not value_str:
        return 0.0
    if isinstance(value_str, (int, float)):
        return float(value_str)
    
    clean_str = str(value_str).replace("R$", "").replace(" ", "").strip()
    if "," in clean_str and "." in clean_str:
        clean_str = clean_str.replace(".", "").replace(",", ".")
    elif "," in clean_str:
        clean_str = clean_str.replace(",", ".")
        
    try:
        return float(clean_str)
    except ValueError:
        return 0.0

def format_percentage(value: float) -> str:
    """Formata porcentagem (ex: 12.5%)."""
    return f"{value:.1f}%"
