import { MCPTool } from '../base/mcp-tool';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PythonBridge } from '../../services/python-bridge';

export class ModelDownloadTool extends MCPTool {
  private pythonBridge: PythonBridge;

  constructor() {
    super(
      'download_model',
      'Download AI models from Hugging Face',
      {
        type: 'object',
        properties: {
          model_id: { type: 'string', description: 'Hugging Face model ID' },
          model_type: { type: 'string', enum: ['base', 'adapter', 'merged'] },
          destination: { type: 'string', description: 'Local destination path' },
          auth_token: { type: 'string', description: 'Hugging Face auth token (optional)' }
        },
        required: ['model_id', 'destination']
      }
    );
    this.pythonBridge = new PythonBridge();
  }

  async execute(parameters: any): Promise<any> {
    const { model_id, model_type = 'base', destination, auth_token } = parameters;
    
    try {
      // Ensure destination directory exists
      await fs.mkdir(destination, { recursive: true });

      // Use huggingface-hub to download model
      const downloadScript = `
import os
import sys
from huggingface_hub import snapshot_download
import json

def download_model(model_id, destination, auth_token=None):
    try:
        # Download model files
        local_dir = snapshot_download(
            repo_id=model_id,
            local_dir=destination,
            token=auth_token,
            resume_download=True
        )
        
        # Get model info
        model_size = sum(
            os.path.getsize(os.path.join(dirpath, filename))
            for dirpath, dirnames, filenames in os.walk(local_dir)
            for filename in filenames
        )
        
        return {
            'success': True,
            'model_path': local_dir,
            'model_id': model_id,
            'size_bytes': model_size,
            'size_mb': round(model_size / (1024 * 1024), 2)
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    result = download_model('${model_id}', '${destination}', ${auth_token ? `'${auth_token}'` : 'None'})
    print(json.dumps(result))
`;

      const result = await this.pythonBridge.executePythonScript(downloadScript);
      
      if (result.success) {
        // Update local model registry
        await this.updateModelRegistry({
          id: model_id,
          name: model_id.split('/').pop(),
          path: result.model_path,
          type: model_type,
          size: result.size_mb,
          downloaded_at: new Date().toISOString(),
          capabilities: await this.detectCapabilities(model_id)
        });
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async detectCapabilities(modelId: string): Promise<string[]> {
    const capabilities = [];
    
    // Basic capability detection based on model name/type
    if (modelId.toLowerCase().includes('dolphin')) {
      capabilities.push('conversation', 'uncensored', 'reasoning');
    }
    if (modelId.toLowerCase().includes('cogito') || modelId.toLowerCase().includes('reasoning')) {
      capabilities.push('reasoning', 'analysis', 'logic');
    }
    if (modelId.toLowerCase().includes('code') || modelId.toLowerCase().includes('starcoder')) {
      capabilities.push('coding', 'programming', 'technical');
    }
    if (modelId.toLowerCase().includes('instruct') || modelId.toLowerCase().includes('chat')) {
      capabilities.push('instruction', 'conversation', 'helpfulness');
    }

    return capabilities.length > 0 ? capabilities : ['general', 'text_generation'];
  }

  private async updateModelRegistry(modelInfo: any): Promise<void> {
    const registryPath = path.join(process.cwd(), 'models', 'registry.json');
    
    try {
      let registry = [];
      try {
        const registryData = await fs.readFile(registryPath, 'utf8');
        registry = JSON.parse(registryData);
      } catch {
        // Registry doesn't exist yet
      }

      // Remove existing entry if it exists
      registry = registry.filter((model: any) => model.id !== modelInfo.id);
      
      // Add new entry
      registry.push(modelInfo);

      // Ensure directory exists
      await fs.mkdir(path.dirname(registryPath), { recursive: true });
      
      // Save registry
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
    } catch (error) {
      console.error('Failed to update model registry:', error);
    }
  }
}

export class ModelMergeTool extends MCPTool {
  private pythonBridge: PythonBridge;

  constructor() {
    super(
      'merge_models',
      'Merge multiple AI models using various algorithms',
      {
        type: 'object',
        properties: {
          models: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                weight: { type: 'number' },
                name: { type: 'string' }
              }
            }
          },
          merge_method: { 
            type: 'string', 
            enum: ['slerp', 'ties', 'dare', 'linear'] 
          },
          output_path: { type: 'string' },
          config_overrides: { type: 'object' }
        },
        required: ['models', 'merge_method', 'output_path']
      }
    );
    this.pythonBridge = new PythonBridge();
  }

  async execute(parameters: any): Promise<any> {
    const { models, merge_method, output_path, config_overrides = {} } = parameters;
    
    try {
      // Generate mergekit configuration
      const mergeConfig = this.generateMergeConfig(models, merge_method, config_overrides);
      
      // Save config to temporary file
      const configPath = path.join(process.cwd(), 'temp', 'merge_config.yaml');
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      await fs.writeFile(configPath, mergeConfig);

      // Execute merge using mergekit
      const mergeScript = `
import sys
import os
import json
import yaml
from mergekit.config import MergeConfiguration
from mergekit.merge import run_merge
import torch

def merge_models(config_path, output_path):
    try:
        # Load configuration
        with open(config_path, 'r') as f:
            config_data = yaml.safe_load(f)
        
        config = MergeConfiguration.model_validate(config_data)
        
        # Ensure output directory exists
        os.makedirs(output_path, exist_ok=True)
        
        # Run merge
        run_merge(
            merge_config=config,
            out_path=output_path,
            options={
                'allow_crimes': True,
                'trust_remote_code': True
            }
        )
        
        # Calculate output size
        total_size = 0
        for root, dirs, files in os.walk(output_path):
            for file in files:
                total_size += os.path.getsize(os.path.join(root, file))
        
        return {
            'success': True,
            'output_path': output_path,
            'size_bytes': total_size,
            'size_mb': round(total_size / (1024 * 1024), 2),
            'merge_method': '${merge_method}',
            'source_models': [model['name'] for model in ${JSON.stringify(models)}]
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    result = merge_models('${configPath}', '${output_path}')
    print(json.dumps(result))
`;

      const result = await this.pythonBridge.executePythonScript(mergeScript);
      
      if (result.success) {
        // Update merged models registry
        await this.updateMergedModelRegistry({
          id: `merged_${Date.now()}`,
          name: config_overrides.name || `Merged_${merge_method}`,
          path: output_path,
          merge_method,
          source_models: models.map((m: any) => m.name),
          weights: models.map((m: any) => m.weight),
          created_at: new Date().toISOString(),
          size: result.size_mb
        });
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private generateMergeConfig(models: any[], method: string, overrides: any): string {
    let config: any = {
      merge_method: method,
      base_model: models[0].path,
      models: models.slice(1).map(model => ({
        model: model.path,
        parameters: {
          weight: model.weight
        }
      })),
      dtype: "bfloat16",
      ...overrides
    };

    // Method-specific configurations
    if (method === 'ties') {
      config.parameters = {
        normalize: true,
        int8_mask: false,
        ...config.parameters
      };
    } else if (method === 'dare') {
      config.parameters = {
        int8_mask: false,
        rescale: true,
        ...config.parameters
      };
    }

    // Convert to YAML
    return this.objectToYaml(config);
  }

  private objectToYaml(obj: any, indent = 0): string {
    let yaml = '';
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.objectToYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  private async updateMergedModelRegistry(modelInfo: any): Promise<void> {
    const registryPath = path.join(process.cwd(), 'models', 'merged_registry.json');
    
    try {
      let registry = [];
      try {
        const registryData = await fs.readFile(registryPath, 'utf8');
        registry = JSON.parse(registryData);
      } catch {
        // Registry doesn't exist yet
      }

      registry.push(modelInfo);

      await fs.mkdir(path.dirname(registryPath), { recursive: true });
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
    } catch (error) {
      console.error('Failed to update merged model registry:', error);
    }
  }
}

export class ModelValidationTool extends MCPTool {
  private pythonBridge: PythonBridge;

  constructor() {
    super(
      'validate_model',
      'Test and validate merged models',
      {
        type: 'object',
        properties: {
          model_path: { type: 'string' },
          test_prompts: { type: 'array', items: { type: 'string' } },
          validation_type: { 
            type: 'string', 
            enum: ['basic', 'reasoning', 'conversational', 'comprehensive'] 
          }
        },
        required: ['model_path', 'validation_type']
      }
    );
    this.pythonBridge = new PythonBridge();
  }

  async execute(parameters: any): Promise<any> {
    const { model_path, test_prompts, validation_type } = parameters;
    
    try {
      const testSuite = this.getTestSuite(validation_type, test_prompts);
      
      const validationScript = `
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import json
import time

def validate_model(model_path, test_prompts):
    try:
        # Load model and tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_path,
            torch_dtype=torch.bfloat16,
            device_map="auto",
            trust_remote_code=True
        )
        
        results = []
        
        for prompt in test_prompts:
            start_time = time.time()
            
            # Tokenize input
            inputs = tokenizer.encode(prompt, return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_new_tokens=256,
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            # Decode response
            response = tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)
            
            generation_time = time.time() - start_time
            
            # Basic quality metrics
            quality_score = min(100, max(0, len(response.split()) * 2))  # Simple word count based score
            
            results.append({
                'prompt': prompt,
                'response': response,
                'quality_score': quality_score,
                'generation_time': generation_time,
                'response_length': len(response)
            })
        
        return {
            'success': True,
            'results': results,
            'model_info': {
                'model_path': model_path,
                'parameters': model.num_parameters() if hasattr(model, 'num_parameters') else 'unknown'
            }
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    test_prompts = ${JSON.stringify(testSuite)}
    result = validate_model('${model_path}', test_prompts)
    print(json.dumps(result, default=str))
`;

      const result = await this.pythonBridge.executePythonScript(validationScript);
      
      if (result.success) {
        // Calculate overall scores
        const overallScore = this.calculateOverallScore(result.results, validation_type);
        result.overall_score = overallScore;
        result.validation_type = validation_type;
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private getTestSuite(validationType: string, customPrompts?: string[]): string[] {
    if (customPrompts && customPrompts.length > 0) {
      return customPrompts;
    }

    const testSuites = {
      basic: [
        "What is the capital of France?",
        "Explain photosynthesis in simple terms.",
        "Write a short poem about nature."
      ],
      reasoning: [
        "If all cats are mammals and all mammals are animals, are all cats animals? Explain your reasoning.",
        "A train travels 60 mph for 2 hours, then 80 mph for 1 hour. What's the average speed?",
        "You have 3 boxes: one with only apples, one with only oranges, one with both. All labels are wrong. You can pick one fruit from one box. How do you correctly label all boxes?"
      ],
      conversational: [
        "Tell me about your day and how you're feeling.",
        "What's your opinion on the future of artificial intelligence?",
        "Can you help me plan a birthday party for my friend who loves science fiction?"
      ],
      comprehensive: [
        "Explain quantum computing and its potential applications.",
        "Write a Python function to implement binary search.",
        "What are the ethical implications of AI development?",
        "Solve this riddle: I speak without a mouth and hear without ears. What am I?",
        "How would you approach debugging a complex software system?"
      ]
    };

    return testSuites[validationType as keyof typeof testSuites] || testSuites.basic;
  }

  private calculateOverallScore(results: any[], validationType: string): number {
    if (!results || results.length === 0) return 0;

    const scores = results.map(r => r.quality_score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Adjust score based on validation type complexity
    const complexityMultiplier = {
      basic: 1.0,
      reasoning: 0.9,
      conversational: 0.85,
      comprehensive: 0.8
    };

    return Math.round(avgScore * (complexityMultiplier[validationType as keyof typeof complexityMultiplier] || 1.0));
  }
}

export class ListLocalModelsTool extends MCPTool {
  constructor() {
    super(
      'list_local_models',
      'List all locally downloaded models',
      {
        type: 'object',
        properties: {
          include_merged: { type: 'boolean', default: false }
        }
      }
    );
  }

  async execute(parameters: any): Promise<any> {
    const { include_merged = false } = parameters;
    
    try {
      const registryPath = path.join(process.cwd(), 'models', 'registry.json');
      const mergedRegistryPath = path.join(process.cwd(), 'models', 'merged_registry.json');
      
      let models = [];
      
      // Load standard models
      try {
        const registryData = await fs.readFile(registryPath, 'utf8');
        models = JSON.parse(registryData);
      } catch {
        // Registry doesn't exist
      }

      // Load merged models if requested
      if (include_merged) {
        try {
          const mergedRegistryData = await fs.readFile(mergedRegistryPath, 'utf8');
          const mergedModels = JSON.parse(mergedRegistryData);
          models = [...models, ...mergedModels.map((m: any) => ({ ...m, type: 'merged' }))];
        } catch {
          // Merged registry doesn't exist
        }
      }

      return {
        success: true,
        models: models,
        count: models.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export class ListMergedModelsTool extends MCPTool {
  constructor() {
    super(
      'list_merged_models',
      'List all merged models',
      {
        type: 'object',
        properties: {}
      }
    );
  }

  async execute(parameters: any): Promise<any> {
    try {
      const registryPath = path.join(process.cwd(), 'models', 'merged_registry.json');
      
      let models = [];
      try {
        const registryData = await fs.readFile(registryPath, 'utf8');
        models = JSON.parse(registryData);
      } catch {
        // Registry doesn't exist
      }

      return {
        success: true,
        models: models,
        count: models.length
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}