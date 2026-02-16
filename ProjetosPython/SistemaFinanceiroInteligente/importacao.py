"""
Módulo de Importação - Sistema de Controle Financeiro Inteligente
Gerencia a importação e limpeza de dados de extratos bancários (.CSV e .OFX)
"""

import pandas as pd
import re
from datetime import datetime
from typing import List, Dict, Optional
from database import Database

class ImportadorExtratos:
    """Classe para importar e processar extratos bancários"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def limpar_data(self, data_str: str, formato_entrada: str = "auto") -> Optional[str]:
        """
        Limpa e converte data para formato DD/MM/AAAA
        Suporta múltiplos formatos de entrada
        """
        if pd.isna(data_str) or not data_str:
            return None
        
        data_str = str(data_str).strip()
        
        # Tenta diferentes formatos comuns (incluindo formatos do Nubank)
        formatos = [
            "%d/%m/%Y",      # 09/03/2026
            "%Y-%m-%d",      # 2026-03-09 (Nubank comum)
            "%d-%m-%Y",      # 09-03-2026
            "%Y/%m/%d",      # 2026/03/09
            "%d.%m.%Y",      # 09.03.2026
            "%Y.%m.%d",      # 2026.03.09
            "%d/%m/%y",      # 09/03/26
            "%Y%m%d",        # 20260309
            "%d%m%Y",        # 09032026
        ]
        
        if formato_entrada != "auto":
            formatos.insert(0, formato_entrada)
        
        for fmt in formatos:
            try:
                dt = datetime.strptime(data_str, fmt)
                return dt.strftime("%d/%m/%Y")
            except:
                continue
        
        # Tenta regex para formatos variados
        padroes = [
            r'(\d{2})/(\d{2})/(\d{4})',
            r'(\d{4})-(\d{2})-(\d{2})',
            r'(\d{2})-(\d{2})-(\d{4})',
        ]
        
        for padrao in padroes:
            match = re.match(padrao, data_str)
            if match:
                grupos = match.groups()
                if len(grupos[0]) == 4:  # Ano primeiro
                    ano, mes, dia = grupos
                else:  # Dia primeiro
                    dia, mes, ano = grupos
                try:
                    dt = datetime(int(ano), int(mes), int(dia))
                    return dt.strftime("%d/%m/%Y")
                except:
                    continue
        
        return None
    
    def limpar_valor(self, valor_str: str) -> Optional[float]:
        """
        Limpa e converte valor para float
        Remove símbolos de moeda, espaços e trata decimais
        Suporta formatos brasileiros (vírgula como separador decimal)
        """
        if pd.isna(valor_str):
            return None
        
        valor_str = str(valor_str).strip()
        
        # Remove símbolos de moeda comuns e espaços
        valor_str = re.sub(r'[R$\s]', '', valor_str)
        
        # Detecta se usa vírgula ou ponto como separador decimal
        # Se tem vírgula e ponto, assume que vírgula é decimal e ponto é milhar
        tem_virgula = ',' in valor_str
        tem_ponto = '.' in valor_str
        
        if tem_virgula and tem_ponto:
            # Formato brasileiro: 1.234,56
            valor_str = valor_str.replace('.', '')  # Remove separador de milhar
            valor_str = valor_str.replace(',', '.')   # Converte vírgula para ponto
        elif tem_virgula and not tem_ponto:
            # Apenas vírgula: 1234,56
            valor_str = valor_str.replace(',', '.')
        # Se só tem ponto ou nenhum, mantém como está
        
        # Remove caracteres não numéricos exceto ponto e sinal negativo
        valor_str = re.sub(r'[^\d\.\-]', '', valor_str)
        
        # Remove múltiplos pontos (mantém apenas o último como decimal)
        partes = valor_str.split('.')
        if len(partes) > 2:
            valor_str = ''.join(partes[:-1]) + '.' + partes[-1]
        
        try:
            valor = float(valor_str)
            return valor
        except:
            return None
    
    def identificar_tipo_transacao(self, descricao: str, valor: float) -> str:
        """
        Identifica automaticamente o tipo de transação (Receita/Despesa)
        baseado na descrição e no valor
        """
        descricao_lower = descricao.lower()
        
        # Palavras-chave para receitas
        palavras_receita = [
            'salario', 'salário', 'deposito', 'depósito', 'credito', 'crédito',
            'transferencia recebida', 'transferência recebida', 'pix recebido',
            'rendimento', 'dividendo', 'juros recebidos', 'reembolso'
        ]
        
        # Palavras-chave para despesas
        palavras_despesa = [
            'pagamento', 'debito', 'débito', 'transferencia enviada',
            'transferência enviada', 'pix enviado', 'compra', 'saque',
            'taxa', 'tarifa', 'boleto', 'fatura'
        ]
        
        # Verifica receitas
        for palavra in palavras_receita:
            if palavra in descricao_lower:
                return 'Receita'
        
        # Verifica despesas
        for palavra in palavras_despesa:
            if palavra in descricao_lower:
                return 'Despesa'
        
        # Se não identificou, usa o sinal do valor
        # Valores negativos geralmente são despesas
        if valor < 0:
            return 'Despesa'
        else:
            return 'Receita'
    
    def identificar_forma_pagamento(self, descricao: str) -> str:
        """
        Identifica automaticamente a forma de pagamento
        baseado na descrição
        """
        descricao_lower = descricao.lower()
        
        if 'pix' in descricao_lower:
            return 'Pix'
        elif 'cartao' in descricao_lower or 'cartão' in descricao_lower or 'credito' in descricao_lower:
            return 'Cartão'
        elif 'transferencia' in descricao_lower or 'transferência' in descricao_lower:
            return 'Transferência'
        elif 'dinheiro' in descricao_lower or 'saque' in descricao_lower:
            return 'Dinheiro'
        else:
            return 'Pix'  # Padrão
    
    def mapear_categoria(self, descricao: str, tipo: str) -> Optional[int]:
        """
        Tenta mapear automaticamente a categoria baseado na descrição
        Retorna o ID da categoria ou None
        """
        descricao_lower = descricao.lower()
        categorias = self.db.obter_categorias(tipo=tipo)
        
        # Mapeamento de palavras-chave para categorias
        mapeamento = {
            'Habitação': ['aluguel', 'condominio', 'condomínio', 'iptu', 'agua', 'água', 'luz', 'gas', 'gás', 'internet', 'telefone'],
            'Transporte': ['combustivel', 'combustível', 'estacionamento', 'ipva', 'seguro', 'uber', 'taxi', 'onibus', 'ônibus'],
            'Alimentação': ['supermercado', 'restaurante', 'delivery', 'padaria', 'ifood', 'rappi', 'uber eats'],
            'Saúde': ['plano de saude', 'médico', 'medico', 'dentista', 'farmacia', 'farmácia', 'medicamento'],
            'Educação': ['mensalidade', 'escola', 'curso', 'faculdade', 'universidade', 'material escolar'],
            'Lazer': ['cinema', 'netflix', 'spotify', 'viagem', 'hobby'],
            'Compras': ['loja', 'shopping', 'amazon', 'mercado livre'],
            'Salário': ['salario', 'salário', 'pagamento', 'folha'],
            'Freelance': ['freelance', 'projeto', 'consultoria'],
            'Investimentos': ['dividendo', 'rendimento', 'juros', 'aplicacao', 'aplicação']
        }
        
        # Procura correspondência
        for categoria_nome, palavras_chave in mapeamento.items():
            categoria_df = categorias[categorias['nome'] == categoria_nome]
            if not categoria_df.empty:
                for palavra in palavras_chave:
                    if palavra in descricao_lower:
                        return int(categoria_df.iloc[0]['id'])
        
        # Se não encontrou, retorna categoria "Outros"
        outros_df = categorias[categorias['nome'] == 'Outros']
        if not outros_df.empty:
            return int(outros_df.iloc[0]['id'])
        
        return None
    
    def importar_csv(self, caminho_arquivo: str, 
                    mapeamento_colunas: Optional[Dict[str, str]] = None,
                    separador: Optional[str] = None,
                    encoding: str = 'utf-8') -> pd.DataFrame:
        """
        Importa um arquivo CSV de extrato bancário
        
        mapeamento_colunas: Dicionário com mapeamento {coluna_arquivo: coluna_sistema}
        Exemplo: {'Data': 'data', 'Descrição': 'descricao', 'Valor': 'valor'}
        """
        try:
            # Tenta diferentes separadores se não especificado
            separadores = [separador] if separador else [';', ',', '\t', '|']
            # Remove None se separador foi especificado como None
            separadores = [s for s in separadores if s is not None]
            
            # Tenta diferentes encodings
            encodings = [encoding, 'latin-1', 'iso-8859-1', 'cp1252', 'utf-8-sig']
            df = None
            separador_usado = None
            encoding_usado = None
            
            # Tenta todas as combinações de separador e encoding
            for sep in separadores:
                for enc in encodings:
                    try:
                        df_teste = pd.read_csv(caminho_arquivo, sep=sep, encoding=enc, on_bad_lines='skip')
                        # Verifica se conseguiu ler pelo menos uma linha de dados
                        if len(df_teste) > 0 and len(df_teste.columns) >= 2:
                            df = df_teste
                            separador_usado = sep
                            encoding_usado = enc
                            break
                    except:
                        continue
                if df is not None:
                    break
            
            if df is None or df.empty:
                raise ValueError("Não foi possível ler o arquivo. Verifique o formato e encoding.")
            
            # Mapeia colunas se fornecido
            if mapeamento_colunas:
                df = df.rename(columns=mapeamento_colunas)
            
            # Normaliza nomes de colunas (minúsculas, sem acentos)
            df.columns = df.columns.str.lower().str.strip()
            
            # Remove linhas completamente vazias
            df = df.dropna(how='all')
            
            # Processa dados
            transacoes_processadas = []
            linhas_ignoradas = 0
            
            for idx, row in df.iterrows():
                # Extrai e limpa dados
                data_str = None
                descricao = None
                valor = None
                
                # Tenta encontrar colunas por nomes comuns (mais flexível)
                for col in df.columns:
                    col_lower = col.lower().strip()
                    valor_celula = row[col]
                    
                    # Ignora células vazias
                    if pd.isna(valor_celula):
                        continue
                    
                    # Detecta coluna de data
                    if ('data' in col_lower or 'date' in col_lower or 'dia' in col_lower) and data_str is None:
                        data_str = self.limpar_data(str(valor_celula))
                    
                    # Detecta coluna de descrição (mais variações)
                    elif (('desc' in col_lower or 'historico' in col_lower or 'detalhe' in col_lower or 
                           'title' in col_lower or 'nome' in col_lower or 'name' in col_lower or
                           'transacao' in col_lower or 'transaction' in col_lower or
                           'categoria' in col_lower or 'category' in col_lower) and 
                          descricao is None):
                        descricao = str(valor_celula).strip()
                    
                    # Detecta coluna de valor (mais variações)
                    elif (('valor' in col_lower or 'amount' in col_lower or 'saldo' in col_lower or
                           'value' in col_lower or 'total' in col_lower or 'preco' in col_lower or
                           'preço' in col_lower) and valor is None):
                        valor = self.limpar_valor(str(valor_celula))
                
                # Se não encontrou descrição, tenta usar qualquer coluna de texto não numérica
                if not descricao:
                    for col in df.columns:
                        col_lower = col.lower().strip()
                        valor_celula = row[col]
                        if pd.notna(valor_celula):
                            valor_str = str(valor_celula).strip()
                            # Se não é número e não é data, pode ser descrição
                            try:
                                float(valor_str.replace(',', '.').replace('R$', '').replace('$', '').strip())
                            except:
                                if len(valor_str) > 3 and descricao is None:
                                    descricao = valor_str
                
                # Valida dados obrigatórios
                if not data_str or not descricao or valor is None:
                    linhas_ignoradas += 1
                    continue
                
                # Identifica tipo baseado no valor (negativo = despesa, positivo = receita)
                # Mas também verifica a descrição
                if valor < 0:
                    tipo = 'Despesa'
                    valor = abs(valor)  # Converte para positivo
                else:
                    tipo = self.identificar_tipo_transacao(descricao, valor)
                
                forma_pagamento = self.identificar_forma_pagamento(descricao)
                
                # Mapeia categoria
                categoria_id = self.mapear_categoria(descricao, tipo)
                
                transacoes_processadas.append({
                    'data': data_str,
                    'descricao': descricao,
                    'categoria_id': categoria_id,
                    'valor': float(valor),
                    'tipo': tipo,
                    'status': 'Pago',  # Assumindo que extratos são de transações já pagas
                    'forma_pagamento': forma_pagamento
                })
            
            resultado = pd.DataFrame(transacoes_processadas)
            
            # Adiciona informações de debug como atributo (não visível no DataFrame)
            if hasattr(resultado, '_info'):
                resultado._info = {
                    'separador': separador_usado,
                    'encoding': encoding_usado,
                    'linhas_ignoradas': linhas_ignoradas,
                    'colunas_encontradas': list(df.columns)
                }
            
            return resultado
            
        except Exception as e:
            raise Exception(f"Erro ao importar CSV: {str(e)}")
    
    def importar_ofx(self, caminho_arquivo: str) -> pd.DataFrame:
        """
        Importa um arquivo OFX (Open Financial Exchange)
        Formato comum de extratos bancários
        """
        try:
            # Lê o arquivo OFX (é um formato XML)
            with open(caminho_arquivo, 'r', encoding='utf-8', errors='ignore') as f:
                conteudo = f.read()
            
            # Extrai transações usando regex (formato simplificado)
            transacoes = []
            
            # Padrão para transações OFX
            padrao_transacao = r'<STMTTRN>.*?<DTPOSTED>(\d{8})</DTPOSTED>.*?<TRNAMT>([\d\.\-,]+)</TRNAMT>.*?<MEMO>(.*?)</MEMO>.*?</STMTTRN>'
            
            matches = re.findall(padrao_transacao, conteudo, re.DOTALL)
            
            for match in matches:
                data_ofx, valor_str, memo = match
                
                # Converte data OFX (YYYYMMDD) para DD/MM/YYYY
                try:
                    dt = datetime.strptime(data_ofx, "%Y%m%d")
                    data_str = dt.strftime("%d/%m/%Y")
                except:
                    continue
                
                # Limpa valor
                valor = self.limpar_valor(valor_str)
                if valor is None:
                    continue
                
                # Identifica tipo
                tipo = self.identificar_tipo_transacao(memo, valor)
                forma_pagamento = self.identificar_forma_pagamento(memo)
                categoria_id = self.mapear_categoria(memo, tipo)
                
                transacoes.append({
                    'data': data_str,
                    'descricao': memo.strip(),
                    'categoria_id': categoria_id,
                    'valor': abs(valor),
                    'tipo': tipo,
                    'status': 'Pago',
                    'forma_pagamento': forma_pagamento
                })
            
            return pd.DataFrame(transacoes)
            
        except Exception as e:
            raise Exception(f"Erro ao importar OFX: {str(e)}")
    
    def salvar_transacoes_importadas(self, df_transacoes: pd.DataFrame, 
                                     revisar_antes: bool = True) -> Dict:
        """
        Salva transações importadas no banco de dados
        Retorna estatísticas da importação
        """
        if df_transacoes.empty:
            return {
                'total': 0,
                'importadas': 0,
                'erros': 0,
                'duplicadas': 0
            }
        
        importadas = 0
        erros = 0
        duplicadas = 0
        
        for _, transacao in df_transacoes.iterrows():
            try:
                # Verifica se já existe (evita duplicatas)
                # Compara por data, descrição e valor
                transacoes_existentes = self.db.obter_transacoes()
                if not transacoes_existentes.empty:
                    existe = transacoes_existentes[
                        (transacoes_existentes['data'].dt.strftime('%d/%m/%Y') == transacao['data']) &
                        (transacoes_existentes['descricao'] == transacao['descricao']) &
                        (abs(transacoes_existentes['valor'] - transacao['valor']) < 0.01)
                    ]
                    if not existe.empty:
                        duplicadas += 1
                        continue
                
                # Adiciona transação
                categoria_id = transacao.get('categoria_id')
                if not categoria_id:
                    # Usa categoria "Outros" se não mapeou
                    categorias = self.db.obter_categorias(tipo=transacao['tipo'])
                    outros = categorias[categorias['nome'] == 'Outros']
                    if not outros.empty:
                        categoria_id = int(outros.iloc[0]['id'])
                    else:
                        erros += 1
                        continue
                
                self.db.adicionar_transacao(
                    data=transacao['data'],
                    descricao=transacao['descricao'],
                    categoria_id=categoria_id,
                    valor=transacao['valor'],
                    tipo=transacao['tipo'],
                    status=transacao.get('status', 'Pago'),
                    forma_pagamento=transacao.get('forma_pagamento', 'Pix')
                )
                importadas += 1
                
            except Exception as e:
                erros += 1
                continue
        
        return {
            'total': len(df_transacoes),
            'importadas': importadas,
            'erros': erros,
            'duplicadas': duplicadas
        }
