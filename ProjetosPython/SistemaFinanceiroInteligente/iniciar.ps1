# Script PowerShell para iniciar o Sistema Financeiro Inteligente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sistema Financeiro Inteligente" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando aplicacao..." -ForegroundColor Green
Write-Host ""

# Navega para o diretório do script
Set-Location $PSScriptRoot

# Executa o Streamlit
python -m streamlit run app.py
