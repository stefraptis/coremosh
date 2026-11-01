@echo off
REM Double-click to preview the site at http://localhost:4000 (close this window to stop).
cd /d "%~dp0"
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:4000"
node scripts\serve.mjs
pause
