# Luminari Wilderness Editor Project

## Project Overview

The Luminari Wilderness Editor is a two-tier web application with a React/TypeScript frontend for the visual editing interface and a Python backend API for data persistence and game logic. This architecture provides a modern editing experience while preserving existing game systems and MySQL spatial database integration.

**Architecture Decision**: The project uses a clear separation of concerns - React handles all UI/UX aspects while Python manages business logic, validation, and database operations.

**Current Status**: Phase 3 of 7 - Frontend UI and drawing tools have initial implementations but need significant refinement. Many features are partially working or need debugging. Python backend API development is the next major milestone.

## Core Requirements

### 1. Map Display and Interaction
- Display game-generated wilderness map image as base layer
- Click-to-register coordinates functionality
- Real-time coordinate display on mouse hover
- Zoom functionality (100%, 200%, etc.)
- Coordinate display adjusts to zoom level (1x1 at 100%, 2x2 at 200%)

### 2. Drawing Tools
- **Point Tool**: Place landmarks/single-room regions
- **Polygon Tool**: Draw regions (geographic, sector, encounter)
- **Linestring Tool**: Draw paths (roads, rivers, etc.)
- **Select Tool**: Click to view/edit existing features

### 3. User Interface
- Split-window design:
  - Left: Interactive map canvas
  - Right: Information/editing panel
- Tool palette for switching between drawing modes
- Layer visibility controls
- Coordinate display (current mouse position)

### 4. Editing Features
- Manual coordinate entry/modification
- Add/remove/reorder points in polygons and paths
- Automatic polygon validation (prevent self-intersecting lines)
- Support for polygon holes (interior rings)
- Bulk selection and editing

### 5. Data Management
- Local editing with preview before committing
- Version control/commit system
- Mark items for deletion (soft delete)
- Lock regions from in-game editing
- Server selection (dev/prod environments)

### 6. Authentication & Security
- Supabase Auth for UI session management
- API token authentication for backend calls
- User permission levels
- Rate limiting for DDoS protection

## Technical Architecture

### Architecture Overview

The application follows a clean separation between frontend and backend:

**React Frontend** → HTTP/REST → **Python Backend API** → **MySQL Database**

This architecture ensures:
- Frontend focuses purely on UI/UX concerns
- Backend handles all business logic and validation
- Game logic remains in Python/C code
- Database integrity is maintained by the backend

### Current Implementation (as of January 2025)

#### Frontend Stack (Implemented)
- **Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth (UI sessions only)
- **State Management**: React hooks with local session tracking
- **API Client**: Axios or Fetch for backend communication
- **Deployment**: Netlify with SPA routing

#### Backend Stack (To Be Implemented)
- **Framework**: Python FastAPI (recommended for async support)
- **Database**: MySQL 5.7+ with spatial extensions
- **ORM**: SQLAlchemy with GeoAlchemy2
- **API**: RESTful with OpenAPI documentation
- **Authentication**: Token-based API authentication
- **Validation**: Pydantic models for request/response
- **Spatial Operations**: MySQL spatial functions via SQL

### Database Schema
```sql
-- Matches existing game tables
region_data (
    vnum INT PRIMARY KEY,
    zone_vnum INT,
    name VARCHAR(255),
    region_type INT,
    region_polygon GEOMETRY,
    region_props INT,
    region_reset_data TEXT,
    region_reset_time INT
)

path_data (
    vnum INT PRIMARY KEY,
    zone_vnum INT,
    name VARCHAR(255),
    path_type INT,
    path_linestring GEOMETRY,
    path_props INT
)

-- Editor-specific tables
editor_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    session_data JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

editor_commits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255),
    commit_message TEXT,
    changes JSON,
    committed_at TIMESTAMP
)
```

## API Endpoints

The React frontend will communicate with the Python backend via these RESTful endpoints:

### Authentication
- `POST /api/auth/token` - Exchange Supabase token for API token
- `POST /api/auth/refresh` - Refresh API token
- `POST /api/auth/logout` - Invalidate API token
- `GET /api/auth/permissions` - Get user permissions

### Map Data
- `GET /api/map/image` - Get base map image
- `GET /api/map/regions` - Get all regions for display
- `GET /api/map/paths` - Get all paths for display
- `GET /api/map/at/{x}/{y}` - Get features at coordinates

### Region Management
- `GET /api/regions` - List all regions
- `GET /api/regions/{vnum}` - Get specific region
- `POST /api/regions` - Create new region
- `PUT /api/regions/{vnum}` - Update region
- `DELETE /api/regions/{vnum}` - Mark region for deletion

### Path Management
- `GET /api/paths` - List all paths
- `GET /api/paths/{vnum}` - Get specific path
- `POST /api/paths` - Create new path
- `PUT /api/paths/{vnum}` - Update path
- `DELETE /api/paths/{vnum}` - Mark path for deletion

### Session Management
- `GET /api/session` - Get current editing session
- `POST /api/session/save` - Save session state
- `POST /api/session/commit` - Commit changes to database
- `POST /api/session/discard` - Discard session changes

## Development Phases

### Phase 1: Core Infrastructure ✅ COMPLETED
1. ✅ Set up React frontend with TypeScript
2. ✅ Configure Vite build system
3. ✅ Implement Supabase authentication
4. ✅ Create basic component structure
5. ✅ Set up development environment

### Phase 2: Basic Map Viewer ✅ COMPLETED
1. ✅ Create web frontend framework
2. ✅ Implement map canvas display
3. ✅ Add zoom functionality
4. ✅ Display mouse coordinates
5. ✅ Show mock regions/paths as overlays

### Phase 3: Drawing Tools 🚧 IN PROGRESS (First-Shot Implementation)
1. ✅ Implement point placement tool (basic functionality working)
2. ⚠️ Add polygon drawing with vertex editing (drawing works, editing needs fixes)
3. ⚠️ Create linestring drawing for paths (basic drawing works, needs refinement)
4. ⚠️ Add selection tool for existing features (partially working, needs debugging)
5. ✅ Implement coordinate click registration (working but needs optimization)

### Phase 4: Editing Interface 🚧 IN PROGRESS (Needs Major Work)
1. ⚠️ Create information panel UI (layout done, functionality incomplete)
2. ⚠️ Implement manual coordinate editing (UI exists, doesn't save properly)
3. ❌ Add point reordering functionality (UI elements present, not functional)
4. ⚠️ Create property editing forms (forms display, updates don't persist)
5. ❌ Implement validation rules (not started)

### Phase 5: Data Management ❌ NOT STARTED
1. ❌ Implement session-based editing
2. ❌ Create commit/rollback functionality
3. ❌ Add change preview system
4. ❌ Implement soft delete marking
5. ❌ Create change history tracking

### Phase 6: Advanced Features ❌ NOT STARTED
1. ❌ Add polygon hole support
2. ❌ Implement automatic polygon fixing
3. ❌ Create bulk editing tools
4. ❌ Add region locking mechanism
5. ❌ Implement collaborative editing features

### Phase 7: Deployment & Integration ⏳ PARTIALLY COMPLETE
1. ✅ Set up production environment (Netlify)
2. ✅ Configure environment switching (dev/prod)
3. ❌ Implement backup and recovery
4. ✅ Create user documentation (CLAUDE.md)
5. ❌ Integrate with game systems

## Region Types (from game)
- `REGION_GEOGRAPHIC` (1) - Named geographic areas
- `REGION_ENCOUNTER` (2) - Encounter spawn zones
- `REGION_SECTOR_TRANSFORM` (3) - Terrain modification
- `REGION_SECTOR` (4) - Complete terrain override

## Path Types (from game)
- `PATH_ROAD` (1) - Paved roads
- `PATH_DIRT_ROAD` (2) - Dirt roads
- `PATH_GEOGRAPHIC` (3) - Geographic features
- `PATH_RIVER` (5) - Rivers and streams
- `PATH_STREAM` (6) - Small streams

## Coordinate System
- **Range**: -1024 to +1024 (X and Y)
- **Origin**: (0,0) at map center
- **Direction**: North (+Y), South (-Y), East (+X), West (-X)

## Security Considerations
- Validate all coordinate inputs
- Sanitize polygon/linestring data
- Implement proper SQL injection prevention
- Use prepared statements for all queries
- Rate limit API endpoints
- Log all data modifications

## Performance Requirements
- Support maps up to 2048x2048 pixels
- Handle thousands of regions/paths
- Sub-second response times for queries
- Efficient spatial indexing
- Minimal memory footprint

## User Interface Mockup
```
+--------------------------------------------------+
|  Wilderness Editor                    User: Name  |
+------------------+-------------------------------+
| Tools:           | Region: Geographic Area #101   |
| [Select] [Point] | Type: [Geographic v]          |
| [Polygon] [Line] | Name: [Darkwood Forest      ] |
|                  | Props: [Forest terrain      ] |
| Layers:          |                               |
| [x] Regions      | Points (click to edit):       |
| [x] Paths        | 1. (102, 205) [Delete]        |
| [ ] Grid         | 2. (145, 210) [Delete]        |
|                  | 3. (150, 180) [Delete]        |
| Server: [Dev v]  | 4. (102, 175) [Delete]        |
|                  | [Add Point] [Auto-Fix]        |
| Zoom: [100% v]   |                               |
|                  | [Save Draft] [Commit] [Reset] |
+------------------+-------------------------------+
| Map Canvas                                       |
| (Displays map with overlays)                     |
| Current: (X: 125, Y: 200)                        |
+--------------------------------------------------+
```

## Integration with Existing Systems
- Read map images from game's map generation system
- Use existing MySQL spatial tables
- Match coordinate system with game wilderness
- Support all existing region and path types
- Maintain compatibility with game's spatial queries

## Future Enhancements
- Mobile-responsive design
- Offline editing with sync
- Collaborative real-time editing
- Automated region generation tools
- Integration with Mudlet client
- Export/import functionality
- Procedural content generation
- 3D terrain visualization

## Current Implementation Details

### First-Shot Implementation Status
- **UI Layout**: Split-window design implemented (needs polish and responsive design)
- **Authentication**: Supabase auth working (email verification enabled)
- **Drawing Tools**: All four tools have basic functionality but need significant debugging:
  - Select tool: Can click items but selection state management is buggy
  - Point tool: Places points correctly
  - Polygon tool: Can draw but closing polygons and editing vertices needs work
  - Linestring tool: Basic drawing works, editing needs implementation
- **Coordinate System**: -1024 to +1024 grid displays correctly
- **Layer Controls**: Visibility toggles work
- **Keyboard Shortcuts**: Implemented but need better visual feedback
- **Mock Data**: Using hardcoded sample data (no persistence)

### Known Issues (Current State)
- **Critical**: No backend API integration (using mock data)
- **Critical**: Zero test coverage
- **Critical**: State management issues - edits don't persist properly
- **Critical**: Selection tool doesn't maintain state correctly
- **High**: Limited error handling throughout the application
- **High**: Canvas re-rendering performance issues
- **High**: Coordinate editing in PropertiesPanel doesn't update canvas
- **High**: Polygon/linestring editing features are incomplete
- **Medium**: Two `any` types in error catches
- **Medium**: MapCanvas component too large (356 lines) and doing too much
- **Medium**: No visual feedback for many user actions
- **Low**: No accessibility features
- **Low**: Missing undo/redo functionality
- **Low**: No tooltips or help system

### Immediate Fix Priorities (Before Backend)
1. **Fix State Management**: Ensure edits persist in the UI properly
2. **Debug Selection Tool**: Fix selection state and highlighting
3. **Complete Drawing Tools**: 
   - Fix polygon closing and vertex editing
   - Implement linestring point editing
   - Add visual feedback for active tool
4. **Connect PropertiesPanel to Canvas**: Make coordinate edits update the canvas
5. **Add Basic Error Handling**: Prevent crashes from invalid operations

### Tech Debt Priorities
1. Refactor useEditor hook - it's doing too much
2. Split MapCanvas into smaller components
3. Implement proper state management (consider Zustand or Redux)
4. Set up testing framework (Vitest recommended)
5. Add proper TypeScript types to replace `any`
6. Implement error boundaries
7. Design and implement backend API

## Development Repository
- **Name**: wildeditor
- **URL**: https://wildedit.luminarimud.com
- **Structure**:
  ```
  /
  ├── src/
  │   ├── components/     # UI components
  │   ├── hooks/          # Custom React hooks
  │   ├── lib/            # External integrations
  │   └── types/          # TypeScript definitions
  ├── docs/
  │   ├── WILDERNESS_PROJECT.md
  │   ├── WILDERNESS_SYSTEM.md
  │   └── AUDIT.md
  ├── public/
  └── config files (vite, tailwind, etc.)
  ```

## Getting Started (Development)
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Configure Supabase credentials in `.env.local`
5. Start development server: `npm run dev`
6. Access at `http://localhost:5173`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Testing Strategy
- Unit tests for API endpoints
- Integration tests for database operations
- Frontend component testing
- End-to-end testing with Cypress
- Load testing for performance validation
- Security penetration testing

## Documentation Requirements
- API documentation (OpenAPI/Swagger)
- User guide with screenshots
- Administrator manual
- Developer setup guide
- Database schema documentation
- Troubleshooting guide

## Next Steps (Q1 2025)

### Monorepo Transformation (January 30, 2025)
**IMPORTANT**: Before backend development, we're restructuring the project to a monorepo architecture using Bolt.new. This will:
- Create a proper separation between frontend and backend code
- Add a temporary Node.js/Express backend (to be replaced with Python later)
- Extract shared types to a common package
- Enable parallel development of frontend fixes and backend API

**Transformation Plan**:
1. Use Bolt.new to restructure into monorepo (apps/frontend, apps/backend, packages/shared)
2. Create Node.js Express API matching our intended Python API structure
3. Connect frontend to use API instead of mock data
4. Later replace Express with Python FastAPI (identical endpoints)

### Immediate Priorities (Post-Transformation)
1. **Complete Monorepo Setup**
   - Verify all existing functionality works
   - Test API endpoints with mock data
   - Set up Supabase database tables
   - Configure development environment

2. **Python Backend API Development** (After monorepo is stable)
   - Set up FastAPI project structure
   - Implement authentication middleware
   - Create SQLAlchemy models with GeoAlchemy2
   - Build RESTful endpoints for regions/paths/points
   - Add validation and error handling
   - Document API with OpenAPI/Swagger

2. **Testing Infrastructure**
   - Set up Vitest for unit testing
   - Write tests for existing hooks and components
   - Aim for 80% code coverage

3. **Error Handling**
   - Implement React error boundaries
   - Add proper error types to replace `any`
   - Create user-friendly error messages

### Short-term Goals
1. **Performance Optimization**
   - Refactor MapCanvas component
   - Implement React.memo for expensive renders
   - Add debouncing for coordinate updates

2. **Frontend-Backend Integration**
   - Create API service layer in React
   - Replace mock data with API calls
   - Implement session-based change tracking
   - Add optimistic UI updates
   - Handle API errors gracefully

3. **UI Enhancements**
   - Add loading states
   - Implement undo/redo
   - Improve accessibility

### Medium-term Vision
1. **Real-time Collaboration**
   - WebSocket integration
   - Multi-user editing support
   - Conflict resolution

2. **Advanced Features**
   - Map image overlay support
   - Bulk editing tools
   - Export/import functionality

3. **Production Readiness**
   - Comprehensive test suite
   - Performance monitoring
   - Security hardening

## Architecture Benefits

### Why React + Python Backend?

1. **Separation of Concerns**
   - UI logic stays in React
   - Business logic stays in Python
   - Database operations isolated in backend

2. **Technology Strengths**
   - React: Excellent for interactive UIs
   - Python: Great for spatial operations and MySQL integration
   - FastAPI: Modern, fast, with automatic API documentation

3. **Development Efficiency**
   - Frontend and backend can be developed independently
   - Clear API contract enables parallel development
   - Mock data allows frontend development without backend

4. **Maintenance Benefits**
   - Game logic remains in familiar Python/C
   - UI updates don't affect game systems
   - Backend can serve multiple clients (web, mobile, etc.)

5. **Security**
   - API layer provides validation and sanitization
   - No direct database access from browser
   - Token-based authentication for API calls

---

*Last Updated: January 30, 2025 - Preparing for monorepo transformation using Bolt.new. Will create temporary Node.js backend as stepping stone to Python FastAPI. Frontend has "first-shot" implementations needing refinement.*