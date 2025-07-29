# Wilderness Editor TODO List

## 🎉 Monorepo Transformation Complete!

The project has been successfully transformed into a monorepo structure with:
- ✅ Frontend in `apps/frontend/`
- ✅ Backend API in `apps/backend/` (Express/TypeScript)
- ✅ Shared types in `packages/shared/`
- ✅ Turborepo for build orchestration
- ✅ API integration replacing mock data

## 🚨 Immediate Setup Required

### 1. Environment Configuration
- [ ] Create `.env` files in both frontend and backend
- [ ] Add Supabase credentials (URL, anon key, service key)
- [ ] Verify API URL configuration (default: http://localhost:3001/api)
- [ ] Test Supabase connection

### 2. Database Setup
- [ ] Create Supabase project if not exists
- [ ] Enable PostGIS extension in Supabase
- [ ] Run table creation SQL from CLAUDE.md
- [ ] Verify tables created successfully
- [ ] Test database connectivity from backend

### 3. Development Environment
- [ ] Install dependencies: `npm install`
- [ ] Fix any npm workspace issues (may need npm 9+)
- [ ] Test `npm run dev` starts both services
- [ ] Verify frontend on :5173, backend on :3001
- [ ] Check health endpoint: http://localhost:3001/api/health

## Critical Issues - Frontend Stabilization

### 1. State Management Architecture ❗
- [ ] **Refactor useEditor hook** - Now integrated with API
  - [ ] Split API calls from UI state management
  - [ ] Implement proper loading and error states
  - [ ] Add optimistic updates for better UX
- [ ] **Fix state synchronization issues**
  - [ ] Updates in PropertiesPanel don't reflect on canvas properly
  - [ ] Selected item state gets out of sync
  - [ ] Drawing state cleanup is inconsistent
- [ ] **API Integration Polish**
  - [ ] Add retry logic for failed requests
  - [ ] Implement proper error boundaries
  - [ ] Add request debouncing where appropriate

### 2. Selection Tool Bugs 🐛
- [ ] **Fix selection detection in MapCanvas**
  - [ ] Current implementation uses crude distance checks
  - [ ] Need proper point-in-polygon algorithm for regions
  - [ ] Need point-to-line distance for paths
  - [ ] Selection hit boxes are inconsistent
- [ ] **Visual feedback improvements**
  - [ ] Selected item highlight doesn't always show
  - [ ] No hover states for selectable items
  - [ ] Selection outline thickness inconsistent
- [ ] **Multi-selection support**
  - [ ] Ctrl+click for multiple items
  - [ ] Marquee selection tool
  - [ ] Bulk operations

### 3. Drawing Tools Completion 🎨
- [ ] **Polygon Tool**
  - [ ] Fix polygon closing - currently requires manual finishDrawing()
  - [ ] Add click-on-first-point to close
  - [ ] Implement vertex editing after creation
  - [ ] Add vertex deletion
  - [ ] Prevent self-intersecting polygons
  - [ ] Support for holes (interior rings)
- [ ] **Linestring Tool**  
  - [ ] Add vertex editing after creation
  - [ ] Implement vertex insertion
  - [ ] Add vertex deletion
  - [ ] Smooth curve option
- [ ] **General Drawing**
  - [ ] Right-click to finish drawing
  - [ ] Double-click to finish drawing
  - [ ] ESC to cancel current drawing
  - [ ] Visual feedback for drawing mode
  - [ ] Snap-to-grid option
  - [ ] Snap-to-vertex option

### 4. Coordinate System Issues 📐
- [ ] **Fix coordinate editing in PropertiesPanel**
  - [ ] Changes to coordinates don't update canvas
  - [ ] updateSelectedItem doesn't properly detect coordinate changes
  - [ ] Need immediate visual feedback
- [ ] **Coordinate validation**
  - [ ] Enforce -1024 to +1024 bounds
  - [ ] Prevent invalid coordinate entries
  - [ ] Show warnings for out-of-bounds
- [ ] **Coordinate precision**
  - [ ] Currently rounds to integers - is this desired?
  - [ ] Consider decimal support for smoother drawing

### 5. Canvas Performance & Rendering <�
- [ ] **Optimize MapCanvas component (356 lines)**
  - [ ] Split into smaller components
  - [ ] Memoize expensive calculations
  - [ ] Use React.memo for child components
  - [ ] Implement virtual canvas for large datasets
- [ ] **Rendering optimizations**
  - [ ] Currently re-renders entire canvas on any change
  - [ ] Implement dirty region tracking
  - [ ] Use requestAnimationFrame for smooth updates
  - [ ] Consider WebGL for better performance
- [ ] **Zoom improvements**
  - [ ] Zoom to mouse cursor position
  - [ ] Smooth zoom transitions
  - [ ] Zoom with mouse wheel
  - [ ] Fit-to-screen option

## High Priority Features

### 6. Error Handling & Validation =�
- [ ] **Add error boundaries**
  - [ ] Wrap MapCanvas in error boundary
  - [ ] Wrap PropertiesPanel in error boundary
  - [ ] Global error handler
- [ ] **Input validation**
  - [ ] Validate all numeric inputs
  - [ ] Validate coordinate bounds
  - [ ] Validate polygon/path minimum points
  - [ ] Show user-friendly error messages
- [ ] **TypeScript improvements**
  - [ ] Replace `any` types in error catches
  - [ ] Add proper error types
  - [ ] Strict null checks

### 7. User Experience Improvements =�
- [ ] **Visual feedback**
  - [ ] Loading states for async operations
  - [ ] Success/error toasts
  - [ ] Tool cursor changes
  - [ ] Active tool indicator in UI
  - [ ] Keyboard shortcut hints
- [ ] **Tooltips and help**
  - [ ] Tool descriptions on hover
  - [ ] Keyboard shortcut reference
  - [ ] Coordinate system explanation
  - [ ] Interactive tutorial
- [ ] **Accessibility**
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] High contrast mode
  - [ ] Focus indicators

### 8. Data Persistence =�
- [ ] **Local storage**
  - [ ] Save work in progress
  - [ ] Recover from browser crash
  - [ ] Export/import JSON
- [ ] **Session management**
  - [ ] Track unsaved changes
  - [ ] Warn before leaving with unsaved work
  - [ ] Auto-save timer
- [ ] **Change tracking**
  - [ ] Show modified items
  - [ ] Change summary panel
  - [ ] Diff view

## Medium Priority Features

### 9. Advanced Editing Features 
- [ ] **Undo/Redo system**
  - [ ] Command pattern implementation
  - [ ] Undo stack with history limit
  - [ ] Keyboard shortcuts (Ctrl+Z/Y)
- [ ] **Copy/Paste**
  - [ ] Copy selected items
  - [ ] Paste with offset
  - [ ] Duplicate in place
- [ ] **Transform tools**
  - [ ] Move selected items
  - [ ] Rotate regions/paths
  - [ ] Scale regions/paths
  - [ ] Mirror/flip

### 10. Layer System Enhancements <�
- [ ] **Layer management**
  - [ ] Reorder layers
  - [ ] Layer opacity
  - [ ] Layer locking
  - [ ] Custom layers
- [ ] **Visual options**
  - [ ] Color customization per item
  - [ ] Fill pattern options
  - [ ] Stroke width options
  - [ ] Label display toggle

### 11. Testing Infrastructure >�
- [ ] **Unit tests**
  - [ ] Test coordinate conversions
  - [ ] Test selection algorithms
  - [ ] Test state updates
  - [ ] Test validation logic
- [ ] **Integration tests**
  - [ ] Test drawing workflows
  - [ ] Test editing workflows
  - [ ] Test keyboard shortcuts
- [ ] **E2E tests**
  - [ ] Complete user journeys
  - [ ] Cross-browser testing
  - [ ] Performance benchmarks

## Low Priority Features

### 12. Advanced Features =�
- [ ] **Collaboration**
  - [ ] WebSocket for real-time updates
  - [ ] User cursors
  - [ ] Conflict resolution
  - [ ] Activity feed
- [ ] **Templates**
  - [ ] Save region/path as template
  - [ ] Template library
  - [ ] Quick shapes (rectangle, circle)
- [ ] **Map features**
  - [ ] Background image support
  - [ ] Multiple map layers
  - [ ] Minimap navigation
  - [ ] Measurement tools

### 13. Export/Import Features =�
- [ ] **Export formats**
  - [ ] JSON export
  - [ ] SQL export
  - [ ] Image export (PNG/SVG)
  - [ ] PDF export
- [ ] **Import formats**
  - [ ] JSON import
  - [ ] CSV coordinate import
  - [ ] Batch import

### 14. Documentation & Help =�
- [ ] **User documentation**
  - [ ] Getting started guide
  - [ ] Video tutorials
  - [ ] Feature documentation
  - [ ] FAQ section
- [ ] **Developer documentation**
  - [ ] API documentation
  - [ ] Architecture guide
  - [ ] Contributing guidelines
  - [ ] Plugin system

## Backend Enhancement & Python Migration

### 15. Current Backend Status ✅
- [x] **Express/TypeScript API** - Temporary implementation complete
  - [x] RESTful endpoints for regions, paths, points
  - [x] Supabase integration
  - [x] JWT authentication middleware
  - [x] CORS and security configured
- [ ] **Production Readiness**
  - [ ] Add request validation (Joi/Zod)
  - [ ] Implement rate limiting
  - [ ] Add API documentation (Swagger/OpenAPI)
  - [ ] Set up logging (Winston/Pino)
  - [ ] Add monitoring/metrics

### 16. Python Backend Migration 🐍
- [ ] **Python FastAPI backend**
  - [ ] Project setup
  - [ ] Database models
  - [ ] REST endpoints
  - [ ] Authentication middleware
- [ ] **Frontend integration**
  - [ ] API service layer
  - [ ] Replace mock data
  - [ ] Error handling
  - [ ] Loading states
- [ ] **Real-time features**
  - [ ] WebSocket setup
  - [ ] Live updates
  - [ ] Presence indicators

## Bug Fixes Needed

### Current Bugs =
1. **Selection state doesn't persist** - Clicking same item multiple times loses selection
2. **Coordinate updates don't render** - Changing X/Y in properties doesn't update canvas
3. **Path detection too sensitive** - Hard to select specific path points
4. **Polygon closing unintuitive** - Users don't know how to close polygons
5. **No feedback for invalid operations** - Silent failures confuse users
6. **Zoom doesn't center properly** - Canvas jumps when zooming
7. **Drawing mode escape** - Can't cancel drawing with ESC
8. **Memory leaks** - Event listeners not cleaned up properly
9. **Type errors in console** - Two `any` catches need proper types
10. **Save/Reset buttons don't work** - UI only, no functionality

## Performance Metrics to Track

- [ ] Canvas render time < 16ms (60fps)
- [ ] Selection response < 50ms  
- [ ] Coordinate update < 100ms
- [ ] Initial load time < 2s
- [ ] Memory usage < 100MB for 1000 items

## Code Quality Goals

- [ ] 80%+ test coverage
- [ ] 0 TypeScript errors
- [ ] 0 ESLint warnings
- [ ] All components < 200 lines
- [ ] All functions < 50 lines
- [ ] Consistent naming conventions
- [ ] Proper error handling throughout

---

*Last Updated: January 30, 2025*
*Status: Monorepo transformation complete, backend API operational*
*Priority: Immediate Setup > Critical > High > Medium > Low*
*Estimated effort to stabilize current features: 2-3 weeks*
*Estimated effort for complete feature set: 2-3 months*