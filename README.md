# Luminari Wilderness Editor

A modern full-stack monorepo application for creating and managing wilderness regions, paths, and landmarks in the LuminariMUD game world. Built with React/TypeScript frontend, Express/TypeScript backend, and integrated with Supabase PostgreSQL spatial databases.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)
![React](https://img.shields.io/badge/React-18.3+-blue.svg)
![Express](https://img.shields.io/badge/Express-4.18+-green.svg)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0+-red.svg)

## 🌟 Features

### Core Functionality
- **Interactive Map Display**: Visual representation of the wilderness with zoom and pan capabilities
- **Drawing Tools**: Point, polygon, and linestring tools for creating regions and paths
- **Real-time Coordinate Display**: Mouse hover coordinates with zoom-adjusted precision
- **Layer Management**: Toggle visibility of regions, paths, and other map elements
- **Click-to-Register**: Click anywhere on the map to capture precise coordinates

### Editing Capabilities
- **Visual Region Creation**: Draw geographic areas, encounter zones, and terrain modifiers
- **Path Drawing**: Create roads, rivers, and other linear features
- **Manual Coordinate Entry**: Precise coordinate input and modification
- **Polygon Validation**: Automatic detection and prevention of self-intersecting polygons
- **Bulk Operations**: Select and edit multiple features simultaneously

### Data Management
- **Session-based Editing**: Local changes with preview before committing
- **Version Control**: Track changes with commit messages and rollback capability
- **Soft Delete**: Mark items for deletion without immediate removal
- **Multi-environment Support**: Switch between development and production servers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+ (for workspace support)
- Supabase project with database access
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
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials:
   # Frontend (apps/frontend/.env):
   #   VITE_SUPABASE_URL=your_supabase_url
   #   VITE_SUPABASE_ANON_KEY=your_anon_key
   #   VITE_API_URL=http://localhost:3001/api
   # Backend (apps/backend/.env):
   #   SUPABASE_URL=your_supabase_url
   #   SUPABASE_SERVICE_KEY=your_service_key
   #   PORT=3001
   ```

4. **Set up database tables**
   Create the required tables in your Supabase dashboard:
   ```sql
   -- Enable PostGIS extension
   create extension if not exists postgis;

   -- Create tables (see Database Schema section)
   ```

5. **Start development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on :5173
   npm run dev:backend   # Backend on :3001
   ```

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
│   └── backend/           # Express TypeScript API
│       ├── src/
│       └── package.json
├── packages/
│   └── shared/            # Shared types and utilities
│       └── src/types/
├── docs/                  # Documentation
└── package.json          # Workspace root
```

## 📖 Documentation

- **[User Guide](docs/USER_GUIDE.md)** - How to use the wilderness editor
- **[API Documentation](docs/API.md)** - Backend API reference
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Technical architecture and development
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing](CONTRIBUTING.md)** - How to contribute to the project

## 🎮 Integration with LuminariMUD

This editor integrates seamlessly with the LuminariMUD wilderness system:

- **Coordinate System**: Uses the same -1024 to +1024 coordinate space
- **Database Compatibility**: Works directly with existing MySQL spatial tables
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
- **Express.js** - Node.js web framework (temporary, will be Python)
- **TypeScript** - Type-safe backend development
- **Supabase** - PostgreSQL with PostGIS for spatial data
- **JWT Authentication** - Secure API access
- **Helmet & CORS** - Security middleware

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

- **`apps/backend/src/`** - Express API source
  - `routes/` - API endpoint definitions
  - `controllers/` - Request handling logic
  - `middleware/` - Authentication and validation
  - `models/` - Database models and queries
  - `config/` - Configuration and database setup

- **`packages/shared/src/`** - Shared code
  - `types/` - TypeScript interfaces used by both frontend and backend

- **`docs/`** - Comprehensive documentation
  - `WILDERNESS_SYSTEM.md` - Game system architecture
  - `WILDERNESS_PROJECT.md` - Project specifications
  - `TODO.md` - Development task tracking
  - `API.md` - API endpoint reference

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
