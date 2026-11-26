@echo off
rem La Horda: Conclave en LAN. Los celulares del mismo Wi-Fi abren la direccion que se muestra abajo.
cd /d "%~dp0server"
if not exist node_modules\ws call npm install --no-audit --no-fund
start "" http://localhost:8787
node duel-server.js
pause
