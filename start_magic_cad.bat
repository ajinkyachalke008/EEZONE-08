@echo off
echo ===================================================
echo 🚀 STARTING EE ZONE + MAGIC CAD (CADAM) 🚀
echo ===================================================

echo [1/4] Checking Docker Engine status...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Docker is not running! Launching Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Waiting 15 seconds for Docker Engine to initialize...
    ping 127.0.0.1 -n 15 > nul
    docker ps >nul 2>&1
    if errorlevel 1 (
        echo ⚠️ WARNING: Docker still doesn't seem ready. The Supabase backend might fail to start.
    ) else (
        echo ✅ Docker started successfully.
    )
) else (
    echo ✅ Docker is already running.
)

echo.
echo [2/4] Starting CADAM Supabase Backend...
cd apps\magic-cad
call npx supabase start
start cmd /k "echo Serving NVIDIA Edge Functions... & npx supabase functions serve --no-verify-jwt"

echo.
echo [3/4] Starting CADAM Frontend (Port 5173)...
start cmd /k "echo Starting Magic CAD Frontend... & npm run dev"

echo.
echo [4/4] Starting EE Zone Main Site (Port 3000)...
cd ..\..
start cmd /k "echo Starting EE Zone Next.js... & npm run dev"

echo ===================================================
echo ✨ ALL SERVICES LAUNCHED! ✨
echo Magic CAD should be available inside EE Zone now.
echo Visit: http://localhost:3000/magic-cad
echo ===================================================
pause
