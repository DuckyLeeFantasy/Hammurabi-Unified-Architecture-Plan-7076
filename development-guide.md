# 🏛️ Hammurabi Unified - Development Guide

## Quick Start

```bash
# 1. Run the setup script
setup.bat

# 2. Run the integration helper
run-integration.bat

# 3. Start development
npm run dev
```

## Project Structure

```
hammurabi-unified/
├── src/
│   ├── main/                   # Electron main process
│   │   ├── app.ts             # Main application entry
│   │   ├── preload.ts         # Preload script for renderer
│   │   ├── mcp/               # MCP Bridge integration
│   │   ├── browser/           # Browser engine
│   │   └── services/          # Background services
│   ├── renderer/              # React frontend
│   │   ├── App.tsx           # Main React application
│   │   └── components/       # UI components
│   ├── agents/               # AI agent implementations
│   └── shared/               # Shared types and utilities
├── resources/                # App icons and assets
└── docs/                    # Documentation
```

## Key Components Integration

### 1. MCP Server Bridge (`src/main/mcp/`)
- Integrates your existing Python MCP server
- Provides TypeScript bridge for Electron
- Handles agent coordination

### 2. AI Agents (`src/agents/`)
- Your existing agent implementations
- Unified agent management
- Multi-agent coordination

### 3. Browser Engine (`src/main/browser/`)
- Enhanced Electron browser
- AI-powered browsing assistance
- Desktop Commander integration

### 4. File System Bridge (`src/main/services/`)
- Local file operations
- Desktop Commander tools
- Secure file access

## Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build:watch      # Build and watch for changes

# Building
npm run build           # Build all components
npm run build:prod      # Production build

# Packaging
npm run package:win     # Windows installer
npm run package:mac     # macOS app
npm run package:linux   # Linux AppImage/deb
npm run package:all     # All platforms

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode
npm run lint           # Code quality check
```

## Integration Checklist

- [ ] ✅ Project structure created
- [ ] ✅ Dependencies installed
- [ ] 🔄 MCP server integrated
- [ ] 🔄 AI agents integrated
- [ ] 🔄 Browser engine integrated
- [ ] 🔄 Desktop Commander integrated
- [ ] 🔄 First successful build
- [ ] 🔄 All components tested

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Electron Main Process         │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ MCP Bridge  │  │ Browser Engine  │   │
│  └─────────────┘  └─────────────────┘   │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ AI Agents   │  │ File System     │   │
│  └─────────────┘  └─────────────────┘   │
├─────────────────────────────────────────┤
│           React Renderer Process        │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ Browser UI  │  │ Agent Dashboard │   │
│  └─────────────┘  └─────────────────┘   │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ File Manager│  │ Settings Panel  │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

## Next Steps

1. **Complete Integration**: Run the integration helper to merge your existing code
2. **Test Components**: Verify each component works correctly
3. **Customize UI**: Adapt the interface to your preferences
4. **Add Features**: Extend functionality as needed
5. **Build & Deploy**: Create distributable packages

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all TypeScript paths are correctly configured
2. **Build Failures**: Check webpack configuration and dependencies
3. **Runtime Errors**: Verify IPC communication between main and renderer

### Getting Help

- Check the console for detailed error messages
- Review the integration logs from `run-integration.bat`
- Ensure all source paths in the integration helper are correct

## Contributing

This unified application integrates multiple components while maintaining:
- **Local-first architecture**
- **Privacy and security**
- **Extensible design**
- **Professional UI/UX**

Happy coding! 🚀