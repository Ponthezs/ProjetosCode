import os
import hashlib
import re
from pathlib import Path
from datetime import datetime, date
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session

from config.settings import DADOS_DIR
from models.import_history import ImportHistory
from repositories.transaction_repo import TransactionRepository
from repositories.category_repo import CategoryRepository, OwnerRepository
from repositories.account_repo import AccountRepository
from services.transaction_service import TransactionService
from utils.logger import logger

class IntelligentImporterService:
    def __init__(self, db: Session):
        self.db = db
        self.trans_repo = TransactionRepository(db)
        self.cat_repo = CategoryRepository(db)
        self.acc_repo = AccountRepository(db)
        self.owner_repo = OwnerRepository(db)
        self.trans_service = TransactionService(db)

    def find_all_csv_files(self) -> List[Path]:
        """Retorna todos os arquivos CSV e XLSX disponíveis na pasta dados/ ordenados por data de modificação."""
        if not DADOS_DIR.exists():
            return []
        files = list(DADOS_DIR.glob("*.csv")) + list(DADOS_DIR.glob("*.xlsx"))
        files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        return files

    def find_latest_csv_file(self) -> Optional[Path]:
        """Procura o arquivo mais recente dentro de dados/."""
        files = self.find_all_csv_files()
        return files[0] if files else None

    def read_raw_dataframe(self, file_path: Path) -> pd.DataFrame:
        """Lê um arquivo CSV ou XLSX tentando diferentes encodings e delimitadores (vírgula, ponto e vírgula, tab)."""
        if file_path.suffix.lower() == ".xlsx":
            return pd.read_excel(file_path)

        # Para arquivos CSV, tentar encodings e delimitadores
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        delimiters = [',', ';', '\t', '|']

        for enc in encodings:
            for sep in delimiters:
                try:
                    df = pd.read_csv(file_path, encoding=enc, sep=sep)
                    # Se tiver mais de 1 coluna ou 1 linha com colunas validas, encontramos o separador correto!
                    if len(df.columns) > 1 or len(df) > 0:
                        # Remover colunas totalmente vazias
                        df = df.dropna(how='all', axis=1)
                        if len(df.columns) > 1:
                            return df
                except Exception:
                    continue

        # Fallback padrão
        return pd.read_csv(file_path, encoding='latin-1', sep=None, engine='python')

    def auto_detect_columns(self, columns: List[str]) -> Dict[str, Optional[str]]:
        """Identifica automaticamente as colunas de Data, Descrição, Valor e Categoria."""
        cols_lower = [str(c).strip().lower() for c in columns]

        date_col = None
        desc_col = None
        amount_col = None
        category_col = None

        # Procurar Data
        for orig, low in zip(columns, cols_lower):
            if any(k in low for k in ['data', 'date', 'dt', 'lançamento', 'lancamento']):
                date_col = orig
                break

        # Procurar Descrição
        for orig, low in zip(columns, cols_lower):
            if any(k in low for k in ['descri', 'histór', 'histor', 'title', 'estabelec', 'memo', 'detalhe', 'transacao', 'transação']):
                desc_col = orig
                break

        # Procurar Valor
        for orig, low in zip(columns, cols_lower):
            if any(k in low for k in ['valor', 'amount', 'value', 'montante', 'saida', 'saída', 'entrada']):
                amount_col = orig
                break

        # Procurar Categoria
        for orig, low in zip(columns, cols_lower):
            if any(k in low for k in ['categor', 'cat', 'grupo', 'classific']):
                category_col = orig
                break

        return {
            "date": date_col or (columns[0] if len(columns) > 0 else None),
            "description": desc_col or (columns[1] if len(columns) > 1 else None),
            "amount": amount_col or (columns[2] if len(columns) > 2 else None),
            "category": category_col
        }

    def parse_flexible_date(self, raw_val: Any) -> date:
        """Parse extremamente tolerante a múltiplos formatos de data brasileira e ISO."""
        val_str = str(raw_val).strip().split(" ")[0].split("T")[0]
        
        # Múltiplos formatos conhecidos
        formats = [
            "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d",
            "%d/%m/%y", "%d-%m-%y", "%m/%d/%Y", "%d.%m.%Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(val_str, fmt).date()
            except ValueError:
                continue

        # Fallback para data atual se falhar
        return date.today()

    def parse_flexible_amount(self, raw_val: Any) -> float:
        """Parse de valor numérico convertendo strings com R$, vírgulas e pontos."""
        if pd.isna(raw_val) or raw_val is None:
            return 0.0
        if isinstance(raw_val, (int, float)):
            return float(raw_val)

        val_str = str(raw_val).replace("R$", "").replace(" ", "").strip()

        # Tratar formato contábil negativo como (100,50) ou 100,50-
        is_negative = False
        if val_str.startswith("(") and val_str.endswith(")"):
            is_negative = True
            val_str = val_str[1:-1]
        elif val_str.endswith("-"):
            is_negative = True
            val_str = val_str[:-1]

        if "," in val_str and "." in val_str:
            val_str = val_str.replace(".", "").replace(",", ".")
        elif "," in val_str:
            val_str = val_str.replace(",", ".")

        try:
            val = float(val_str)
            return -val if is_negative else val
        except ValueError:
            return 0.0

    def generate_fingerprint(self, date_str: str, amount: float, description: str, account_name: str) -> str:
        """Gera um hash SHA256 único para cada movimentação para evitar duplicidades."""
        raw = f"{date_str}_{amount:.2f}_{description.strip().lower()}_{account_name.strip().lower()}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()

    def preview_csv_content(
        self,
        file_path: Path,
        custom_mapping: Optional[Dict[str, str]] = None,
        account_name: str = "Nubank"
    ) -> Dict[str, Any]:
        """Gera pré-visualização completa dos dados da planilha com verificação de duplicidade."""
        df = self.read_raw_dataframe(file_path)
        if df.empty:
            return {"success": False, "message": "O arquivo está vazio.", "columns": [], "rows": []}

        columns = [str(c) for c in df.columns]
        mapping = custom_mapping or self.auto_detect_columns(columns)

        date_col = mapping.get("date")
        desc_col = mapping.get("description")
        amount_col = mapping.get("amount")
        cat_col = mapping.get("category")

        parsed_rows = []
        for idx, row in df.iterrows():
            raw_date = row[date_col] if date_col and date_col in row else None
            raw_desc = row[desc_col] if desc_col and desc_col in row else "Sem Descrição"
            raw_amount = row[amount_col] if amount_col and amount_col in row else 0.0
            raw_cat = row[cat_col] if cat_col and cat_col in row and pd.notna(row[cat_col]) else "Geral"

            trans_date = self.parse_flexible_date(raw_date)
            parsed_amount = self.parse_flexible_amount(raw_amount)
            desc = str(raw_desc).strip()

            if parsed_amount < 0:
                type_ = "Despesa"
                amount = abs(parsed_amount)
            else:
                type_ = "Receita"
                amount = parsed_amount

            fingerprint = self.generate_fingerprint(
                trans_date.strftime("%Y-%m-%d"), amount, desc, account_name
            )

            existing = self.trans_repo.get_by_fingerprint(fingerprint)
            status_dup = "Já Importado (Duplicado)" if existing else "Novo Lançamento"

            parsed_rows.append({
                "Linha": idx + 1,
                "Data Original": str(raw_date),
                "Data Formatada": trans_date.strftime("%d/%m/%Y"),
                "Descrição": desc,
                "Tipo": type_,
                "Valor Original": str(raw_amount),
                "Valor Processado": amount,
                "Categoria": str(raw_cat),
                "Status Deduplicação": status_dup,
                "fingerprint": fingerprint,
                "trans_date": trans_date
            })

        return {
            "success": True,
            "filename": file_path.name,
            "columns": columns,
            "detected_mapping": mapping,
            "total_rows": len(parsed_rows),
            "new_count": sum(1 for r in parsed_rows if r["Status Deduplicação"] == "Novo Lançamento"),
            "duplicate_count": sum(1 for r in parsed_rows if r["Status Deduplicação"] != "Novo Lançamento"),
            "raw_df": df,
            "parsed_rows": parsed_rows
        }

    def import_mapped_csv(
        self,
        file_path: Path,
        mapping: Dict[str, str],
        account_id: int,
        owner_id: int
    ) -> Dict[str, Any]:
        """Efetua a importação definitiva dos dados mapeados para o banco de dados SQLite."""
        preview = self.preview_csv_content(file_path, custom_mapping=mapping)
        if not preview["success"]:
            return preview

        target_acc = self.acc_repo.get_by_id(account_id) or self.acc_repo.get_all()[0]
        target_owner = self.owner_repo.get_by_id(owner_id) or self.owner_repo.get_all()[0]

        imported_count = 0
        skipped_count = 0

        for item in preview["parsed_rows"]:
            if item["Status Deduplicação"] == "Novo Lançamento":
                # Tentar encontrar categoria correspondente
                cat_obj = self.cat_repo.get_by_name(item["Categoria"])
                cat_id = cat_obj.id if cat_obj else None

                trans_created = self.trans_service.create_transaction(
                    description=item["Descrição"],
                    amount=item["Valor Processado"],
                    transaction_date=item["trans_date"],
                    type_=item["Tipo"],
                    payment_method="Cartão de Crédito" if "nubank" in file_path.name.lower() else "PIX",
                    status="Pago",
                    category_id=cat_id,
                    account_id=target_acc.id,
                    owner_id=target_owner.id,
                    source="CSV"
                )[0]

                trans_created.hash_fingerprint = item["fingerprint"]
                self.db.commit()
                imported_count += 1
            else:
                skipped_count += 1

        # Registrar no histórico
        history = ImportHistory(
            filename=file_path.name,
            imported_count=imported_count,
            skipped_count=skipped_count
        )
        self.db.add(history)
        self.db.commit()

        return {
            "success": True,
            "message": f"Sucesso! {imported_count} novas movimentações foram salvas no banco de dados. {skipped_count} duplicadas foram ignoradas.",
            "imported": imported_count,
            "skipped": skipped_count,
            "filename": file_path.name
        }

    def import_latest_csv(self, file_path: Optional[Path] = None) -> Dict[str, Any]:
        """Wrapper para retrocompatibilidade que importa o arquivo usando detecção automática."""
        target = file_path or self.find_latest_csv_file()
        if not target:
            return {"success": False, "message": "Nenhum arquivo CSV encontrado.", "imported": 0, "skipped": 0}

        df = self.read_raw_dataframe(target)
        columns = [str(c) for c in df.columns]
        mapping = self.auto_detect_columns(columns)
        
        accs = self.acc_repo.get_all()
        owners = self.owner_repo.get_all()
        acc_id = accs[0].id if accs else 1
        owner_id = owners[0].id if owners else 1

        return self.import_mapped_csv(target, mapping, acc_id, owner_id)

    def auto_sync_all_csvs(self) -> Dict[str, Any]:
        """Varre TODOS os arquivos CSV/XLSX da pasta dados/ e sincroniza automaticamente todas as movimentações novas."""
        files = self.find_all_csv_files()
        if not files:
            return {"success": False, "message": "Nenhuma planilha encontrada em dados/", "imported": 0, "skipped": 0, "files_processed": 0}

        total_imported = 0
        total_skipped = 0
        processed_files = []

        accs = self.acc_repo.get_all()
        owners = self.owner_repo.get_all()
        acc_id = accs[0].id if accs else 1
        owner_id = owners[0].id if owners else 1

        for file_path in files:
            try:
                res = self.import_latest_csv(file_path)
                if res.get("success"):
                    total_imported += res.get("imported", 0)
                    total_skipped += res.get("skipped", 0)
                    if res.get("imported", 0) > 0:
                        processed_files.append(f"{file_path.name} (+{res['imported']})")
            except Exception as e:
                logger.error(f"Erro no auto-sync do arquivo {file_path.name}: {e}")

        if total_imported > 0:
            msg = f"⚡ Sincronização Automática: {total_imported} novas movimentações importadas das planilhas em dados/ ({', '.join(processed_files)})."
        else:
            msg = f"Nenhuma movimentação nova encontrada. As {total_skipped} movimentações das planilhas já estão sincronizadas no banco de dados."

        return {
            "success": True,
            "message": msg,
            "imported": total_imported,
            "skipped": total_skipped,
            "files_processed": len(files)
        }
