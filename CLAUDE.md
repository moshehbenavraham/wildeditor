# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Luminari Wilderness Editor is a React/TypeScript web application for creating and managing wilderness areas in the LuminariMUD game world. It provides a visual interface for drawing regions, paths, and landmarks on a 2D coordinate grid (-1024 to +1024), integrating with MySQL spatial databases.

## Common Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Preview production build
npm run preview

# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Clean build artifacts
npm run clean
```

Note: Tests are not yet implemented (`npm test` will exit with 0).

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18.3 with TypeScript 5.5
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS with utility classes
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **State Management**: React hooks (useState, useCallback)

### Core Application Structure

The application follows a component-based architecture with custom hooks for business logic:

```
src/
├── App.tsx                 # Main application component with layout
├── components/            
│   ├── AuthCallback.tsx    # Handles Supabase auth redirects
│   ├── AuthForm.tsx        # Login/signup forms
│   ├── LayerControls.tsx   # Toggle visibility of map layers
│   ├── MapCanvas.tsx       # Main drawing canvas (2D coordinate system)
│   ├── PropertiesPanel.tsx # Edit selected items
│   ├── ProtectedRoute.tsx  # Auth guard wrapper
│   ├── StatusBar.tsx       # Mouse coords and zoom controls
│   └── ToolPalette.tsx     # Drawing tool selection
├── hooks/
│   ├── useAuth.ts          # Supabase authentication logic
│   └── useEditor.ts        # Core editor state and operations
├── lib/
│   └── supabase.ts         # Supabase client initialization
└── types/
    └── index.ts            # TypeScript interfaces
```

### Key Concepts

1. **Coordinate System**: The wilderness uses a coordinate grid from -1024 to +1024 on both X and Y axes, matching the LuminariMUD wilderness system.

2. **Drawing Tools**:
   - `select`: Click items to view/edit properties
   - `point`: Place single landmarks
   - `polygon`: Draw regions (requires 3+ points)
   - `linestring`: Draw paths (requires 2+ points)

3. **Data Types**:
   - **Region**: Polygonal areas with types (geographic, encounter, sector_transform, sector)
   - **Path**: Linear features with types (road, dirt_road, geographic, river, stream)
   - **Point**: Single coordinate landmarks

4. **State Management**: The `useEditor` hook manages all editor state including:
   - Current tool selection
   - Drawing state and temporary coordinates
   - Selected items for editing
   - Layer visibility toggles
   - Zoom level and mouse position

### Authentication Flow

1. User accesses the app → `ProtectedRoute` checks auth status
2. If not authenticated → Redirects to `AuthForm`
3. Supabase handles OAuth → Returns to `/auth/callback`
4. `AuthCallback` component processes the auth response
5. User is redirected to main editor interface

### Environment Configuration

The app uses Vite environment variables (all prefixed with `VITE_`):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public Supabase key
- `VITE_API_URL`: Backend API endpoint (when implemented)

Production domain: `https://wildedit.luminarimud.com`

### Integration with LuminariMUD

The editor is designed to work with the MUD's wilderness system:
- Matches coordinate system (-1024 to +1024)
- Compatible region types (REGION_GEOGRAPHIC, REGION_ENCOUNTER, etc.)
- Compatible path types (PATH_ROAD, PATH_RIVER, etc.)
- Will integrate with MySQL spatial database tables:
  - `region_data`: Stores polygonal regions
  - `path_data`: Stores linear paths

### Current Implementation Status

**Implemented**:
- Full UI layout and components
- Drawing tools for all geometry types
- Authentication with Supabase
- Mock data for development
- Keyboard shortcuts (S, P, G, L, ESC, Enter)
- Real-time coordinate display
- Layer visibility controls

**Not Yet Implemented**:
- Backend API integration
- MySQL database connectivity
- Actual data persistence
- Map image display
- Version control/commit system
- Multi-environment support
- Tests

### Development Notes

- The project uses mock data (see `useEditor.ts`) for regions, paths, and points
- Coordinates are in MUD units, not pixels
- Colors are hardcoded per item but should eventually come from the database
- The app is prepared for WebSocket support (`VITE_WS_URL`) for real-time collaboration
- Netlify deployment configured with SPA routing (`_redirects` file)

### Common Tasks

When implementing new features:
1. Define types in `src/types/index.ts`
2. Add UI components in `src/components/`
3. Implement logic in hooks (prefer `useEditor.ts` for editor logic)
4. Use Tailwind classes for styling (dark theme with gray-900 backgrounds)
5. Follow the existing pattern of keyboard shortcuts
6. Ensure auth protection for all routes

When debugging:
- Check browser console for Supabase auth errors
- Verify environment variables are loaded (Vite requires `VITE_` prefix)
- Use React Developer Tools to inspect component state
- Check `useEditor` hook for state management issues