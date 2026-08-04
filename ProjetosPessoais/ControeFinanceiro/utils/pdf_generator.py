import io
import pandas as pd
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from utils.formatters import format_currency, format_date

def generate_financial_pdf_report(
    title: str,
    period_str: str,
    kpis: dict,
    df_transactions: pd.DataFrame
) -> bytes:
    """Gera um PDF completo e estilizado do relatório financeiro usando ReportLab."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    
    # Estilos customizados
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E293B')
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#64748B')
    )

    section_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=12,
        spaceAfter=6
    )

    cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#334155')
    )

    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    story = []

    # Cabeçalho
    story.append(Paragraph(title, title_style))
    story.append(Paragraph(f"Período: {period_str} | Gerado por FinanceControl", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

    # Tabela de KPIs
    if kpis:
        story.append(Paragraph("Resumo Executivo", section_style))
        kpi_data = [
            [
                Paragraph("<b>Receitas</b>", cell_style),
                Paragraph("<b>Despesas</b>", cell_style),
                Paragraph("<b>Saldo</b>", cell_style),
                Paragraph("<b>Taxa de Economia</b>", cell_style)
            ],
            [
                Paragraph(format_currency(kpis.get('receitas', 0.0)), cell_style),
                Paragraph(format_currency(kpis.get('despesas', 0.0)), cell_style),
                Paragraph(format_currency(kpis.get('saldo', 0.0)), cell_style),
                Paragraph(f"{kpis.get('taxa_economia', 0.0):.1f}%", cell_style)
            ]
        ]
        t_kpi = Table(kpi_data, colWidths=[130, 130, 130, 130])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(t_kpi)
        story.append(Spacer(1, 15))

    # Tabela de Movimentações
    story.append(Paragraph("Detalhamento das Movimentações", section_style))
    
    table_data = [[
        Paragraph("Data", header_cell_style),
        Paragraph("Descrição", header_cell_style),
        Paragraph("Tipo", header_cell_style),
        Paragraph("Categoria", header_cell_style),
        Paragraph("Proprietário", header_cell_style),
        Paragraph("Valor", header_cell_style)
    ]]

    if not df_transactions.empty:
        for _, row in df_transactions.head(100).iterrows(): # Limitar a 100 mais recentes no PDF
            val = row.get('valor', 0.0)
            tipo = str(row.get('tipo', 'Despesa'))
            val_str = format_currency(val)
            if tipo == "Despesa":
                val_str = f"- {val_str}"
            elif tipo == "Receita":
                val_str = f"+ {val_str}"

            dt_str = format_date(row.get('data'))
            desc = str(row.get('descricao', ''))[:30]
            cat = str(row.get('categoria', 'Geral'))[:20]
            prop = str(row.get('proprietario', 'Meu'))[:15]

            table_data.append([
                Paragraph(dt_str, cell_style),
                Paragraph(desc, cell_style),
                Paragraph(tipo, cell_style),
                Paragraph(cat, cell_style),
                Paragraph(prop, cell_style),
                Paragraph(val_str, cell_style)
            ])
    else:
        table_data.append([Paragraph("Nenhuma movimentação encontrada.", cell_style)] * 6)

    t_trans = Table(table_data, colWidths=[65, 155, 65, 95, 70, 80])
    t_trans.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_trans)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
