import React from 'react';
import { MousePointer, MapPin, Square, Minus } from 'lucide-react';
import { DrawingTool } from '../types';

interface ToolPaletteProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export const ToolPalette: React.FC<ToolPaletteProps> = ({ currentTool, onToolChange }) => {
  const tools = [
    { id: 'select' as const, icon: MousePointer, label: 'Select', shortcut: 'S' },
    { id: 'point' as const, icon: MapPin, label: 'Point', shortcut: 'P' },
    { id: 'polygon' as const, icon: Square, label: 'Polygon', shortcut: 'G' },
    { id: 'linestring' as const, icon: Minus, label: 'Linestring', shortcut: 'L' }
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-3">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Drawing Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = currentTool === tool.id;
          
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`
                flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};