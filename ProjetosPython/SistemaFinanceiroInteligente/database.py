"""
Módulo de Banco de Dados - Sistema de Controle Financeiro Inteligente
Gerencia todas as operações de banco de dados SQLite
"""

import sqlite3
import pandas as pd
from datetime import datetime
from typing import Optional, List, Dict, Tuple
import os

class Database:
    """Classe para gerenciar o banco de dados SQLite"""
    
    def __init__(self, db_path: str = "financas.db"):
        self.db_path = db_path
        self.init_database()
        self.init_default_categories()
    
    def get_connection(self):
        """Retorna uma conexão com o banco de dados"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Inicializa o banco de dados com todas as tabelas necessárias"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Tabela de Categorias (hierárquica)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categorias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('Receita', 'Despesa', 'Transferência')),
                categoria_pai_id INTEGER,
                FOREIGN KEY (categoria_pai_id) REFERENCES categorias(id)
            )
        """)
        
        # Tabela de Transações
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data DATE NOT NULL,
                descricao TEXT NOT NULL,
                categoria_id INTEGER NOT NULL,
                subcategoria_id INTEGER,
                valor REAL NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('Receita', 'Despesa', 'Transferência')),
                status TEXT NOT NULL CHECK(status IN ('Pago', 'Pendente')),
                forma_pagamento TEXT NOT NULL CHECK(forma_pagamento IN ('Cartão', 'Pix', 'Dinheiro', 'Transferência')),
                observacoes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id),
                FOREIGN KEY (subcategoria_id) REFERENCES categorias(id)
            )
        """)
        
        # Tabela de Orçamentos Mensais
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS orcamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                categoria_id INTEGER NOT NULL,
                mes INTEGER NOT NULL CHECK(mes >= 1 AND mes <= 12),
                ano INTEGER NOT NULL,
                valor_limite REAL NOT NULL,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id),
                UNIQUE(categoria_id, mes, ano)
            )
        """)
        
        # Tabela de Metas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('Reserva de Emergência', 'Outro')),
                valor_objetivo REAL NOT NULL,
                valor_atual REAL DEFAULT 0,
                data_objetivo DATE,
                descricao TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de Configurações
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS configuracoes (
                chave TEXT PRIMARY KEY,
                valor TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def init_default_categories(self):
        """Inicializa categorias padrão do sistema"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Verifica se já existem categorias
        cursor.execute("SELECT COUNT(*) FROM categorias")
        if cursor.fetchone()[0] > 0:
            conn.close()
            return
        
        # Categorias de Despesa
        categorias_despesa = [
            ("Habitação", None),
            ("Transporte", None),
            ("Alimentação", None),
            ("Saúde", None),
            ("Educação", None),
            ("Lazer", None),
            ("Compras", None),
            ("Serviços", None),
            ("Impostos", None),
            ("Outros", None)
        ]
        
        # Subcategorias de Despesa
        subcategorias_despesa = {
            "Habitação": ["Aluguel", "Condomínio", "IPTU", "Água", "Luz", "Gás", "Internet", "Telefone", "Manutenção"],
            "Transporte": ["Combustível", "Estacionamento", "Manutenção", "IPVA", "Seguro", "Transporte Público"],
            "Alimentação": ["Supermercado", "Restaurante", "Delivery", "Padaria", "Farmácia"],
            "Saúde": ["Plano de Saúde", "Médico", "Dentista", "Medicamentos", "Exames"],
            "Educação": ["Mensalidade", "Material Escolar", "Cursos", "Livros"],
            "Lazer": ["Cinema", "Viagem", "Hobby", "Assinaturas", "Eventos"],
            "Compras": ["Roupas", "Eletrônicos", "Casa", "Presentes"],
            "Serviços": ["Contador", "Advogado", "Outros Profissionais"],
            "Impostos": ["IRPF", "ISS", "Outros"],
            "Outros": ["Diversos"]
        }
        
        # Categorias de Receita
        categorias_receita = [
            ("Salário", None),
            ("Freelance", None),
            ("Investimentos", None),
            ("Aluguel", None),
            ("Outros", None)
        ]
        
        # Subcategorias de Receita
        subcategorias_receita = {
            "Salário": ["CLT", "PJ", "Bolsa"],
            "Freelance": ["Projetos", "Consultoria"],
            "Investimentos": ["Dividendos", "Juros", "Rendimentos"],
            "Aluguel": ["Imóvel", "Veículo"],
            "Outros": ["Vendas", "Reembolsos"]
        }
        
        # Insere categorias principais de despesa
        categoria_ids = {}
        for nome, pai_id in categorias_despesa:
            cursor.execute(
                "INSERT INTO categorias (nome, tipo, categoria_pai_id) VALUES (?, 'Despesa', ?)",
                (nome, pai_id)
            )
            categoria_ids[nome] = cursor.lastrowid
        
        # Insere subcategorias de despesa
        for categoria_pai, subcats in subcategorias_despesa.items():
            pai_id = categoria_ids[categoria_pai]
            for subcat in subcats:
                cursor.execute(
                    "INSERT INTO categorias (nome, tipo, categoria_pai_id) VALUES (?, 'Despesa', ?)",
                    (subcat, pai_id)
                )
        
        # Insere categorias principais de receita
        for nome, pai_id in categorias_receita:
            cursor.execute(
                "INSERT INTO categorias (nome, tipo, categoria_pai_id) VALUES (?, 'Receita', ?)",
                (nome, pai_id)
            )
            categoria_ids[nome] = cursor.lastrowid
        
        # Insere subcategorias de receita
        for categoria_pai, subcats in subcategorias_receita.items():
            if categoria_pai in categoria_ids:
                pai_id = categoria_ids[categoria_pai]
                for subcat in subcats:
                    cursor.execute(
                        "INSERT INTO categorias (nome, tipo, categoria_pai_id) VALUES (?, 'Receita', ?)",
                        (subcat, pai_id)
                    )
        
        conn.commit()
        conn.close()
    
    # ========== OPERAÇÕES COM TRANSAÇÕES ==========
    
    def adicionar_transacao(self, data: str, descricao: str, categoria_id: int, 
                           valor: float, tipo: str, status: str, forma_pagamento: str,
                           subcategoria_id: Optional[int] = None, observacoes: Optional[str] = None) -> int:
        """Adiciona uma nova transação"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO transacoes 
            (data, descricao, categoria_id, subcategoria_id, valor, tipo, status, forma_pagamento, observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (data, descricao, categoria_id, subcategoria_id, valor, tipo, status, forma_pagamento, observacoes))
        
        transacao_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return transacao_id
    
    def obter_transacoes(self, mes: Optional[int] = None, ano: Optional[int] = None,
                        tipo: Optional[str] = None, status: Optional[str] = None) -> pd.DataFrame:
        """Obtém transações com filtros opcionais"""
        conn = self.get_connection()
        
        query = """
            SELECT 
                t.id,
                t.data,
                t.descricao,
                c1.nome as categoria,
                c2.nome as subcategoria,
                t.valor,
                t.tipo,
                t.status,
                t.forma_pagamento,
                t.observacoes
            FROM transacoes t
            LEFT JOIN categorias c1 ON t.categoria_id = c1.id
            LEFT JOIN categorias c2 ON t.subcategoria_id = c2.id
            WHERE 1=1
        """
        params = []
        
        if mes:
            query += " AND strftime('%m', t.data) = ?"
            params.append(f"{mes:02d}")
        
        if ano:
            query += " AND strftime('%Y', t.data) = ?"
            params.append(str(ano))
        
        if tipo:
            query += " AND t.tipo = ?"
            params.append(tipo)
        
        if status:
            query += " AND t.status = ?"
            params.append(status)
        
        query += " ORDER BY t.data DESC, t.id DESC"
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        if not df.empty:
            df['data'] = pd.to_datetime(df['data'])
        
        return df
    
    def atualizar_transacao(self, transacao_id: int, **kwargs):
        """Atualiza uma transação existente"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        campos_permitidos = ['data', 'descricao', 'categoria_id', 'subcategoria_id', 
                           'valor', 'tipo', 'status', 'forma_pagamento', 'observacoes']
        
        updates = []
        valores = []
        for campo, valor in kwargs.items():
            if campo in campos_permitidos:
                updates.append(f"{campo} = ?")
                valores.append(valor)
        
        if updates:
            valores.append(transacao_id)
            query = f"UPDATE transacoes SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, valores)
            conn.commit()
        
        conn.close()
    
    def excluir_transacao(self, transacao_id: int):
        """Exclui uma transação"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transacoes WHERE id = ?", (transacao_id,))
        conn.commit()
        conn.close()
    
    # ========== OPERAÇÕES COM CATEGORIAS ==========
    
    def obter_categorias(self, tipo: Optional[str] = None, apenas_principais: bool = False) -> pd.DataFrame:
        """Obtém categorias com filtros opcionais"""
        conn = self.get_connection()
        
        query = """
            SELECT 
                c.id,
                c.nome,
                c.tipo,
                c.categoria_pai_id,
                cp.nome as categoria_pai
            FROM categorias c
            LEFT JOIN categorias cp ON c.categoria_pai_id = cp.id
            WHERE 1=1
        """
        params = []
        
        if tipo:
            query += " AND c.tipo = ?"
            params.append(tipo)
        
        if apenas_principais:
            query += " AND c.categoria_pai_id IS NULL"
        
        query += " ORDER BY c.tipo, c.categoria_pai_id, c.nome"
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df
    
    def obter_subcategorias(self, categoria_pai_id: int) -> List[Dict]:
        """Obtém subcategorias de uma categoria principal"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, nome, tipo
            FROM categorias
            WHERE categoria_pai_id = ?
            ORDER BY nome
        """, (categoria_pai_id,))
        
        subcategorias = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return subcategorias
    
    # ========== OPERAÇÕES COM ORÇAMENTOS ==========
    
    def adicionar_orcamento(self, categoria_id: int, mes: int, ano: int, valor_limite: float):
        """Adiciona ou atualiza um orçamento mensal"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO orcamentos (categoria_id, mes, ano, valor_limite)
            VALUES (?, ?, ?, ?)
        """, (categoria_id, mes, ano, valor_limite))
        
        conn.commit()
        conn.close()
    
    def obter_orcamentos(self, mes: Optional[int] = None, ano: Optional[int] = None) -> pd.DataFrame:
        """Obtém orçamentos com filtros opcionais"""
        conn = self.get_connection()
        
        query = """
            SELECT 
                o.id,
                o.categoria_id,
                c.nome as categoria,
                o.mes,
                o.ano,
                o.valor_limite
            FROM orcamentos o
            JOIN categorias c ON o.categoria_id = c.id
            WHERE 1=1
        """
        params = []
        
        if mes:
            query += " AND o.mes = ?"
            params.append(mes)
        
        if ano:
            query += " AND o.ano = ?"
            params.append(ano)
        
        query += " ORDER BY o.ano DESC, o.mes DESC, c.nome"
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        return df
    
    # ========== OPERAÇÕES COM METAS ==========
    
    def adicionar_meta(self, nome: str, tipo: str, valor_objetivo: float,
                      valor_atual: float = 0, data_objetivo: Optional[str] = None,
                      descricao: Optional[str] = None) -> int:
        """Adiciona uma nova meta"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO metas (nome, tipo, valor_objetivo, valor_atual, data_objetivo, descricao)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (nome, tipo, valor_objetivo, valor_atual, data_objetivo, descricao))
        
        meta_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return meta_id
    
    def obter_metas(self) -> pd.DataFrame:
        """Obtém todas as metas"""
        conn = self.get_connection()
        df = pd.read_sql_query("SELECT * FROM metas ORDER BY created_at DESC", conn)
        conn.close()
        return df
    
    def atualizar_meta(self, meta_id: int, **kwargs):
        """Atualiza uma meta existente"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        campos_permitidos = ['nome', 'tipo', 'valor_objetivo', 'valor_atual', 
                           'data_objetivo', 'descricao']
        
        updates = []
        valores = []
        for campo, valor in kwargs.items():
            if campo in campos_permitidos:
                updates.append(f"{campo} = ?")
                valores.append(valor)
        
        if updates:
            valores.append(meta_id)
            query = f"UPDATE metas SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, valores)
            conn.commit()
        
        conn.close()
    
    def excluir_meta(self, meta_id: int):
        """Exclui uma meta"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM metas WHERE id = ?", (meta_id,))
        conn.commit()
        conn.close()
    
    # ========== CONFIGURAÇÕES ==========
    
    def obter_configuracao(self, chave: str, valor_padrao: Optional[str] = None) -> Optional[str]:
        """Obtém uma configuração"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT valor FROM configuracoes WHERE chave = ?", (chave,))
        resultado = cursor.fetchone()
        conn.close()
        return resultado[0] if resultado else valor_padrao
    
    def definir_configuracao(self, chave: str, valor: str):
        """Define uma configuração"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO configuracoes (chave, valor)
            VALUES (?, ?)
        """, (chave, valor))
        conn.commit()
        conn.close()
