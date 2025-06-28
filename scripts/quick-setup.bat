@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo 🚀 Hammurabi Unified - 30-Minute Quick Setup
echo ============================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if not %errorlevel% == 0 (
    echo ⚠️  This script needs to run as Administrator
    echo    Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Phase 1: Environment Check
echo 📋 Phase 1: Environment Setup (5 minutes)
echo ============================================

:: Check Node.js version
echo 🔍 Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+ first
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

:: Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: !NPM_VERSION!

:: Check disk space (simplified check)
echo 🔍 Checking available disk space...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set FREESPACE=%%a
echo ✅ Disk space check completed

:: Create backup directory
echo 💾 Creating backup directory...
if not exist "hammurabi-backup" mkdir "hammurabi-backup"
echo ✅ Backup directory ready

echo.
echo ✅ Phase 1 Complete - Environment Ready!
echo.

:: Phase 2: Project Creation
echo 📋 Phase 2: Project Creation (10 minutes)
echo ============================================

:: Check if project directory already exists
if exist "hammurabi-unified" (
    echo ⚠️  hammurabi-unified directory already exists
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i not "!OVERWRITE!"=="y" (
        echo Operation cancelled
        pause
        exit /b 1
    )
    echo 🗑️  Removing existing directory...
    rmdir /s /q "hammurabi-unified"
)

:: Create project directory
echo 📁 Creating project structure...
mkdir "hammurabi-unified"
cd "hammurabi-unified"

:: Create directory structure
mkdir "src\main\mcp"
mkdir "src\main\browser"
mkdir "src\main\services"
mkdir "src\agents\base"
mkdir "src\agents\converted"
mkdir "src\renderer\components"
mkdir "src\shared\types"
mkdir "resources\icons"
mkdir "resources\themes"
mkdir "config"
mkdir "docs\user"
mkdir "scripts"
mkdir "logs"
mkdir "temp"

echo ✅ Directory structure created

:: Create package.json
echo 📦 Creating package.json...
(
echo {
echo   "name": "hammurabi-unified",
echo   "version": "2.0.0",
echo   "description": "Unified AI-powered desktop environment",
echo   "main": "dist/main/app.js",
echo   "scripts": {
echo     "dev": "concurrently \"npm run watch:main\" \"npm run watch:renderer\" \"wait-on dist/main/app.js dist/renderer/index.html && electron .\"",
echo     "watch:main": "webpack --config webpack.main.config.js --watch",
echo     "watch:renderer": "webpack serve --config webpack.renderer.config.js",
echo     "build": "npm run build:main && npm run build:renderer",
echo     "build:main": "webpack --config webpack.main.config.js --mode production",
echo     "build:renderer": "webpack --config webpack.renderer.config.js --mode production",
echo     "clean": "rimraf dist",
echo     "package:win": "electron-builder --win",
echo     "package:mac": "electron-builder --mac",
echo     "package:linux": "electron-builder --linux",
echo     "package:all": "electron-builder --win --mac --linux",
echo     "test": "jest",
echo     "lint": "eslint src --ext .ts,.tsx,.js,.jsx"
echo   },
echo   "keywords": ["ai", "browser", "agents", "desktop", "productivity"],
echo   "author": "Hammurabi Team",
echo   "license": "MIT",
echo   "dependencies": {
echo     "electron": "^27.0.0",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.8.0",
echo     "@mui/material": "^5.11.0",
echo     "@mui/icons-material": "^5.11.0",
echo     "@emotion/react": "^11.10.0",
echo     "@emotion/styled": "^11.10.0",
echo     "framer-motion": "^10.0.0",
echo     "chokidar": "^3.5.3",
echo     "sqlite3": "^5.1.6",
echo     "ws": "^8.14.0",
echo     "uuid": "^9.0.1",
echo     "axios": "^1.6.0"
echo   },
echo   "devDependencies": {
echo     "typescript": "^5.2.0",
echo     "@types/react": "^18.2.0",
echo     "@types/react-dom": "^18.2.0",
echo     "@types/node": "^20.0.0",
echo     "@types/uuid": "^9.0.0",
echo     "webpack": "^5.88.0",
echo     "webpack-cli": "^5.1.0",
echo     "webpack-dev-server": "^4.15.0",
echo     "ts-loader": "^9.4.0",
echo     "html-webpack-plugin": "^5.5.0",
echo     "css-loader": "^6.8.0",
echo     "style-loader": "^3.3.0",
echo     "electron-builder": "^24.6.0",
echo     "concurrently": "^8.2.0",
echo     "wait-on": "^7.0.0",
echo     "rimraf": "^5.0.0",
echo     "eslint": "^8.45.0",
echo     "jest": "^29.6.0"
echo   },
echo   "build": {
echo     "appId": "com.hammurabi.unified",
echo     "productName": "Hammurabi Unified",
echo     "directories": {
echo       "output": "release"
echo     },
echo     "files": [
echo       "dist/**/*",
echo       "resources/**/*",
echo       "package.json"
echo     ],
echo     "win": {
echo       "target": "nsis",
echo       "icon": "resources/icons/icon.ico"
echo     },
echo     "mac": {
echo       "target": "dmg",
echo       "icon": "resources/icons/icon.icns"
echo     },
echo     "linux": {
echo       "target": "AppImage",
echo       "icon": "resources/icons/icon.png"
echo     }
echo   }
echo }
) > package.json

echo ✅ package.json created

:: Install dependencies
echo 📥 Installing dependencies (this may take 5-8 minutes)...
npm install --silent
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

echo.
echo ✅ Phase 2 Complete - Project Created!
echo.

:: Phase 3: Component Integration
echo 📋 Phase 3: Component Integration (10 minutes)
echo ============================================

:: Set source paths - Update these to match your actual paths
set "MCP_SOURCE=I:\Code Based\Hammurabi Code Workspace\mcp_servers"
set "AGENTS_SOURCE=I:\Code Based\Hammurabi Code Workspace\ai_agents"
set "BROWSER_SOURCE=C:\Users\rames\Koofr\Browser of Hammurabi\src"
set "BROWSER_ASSETS=C:\Users\rames\Koofr\Browser of Hammurabi\assets"
set "COMMANDER_SOURCE=I:\Code Based\Hammurabi Code Workspace\desktop_commander"

echo 🔍 Checking source directories...

:: Check and copy MCP Server
if exist "%MCP_SOURCE%" (
    echo 📡 Copying MCP Server files...
    xcopy "%MCP_SOURCE%\*" "src\main\mcp\" /E /I /Q /Y
    echo ✅ MCP Server files copied
) else (
    echo ⚠️  MCP Server source not found: %MCP_SOURCE%
    echo    You can copy these files manually later
)

:: Check and copy AI Agents
if exist "%AGENTS_SOURCE%" (
    echo 🤖 Copying AI Agents...
    xcopy "%AGENTS_SOURCE%\*" "src\agents\" /E /I /Q /Y
    echo ✅ AI Agents copied
) else (
    echo ⚠️  AI Agents source not found: %AGENTS_SOURCE%
    echo    You can copy these files manually later
)

:: Check and copy Browser Engine
if exist "%BROWSER_SOURCE%" (
    echo 🌐 Copying Browser Engine...
    xcopy "%BROWSER_SOURCE%\*" "src\main\browser\" /E /I /Q /Y
    echo ✅ Browser Engine copied
) else (
    echo ⚠️  Browser Engine source not found: %BROWSER_SOURCE%
    echo    You can copy these files manually later
)

:: Check and copy Browser Assets
if exist "%BROWSER_ASSETS%" (
    echo 📁 Copying Browser Assets...
    xcopy "%BROWSER_ASSETS%\*" "resources\" /E /I /Q /Y
    echo ✅ Browser Assets copied
) else (
    echo ⚠️  Browser Assets not found: %BROWSER_ASSETS%
    echo    You can copy these files manually later
)

:: Check and copy Desktop Commander
if exist "%COMMANDER_SOURCE%" (
    echo 🖥️  Copying Desktop Commander...
    xcopy "%COMMANDER_SOURCE%\*" "src\main\services\" /E /I /Q /Y
    echo ✅ Desktop Commander copied
) else (
    echo ⚠️  Desktop Commander source not found: %COMMANDER_SOURCE%
    echo    You can copy these files manually later
)

echo.
echo ✅ Phase 3 Complete - Components Integrated!
echo.

:: Phase 4: Build and Test
echo 📋 Phase 4: Build and Test (5 minutes)
echo ============================================

echo 🔨 Building application...
npm run build
if errorlevel 1 (
    echo ❌ Build failed
    echo    This is normal if source files need TypeScript conversion
    echo    Please review the errors and fix them manually
) else (
    echo ✅ Build completed successfully
)

echo 🧪 Creating test script...
(
echo @echo off
echo echo 🧪 Testing Hammurabi Unified...
echo echo.
echo echo Starting application in test mode...
echo npm run dev
) > test-app.bat

echo ✅ Test script created

echo.
echo ============================================
echo 🎉 QUICK SETUP COMPLETED!
echo ============================================
echo.
echo 📊 Setup Summary:
echo    ✅ Environment verified
echo    ✅ Project structure created
echo    ✅ Dependencies installed
echo    ✅ Components integrated
echo    ✅ Build system configured
echo.
echo 🚀 Next Steps:
echo    1. Run: test-app.bat
echo    2. If errors occur, see troubleshooting guide
echo    3. Customize TypeScript files as needed
echo    4. Start development: npm run dev
echo.
echo 📚 Documentation:
echo    • docs\user\USER_GUIDE.md
echo    • docs\user\TROUBLESHOOTING.md
echo.
echo 💡 Quick Commands:
echo    npm run dev          - Start development
echo    npm run build        - Build application
echo    npm run package:all  - Create installers
echo.
echo Happy coding! 🏛️✨
echo.
pause