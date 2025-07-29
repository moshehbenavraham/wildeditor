import React from 'react';
import { Coordinate } from '../types';

interface StatusBarProps {
  mousePosition: Coordinate;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ mousePosition, zoom, onZoomChange }) => {
  const zoomLevels = [50, 75, 100, 150, 200, 300];

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="text-gray-300">
          Mouse: ({mousePosition.x}, {mousePosition.y})
        </span>
        <div className="w-px h-4 bg-gray-600"></div>
        <span className="text-gray-300">
          Server: <span className="text-green-400">Development</span>
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-gray-300">Zoom:</span>
        <select
          value={zoom}
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:ring-1 focus:ring-blue-500"
        >
          {zoomLevels.map(level => (
            <option key={level} value={level}>{level}%</option>
          ))}
        </select>
      </div>
    </div>
  );
};