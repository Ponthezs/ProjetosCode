from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# Data directories
DADOS_DIR = BASE_DIR / "dados"
BACKUPS_DIR = BASE_DIR / "backups"
EXPORTS_DIR = BASE_DIR / "exports"
DATABASE_DIR = BASE_DIR / "database"

# Ensure essential directories exist
for folder in [DADOS_DIR, BACKUPS_DIR, EXPORTS_DIR, DATABASE_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

# SQLite Database Path
DB_NAME = "finance_control.db"
DB_PATH = DATABASE_DIR / DB_NAME
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Application Info
APP_NAME = "FinanceControl - Gestão Financeira Pessoal"
APP_VERSION = "2.0.0"
APP_AUTHOR = "Equipe Sênior de Engenharia Financeira"
