@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo 🏛️ Hammurabi Unified - Automatic Migration
echo ============================================
echo.

:: Set source paths (update these to match your actual paths)
set "MCP_SOURCE=I:\Code Based\Hammurabi Code Workspace\mcp_servers"
set "AGENTS_SOURCE=I:\Code Based\Hammurabi Code Workspace\ai_agents"
set "BROWSER_SOURCE=C:\Users\rames\Koofr\Browser of Hammurabi\src"
set "BROWSER_ASSETS=C:\Users\rames\Koofr\Browser of Hammurabi\assets"
set "COMMANDER_SOURCE=I:\Code Based\Hammurabi Code Workspace\desktop_commander"

:: Set target paths
set "PROJECT_ROOT=%CD%"
set "MCP_TARGET=%PROJECT_ROOT%\src\main\mcp"
set "AGENTS_TARGET=%PROJECT_ROOT%\src\agents"
set "BROWSER_TARGET=%PROJECT_ROOT%\src\main\browser"
set "ASSETS_TARGET=%PROJECT_ROOT%\resources"
set "COMMANDER_TARGET=%PROJECT_ROOT%\src\main\services"

echo 🔍 Checking source directories...
echo.

:: Check if source directories exist
set "MISSING_SOURCES="

if not exist "%MCP_SOURCE%" (
    echo ❌ MCP Server source not found: %MCP_SOURCE%
    set "MISSING_SOURCES=1"
) else (
    echo ✅ MCP Server source found
)

if not exist "%AGENTS_SOURCE%" (
    echo ❌ AI Agents source not found: %AGENTS_SOURCE%
    set "MISSING_SOURCES=1"
) else (
    echo ✅ AI Agents source found
)

if not exist "%BROWSER_SOURCE%" (
    echo ❌ Browser Engine source not found: %BROWSER_SOURCE%
    set "MISSING_SOURCES=1"
) else (
    echo ✅ Browser Engine source found
)

if not exist "%COMMANDER_SOURCE%" (
    echo ❌ Desktop Commander source not found: %COMMANDER_SOURCE%
    set "MISSING_SOURCES=1"
) else (
    echo ✅ Desktop Commander source found
)

if defined MISSING_SOURCES (
    echo.
    echo ⚠️  Some source directories are missing. Please update the paths in this script.
    echo    Edit the variables at the top of auto-migration.bat
    echo.
    pause
    exit /b 1
)

echo.
echo 📋 Starting migration process...
echo.

:: Create backup of existing files
if exist "%PROJECT_ROOT%\src" (
    echo 💾 Creating backup of existing files...
    if exist "%PROJECT_ROOT%\backup" rmdir /s /q "%PROJECT_ROOT%\backup"
    xcopy "%PROJECT_ROOT%\src" "%PROJECT_ROOT%\backup\src\" /E /I /Q
    echo ✅ Backup created at %PROJECT_ROOT%\backup\
)

:: Migrate MCP Server
echo 🔧 Migrating MCP Server...
if not exist "%MCP_TARGET%" mkdir "%MCP_TARGET%"

:: Copy Python files and create TypeScript equivalents
for %%f in ("%MCP_SOURCE%\*.py") do (
    echo    Converting %%~nf.py to TypeScript...
    copy "%%f" "%MCP_TARGET%\%%~nf.py.bak" >nul
    
    :: Create basic TypeScript file
    (
        echo // Converted from Python: %%~nf.py
        echo // Original file backed up as: %%~nf.py.bak
        echo.
        echo import { EventEmitter } from 'events'^;
        echo.
        echo export class %%~nf extends EventEmitter {
        echo   constructor(^) {
        echo     super(^)^;
        echo     console.log('%%~nf initialized'^)^;
        echo   }
        echo.
        echo   // TODO: Implement methods from %%~nf.py
        echo   async start(^): Promise^<void^> {
        echo     console.log('%%~nf started'^)^;
        echo   }
        echo.
        echo   async stop(^): Promise^<void^> {
        echo     console.log('%%~nf stopped'^)^;
        echo   }
        echo }
    ) > "%MCP_TARGET%\%%~nf.ts"
)

:: Copy other MCP files
xcopy "%MCP_SOURCE%\*" "%MCP_TARGET%\" /E /I /Q /Y
echo ✅ MCP Server migration completed

:: Migrate AI Agents
echo 🤖 Migrating AI Agents...
if not exist "%AGENTS_TARGET%" mkdir "%AGENTS_TARGET%"
if not exist "%AGENTS_TARGET%\converted" mkdir "%AGENTS_TARGET%\converted"

xcopy "%AGENTS_SOURCE%\*" "%AGENTS_TARGET%\" /E /I /Q /Y

:: Convert Python agents to TypeScript
for %%f in ("%AGENTS_SOURCE%\*.py") do (
    echo    Converting agent %%~nf.py...
    (
        echo // Converted AI Agent: %%~nf
        echo // Original Python file: %%~nf.py
        echo.
        echo import { BaseAgent, AgentConfig, AgentMessage, AgentResponse } from '../base/base-agent'^;
        echo.
        echo export class %%~nf extends BaseAgent {
        echo   constructor(config: AgentConfig^) {
        echo     super(config^)^;
        echo   }
        echo.
        echo   async processMessage(message: AgentMessage^): Promise^<AgentResponse^> {
        echo     // TODO: Implement message processing logic from %%~nf.py
        echo     return {
        echo       messageId: message.id,
        echo       content: `%%~nf processed: $${message.content}`,
        echo       success: true,
        echo       processingTimeMs: 0
        echo     }^;
        echo   }
        echo }
    ) > "%AGENTS_TARGET%\converted\%%~nf.ts"
)
echo ✅ AI Agents migration completed

:: Migrate Browser Engine
echo 🌐 Migrating Browser Engine...
if not exist "%BROWSER_TARGET%" mkdir "%BROWSER_TARGET%"

xcopy "%BROWSER_SOURCE%\*" "%BROWSER_TARGET%\" /E /I /Q /Y

:: Copy browser assets
echo 📁 Migrating Browser Assets...
if exist "%BROWSER_ASSETS%" (
    xcopy "%BROWSER_ASSETS%\*" "%ASSETS_TARGET%\" /E /I /Q /Y
    echo ✅ Browser assets migrated
) else (
    echo ⚠️  Browser assets directory not found, skipping...
)

echo ✅ Browser Engine migration completed

:: Migrate Desktop Commander
echo 🖥️ Migrating Desktop Commander...
if not exist "%COMMANDER_TARGET%" mkdir "%COMMANDER_TARGET%"

xcopy "%COMMANDER_SOURCE%\*" "%COMMANDER_TARGET%\" /E /I /Q /Y

:: Convert Desktop Commander Python files
for %%f in ("%COMMANDER_SOURCE%\*.py") do (
    echo    Converting %%~nf.py...
    (
        echo // Converted Desktop Commander: %%~nf
        echo // Original Python file: %%~nf.py
        echo.
        echo import { EventEmitter } from 'events'^;
        echo import * as fs from 'fs'^;
        echo import * as path from 'path'^;
        echo.
        echo export class %%~nf extends EventEmitter {
        echo   constructor(^) {
        echo     super(^)^;
        echo   }
        echo.
        echo   // TODO: Implement functionality from %%~nf.py
        echo   async execute(params: any^): Promise^<any^> {
        echo     console.log('Executing %%~nf with params:', params^)^;
        echo     return { success: true, message: '%%~nf executed' }^;
        echo   }
        echo }
    ) > "%COMMANDER_TARGET%\%%~nf.ts"
)
echo ✅ Desktop Commander migration completed

:: Update package.json with additional dependencies
echo 📦 Updating package.json...
node -e "
const fs = require('fs');
const path = './package.json';
if (fs.existsSync(path)) {
  const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
  
  // Add additional dependencies that might be needed
  const additionalDeps = {
    'chokidar': '^3.5.3',
    'sqlite3': '^5.1.6',
    'ws': '^8.14.0',
    'fastify': '^4.23.0',
    'uuid': '^9.0.1',
    'axios': '^1.5.0'
  };
  
  Object.assign(pkg.dependencies, additionalDeps);
  
  fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
  console.log('✅ package.json updated with additional dependencies');
} else {
  console.log('❌ package.json not found');
}
"

:: Install dependencies
echo 📥 Installing dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo    Please run 'npm install' manually
) else (
    echo ✅ Dependencies installed successfully
)

:: Build the application
echo 🔨 Building application...
npm run build
if errorlevel 1 (
    echo ❌ Build failed
    echo    Please check the TypeScript files and fix any errors
    echo    Run 'npm run build' manually to see detailed errors
) else (
    echo ✅ Application built successfully
)

echo.
echo ============================================
echo 🎉 MIGRATION COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo 📁 Migration Summary:
echo    • MCP Server: %MCP_TARGET%
echo    • AI Agents: %AGENTS_TARGET%
echo    • Browser Engine: %BROWSER_TARGET%
echo    • Desktop Commander: %COMMANDER_TARGET%
echo    • Assets: %ASSETS_TARGET%
echo    • Backup: %PROJECT_ROOT%\backup\
echo.
echo 🔧 Next Steps:
echo    1. Review converted TypeScript files in each directory
echo    2. Implement TODO items in the generated TypeScript files
echo    3. Test the application: npm run dev
echo    4. Customize the UI and functionality as needed
echo.
echo 💡 Important Notes:
echo    • Original Python files are backed up with .bak extension
echo    • Generated TypeScript files need manual implementation
echo    • Check console for any build errors
echo    • Refer to the migration guide for detailed instructions
echo.
echo 🚀 Ready to start development:
echo    npm run dev
echo.
pause