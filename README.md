# 🏛️ Hammurabi Unified

**The Ultimate AI-Powered Desktop Productivity Environment**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/hammurabi-unified/app)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/hammurabi-unified/app/releases)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

> Transform your desktop into an intelligent workspace with AI-enhanced browsing, multi-agent coordination, and seamless file management—all running locally for maximum privacy and control.

## ✨ Features

### 🌐 **AI-Enhanced Browser**
- **Smart Navigation**: AI-powered URL completion and suggestions
- **Content Analysis**: Automatic page content analysis and insights
- **Form Intelligence**: AI-assisted form filling and data extraction
- **Ad Blocking**: Built-in ad and tracker blocking for faster browsing
- **Privacy First**: All processing happens locally on your machine

### 🤖 **Multi-Agent AI System**
- **Agent Coordination**: Multiple AI agents working together seamlessly
- **Specialized Agents**: File management, web scraping, code assistance, and more
- **Custom Agents**: Create and deploy your own AI agents
- **Real-time Communication**: Agents share context and coordinate tasks
- **Local Processing**: No data sent to external services

### 📁 **Intelligent File Management**
- **AI File Organization**: Smart file categorization and organization
- **Content Search**: Search file contents with natural language
- **Automated Processing**: Agents can process files automatically
- **Safe Operations**: Sandboxed file operations with permission controls
- **Version Tracking**: Track file changes and versions

### 🔧 **Desktop Commander**
- **Safe Command Execution**: Execute system commands with security controls
- **Directory Management**: Create, organize, and manage directories
- **File Operations**: Read, write, and manipulate files safely
- **Search Capabilities**: Find files across your system quickly
- **Permission Controls**: Configurable security and access controls

## 🚀 Quick Start

### **30-Minute Setup**

1. **Prerequisites**
   ```bash
   # Ensure you have Node.js 18+ installed
   node --version  # Should be 18.0.0 or higher
   ```

2. **Automated Setup**
   ```bash
   # Download and run the quick setup script
   curl -O https://raw.githubusercontent.com/hammurabi-unified/app/main/scripts/quick-setup.bat
   # Or download manually and run:
   quick-setup.bat
   ```

3. **Manual Setup** (if automated setup doesn't work)
   ```bash
   # Clone the repository
   git clone https://github.com/hammurabi-unified/app.git hammurabi-unified
   cd hammurabi-unified
   
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   
   # Start development mode
   npm run dev
   ```

### **Component Integration**

If you have existing Hammurabi components, use the migration helper:

```bash
# Run the automated migration
scripts\auto-migration.bat

# Or copy components manually:
# MCP Server: Copy to src\main\mcp\
# AI Agents: Copy to src\agents\
# Browser Engine: Copy to src\main\browser\
# Desktop Commander: Copy to src\main\services\
```

## 📚 Documentation

### **User Guides**
- [**Quick Start Guide**](docs/user/QUICK_START.md) - Get up and running in 30 minutes
- [**User Manual**](docs/user/USER_GUIDE.md) - Complete feature documentation
- [**Troubleshooting**](docs/user/TROUBLESHOOTING.md) - Common issues and solutions

### **Developer Documentation**
- [**API Reference**](docs/api/README.md) - Complete API documentation
- [**Architecture Guide**](docs/dev/ARCHITECTURE.md) - System architecture overview
- [**Plugin Development**](docs/dev/PLUGINS.md) - Creating custom plugins and agents
- [**Contributing Guide**](CONTRIBUTING.md) - How to contribute to the project

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                Main Process                  │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │ MCP Bridge  │  │   Browser Engine    │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │ AI Agents   │  │ Desktop Commander   │   │
│  └─────────────┘  └─────────────────────┘   │
├─────────────────────────────────────────────┤
│              Service Manager                 │
├─────────────────────────────────────────────┤
│               Renderer Process               │
├─────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │ Browser UI  │  │  Agent Dashboard    │   │
│  └─────────────┘  └─────────────────────┘   │
│  ┌─────────────┐  ┌─────────────────────┐   │
│  │File Manager │  │  Settings Panel     │   │
│  └─────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 🛠️ Development

### **Development Commands**

```bash
# Development
npm run dev              # Start development with hot reload
npm run watch:main       # Watch main process changes
npm run watch:renderer   # Watch renderer process changes

# Building
npm run build            # Build for production
npm run build:dev        # Build for development
npm run clean            # Clean build artifacts

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Packaging
npm run package          # Package for current platform
npm run package:win      # Package for Windows
npm run package:mac      # Package for macOS
npm run package:linux    # Package for Linux
npm run package:all      # Package for all platforms

# Utilities
npm run health-check     # Check system health
npm run component-test   # Test all components
npm run lint             # Lint and fix code
```

### **Project Structure**

```
hammurabi-unified/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── app.ts           # Main application entry
│   │   ├── preload.ts       # Preload script
│   │   ├── mcp/             # MCP Bridge integration
│   │   ├── browser/         # Browser engine
│   │   └── services/        # Background services
│   ├── renderer/            # React frontend
│   │   ├── App.tsx          # Main React app
│   │   ├── components/      # UI components
│   │   └── hooks/           # React hooks
│   ├── agents/              # AI agent implementations
│   │   ├── base/            # Base agent classes
│   │   └── converted/       # Converted agents
│   └── shared/              # Shared types and utilities
├── resources/               # Icons, themes, assets
├── config/                  # Configuration files
├── scripts/                 # Build and utility scripts
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔒 Security & Privacy

### **Local-First Architecture**
- **No Cloud Dependency**: All processing happens on your local machine
- **Data Privacy**: Your data never leaves your device
- **Offline Capable**: Full functionality without internet connection
- **Encrypted Storage**: Local data is encrypted at rest

### **Security Features**
- **Sandboxed Operations**: All file and system operations are sandboxed
- **Permission Controls**: Configurable access controls and restrictions
- **Safe Command Execution**: Whitelist-based command execution
- **Process Isolation**: Components run in isolated processes
- **Security Auditing**: Comprehensive logging and audit trails

### **Configurable Security**
```json
{
  "security": {
    "allowedDirectories": ["./documents", "./projects"],
    "blockedCommands": ["rm -rf", "del /f", "format"],
    "enableSandbox": true,
    "requirePermissions": true,
    "auditLogging": true
  }
}
```

## 🎯 Use Cases

### **For Developers**
- **Code Analysis**: AI agents that understand and analyze code
- **Project Management**: Intelligent file organization and project structure
- **Documentation**: Automatic documentation generation and maintenance
- **Testing**: AI-assisted testing and quality assurance

### **For Researchers**
- **Data Collection**: Web scraping with AI-powered content extraction
- **Literature Review**: Intelligent document analysis and summarization
- **Note Taking**: AI-enhanced note organization and cross-referencing
- **Citation Management**: Automatic citation extraction and formatting

### **For Content Creators**
- **Content Research**: AI-powered research and fact-checking
- **Asset Management**: Intelligent organization of media files
- **Workflow Automation**: Custom agents for repetitive tasks
- **Quality Control**: AI-assisted content review and editing

### **For Business Users**
- **Data Analysis**: AI-powered insights from business documents
- **Process Automation**: Custom workflows and business logic
- **Report Generation**: Automatic report creation and formatting
- **Communication**: AI-assisted email and document drafting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Ways to Contribute**
- **Bug Reports**: Help us find and fix issues
- **Feature Requests**: Suggest new features and improvements
- **Code Contributions**: Submit pull requests with improvements
- **Documentation**: Help improve our documentation
- **Testing**: Test new features and report feedback
- **Agent Development**: Create and share new AI agents

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📊 System Requirements

### **Minimum Requirements**
- **OS**: Windows 10, macOS 10.14, or Linux (Ubuntu 18.04+)
- **CPU**: Dual-core processor (2.0 GHz)
- **RAM**: 4 GB
- **Storage**: 2 GB free space
- **Node.js**: 18.0.0 or higher

### **Recommended Requirements**
- **OS**: Windows 11, macOS 12+, or Linux (Ubuntu 20.04+)
- **CPU**: Quad-core processor (3.0 GHz+)
- **RAM**: 8 GB or more
- **Storage**: 5 GB free space (SSD recommended)
- **Node.js**: Latest LTS version

## 🗺️ Roadmap

### **Version 2.1.0** (Q2 2024)
- [ ] Plugin marketplace and ecosystem
- [ ] Advanced agent coordination patterns
- [ ] Multi-language support
- [ ] Enhanced security features
- [ ] Performance optimizations

### **Version 2.2.0** (Q3 2024)
- [ ] Cloud synchronization (optional)
- [ ] Mobile companion app
- [ ] Advanced AI models integration
- [ ] Collaborative features
- [ ] Extended platform support

### **Version 3.0.0** (Q4 2024)
- [ ] Complete UI/UX redesign
- [ ] Voice control integration
- [ ] AR/VR compatibility
- [ ] Advanced analytics dashboard
- [ ] Enterprise features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for inspiring AI integration patterns
- **Electron** for the cross-platform framework
- **React** for the powerful UI framework
- **Material-UI** for beautiful components
- **The Open Source Community** for countless tools and libraries

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/hammurabi-unified/app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/hammurabi-unified/app/discussions)
- **Email**: support@hammurabi.dev

---

<div align="center">

**Built with ❤️ by the Hammurabi Team**

[Website](https://hammurabi.dev) • [Documentation](docs/) • [Community](https://github.com/hammurabi-unified/app/discussions) • [Support](mailto:support@hammurabi.dev)

</div>