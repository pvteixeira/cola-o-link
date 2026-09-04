@echo off
cls

echo ========================================================
echo   COLA O LINK - Deploy Docker
echo ========================================================
echo.

echo [1/3] Parando containers anteriores...
docker compose down

echo.
echo [2/3] Construindo imagens sem cache...
docker compose build --no-cache

echo.
echo [3/3] Iniciando aplicacao e Redis...
docker compose up -d

echo.
echo ========================================================
echo   Sucesso! A aplicacao esta no ar:
echo   - Web:   http://localhost:3000
echo   - Redis: localhost:6379
echo ========================================================
echo.
pause