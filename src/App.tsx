import React, { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MapCanvas } from './components/MapCanvas';
import { ToolPalette } from './components/ToolPalette';
import { LayerControls } from './components/LayerControls';
import { PropertiesPanel } from './components/PropertiesPanel';
import { StatusBar } from './components/StatusBar';
import { useEditor } from './hooks/useEditor';
import { useAuth } from './hooks/useAuth';
import { User, Settings, LogOut } from 'lucide-react';

function App() {
  const { user, signOut } = useAuth();
  const {
    state,
    regions,
    paths,
    points,
    setTool,
    setZoom,
    setMousePosition,
    toggleLayer,
    selectItem,
    handleCanvasClick,
    finishDrawing,
    updateSelectedItem
  } = useEditor();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key.toLowerCase()) {
        case 's':
          setTool('select');
          break;
        case 'p':
          setTool('point');
          break;
        case 'g':
          setTool('polygon');
          break;
        case 'l':
          setTool('linestring');
          break;
        case 'escape':
          selectItem(null);
          break;
        case 'enter':
          if (state.isDrawing) {
            finishDrawing();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setTool, selectItem, state.isDrawing, finishDrawing]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Luminari Wilderness Editor</h1>
            <div className="text-sm text-gray-400">
              Zone: Darkwood Forest • Build: v1.0.0-dev
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings size={18} />
            </button>
            <div className="flex items-center gap-2 text-gray-300">
              <User size={16} />
              <span className="text-sm">{user?.email}</span>
            </div>
            <button 
              onClick={handleSignOut}
              className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
            <ToolPalette currentTool={state.tool} onToolChange={setTool} />
            <LayerControls
              showGrid={state.showGrid}
              showRegions={state.showRegions}
              showPaths={state.showPaths}
              onToggleLayer={toggleLayer}
            />
            <div className="flex-1"></div>
          </div>

          {/* Map canvas */}
          <MapCanvas
            state={state}
            regions={regions}
            paths={paths}
            points={points}
            onMouseMove={setMousePosition}
            onClick={handleCanvasClick}
            onSelectItem={selectItem}
          />

          {/* Right sidebar */}
          <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
            <PropertiesPanel
              selectedItem={state.selectedItem}
              onUpdate={updateSelectedItem}
              onFinishDrawing={finishDrawing}
              isDrawing={state.isDrawing}
            />
          </div>
        </div>

        {/* Status bar */}
        <StatusBar
          mousePosition={state.mousePosition}
          zoom={state.zoom}
          onZoomChange={setZoom}
        />
      </div>
    </ProtectedRoute>
  );
}

export default App;