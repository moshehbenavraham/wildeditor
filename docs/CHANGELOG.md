# Changelog

All notable changes to the Luminari Wilderness Editor will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive code quality audit and improvements
- Input validation in all backend controllers
- ESLint configuration for backend with TypeScript rules
- Basic request validation for required fields in API endpoints
- Consistent error handling patterns across all model methods

### Changed
- Improved type safety by replacing `any` types with proper TypeScript types
- Enhanced error handling in frontend with proper unknown type usage
- Optimized Region/Path identification logic in UI components
- Updated ESLint configurations to resolve compatibility issues

### Fixed
- **Critical Logic Bug**: Fixed incorrect Region/Path identification in PropertiesPanel and useEditor
- **Configuration Issues**: 
  - Updated turbo.json to use `tasks` instead of deprecated `pipeline` field
  - Fixed missing ESLint configuration for backend package
  - Corrected TypeScript export path in shared package (removed .js extension)
- **Backend Code Quality**:
  - Added consistent null checking for Supabase client across all model methods
  - Fixed unused parameter in error handler middleware
  - Added input validation for create/update operations
- **Frontend Code Quality**:
  - Fixed conditional React Hook calls by reordering useEffect placement
  - Removed unused imports and variables
  - Fixed missing dependencies in useCallback dependency arrays
  - Improved error handling with proper type safety
- **Linting and Type Safety**:
  - All ESLint issues resolved across frontend, backend, and shared packages
  - All TypeScript type checking issues resolved
  - Removed usage of `any` types in favor of proper type annotations

## [0.2.0] - 2025-01-30

### Added
- Full-stack monorepo architecture with npm workspaces and Turborepo
- Express.js backend with TypeScript (TEMPORARY - will be replaced with Python FastAPI)
- Supabase database integration with PostgreSQL (for local development)
- Future Python backend will integrate directly with LuminariMUD's MySQL spatial tables
- JWT authentication middleware for API protection
- RESTful API endpoints for regions, paths, and points
- Shared types package for frontend-backend consistency
- API client with error handling and optimistic updates
- Database schema with indexes and Row Level Security
- Health check endpoint for monitoring
- Dotenv configuration for environment variables
- CORS and Helmet.js security middleware
- Graceful handling of missing Supabase credentials
- Database setup SQL script with tables and policies
- Frontend-backend connection with real data persistence
- Loading states and error handling in UI
- SETUP.md with quick start instructions

### Changed
- Transformed project from single React app to monorepo structure
- Replaced mock data with API-based persistence
- Updated useEditor hook to integrate with API client
- Modified authentication flow to pass JWT tokens to API
- Restructured project directories into apps/ and packages/
- Updated all import paths to use shared types
- Enhanced error handling with fallback to mock data
- Improved development workflow with parallel server startup
- Updated package.json with workspace configuration
- Modified TypeScript configs for monorepo structure
- Changed from file: to workspace: protocol for shared packages

### Fixed
- TypeScript module resolution issues in backend
- Import path extensions (.js) removed for proper builds
- useState/useEffect hooks corrected in useEditor
- Null handling for Supabase client initialization
- Backend build errors with tsconfig adjustments
- Environment variable loading with dotenv  
- API authentication token passing from frontend
- CORS configuration for local development

## [0.2.0] - 2025-01-30

### Added
- Monorepo architecture implementation
- Express backend with TypeScript
- Supabase integration
- JWT authentication
- RESTful API for all entities
- Shared types package
- API client in frontend
- Database schema and setup script
- Development environment configuration

### Changed
- Project structure to monorepo
- Frontend to use API instead of mock data
- Authentication to use JWT tokens
- Build system to Turborepo

### Removed
- Mock data from frontend (now optional fallback)
- Direct Supabase queries from frontend

## [0.1.0] - 2025-01-29

### Added
- Initial project setup with React, TypeScript, and Vite
- Basic project structure and configuration files
- Comprehensive documentation suite following GitHub best practices
- Supabase authentication integration with OAuth support
- Core wilderness editor UI components:
  - MapCanvas with coordinate tracking and drawing
  - ToolPalette with four drawing tools
  - LayerControls for visibility toggles
  - PropertiesPanel for entity editing
  - StatusBar with coordinates and zoom
- Drawing tools implementation:
  - Select tool for choosing existing features
  - Point tool for placing landmarks
  - Polygon tool for drawing regions
  - Linestring tool for creating paths
- Real-time coordinate display with zoom-adjusted precision
- Layer visibility controls for grid, regions, and paths
- Keyboard shortcuts (S, P, G, L, Escape, Enter)
- Mock data system for development
- Custom React hooks for editor state management (useEditor)
- Authentication flow with protected routes
- Environment configuration template (.env.example)
- Netlify deployment configuration with SPA routing
- CLAUDE.md file for AI assistant guidance
- TypeScript type definitions for all wilderness entities

#### Documentation Infrastructure
- Professional README.md with project overview, features, and quick start guide
- CONTRIBUTING.md with development setup, coding standards, and PR process
- LICENSE file (MIT) for open source distribution
- SECURITY.md with vulnerability reporting procedures and security policies
- ROADMAP.md with comprehensive development phases and milestones
- Complete API documentation (docs/API.md) with endpoints and examples
- User Guide (docs/USER_GUIDE.md) with tutorials and best practices
- Developer Guide (docs/DEVELOPER_GUIDE.md) with technical architecture
- Deployment Guide (docs/DEPLOYMENT.md) with production setup procedures
- Documentation index (docs/README.md) for easy navigation
- WILDERNESS_PROJECT.md with detailed project specifications

#### GitHub Templates and Automation
- Bug report template for structured issue reporting
- Feature request template for standardized enhancement requests
- Pull request template with comprehensive checklist
- GitHub Actions CI/CD workflow placeholder
- Issue and PR templates following GitHub best practices

### Changed
- Updated project metadata in package.json
- Enhanced package.json with additional npm scripts
- Configured project for LuminariMUD wilderness system integration
- Set up coordinate system matching MUD wilderness (-1024 to +1024)

### Security
- Implemented protected routes requiring authentication
- Added environment variable configuration for API keys
- Configured Supabase authentication with secure OAuth flow
- Created comprehensive security policy
- Established security best practices documentation

---

## Release Notes Template

When creating a new release, use this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features and functionality

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in future versions

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements and vulnerability fixes
```

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

## Categories

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.