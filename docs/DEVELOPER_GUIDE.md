# Developer Guide - Luminari Wilderness Editor

This guide provides technical information for developers working on the Luminari Wilderness Editor project.

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (MySQL)       │
│                 │    │                 │    │                 │
│ - Map Interface │    │ - Authentication│    │ - Spatial Data  │
│ - Drawing Tools │    │ - CRUD Ops      │    │ - Region Tables │
│ - State Mgmt    │    │ - Validation    │    │ - Path Tables   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **React 18.3+**: Component-based UI framework
- **TypeScript 5.5+**: Static typing and enhanced developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Supabase Client**: Authentication and real-time features

#### Development Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript Compiler**: Type checking and compilation
- **PostCSS**: CSS processing with Tailwind
- **Vite Dev Server**: Hot module replacement and fast builds

## 📁 Project Structure

```
wildeditor/
├── src/
│   ├── components/              # React components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── map/                # Map-related components
│   │   ├── tools/              # Drawing tool components
│   │   └── panels/             # Info and control panels
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMap.ts          # Map state management
│   │   ├── useAuth.ts         # Authentication logic
│   │   └── useDrawing.ts      # Drawing tool logic
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts             # API client functions
│   │   ├── coordinates.ts     # Coordinate system utilities
│   │   ├── geometry.ts        # Geometric calculations
│   │   └── validation.ts      # Data validation functions
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts             # API response types
│   │   ├── map.ts             # Map-related types
│   │   └── geometry.ts        # Geometric types
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Application entry point
│   └── index.css              # Global styles
├── public/                     # Static assets
├── docs/                       # Documentation
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── eslint.config.js          # ESLint configuration
```

## 🔧 Development Setup

### Prerequisites

- **Node.js 18+** and npm
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - ESLint

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/moshehbenavraham/wildeditor.git
   cd wildeditor
   npm install
   ```

2. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build Process

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🧩 Core Components

### Map Component

The central map component handles wilderness display and interaction:

```typescript
interface MapProps {
  regions: Region[];
  paths: Path[];
  selectedFeature?: Feature;
  onFeatureSelect: (feature: Feature) => void;
  onCoordinateClick: (coords: WildernessCoordinates) => void;
}

export const Map: React.FC<MapProps> = ({
  regions,
  paths,
  selectedFeature,
  onFeatureSelect,
  onCoordinateClick
}) => {
  // Map implementation
};
```

**Key Features:**
- Canvas-based rendering for performance
- Zoom and pan functionality
- Layer management (regions, paths, grid)
- Click-to-coordinate conversion
- Feature selection and highlighting

### Drawing Tools

Each drawing tool is implemented as a separate component:

```typescript
interface DrawingToolProps {
  isActive: boolean;
  onFeatureCreate: (feature: Feature) => void;
  onCancel: () => void;
}

export const PolygonTool: React.FC<DrawingToolProps> = ({
  isActive,
  onFeatureCreate,
  onCancel
}) => {
  // Polygon drawing logic
};
```

**Tool Types:**
- **SelectTool**: Feature selection and editing
- **PointTool**: Single-point landmark creation
- **PolygonTool**: Multi-point region creation
- **LinestringTool**: Linear path creation

### State Management

The application uses React hooks for state management:

```typescript
// Map state hook
export const useMap = () => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [layers, setLayers] = useState({
    regions: true,
    paths: true,
    grid: false
  });

  return {
    zoom,
    center,
    layers,
    setZoom,
    setCenter,
    toggleLayer: (layer: string) => {
      setLayers(prev => ({
        ...prev,
        [layer]: !prev[layer]
      }));
    }
  };
};
```

## 🎨 Styling System

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wilderness: {
          forest: '#228B22',
          mountain: '#8B7355',
          water: '#4682B4',
          desert: '#F4A460'
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  },
  plugins: []
};
```

### Component Styling Patterns

```typescript
// Use consistent class patterns
const buttonClasses = {
  base: 'px-4 py-2 rounded-md font-medium transition-colors',
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => (
  <button
    className={`${buttonClasses.base} ${buttonClasses[variant]}`}
    {...props}
  >
    {children}
  </button>
);
```

## 🔌 API Integration

### API Client

```typescript
// lib/api.ts
class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Region methods
  async getRegions(params?: RegionQueryParams): Promise<Region[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Region[]>(`/regions?${query}`);
  }

  async createRegion(region: CreateRegionRequest): Promise<Region> {
    return this.request<Region>('/regions', {
      method: 'POST',
      body: JSON.stringify(region)
    });
  }

  // Path methods
  async getPaths(params?: PathQueryParams): Promise<Path[]> {
    return this.request<Path[]>('/paths');
  }

  // Session methods
  async saveSession(changes: SessionChanges): Promise<void> {
    return this.request<void>('/session/save', {
      method: 'POST',
      body: JSON.stringify(changes)
    });
  }
}

export const apiClient = new ApiClient(process.env.VITE_API_URL || 'http://localhost:3000/api');
```

### Data Fetching Hooks

```typescript
// hooks/useRegions.ts
export const useRegions = (params?: RegionQueryParams) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getRegions(params);
        setRegions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [params]);

  return { regions, loading, error, refetch: fetchRegions };
};
```

## 🧮 Coordinate System

### Coordinate Conversion

```typescript
// lib/coordinates.ts
export interface WildernessCoordinates {
  x: number; // -1024 to 1024
  y: number; // -1024 to 1024
}

export interface ScreenCoordinates {
  x: number; // Screen pixels
  y: number; // Screen pixels
}

export class CoordinateSystem {
  constructor(
    private mapWidth: number,
    private mapHeight: number,
    private wildernessSize: number = 2048
  ) {}

  screenToWilderness(screen: ScreenCoordinates, zoom: number): WildernessCoordinates {
    const scaledX = screen.x / zoom;
    const scaledY = screen.y / zoom;
    
    const x = Math.round((scaledX / this.mapWidth) * this.wildernessSize - this.wildernessSize / 2);
    const y = Math.round(this.wildernessSize / 2 - (scaledY / this.mapHeight) * this.wildernessSize);
    
    return { x, y };
  }

  wildernessToScreen(wilderness: WildernessCoordinates, zoom: number): ScreenCoordinates {
    const normalizedX = (wilderness.x + this.wildernessSize / 2) / this.wildernessSize;
    const normalizedY = (this.wildernessSize / 2 - wilderness.y) / this.wildernessSize;
    
    const x = normalizedX * this.mapWidth * zoom;
    const y = normalizedY * this.mapHeight * zoom;
    
    return { x, y };
  }

  validateCoordinates(coords: WildernessCoordinates): boolean {
    const max = this.wildernessSize / 2;
    return coords.x >= -max && coords.x <= max && coords.y >= -max && coords.y <= max;
  }
}
```

## 🎯 Drawing System

### Polygon Drawing Implementation

```typescript
// components/tools/PolygonTool.tsx
export const PolygonTool: React.FC<DrawingToolProps> = ({ isActive, onFeatureCreate }) => {
  const [points, setPoints] = useState<WildernessCoordinates[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleMapClick = useCallback((coords: WildernessCoordinates) => {
    if (!isActive) return;

    if (!isDrawing) {
      // Start new polygon
      setPoints([coords]);
      setIsDrawing(true);
    } else {
      // Add point to current polygon
      setPoints(prev => [...prev, coords]);
    }
  }, [isActive, isDrawing]);

  const handleDoubleClick = useCallback(() => {
    if (points.length >= 3) {
      // Complete polygon
      const region: Region = {
        coordinates: points,
        type: RegionType.GEOGRAPHIC,
        // ... other properties
      };
      onFeatureCreate(region);
      setPoints([]);
      setIsDrawing(false);
    }
  }, [points, onFeatureCreate]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Cancel drawing
      setPoints([]);
      setIsDrawing(false);
    } else if (event.key === 'Enter' && points.length >= 3) {
      // Complete polygon
      handleDoubleClick();
    }
  }, [points, handleDoubleClick]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isActive, handleKeyPress]);

  return (
    <div className="polygon-tool">
      {isDrawing && (
        <div className="drawing-instructions">
          <p>Click to add points. Double-click or press Enter to finish.</p>
          <p>Press Escape to cancel.</p>
        </div>
      )}
    </div>
  );
};
```

## 🔍 Testing Strategy

### Unit Testing

```typescript
// __tests__/coordinates.test.ts
import { CoordinateSystem } from '../lib/coordinates';

describe('CoordinateSystem', () => {
  const coordSystem = new CoordinateSystem(1024, 1024, 2048);

  test('converts screen to wilderness coordinates correctly', () => {
    const screen = { x: 512, y: 512 };
    const wilderness = coordSystem.screenToWilderness(screen, 1);
    
    expect(wilderness).toEqual({ x: 0, y: 0 });
  });

  test('validates coordinates within range', () => {
    expect(coordSystem.validateCoordinates({ x: 0, y: 0 })).toBe(true);
    expect(coordSystem.validateCoordinates({ x: 1025, y: 0 })).toBe(false);
    expect(coordSystem.validateCoordinates({ x: 0, y: -1025 })).toBe(false);
  });
});
```

### Integration Testing

```typescript
// __tests__/api.test.ts
import { apiClient } from '../lib/api';

describe('API Client', () => {
  test('fetches regions successfully', async () => {
    const regions = await apiClient.getRegions();
    
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThan(0);
    expect(regions[0]).toHaveProperty('vnum');
    expect(regions[0]).toHaveProperty('coordinates');
  });

  test('creates region with valid data', async () => {
    const newRegion = {
      name: 'Test Region',
      zone_vnum: 10000,
      region_type: 1,
      coordinates: [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 }
      ]
    };

    const created = await apiClient.createRegion(newRegion);
    
    expect(created).toHaveProperty('vnum');
    expect(created.name).toBe(newRegion.name);
  });
});
```

## 🚀 Performance Optimization

### Canvas Rendering

```typescript
// components/map/MapCanvas.tsx
export const MapCanvas: React.FC<MapCanvasProps> = ({ regions, paths, zoom }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render regions
    regions.forEach(region => {
      ctx.beginPath();
      region.coordinates.forEach((coord, index) => {
        const screen = coordSystem.wildernessToScreen(coord, zoom);
        if (index === 0) {
          ctx.moveTo(screen.x, screen.y);
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      });
      ctx.closePath();
      ctx.fillStyle = getRegionColor(region.type);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
    });

    // Render paths
    paths.forEach(path => {
      ctx.beginPath();
      path.coordinates.forEach((coord, index) => {
        const screen = coordSystem.wildernessToScreen(coord, zoom);
        if (index === 0) {
          ctx.moveTo(screen.x, screen.y);
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      });
      ctx.strokeStyle = getPathColor(path.type);
      ctx.lineWidth = getPathWidth(path.type);
      ctx.stroke();
    });
  }, [regions, paths, zoom]);

  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return <canvas ref={canvasRef} className="map-canvas" />;
};
```

### Memory Management

```typescript
// hooks/useMemoryOptimization.ts
export const useMemoryOptimization = () => {
  const [visibleFeatures, setVisibleFeatures] = useState<Feature[]>([]);

  const updateVisibleFeatures = useCallback((
    allFeatures: Feature[],
    viewport: Viewport,
    zoom: number
  ) => {
    // Only render features within viewport
    const visible = allFeatures.filter(feature => 
      isFeatureInViewport(feature, viewport, zoom)
    );
    
    setVisibleFeatures(visible);
  }, []);

  return { visibleFeatures, updateVisibleFeatures };
};
```

## 🔧 Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['./src/lib/coordinates', './src/lib/geometry']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

## 📊 Monitoring and Debugging

### Error Handling

```typescript
// lib/errorHandler.ts
export class ErrorHandler {
  static handle(error: Error, context?: string) {
    console.error(`Error in ${context}:`, error);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
    
    // Show user-friendly message
    return this.getUserMessage(error);
  }

  private static getUserMessage(error: Error): string {
    if (error.message.includes('Network')) {
      return 'Connection error. Please check your internet connection.';
    }
    if (error.message.includes('Unauthorized')) {
      return 'Please log in to continue.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export class PerformanceMonitor {
  static measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    console.log(`${componentName} render time: ${end - start}ms`);
    
    if (end - start > 16) { // > 60fps
      console.warn(`Slow render detected in ${componentName}`);
    }
  }

  static measureApiCall(endpoint: string, apiFn: () => Promise<any>) {
    const start = performance.now();
    
    return apiFn().finally(() => {
      const end = performance.now();
      console.log(`API call to ${endpoint}: ${end - start}ms`);
    });
  }
}
```

This developer guide provides the foundation for understanding and contributing to the Luminari Wilderness Editor codebase. For more specific implementation details, refer to the inline code documentation and the API documentation.
