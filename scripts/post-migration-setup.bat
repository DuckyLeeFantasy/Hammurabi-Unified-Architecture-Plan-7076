@echo off
echo ============================================
echo 🔧 Post-Migration Setup for Hammurabi Unified
echo ============================================
echo.

:: Verify we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

:: Run migration verification
echo 🔍 Running migration verification...
node scripts/verify-migration.js
if errorlevel 1 (
    echo.
    echo ❌ Migration verification found issues
    echo    Please review the output above and fix any errors
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Migration verification passed!
echo.

:: Ensure all directories exist
echo 📁 Creating additional directories...
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp
if not exist "resources\icons" mkdir resources\icons
if not exist "resources\themes" mkdir resources\themes
if not exist "docs\api" mkdir docs\api
echo ✅ Directories created

:: Generate default configuration files
echo ⚙️ Generating configuration files...

:: Create default app config
(
echo {
echo   "app": {
echo     "name": "Hammurabi Unified",
echo     "version": "2.0.0",
echo     "environment": "development"
echo   },
echo   "mcp": {
echo     "host": "localhost",
echo     "port": 8001,
echo     "timeout": 30000
echo   },
echo   "browser": {
echo     "defaultSearchEngine": "google",
echo     "blockAds": true,
echo     "enableJavaScript": true
echo   },
echo   "agents": {
echo     "maxConcurrent": 5,
echo     "defaultTimeout": 30000
echo   },
echo   "security": {
echo     "allowedDirectories": [
echo       "./temp",
echo       "./resources",
echo       "%USERPROFILE%\\Documents\\Hammurabi"
echo     ],
echo     "blockedCommands": [
echo       "rm -rf",
echo       "del /f",
echo       "format"
echo     ]
echo   }
echo }
) > config\app.json

echo ✅ Configuration files generated

:: Create development environment file
echo 🔧 Setting up development environment...
(
echo # Hammurabi Unified Development Environment
echo NODE_ENV=development
echo DEBUG=true
echo LOG_LEVEL=debug
echo.
echo # MCP Server Configuration
echo MCP_HOST=localhost
echo MCP_PORT=8001
echo.
echo # Browser Configuration
echo BROWSER_DEVTOOLS=true
echo.
echo # Security Configuration
echo SECURITY_MODE=development
) > .env.development

:: Create production environment file
(
echo # Hammurabi Unified Production Environment
echo NODE_ENV=production
echo DEBUG=false
echo LOG_LEVEL=info
echo.
echo # MCP Server Configuration
echo MCP_HOST=localhost
echo MCP_PORT=8001
echo.
echo # Browser Configuration
echo BROWSER_DEVTOOLS=false
echo.
echo # Security Configuration
echo SECURITY_MODE=production
) > .env.production

echo ✅ Environment files created

:: Install any missing dependencies
echo 📦 Checking for missing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Build the application
echo 🔨 Building application...
npm run build
if errorlevel 1 (
    echo ❌ Build failed - please check for TypeScript errors
    echo.
    echo Common issues:
    echo 1. Missing imports in converted TypeScript files
    echo 2. Type errors in migrated code
    echo 3. Missing dependencies
    echo.
    echo Fix these issues and run: npm run build
    pause
    exit /b 1
)

echo ✅ Application built successfully

:: Create desktop shortcuts (Windows)
echo 🖥️ Creating desktop shortcuts...
powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Hammurabi Unified.lnk');
$Shortcut.TargetPath = '%CD%\node_modules\.bin\electron.cmd';
$Shortcut.Arguments = '.';
$Shortcut.WorkingDirectory = '%CD%';
$Shortcut.IconLocation = '%CD%\resources\icons\icon.ico';
$Shortcut.Description = 'Hammurabi Unified - AI-Enhanced Browser and Agent System';
$Shortcut.Save()
"

:: Create start menu shortcut
powershell -Command "
$WshShell = New-Object -comObject WScript.Shell;
$Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Hammurabi Unified.lnk');
$Shortcut.TargetPath = '%CD%\node_modules\.bin\electron.cmd';
$Shortcut.Arguments = '.';
$Shortcut.WorkingDirectory = '%CD%';
$Shortcut.IconLocation = '%CD%\resources\icons\icon.ico';
$Shortcut.Description = 'Hammurabi Unified - AI-Enhanced Browser and Agent System';
$Shortcut.Save()
"

echo ✅ Desktop shortcuts created

:: Create batch files for easy development
echo 📝 Creating development batch files...

:: Development start script
(
echo @echo off
echo echo Starting Hammurabi Unified Development Mode...
echo npm run dev
echo pause
) > start-dev.bat

:: Production build script
(
echo @echo off
echo echo Building Hammurabi Unified for Production...
echo npm run build:prod
echo echo.
echo echo Build completed! Check the dist directory.
echo pause
) > build-production.bat

:: Package script
(
echo @echo off
echo echo Packaging Hammurabi Unified...
echo npm run package:all
echo echo.
echo echo Packaging completed! Check the release directory.
echo pause
) > package-app.bat

echo ✅ Development batch files created

echo.
echo ============================================
echo 🎉 POST-MIGRATION SETUP COMPLETED!
echo ============================================
echo.
echo 📁 Files Created:
echo    • config\app.json - Application configuration
echo    • .env.development - Development environment
echo    • .env.production - Production environment
echo    • Desktop shortcut - Quick access to app
echo    • start-dev.bat - Start development mode
echo    • build-production.bat - Build for production
echo    • package-app.bat - Create installers
echo.
echo 🚀 Ready to start development!
echo.
echo 💡 Development Commands:
echo    npm run dev          - Start development mode
echo    npm run build        - Build application
echo    npm run package:all  - Create installers
echo.
echo    Or use the batch files:
echo    start-dev.bat        - Start development
echo    build-production.bat - Build for production
echo    package-app.bat      - Package application
echo.
echo 📚 Documentation:
echo    docs\user\USER_GUIDE.md - User guide
echo    docs\user\TROUBLESHOOTING.md - Troubleshooting
echo.
echo 🎯 Next Steps:
echo    1. Review converted TypeScript files in src\
echo    2. Implement TODO items in the generated files
echo    3. Test the application: npm run dev
echo    4. Customize UI and functionality as needed
echo.
echo Happy coding! 🏛️✨
echo.
pause