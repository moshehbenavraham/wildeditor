import React from 'react';
import { Grid, Map, Route } from 'lucide-react';

interface LayerControlsProps {
  showGrid: boolean;
  showRegions: boolean;
  showPaths: boolean;
  onToggleLayer: (layer: 'grid' | 'regions' | 'paths') => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  showGrid,
  showRegions,
  showPaths,
  onToggleLayer
}) => {
  const layers = [
    { id: 'grid' as const, icon: Grid, label: 'Grid', visible: showGrid },
    { id: 'regions' as const, icon: Map, label: 'Regions', visible: showRegions },
    { id: 'paths' as const, icon: Route, label: 'Paths', visible: showPaths }
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-3">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Layers</h3>
      <div className="space-y-2">
        {layers.map(layer => {
          const Icon = layer.icon;
          
          return (
            <label
              key={layer.id}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer"
            >
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => onToggleLayer(layer.id)}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Icon size={16} />
              <span>{layer.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};