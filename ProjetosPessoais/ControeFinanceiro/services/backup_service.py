import shutil
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from config.settings import DB_PATH, BACKUPS_DIR
from utils.logger import logger

class BackupService:
    @staticmethod
    def create_backup() -> Dict[str, Any]:
        """Cria um backup timestamped do banco de dados SQLite na pasta backups/."""
        if not DB_PATH.exists():
            return {"success": False, "message": "Banco de dados não encontrado."}

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"finance_control_backup_{timestamp}.db"
        dest_path = BACKUPS_DIR / backup_filename

        try:
            shutil.copy2(DB_PATH, dest_path)
            logger.info(f"Backup do banco de dados criado em: {dest_path}")
            return {
                "success": True,
                "message": f"Backup realizado com sucesso: {backup_filename}",
                "filename": backup_filename,
                "path": str(dest_path)
            }
        except Exception as e:
            logger.error(f"Erro ao criar backup: {e}")
            return {"success": False, "message": f"Erro ao criar backup: {str(e)}"}

    @staticmethod
    def list_backups() -> List[Dict[str, Any]]:
        """Lista todos os arquivos de backup salvos em backups/."""
        if not BACKUPS_DIR.exists():
            return []
        
        backups = []
        for file_path in BACKUPS_DIR.glob("*.db"):
            stat = file_path.stat()
            backups.append({
                "filename": file_path.name,
                "path": str(file_path),
                "size_kb": round(stat.st_size / 1024, 2),
                "created_at": datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M:%S")
            })

        backups.sort(key=lambda x: x["filename"], reverse=True)
        return backups

    @staticmethod
    def restore_backup(backup_filename: str) -> Dict[str, Any]:
        """Restaura um banco de dados a partir de um arquivo de backup especifico."""
        target_backup = BACKUPS_DIR / backup_filename
        if not target_backup.exists():
            return {"success": False, "message": "Arquivo de backup não encontrado."}

        try:
            # Criar um backup de segurança do estado atual antes da restauração
            BackupService.create_backup()

            shutil.copy2(target_backup, DB_PATH)
            logger.info(f"Banco de dados restaurado a partir de {backup_filename}")
            return {"success": True, "message": f"Banco de dados restaurado com sucesso para a versão {backup_filename}."}
        except Exception as e:
            logger.error(f"Erro ao restaurar backup: {e}")
            return {"success": False, "message": f"Erro ao restaurar backup: {str(e)}"}
