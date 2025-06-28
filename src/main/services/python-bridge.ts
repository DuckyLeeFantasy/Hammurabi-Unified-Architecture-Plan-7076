import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';

export class PythonBridge {
  private pythonPath: string;
  private environmentPath: string;
  private isInitialized: boolean = false;

  constructor() {
    this.pythonPath = this.findPythonExecutable();
    this.environmentPath = path.join(process.cwd(), 'python_env');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.setupVirtualEnvironment();
      await this.setupModelMergingEnvironment();
      this.isInitialized = true;
      console.log('✅ Python Bridge initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Python Bridge:', error);
      throw error;
    }
  }

  private findPythonExecutable(): string {
    // Try common Python executable names
    const pythonNames = ['python3', 'python', 'python3.9', 'python3.10', 'python3.11'];
    
    for (const name of pythonNames) {
      try {
        // This is a simplified check - in real implementation, you'd use which/where
        return name;
      } catch {
        continue;
      }
    }
    
    throw new Error('Python executable not found. Please install Python 3.9+');
  }

  private async setupVirtualEnvironment(): Promise<void> {
    try {
      // Check if virtual environment already exists
      const venvExists = await this.checkPathExists(this.environmentPath);
      
      if (!venvExists) {
        console.log('Creating Python virtual environment...');
        await this.executeCommand(this.pythonPath, ['-m', 'venv', this.environmentPath]);
      }

      console.log('✅ Virtual environment ready');
    } catch (error) {
      throw new Error(`Failed to setup virtual environment: ${error}`);
    }
  }

  async setupModelMergingEnvironment(): Promise<void> {
    const packages = [
      'torch>=2.0.0',
      'transformers>=4.35.0',
      'accelerate>=0.24.0',
      'peft>=0.7.0',
      'huggingface-hub>=0.19.0',
      'safetensors>=0.4.0',
      'sentencepiece>=0.1.99',
      'protobuf>=3.20.0',
      'numpy>=1.24.0',
      'pyyaml>=6.0',
      'tqdm>=4.64.0'
    ];

    // Install mergekit from git (since it's not on PyPI)
    const gitPackages = [
      'git+https://github.com/cg123/mergekit.git'
    ];

    try {
      const pipPath = this.getPipPath();
      
      console.log('Installing Python packages for model merging...');
      
      // Install regular packages
      for (const pkg of packages) {
        console.log(`Installing ${pkg}...`);
        await this.executeCommand(pipPath, ['install', pkg, '--upgrade']);
      }

      // Install git packages
      for (const pkg of gitPackages) {
        console.log(`Installing ${pkg}...`);
        await this.executeCommand(pipPath, ['install', pkg, '--upgrade']);
      }

      console.log('✅ Model merging environment setup complete');
    } catch (error) {
      throw new Error(`Failed to setup model merging environment: ${error}`);
    }
  }

  private getPipPath(): string {
    const isWindows = os.platform() === 'win32';
    const scriptsDir = isWindows ? 'Scripts' : 'bin';
    const pipName = isWindows ? 'pip.exe' : 'pip';
    
    return path.join(this.environmentPath, scriptsDir, pipName);
  }

  private getPythonPath(): string {
    const isWindows = os.platform() === 'win32';
    const scriptsDir = isWindows ? 'Scripts' : 'bin';
    const pythonName = isWindows ? 'python.exe' : 'python';
    
    return path.join(this.environmentPath, scriptsDir, pythonName);
  }

  async executePythonScript(script: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Write script to temporary file
      const tempDir = path.join(os.tmpdir(), 'hammurabi_python');
      await fs.mkdir(tempDir, { recursive: true });
      
      const scriptPath = path.join(tempDir, `script_${Date.now()}.py`);
      await fs.writeFile(scriptPath, script);

      // Execute script
      const pythonPath = this.getPythonPath();
      const result = await this.executeCommand(pythonPath, [scriptPath], {
        env: {
          ...process.env,
          PYTHONPATH: this.environmentPath
        }
      });

      // Clean up
      await fs.unlink(scriptPath);

      // Parse JSON result if possible
      try {
        return JSON.parse(result.stdout);
      } catch {
        return {
          success: true,
          stdout: result.stdout,
          stderr: result.stderr
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async installPythonPackage(packageName: string): Promise<void> {
    const pipPath = this.getPipPath();
    await this.executeCommand(pipPath, ['install', packageName, '--upgrade']);
  }

  private async executeCommand(
    command: string, 
    args: string[], 
    options: any = {}
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        ...options,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, exitCode: code || 0 });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async checkPathExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    // Cleanup any running processes or resources
    console.log('🔌 Python Bridge shut down');
  }
}