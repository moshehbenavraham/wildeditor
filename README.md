# Luminari Wilderness Editor

A **production-ready** full-stack monorepo application for creating and managing wilderness regions, paths, and landmarks in the LuminariMUD game world. Built with React/TypeScript frontend, Python FastAPI backend, and integrated with LuminariMUD's MySQL spatial databases.

> ✅ **System Status**: **STABLE** - Major stability and performance improvements completed. System confidence level: **85%**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)
![React](https://img.shields.io/badge/React-18.3+-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0+-red.svg)

## 🌟 Features

### Core Functionality
- **Interactive Map Display**: Visual representation of the wilderness with zoom and pan capabilities
- **Advanced Drawing Tools**: Point, polygon, and linestring tools with real-time validation feedback
- **Precision Coordinate System**: Accurate mouse tracking and coordinate conversion at all zoom levels
- **Intelligent Selection**: Point-in-polygon and distance-to-line algorithms for precise feature selection
- **Layer Management**: Toggle visibility of regions, paths, and other map elements
- **Visual Drawing Feedback**: Color-coded validity indicators and real-time guidance

### Editing Capabilities
- **Visual Region Creation**: Draw geographic areas, encounter zones, and terrain modifiers with validation
- **Path Drawing**: Create roads, rivers, and other linear features with real-time feedback
- **Validated Coordinate Entry**: Bounds-checked coordinate input with automatic sanitization
- **Smart Drawing Validation**: Real-time feedback for minimum point requirements and validity
- **Enhanced Properties Panel**: Input validation, coordinate bounds checking, and user guidance
- **Error Prevention**: Comprehensive input validation and bounds checking (-1024 to +1024)

### Data Management & User Experience
- **Robust Error Handling**: User-visible error notifications with auto-dismiss functionality
- **Loading States**: Visual feedback during API operations and data persistence
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on failures
- **Performance Optimized**: Canvas memoization and selective re-rendering for smooth interaction
- **Keyboard Shortcuts**: Enhanced ESC handling for drawing cancellation and tool switching
- **Multi-environment Support**: Switch between development and production servers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+ (for frontend workspace support)
- Python 3.8+ (for FastAPI backend)
- Access to LuminariMUD MySQL database (or compatible MySQL setup)
- Modern web browser with JavaScript enabled
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/moshehbenavraham/wildeditor.git
   cd wildeditor
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install Python backend dependencies
   cd apps/backend/src
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   # Frontend configuration
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit apps/frontend/.env:
   #   VITE_API_URL=http://localhost:8000/api
   
   # Backend configuration  
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env:
   #   MYSQL_DATABASE_URL=mysql+pymysql://username:password@localhost/luminari_mudprod
   #   PORT=8000
   #   HOST=0.0.0.0
   ```

4. **Set up MySQL database**
   Ensure your MySQL database has the required spatial tables:
   ```sql
   -- Ensure spatial support is enabled
   -- Create/verify regions, paths, points tables
   -- (See Database Schema section for details)
   ```

5. **Start development servers**
   ```bash
   # Start frontend (Terminal 1)
   npm run dev:frontend  # Frontend on :5173
   
   # Start Python backend (Terminal 2)
   cd apps/backend/src
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api
   - API Documentation: http://localhost:8000/docs

6. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Monorepo Structure

```
wildeditor/
├── apps/
│   ├── frontend/          # React TypeScript frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── backend/           # Python FastAPI backend
│       └── src/
├── packages/
│   └── shared/            # Shared types and utilities
│       └── src/types/
├── docs/                  # Documentation
└── package.json          # Workspace root
```

## 📖 Documentation

### 🚀 Getting Started
- **[User Guide](docs/USER_GUIDE.md)** - How to use the wilderness editor interface and tools
- **[Setup Guide](SETUP.md)** - Quick start installation and configuration
- **[Documentation Index](docs/README_DOCS.md)** - Complete documentation organization and guide

### 👩‍💻 Development
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Technical architecture and development workflow
- **[API Documentation](docs/API.md)** - Backend API reference and endpoints
- **[Testing Guide](docs/TESTING.md)** - Testing strategy and procedures
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

### 🚀 Deployment & Operations
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Migration Guide](docs/MIGRATION.md)** - Express to Python FastAPI migration
- **[Integration Guide](docs/INTEGRATION.md)** - LuminariMUD game server integration
- **[Monitoring Guide](docs/MONITORING.md)** - Application monitoring and observability
- **[Backup Guide](docs/BACKUP.md)** - Database backup and recovery procedures
- **[Disaster Recovery](docs/DISASTER_RECOVERY.md)** - Emergency response procedures

### 🔒 Security & Compliance
- **[Security Policy](SECURITY.md)** - Security practices and vulnerability reporting
- **[Changelog](docs/CHANGELOG.md)** - Version history and release notes
- **[Code Audit](docs/AUDIT.md)** - Security and code quality assessment

### 🏗️ Architecture & Planning
- **[Wilderness System](docs/WILDERNESS_SYSTEM.md)** - LuminariMUD wilderness architecture
- **[Project Specifications](docs/WILDERNESS_PROJECT.md)** - Detailed project requirements
- **[Development TODO](docs/TODO.md)** - Current tasks and development roadmap
- **[Architecture Decisions](docs/adr/)** - ADR records for major technical decisions

### 📋 Reference
- **[Claude Instructions](CLAUDE.md)** - AI assistant guidance for this codebase
- **[Roadmap](ROADMAP.md)** - Long-term project vision and milestones

## 🎮 Integration with LuminariMUD

This editor integrates seamlessly with the LuminariMUD wilderness system:

- **Coordinate System**: Uses the same -1024 to +1024 coordinate space
- **Database Compatibility**: Works directly with existing LuminariMUD MySQL spatial tables
- **Region Types**: Supports all game region types (Geographic, Encounter, Sector Transform, Sector Override)
- **Path Types**: Compatible with roads, rivers, and other path types
- **Real-time Updates**: Changes reflect immediately in the game world

## 🛠️ Technology Stack

### Frontend (`apps/frontend/`)
- **React 18.3+** - Modern UI framework
- **TypeScript 5.5+** - Type-safe development
- **Vite 7.0** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Supabase Auth** - User authentication

### Backend (`apps/backend/`)
- **FastAPI** - Python 3.8+ web framework with automatic OpenAPI documentation
- **SQLAlchemy** - Database ORM for MySQL integration
- **Pydantic** - Request/response validation and serialization
- **MySQL Integration** - Direct connection to LuminariMUD's existing spatial tables
- **JWT Authentication** - Secure API access (configurable)
- **Uvicorn** - ASGI server for high-performance async operations

### Shared (`packages/shared/`)
- **TypeScript Interfaces** - Shared types between frontend and backend
- **Common Utilities** - Shared helper functions

### Development Tools
- **Turborepo** - Monorepo build orchestration
- **npm Workspaces** - Package management
- **ESLint** - Code linting across all packages
- **TypeScript** - Full-stack type safety

## 📁 Project Structure

See the [Monorepo Structure](#-monorepo-structure) section above for the high-level organization.

### Key Directories

- **`apps/frontend/src/`** - React application source
  - `components/` - UI components (MapCanvas, ToolPalette, etc.)
  - `hooks/` - Custom React hooks (useEditor, useAuth)
  - `services/` - API client and external integrations
  - `lib/` - Utility libraries (Supabase client)
  - `types/` - TypeScript type imports from shared

- **`apps/backend/src/`** - FastAPI Python backend source
  - `routers/` - FastAPI endpoint definitions
  - `schemas/` - Pydantic request/response schemas
  - `models/` - SQLAlchemy database models
  - `config/` - Database configuration and setup
  - `main.py` - FastAPI application entry point

- **`packages/shared/src/`** - Shared code
  - `types/` - TypeScript interfaces used by both frontend and backend

- **`docs/`** - Comprehensive documentation (see Documentation section above)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Coding standards and best practices
- Submitting pull requests
- Reporting issues

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/moshehbenavraham/wildeditor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/moshehbenavraham/wildeditor/discussions)
- **Documentation**: [Project Wiki](https://github.com/moshehbenavraham/wildeditor/wiki)

## 🙏 Acknowledgments

- **LuminariMUD Team** - For the amazing MUD system and wilderness architecture
- **CircleMUD Community** - For the foundational MUD codebase
- **Open Source Contributors** - For the tools and libraries that make this possible

## 🔗 Related Projects

- **[LuminariMUD](https://github.com/luminari-mud/luminari-source)** - The main MUD codebase
- **[Wilderness System Documentation](docs/WILDERNESS_SYSTEM.md)** - Detailed system architecture

---

**Made with ❤️ for the LuminariMUD community**
