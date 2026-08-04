from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config.settings import DATABASE_URL, DB_PATH
from database.base import Base
from utils.logger import logger
import os

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True
)

SessionFactory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
ScopedSession = scoped_session(SessionFactory)

def get_db():
    """Retorna uma sessão do banco de dados SQLAlchemy."""
    db = ScopedSession()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Cria todas as tabelas no banco de dados SQLite e popula sementes padrão se necessário."""
    try:
        # Import all models here so Base knows about them before create_all
        import models.owner
        import models.account
        import models.card
        import models.category
        import models.tag
        import models.transaction
        import models.split
        import models.refund
        import models.fixed_expense
        import models.subscription
        import models.goal
        import models.budget
        import models.import_history

        Base.metadata.create_all(bind=engine)
        logger.info(f"Banco de dados inicializado em {DB_PATH}")

        # Auto-seed default values
        seed_default_data()
    except Exception as e:
        logger.error(f"Erro ao inicializar banco de dados: {e}")
        raise e

def seed_default_data():
    """Insere categorias, proprietários, contas e cartões padrão caso o banco esteja limpo."""
    from models.owner import Owner
    from models.account import Account
    from models.card import Card
    from models.category import Category, Subcategory
    from models.tag import Tag
    from config.constants import (
        DEFAULT_OWNERS, DEFAULT_ACCOUNTS, DEFAULT_CARDS,
        DEFAULT_CATEGORIES, DEFAULT_TAGS
    )

    db = ScopedSession()
    try:
        # Seed Owners
        if db.query(Owner).count() == 0:
            for owner_name in DEFAULT_OWNERS:
                db.add(Owner(name=owner_name, is_default=True))
            db.commit()
            logger.info("Proprietários padrão inseridos com sucesso.")

        # Seed Accounts
        if db.query(Account).count() == 0:
            for acc in DEFAULT_ACCOUNTS:
                db.add(Account(
                    name=acc["name"],
                    account_type=acc["type"],
                    initial_balance=acc["balance"],
                    current_balance=acc["balance"],
                    icon=acc["icon"],
                    color=acc["color"]
                ))
            db.commit()
            logger.info("Contas padrão inseridas com sucesso.")

        # Seed Cards
        if db.query(Card).count() == 0:
            for card in DEFAULT_CARDS:
                db.add(Card(
                    name=card["name"],
                    brand=card["brand"],
                    credit_limit=card["limit"],
                    closing_day=card["closing_day"],
                    due_day=card["due_day"],
                    color=card["color"]
                ))
            db.commit()
            logger.info("Cartões de crédito padrão inseridos.")

        # Seed Categories & Subcategories
        if db.query(Category).count() == 0:
            for cat_data in DEFAULT_CATEGORIES:
                cat = Category(
                    name=cat_data["name"],
                    type=cat_data["type"],
                    icon=cat_data["icon"],
                    color=cat_data["color"]
                )
                db.add(cat)
                db.flush() # get cat.id
                for sub_name in cat_data["subcategories"]:
                    db.add(Subcategory(name=sub_name, category_id=cat.id))
            db.commit()
            logger.info("Categorias e subcategorias padrão inseridas.")

        # Seed Tags
        if db.query(Tag).count() == 0:
            for tag_name in DEFAULT_TAGS:
                db.add(Tag(name=tag_name))
            db.commit()
            logger.info("Tags padrão inseridas.")

    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao popular dados iniciais (seeding): {e}")
    finally:
        db.close()
