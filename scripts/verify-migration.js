const fs = require('fs');
const path = require('path');

class MigrationVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(type, message) {
    console.log(`${this.getIcon(type)} ${message}`);
    
    switch (type) {
      case 'error':
        this.errors.push(message);
        break;
      case 'warning':
        this.warnings.push(message);
        break;
      case 'success':
        this.success.push(message);
        break;
    }
  }

  getIcon(type) {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  }

  verify() {
    console.log('🔍 Verifying Hammurabi Unified Migration...\n');

    this.checkProjectStructure();
    this.checkPackageJson();
    this.checkTypeScriptConfig();
    this.checkMCPIntegration();
    this.checkAgentIntegration();
    this.checkBrowserIntegration();
    this.checkDesktopCommanderIntegration();
    this.checkBuildSystem();

    this.printSummary();
  }

  checkProjectStructure() {
    console.log('📁 Checking project structure...');

    const requiredDirs = [
      'src/main',
      'src/main/mcp',
      'src/main/browser',
      'src/main/services',
      'src/agents',
      'src/renderer',
      'src/shared',
      'resources'
    ];

    requiredDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.log('success', `Directory exists: ${dir}`);
      } else {
        this.log('error', `Missing directory: ${dir}`);
      }
    });
  }

  checkPackageJson() {
    console.log('\n📦 Checking package.json...');

    if (!fs.existsSync('package.json')) {
      this.log('error', 'package.json not found');
      return;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Check required dependencies
      const requiredDeps = [
        'electron',
        'react',
        'react-dom',
        '@mui/material',
        'typescript'
      ];

      requiredDeps.forEach(dep => {
        if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
          this.log('success', `Dependency found: ${dep}`);
        } else {
          this.log('error', `Missing dependency: ${dep}`);
        }
      });

      // Check scripts
      const requiredScripts = ['dev', 'build', 'package'];
      requiredScripts.forEach(script => {
        if (pkg.scripts?.[script]) {
          this.log('success', `Script found: ${script}`);
        } else {
          this.log('warning', `Missing script: ${script}`);
        }
      });

    } catch (error) {
      this.log('error', `Failed to parse package.json: ${error.message}`);
    }
  }

  checkTypeScriptConfig() {
    console.log('\n⚙️ Checking TypeScript configuration...');

    if (fs.existsSync('tsconfig.json')) {
      this.log('success', 'tsconfig.json found');
      
      try {
        const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        if (tsConfig.compilerOptions?.baseUrl) {
          this.log('success', 'Base URL configured');
        } else {
          this.log('warning', 'Base URL not configured');
        }

        if (tsConfig.compilerOptions?.paths) {
          this.log('success', 'Path mapping configured');
        } else {
          this.log('warning', 'Path mapping not configured');
        }

      } catch (error) {
        this.log('error', `Failed to parse tsconfig.json: ${error.message}`);
      }
    } else {
      this.log('error', 'tsconfig.json not found');
    }
  }

  checkMCPIntegration() {
    console.log('\n📡 Checking MCP integration...');

    const mcpFiles = [
      'src/main/mcp/mcp-server.ts',
      'src/main/mcp/mcp-bridge.ts'
    ];

    mcpFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('success', `MCP file found: ${file}`);
        
        // Check if file has basic structure
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('export class')) {
          this.log('success', `${file} has TypeScript class structure`);
        } else {
          this.log('warning', `${file} may need TypeScript implementation`);
        }
      } else {
        this.log('error', `Missing MCP file: ${file}`);
      }
    });

    // Check for Python backup files
    if (fs.existsSync('src/main/mcp') && fs.readdirSync('src/main/mcp').some(f => f.endsWith('.py.bak'))) {
      this.log('success', 'Python MCP files backed up');
    } else {
      this.log('warning', 'No Python backup files found - manual migration may be needed');
    }
  }

  checkAgentIntegration() {
    console.log('\n🤖 Checking AI Agents integration...');

    const agentFiles = [
      'src/agents/base/base-agent.ts',
      'src/agents/base/agent-manager.ts'
    ];

    agentFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('success', `Agent file found: ${file}`);
      } else {
        this.log('error', `Missing agent file: ${file}`);
      }
    });

    // Check for converted agents
    if (fs.existsSync('src/agents/converted')) {
      const convertedFiles = fs.readdirSync('src/agents/converted').filter(f => f.endsWith('.ts'));
      if (convertedFiles.length > 0) {
        this.log('success', `Found ${convertedFiles.length} converted agent files`);
      } else {
        this.log('warning', 'No converted agent files found');
      }
    } else {
      this.log('warning', 'No converted agents directory found');
    }
  }

  checkBrowserIntegration() {
    console.log('\n🌐 Checking Browser Engine integration...');

    const browserFiles = [
      'src/main/browser/browser-engine.ts'
    ];

    browserFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('success', `Browser file found: ${file}`);
      } else {
        this.log('error', `Missing browser file: ${file}`);
      }
    });

    // Check for browser assets
    if (fs.existsSync('resources') && fs.readdirSync('resources').length > 0) {
      this.log('success', 'Browser assets found in resources directory');
    } else {
      this.log('warning', 'No browser assets found - may need manual copying');
    }
  }

  checkDesktopCommanderIntegration() {
    console.log('\n🖥️ Checking Desktop Commander integration...');

    const commanderFiles = [
      'src/main/services/desktop-commander-bridge.ts',
      'src/main/services/service-manager.ts'
    ];

    commanderFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('success', `Desktop Commander file found: ${file}`);
      } else {
        this.log('error', `Missing Desktop Commander file: ${file}`);
      }
    });
  }

  checkBuildSystem() {
    console.log('\n🔨 Checking build system...');

    const buildFiles = [
      'webpack.main.config.js',
      'webpack.renderer.config.js'
    ];

    buildFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('success', `Build config found: ${file}`);
      } else {
        this.log('error', `Missing build config: ${file}`);
      }
    });

    // Check if dist directory exists (built files)
    if (fs.existsSync('dist')) {
      this.log('success', 'Build output directory exists');
    } else {
      this.log('info', 'No build output yet - run npm run build');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`✅ Successful checks: ${this.success.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length === 0 && this.warnings.length <= 3) {
      console.log('\n🎉 Migration verification PASSED!');
      console.log('Your Hammurabi Unified application is ready for development.');
      console.log('\nNext steps:');
      console.log('1. npm run build');
      console.log('2. npm run dev');
    } else if (this.errors.length === 0) {
      console.log('\n⚠️  Migration verification PASSED with warnings.');
      console.log('Your application should work, but consider addressing the warnings.');
    } else {
      console.log('\n❌ Migration verification FAILED.');
      console.log('Please address the errors before proceeding.');
      
      console.log('\nErrors to fix:');
      this.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\nWarnings to consider:');
      this.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    console.log('\n📚 For detailed migration instructions, see:');
    console.log('  • docs/user/USER_GUIDE.md');
    console.log('  • docs/user/TROUBLESHOOTING.md');
  }
}

// Run verification
const verifier = new MigrationVerifier();
verifier.verify();