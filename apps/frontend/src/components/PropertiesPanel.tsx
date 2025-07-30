import React, { useCallback } from 'react';
import { Save, RotateCcw, Trash2, Plus } from 'lucide-react';
import { Region, Path, Point } from '../types';

interface PropertiesPanelProps {
  selectedItem: Region | Path | Point | null;
  onUpdate: (updates: Partial<Region | Path | Point>) => void;
  onFinishDrawing?: () => void;
  isDrawing: boolean;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  onUpdate,
  onFinishDrawing,
  isDrawing
}) => {
  const COORDINATE_BOUNDS = { min: -1024, max: 1024 };
  
  // Validation and sanitization functions
  const validateCoordinate = useCallback((value: number): number => {
    const num = Math.round(value);
    return Math.max(COORDINATE_BOUNDS.min, Math.min(COORDINATE_BOUNDS.max, num));
  }, [COORDINATE_BOUNDS.min, COORDINATE_BOUNDS.max]);
  
  const validateVnum = useCallback((value: number): number => {
    return Math.max(1, Math.min(99999, Math.round(value)));
  }, []);
  
  const sanitizeText = useCallback((text: string): string => {
    return text.trim().slice(0, 100); // Limit length and trim whitespace
  }, []);
  if (isDrawing) {
    return (
      <div className="p-4 bg-gray-900">
        <h3 className="text-lg font-semibold text-white mb-4">Drawing Mode</h3>
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-4">
          <h4 className="text-blue-200 font-medium text-sm mb-2">Instructions</h4>
          <ul className="text-blue-100 text-xs space-y-1">
            <li>• Click on the map to add points</li>
            <li>• Press <kbd className="bg-blue-800 px-1 rounded text-xs">Enter</kbd> to finish drawing</li>
            <li>• Press <kbd className="bg-blue-800 px-1 rounded text-xs">Escape</kbd> to cancel</li>
            <li>• Minimum points: Polygon (3), Path (2)</li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={onFinishDrawing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={16} />
            Finish Drawing
          </button>
          
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw size={16} />
            Cancel Drawing
          </button>
        </div>
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <div className="p-4 bg-gray-900">
        <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
        <p className="text-gray-400">Select an item to edit its properties</p>
      </div>
    );
  }

  const isPoint = 'coordinate' in selectedItem;
  const isRegion = !isPoint && 'vnum' in selectedItem && 'coordinates' in selectedItem && selectedItem.coordinates.length >= 3;
  const isPath = !isPoint && !isRegion && 'vnum' in selectedItem && 'coordinates' in selectedItem;

  return (
    <div className="p-4 bg-gray-900 space-y-4 max-h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {isRegion ? 'Region' : isPath ? 'Path' : 'Point'}
        </h3>
        <button className="text-red-400 hover:text-red-300 p-1">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Common fields */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <input
          type="text"
          value={selectedItem.name}
          onChange={(e) => onUpdate({ name: sanitizeText(e.target.value) })}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={100}
        />
      </div>

      {/* VNUM for regions and paths */}
      {('vnum' in selectedItem) && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">VNUM</label>
          <input
            type="number"
            value={selectedItem.vnum}
            onChange={(e) => onUpdate({ vnum: validateVnum(parseInt(e.target.value) || 1) })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="99999"
          />
        </div>
      )}

      {/* Type selection */}
      {isRegion && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={(selectedItem as Region).type}
            onChange={(e) => onUpdate({ type: e.target.value as Region['type'] })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="geographic">Geographic</option>
            <option value="encounter">Encounter</option>
            <option value="sector_transform">Sector Transform</option>
            <option value="sector">Sector</option>
          </select>
        </div>
      )}

      {isPath && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={(selectedItem as Path).type}
            onChange={(e) => onUpdate({ type: e.target.value as Path['type'] })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="road">Road</option>
            <option value="dirt_road">Dirt Road</option>
            <option value="geographic">Geographic</option>
            <option value="river">River</option>
            <option value="stream">Stream</option>
          </select>
        </div>
      )}

      {isPoint && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
          <select
            value={(selectedItem as Point).type}
            onChange={(e) => onUpdate({ type: e.target.value as Point['type'] })}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="landmark">Landmark</option>
            <option value="poi">Point of Interest</option>
          </select>
        </div>
      )}

      {/* Properties for regions */}
      {isRegion && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Properties</label>
          <textarea
            value={(selectedItem as Region).properties}
            onChange={(e) => onUpdate({ properties: e.target.value })}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* Coordinates */}
      {isPoint ? (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Coordinate</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">X</label>
              <input
                type="number"
                value={(selectedItem as Point).coordinate.x}
                onChange={(e) => onUpdate({ 
                  coordinate: { 
                    ...(selectedItem as Point).coordinate, 
                    x: validateCoordinate(parseInt(e.target.value) || 0) 
                  } 
                })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-blue-500"
                min={COORDINATE_BOUNDS.min}
                max={COORDINATE_BOUNDS.max}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Y</label>
              <input
                type="number"
                value={(selectedItem as Point).coordinate.y}
                onChange={(e) => onUpdate({ 
                  coordinate: { 
                    ...(selectedItem as Point).coordinate, 
                    y: validateCoordinate(parseInt(e.target.value) || 0) 
                  } 
                })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-blue-500"
                min={COORDINATE_BOUNDS.min}
                max={COORDINATE_BOUNDS.max}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">Points</label>
            <button className="text-blue-400 hover:text-blue-300 p-1">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {('coordinates' in selectedItem ? selectedItem.coordinates : []).map((coord, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded">
                <span className="text-xs text-gray-400 w-4">{index + 1}.</span>
                <div className="grid grid-cols-2 gap-1 flex-1">
                  <input
                    type="number"
                    value={coord.x}
                    onChange={(e) => {
                      const newCoords = [...(selectedItem as Region | Path).coordinates];
                      newCoords[index] = { ...coord, x: validateCoordinate(parseInt(e.target.value) || 0) };
                      onUpdate({ coordinates: newCoords });
                    }}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="X"
                    min={COORDINATE_BOUNDS.min}
                    max={COORDINATE_BOUNDS.max}
                  />
                  <input
                    type="number"
                    value={coord.y}
                    onChange={(e) => {
                      const newCoords = [...(selectedItem as Region | Path).coordinates];
                      newCoords[index] = { ...coord, y: validateCoordinate(parseInt(e.target.value) || 0) };
                      onUpdate({ coordinates: newCoords });
                    }}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-blue-500"
                    placeholder="Y"
                    min={COORDINATE_BOUNDS.min}
                    max={COORDINATE_BOUNDS.max}
                  />
                </div>
                <button className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-700">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Save size={16} />
          Save
        </button>
        <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
};