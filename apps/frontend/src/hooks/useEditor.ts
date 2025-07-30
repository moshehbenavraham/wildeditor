import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { apiClient } from '../services/api';
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

export const useEditor = () => {
  const { session } = useAuth();
  const [state, setState] = useState<EditorState>(initialState);
  const [regions, setRegions] = useState<Region[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set API token when session changes
  useEffect(() => {
    if (session?.access_token) {
      apiClient.setToken(session.access_token);
    }
  }, [session]);

  // Load data from API
  const loadData = useCallback(async () => {
    if (!session?.access_token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [regionsData, pathsData, pointsData] = await Promise.all([
        apiClient.getRegions(),
        apiClient.getPaths(),
        apiClient.getPoints()
      ]);
      
      setRegions(regionsData);
      setPaths(pathsData);
      setPoints(pointsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      
      // Fallback to mock data on error
      setRegions([
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
        }
      ]);
      setPaths([
        {
          id: '1',
          vnum: 201,
          name: 'Old Trade Road',
          type: 'road',
          coordinates: [
            { x: -100, y: -100 },
            { x: 0, y: 0 },
            { x: 100, y: 100 }
          ],
          color: '#8B5CF6'
        }
      ]);
      setPoints([
        {
          id: '1',
          coordinate: { x: 75, y: 85 },
          name: 'Ancient Obelisk',
          type: 'landmark'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Load data when session is available
  useEffect(() => {
    loadData();
  }, [loadData]);

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
      
      // Optimistic update
      setPoints(prev => [...prev, newPoint]);
      selectItem(newPoint);
      
      // Save to API
      if (session?.access_token) {
        apiClient.createPoint(newPoint).catch(err => {
          console.error('Failed to create point:', err);
          // Revert optimistic update
          setPoints(prev => prev.filter(p => p.id !== newPoint.id));
          setError('Failed to create point');
        });
      }
    } else if (state.tool === 'polygon' || state.tool === 'linestring') {
      setState(prev => ({
        ...prev,
        isDrawing: true,
        currentDrawing: [...prev.currentDrawing, coordinate]
      }));
    }
  }, [state.tool, points.length, selectItem, session?.access_token]);

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
        
        // Optimistic update
        setRegions(prev => [...prev, newRegion]);
        selectItem(newRegion);
        
        // Save to API
        if (session?.access_token) {
          apiClient.createRegion(newRegion).catch(err => {
            console.error('Failed to create region:', err);
            // Revert optimistic update
            setRegions(prev => prev.filter(r => r.id !== newRegion.id));
            setError('Failed to create region');
          });
        }
      } else if (state.tool === 'linestring') {
        const newPath: Path = {
          id: Date.now().toString(),
          vnum: paths.length + 203,
          name: `New Path ${paths.length + 1}`,
          type: 'road',
          coordinates: state.currentDrawing,
          color: '#EC4899'
        };
        
        // Optimistic update
        setPaths(prev => [...prev, newPath]);
        selectItem(newPath);
        
        // Save to API
        if (session?.access_token) {
          apiClient.createPath(newPath).catch(err => {
            console.error('Failed to create path:', err);
            // Revert optimistic update
            setPaths(prev => prev.filter(p => p.id !== newPath.id));
            setError('Failed to create path');
          });
        }
      }
    }
    setState(prev => ({ ...prev, isDrawing: false, currentDrawing: [] }));
  }, [state.currentDrawing, state.tool, regions.length, paths.length, selectItem, session?.access_token]);

  const updateSelectedItem = useCallback((updates: Partial<Region | Path | Point>) => {
    if (!state.selectedItem) return;

    const itemId = state.selectedItem.id;
    
    if ('coordinates' in state.selectedItem) {
      if ('vnum' in state.selectedItem && 'type' in state.selectedItem) {
        // It's a Region or Path
        if (state.selectedItem.coordinates.length >= 3) {
          // It's a Region
          setRegions(prev => prev.map(region => 
            region.id === itemId
              ? { ...region, ...updates } as Region
              : region
          ));
          
          // Save to API
          if (session?.access_token) {
            apiClient.updateRegion(itemId, updates).catch(err => {
              console.error('Failed to update region:', err);
              setError('Failed to update region');
            });
          }
        } else {
          // It's a Path
          setPaths(prev => prev.map(path => 
            path.id === itemId
              ? { ...path, ...updates } as Path
              : path
          ));
          
          // Save to API
          if (session?.access_token) {
            apiClient.updatePath(itemId, updates).catch(err => {
              console.error('Failed to update path:', err);
              setError('Failed to update path');
            });
          }
        }
      }
    } else {
      // It's a Point
      setPoints(prev => prev.map(point => 
        point.id === itemId
          ? { ...point, ...updates } as Point
          : point
      ));
      
      // Save to API
      if (session?.access_token) {
        apiClient.updatePoint(itemId, updates).catch(err => {
          console.error('Failed to update point:', err);
          setError('Failed to update point');
        });
      }
    }
    
    setState(prev => ({ ...prev, selectedItem: { ...prev.selectedItem!, ...updates } }));
  }, [state.selectedItem, session]);

  return {
    state,
    regions,
    paths,
    points,
    loading,
    error,
    setTool,
    setZoom,
    setMousePosition,
    toggleLayer,
    selectItem,
    handleCanvasClick,
    finishDrawing,
    updateSelectedItem,
    loadData
  };
};