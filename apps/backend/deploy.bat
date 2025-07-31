@echo off
REM Local deployment script for Wildeditor Backend (Windows)
REM This script helps you test the deployment process locally on Windows

setlocal enabledelayedexpansion

echo 🏗️  Wildeditor Backend Local Deployment Script (Windows)
echo ====================================================

REM Configuration
set DOCKER_IMAGE=wildeditor-backend
set CONTAINER_NAME=wildeditor-backend-local
if "%PORT%"=="" set PORT=8000

REM Parse command line argument
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=deploy

goto %COMMAND% 2>nul || goto usage

:build
    echo 🏗️  Building Docker image...
    cd /d "%~dp0"
    docker build -t %DOCKER_IMAGE% -f Dockerfile ..\..
    goto end

:deploy
    call :cleanup
    call :build
    call :run_container
    call :wait_for_health
    call :show_status
    goto end

:restart
    call :cleanup
    call :run_container
    call :wait_for_health
    call :show_status
    goto end

:stop
    call :cleanup
    echo ✅ Container stopped
    goto end

:logs
    docker logs -f %CONTAINER_NAME%
    goto end

:shell
    docker exec -it %CONTAINER_NAME% /bin/bash
    goto end

:cleanup
    echo 🧹 Cleaning up...
    docker stop %CONTAINER_NAME% >nul 2>&1
    docker rm %CONTAINER_NAME% >nul 2>&1
    exit /b 0

:run_container
    echo 🚀 Starting container...
    docker run -d --name %CONTAINER_NAME% -p %PORT%:8000 --env-file .env %DOCKER_IMAGE%
    exit /b 0

:wait_for_health
    echo 🏥 Waiting for health check...
    for /l %%i in (1,1,30) do (
        curl -f http://localhost:%PORT%/api/health >nul 2>&1
        if !errorlevel! equ 0 (
            echo ✅ Container is healthy!
            exit /b 0
        )
        echo Waiting... (%%i/30)
        timeout /t 2 >nul
    )
    echo ❌ Container failed to become healthy
    docker logs %CONTAINER_NAME%
    exit /b 1

:show_status
    echo.
    echo 📊 Deployment Status:
    echo =====================
    docker ps --filter name=%CONTAINER_NAME%
    echo.
    echo 🌐 Endpoints:
    echo   API Health: http://localhost:%PORT%/api/health
    echo   API Docs:   http://localhost:%PORT%/docs
    echo   ReDoc:      http://localhost:%PORT%/redoc
    echo.
    echo 📝 Logs: docker logs %CONTAINER_NAME%
    echo 🛑 Stop:  %~nx0 stop
    echo.
    exit /b 0

:usage
    echo Usage: %~nx0 {build^|deploy^|restart^|stop^|logs^|shell}
    echo.
    echo Commands:
    echo   build   - Build Docker image only
    echo   deploy  - Full deployment (build + run + health check)
    echo   restart - Restart existing container
    echo   stop    - Stop and remove container
    echo   logs    - Show container logs
    echo   shell   - Open shell in container
    goto end

:end
endlocal
