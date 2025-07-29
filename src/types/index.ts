export interface Coordinate {
  x: number;
  y: number;
}

export interface Point {
  id: string;
  coordinate: Coordinate;
  name: string;
  type: 'landmark' | 'poi';
}

export interface Region {
  id: string;
  vnum: number;
  name: string;
  type: 'geographic' | 'encounter' | 'sector_transform' | 'sector';
  coordinates: Coordinate[];
  properties: string;
  color: string;
}

export interface Path {
  id: string;
  vnum: number;
  name: string;
  type: 'road' | 'dirt_road' | 'geographic' | 'river' | 'stream';
  coordinates: Coordinate[];
  color: string;
}

export type DrawingTool = 'select' | 'point' | 'polygon' | 'linestring';

export interface EditorState {
  tool: DrawingTool;
  zoom: number;
  selectedItem: Region | Path | Point | null;
  isDrawing: boolean;
  currentDrawing: Coordinate[];
  showGrid: boolean;
  showRegions: boolean;
  showPaths: boolean;
  mousePosition: Coordinate;
}