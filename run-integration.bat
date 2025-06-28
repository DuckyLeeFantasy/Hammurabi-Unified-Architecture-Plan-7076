@echo off
echo ============================================
echo 🔧 Running Hammurabi Integration Helper
echo ============================================
echo.

:: Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please run setup.bat first.
    pause
    exit /b 1
)

:: Run the integration helper
echo 🚀 Starting integration process...
echo.

node integration-helper.js

if errorlevel 1 (
    echo.
    echo ❌ Integration failed. Please check the error messages above.
    echo.
    echo Manual integration steps:
    echo 1. Copy MCP server files from your workspace to src/main/mcp/
    echo 2. Copy AI agent files to src/agents/
    echo 3. Copy browser engine files to src/main/browser/
    echo 4. Run: npm run dev
) else (
    echo.
    echo ✅ Integration completed successfully!
    echo.
    echo 🚀 Ready to start development:
    echo    npm run dev
    echo.
    echo 📦 Or build for production:
    echo    npm run build
    echo    npm run package:all
)

echo.
pause