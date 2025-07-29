# Luminari Wilderness Editor

A modern web-based visual editor for creating and managing wilderness regions, paths, and landmarks in the LuminariMUD game world. Built with React, TypeScript, and integrated with MySQL spatial databases.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)
![React](https://img.shields.io/badge/React-18.3+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.4+-purple.svg)

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
- Node.js 18+ and npm
- Access to LuminariMUD MySQL database with spatial extensions
- Modern web browser with JavaScript enabled

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
   # Edit .env with your database and API settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

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

### Frontend
- **React 18.3+** - Modern UI framework
- **TypeScript 5.5+** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

### Backend Integration
- **MySQL** - Spatial database with geometry support
- **Supabase** - Authentication and real-time features
- **RESTful API** - Standard HTTP API design

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Vite** - Development server and bundling

## 📁 Project Structure

```
wildeditor/
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── docs/                   # Documentation
│   ├── WILDERNESS_SYSTEM.md    # Game system documentation
│   ├── WILDERNESS_PROJECT.md   # Project specifications
│   ├── USER_GUIDE.md           # User documentation
│   ├── API.md                  # API reference
│   ├── DEVELOPER_GUIDE.md      # Technical documentation
│   └── DEPLOYMENT.md           # Deployment guide
├── package.json            # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

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
