import { useState, useCallback } from 'react';
import { EditorState, DrawingTool, Coordinate, Region, Path, Point } from '../types';

const initialState: EditorState = {
  tool: 'select',
  zoom: 100,
  selectedItem: null,
  isDrawing: false,
  currentDrawing: [],
  showGrid: true,
  showRegions: true,
  showPaths: true,
  mousePosition: { x: 0, y: 0 }
};

// Mock data
const mockRegions: Region[] = [
  {
    id: '1',
    vnum: 101,
    name: 'Darkwood Forest',
    type: 'geographic',
    coordinates: [
      { x: 102, y: 205 },
      { x: 145, y: 210 },
      { x: 150, y: 180 },
      { x: 102, y: 175 }
    ],
    properties: 'Forest terrain',
    color: '#22C55E'
  },
  {
    id: '2',
    vnum: 102,
    name: 'Dragon\'s Lair',
    type: 'encounter',
    coordinates: [
      { x: -50, y: 50 },
      { x: -20, y: 60 },
      { x: -15, y: 30 },
      { x: -45, y: 20 }
    ],
    properties: 'High-level encounter zone',
    color: '#EF4444'
  }
];

const mockPaths: Path[] = [
  {
    id: '1',
    vnum: 201,
    name: 'Old Trade Road',
    type: 'road',
    coordinates: [
      { x: -100, y: -100 },
      { x: -50, y: -50 },
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 }
    ],
    color: '#8B5CF6'
  },
  {
    id: '2',
    vnum: 202,
    name: 'Moonlight River',
    type: 'river',
    coordinates: [
      { x: -80, y: 120 },
      { x: -40, y: 80 },
      { x: 20, y: 60 },
      { x: 80, y: 40 }
    ],
    color: '#06B6D4'
  }
];

const mockPoints: Point[] = [
  {
    id: '1',
    coordinate: { x: 75, y: 85 },
    name: 'Ancient Obelisk',
    type: 'landmark'
  },
  {
    id: '2',
    coordinate: { x: -60, y: -30 },
    name: 'Merchant Camp',
    type: 'poi'
  }
];

export const useEditor = () => {
  const [state, setState] = useState<EditorState>(initialState);
  const [regions, setRegions] = useState<Region[]>(mockRegions);
  const [paths, setPaths] = useState<Path[]>(mockPaths);
  const [points, setPoints] = useState<Point[]>(mockPoints);

  const setTool = useCallback((tool: DrawingTool) => {
    setState(prev => ({ ...prev, tool, isDrawing: false, currentDrawing: [] }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom }));
  }, []);

  const setMousePosition = useCallback((coordinate: Coordinate) => {
    setState(prev => ({ ...prev, mousePosition: coordinate }));
  }, []);

  const toggleLayer = useCallback((layer: 'grid' | 'regions' | 'paths') => {
    setState(prev => ({ 
      ...prev, 
      [`show${layer.charAt(0).toUpperCase() + layer.slice(1)}`]: 
        !prev[`show${layer.charAt(0).toUpperCase() + layer.slice(1)}` as keyof EditorState] 
    }));
  }, []);

  const selectItem = useCallback((item: Region | Path | Point | null) => {
    setState(prev => ({ ...prev, selectedItem: item }));
  }, []);

  const handleCanvasClick = useCallback((coordinate: Coordinate) => {
    if (state.tool === 'point') {
      const newPoint: Point = {
        id: Date.now().toString(),
        coordinate,
        name: `New Point ${points.length + 1}`,
        type: 'landmark'
      };
      setPoints(prev => [...prev, newPoint]);
      selectItem(newPoint);
    } else if (state.tool === 'polygon' || state.tool === 'linestring') {
      setState(prev => ({
        ...prev,
        isDrawing: true,
        currentDrawing: [...prev.currentDrawing, coordinate]
      }));
    }
  }, [state.tool, points.length, selectItem]);

  const finishDrawing = useCallback(() => {
    if (state.currentDrawing.length >= 2) {
      if (state.tool === 'polygon' && state.currentDrawing.length >= 3) {
        const newRegion: Region = {
          id: Date.now().toString(),
          vnum: regions.length + 103,
          name: `New Region ${regions.length + 1}`,
          type: 'geographic',
          coordinates: state.currentDrawing,
          properties: 'Custom region',
          color: '#F59E0B'
        };
        setRegions(prev => [...prev, newRegion]);
        selectItem(newRegion);
      } else if (state.tool === 'linestring') {
        const newPath: Path = {
          id: Date.now().toString(),
          vnum: paths.length + 203,
          name: `New Path ${paths.length + 1}`,
          type: 'road',
          coordinates: state.currentDrawing,
          color: '#EC4899'
        };
        setPaths(prev => [...prev, newPath]);
        selectItem(newPath);
      }
    }
    setState(prev => ({ ...prev, isDrawing: false, currentDrawing: [] }));
  }, [state.currentDrawing, state.tool, regions.length, paths.length, selectItem]);

  const updateSelectedItem = useCallback((updates: Partial<Region | Path | Point>) => {
    if (!state.selectedItem) return;

    if ('coordinates' in state.selectedItem) {
      if ('vnum' in state.selectedItem && 'type' in state.selectedItem) {
        // It's a Region or Path
        if (state.selectedItem.coordinates.length > 2) {
          // It's a Region
          setRegions(prev => prev.map(region => 
            region.id === state.selectedItem!.id 
              ? { ...region, ...updates } as Region
              : region
          ));
        } else {
          // It's a Path
          setPaths(prev => prev.map(path => 
            path.id === state.selectedItem!.id 
              ? { ...path, ...updates } as Path
              : path
          ));
        }
      }
    } else {
      // It's a Point
      setPoints(prev => prev.map(point => 
        point.id === state.selectedItem!.id 
          ? { ...point, ...updates } as Point
          : point
      ));
    }
    
    setState(prev => ({ ...prev, selectedItem: { ...prev.selectedItem!, ...updates } }));
  }, [state.selectedItem]);

  return {
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
  };
};