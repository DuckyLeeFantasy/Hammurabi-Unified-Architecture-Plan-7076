@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo 🏥 Hammurabi Unified - Health Check
echo ============================================
echo.

set "HEALTH_SCORE=0"
set "MAX_SCORE=12"
set "ISSUES="

:: Check 1: Node.js version
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found
    set "ISSUES=!ISSUES!Node.js missing; "
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js: !NODE_VERSION!
    set /a HEALTH_SCORE+=1
)

:: Check 2: npm version
echo 🔍 Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found
    set "ISSUES=!ISSUES!npm missing; "
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm: !NPM_VERSION!
    set /a HEALTH_SCORE+=1
)

:: Check 3: Project structure
echo 🔍 Checking project structure...
if exist "package.json" (
    echo ✅ package.json found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ package.json missing
    set "ISSUES=!ISSUES!package.json missing; "
)

if exist "src\main" (
    echo ✅ src\main directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ src\main directory missing
    set "ISSUES=!ISSUES!src\main missing; "
)

if exist "src\renderer" (
    echo ✅ src\renderer directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ src\renderer directory missing
    set "ISSUES=!ISSUES!src\renderer missing; "
)

:: Check 4: Dependencies
echo 🔍 Checking dependencies...
if exist "node_modules" (
    echo ✅ node_modules found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ node_modules missing - run npm install
    set "ISSUES=!ISSUES!Dependencies not installed; "
)

:: Check 5: TypeScript configuration
echo 🔍 Checking TypeScript config...
if exist "tsconfig.json" (
    echo ✅ tsconfig.json found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ tsconfig.json missing
    set "ISSUES=!ISSUES!TypeScript config missing; "
)

:: Check 6: Webpack configuration
echo 🔍 Checking build configuration...
if exist "webpack.main.config.js" (
    echo ✅ webpack.main.config.js found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ webpack.main.config.js missing
    set "ISSUES=!ISSUES!Main webpack config missing; "
)

if exist "webpack.renderer.config.js" (
    echo ✅ webpack.renderer.config.js found
    set /a HEALTH_SCORE+=1
) else (
    echo ❌ webpack.renderer.config.js missing
    set "ISSUES=!ISSUES!Renderer webpack config missing; "
)

:: Check 7: Source components
echo 🔍 Checking source components...
if exist "src\main\mcp" (
    echo ✅ MCP directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ⚠️  MCP directory missing - may need manual copy
)

if exist "src\agents" (
    echo ✅ Agents directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ⚠️  Agents directory missing - may need manual copy
)

if exist "src\main\browser" (
    echo ✅ Browser directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ⚠️  Browser directory missing - may need manual copy
)

:: Check 8: Build output
echo 🔍 Checking build output...
if exist "dist" (
    echo ✅ dist directory found
    set /a HEALTH_SCORE+=1
) else (
    echo ⚠️  dist directory missing - run npm run build
)

echo.
echo ============================================
echo 📊 HEALTH CHECK RESULTS
echo ============================================

:: Calculate health percentage
set /a HEALTH_PERCENT=(!HEALTH_SCORE! * 100) / !MAX_SCORE!

echo 🎯 Health Score: !HEALTH_SCORE!/!MAX_SCORE! (!HEALTH_PERCENT!%%)

if !HEALTH_PERCENT! geq 90 (
    echo 🟢 EXCELLENT - Your setup is in great shape!
    echo    Ready for development and production use.
) else if !HEALTH_PERCENT! geq 75 (
    echo 🟡 GOOD - Your setup is mostly ready
    echo    Minor issues that should be addressed.
) else if !HEALTH_PERCENT! geq 50 (
    echo 🟠 FAIR - Several issues need attention
    echo    Please review and fix the issues below.
) else (
    echo 🔴 POOR - Significant issues detected
    echo    Major setup problems need to be resolved.
)

echo.

:: Show issues if any
if defined ISSUES (
    echo 🚨 Issues Found:
    echo    !ISSUES!
    echo.
)

:: Provide recommendations
echo 💡 Recommendations:
if !HEALTH_SCORE! lss 8 (
    echo    1. Run: npm install
    echo    2. Check source file paths in migration script
    echo    3. Ensure all dependencies are installed
)
if !HEALTH_SCORE! geq 8 (
    echo    1. Run: npm run build
    echo    2. Test with: npm run dev
    echo    3. Review any TypeScript errors
)
if !HEALTH_SCORE! geq 10 (
    echo    1. Start development: npm run dev
    echo    2. Begin customization
    echo    3. Test all features
)

echo.
echo 🔧 Quick Fixes:
echo    npm install          - Install dependencies
echo    npm run build        - Build application
echo    npm run clean        - Clean build cache
echo    npm run dev          - Start development mode
echo.

:: Create health report file
echo 📄 Saving health report...
(
echo Hammurabi Unified Health Check Report
echo Generated: %date% %time%
echo.
echo Health Score: !HEALTH_SCORE!/!MAX_SCORE! (!HEALTH_PERCENT!%%^)
echo.
echo Issues: !ISSUES!
echo.
echo Recommendations:
echo - Run health check regularly
echo - Keep dependencies updated
echo - Monitor build outputs
echo - Test all components
) > health-report.txt

echo ✅ Health report saved to: health-report.txt

echo.
pause