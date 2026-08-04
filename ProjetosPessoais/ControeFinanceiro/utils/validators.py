from datetime import date
from typing import Tuple, Optional

def validate_transaction_payload(
    description: str,
    amount: float,
    transaction_date: date,
    category_id: Optional[int] = None
) -> Tuple[bool, str]:
    """Valida se os dados da transação atendem aos requisitos mínimos."""
    if not description or not description.strip():
        return False, "A descrição é obrigatória."
    if amount <= 0:
        return False, "O valor deve ser maior que zero."
    if not transaction_date:
        return False, "A data da transação é obrigatória."
    return True, "Validação concluída com sucesso."

def validate_split_total(total_amount: float, split_amounts: list[float]) -> Tuple[bool, str]:
    """Valida se a soma das partes divididas é igual ao valor total da transação."""
    split_sum = sum(split_amounts)
    if abs(total_amount - split_sum) > 0.01:
        return False, f"A soma das partes (R$ {split_sum:.2f}) difere do valor total (R$ {total_amount:.2f})."
    return True, "Divisão válida."
