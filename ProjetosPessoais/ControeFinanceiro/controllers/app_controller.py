from sqlalchemy.orm import Session
from database.connection import ScopedSession
from services.account_service import AccountService
from services.transaction_service import TransactionService
from services.importer_service import IntelligentImporterService
from services.analytics_service import AnalyticsService
from services.ai_insights_service import AIFinancialEngineService
from services.recurring_service import RecurringService
from services.report_service import ReportExportService
from services.backup_service import BackupService
from repositories.category_repo import CategoryRepository, OwnerRepository, TagRepository
from repositories.goal_budget_repo import GoalRepository, BudgetRepository

class AppController:
    """Orquestrador central da aplicação que provê acesso a todos os serviços com gerenciamento de sessão DB."""
    def __init__(self):
        self.db: Session = ScopedSession()
        self.accounts = AccountService(self.db)
        self.transactions = TransactionService(self.db)
        self.importer = IntelligentImporterService(self.db)
        self.analytics = AnalyticsService(self.db)
        self.ai = AIFinancialEngineService(self.db)
        self.recurring = RecurringService(self.db)
        self.reports = ReportExportService(self.db)
        self.backups = BackupService()
        
        self.categories = CategoryRepository(self.db)
        self.owners = OwnerRepository(self.db)
        self.tags = TagRepository(self.db)
        self.goals = GoalRepository(self.db)
        self.budgets = BudgetRepository(self.db)

    def close(self):
        self.db.close()
