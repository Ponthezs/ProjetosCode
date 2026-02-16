@echo off
echo ========================================
echo Sistema Financeiro Inteligente
echo ========================================
echo.
echo Iniciando aplicacao...
echo.

cd /d "%~dp0"
python -m streamlit run app.py

pause
