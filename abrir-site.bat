@echo off
REM ---------------------------------------------------------------
REM  Kavita Uchila — servidor local de pre-visualizacao
REM  Abre http://localhost:3000/preview.html no navegador
REM ---------------------------------------------------------------
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %ERRORLEVEL%==0 (
  echo A iniciar servidor Node (com API) em http://localhost:3000/preview.html
  start "" http://localhost:3000/preview.html
  node server.js
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  echo A iniciar servidor Python em http://localhost:3000/preview.html
  start "" http://localhost:3000/preview.html
  python -m http.server 3000
  goto :eof
)

echo.
echo  Node.js ou Python nao encontrados.
echo  Podes simplesmente abrir o ficheiro preview.html com duplo-clique.
echo.
pause
