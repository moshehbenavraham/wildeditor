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
      
      // Clear data on error - no more fallback mock data
      setRegions([]);
      setPaths([]);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Load data when session is available
  useEffect(() => {
    loadData();
  }, [loadData]);

  const setTool = useCallback((tool: DrawingTool) => {
    console.log('[Drawing] Tool change:', state.tool, '->', tool);
    setState(prev => {
      // If we're currently drawing and switching tools, we need to clean up
      if (prev.isDrawing) {
        console.warn('[Drawing] Tool changed while drawing, canceling current drawing:', {
          previousTool: prev.tool,
          newTool: tool,
          pointsDrawn: prev.currentDrawing.length
        });
      }
      
      return { 
        ...prev, 
        tool, 
        isDrawing: false, 
        currentDrawing: [],
        // Clear selection when switching to non-select tools
        selectedItem: tool === 'select' ? prev.selectedItem : null
      };
    });
  }, [state.tool]);

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
    if (item) {
      console.log('[Selection] Item selected:', {
        type: 'coordinates' in item ? ('vnum' in item ? 'region/path' : 'unknown') : 'point',
        id: item.id,
        name: 'name' in item ? item.name : 'unknown'
      });
    } else {
      console.log('[Selection] Selection cleared');
    }
    setState(prev => ({ ...prev, selectedItem: item }));
  }, []);

  const handleCanvasClick = useCallback((coordinate: Coordinate) => {
    console.log('[Drawing] Canvas click:', {
      tool: state.tool,
      coordinate,
      isDrawing: state.isDrawing,
      currentPoints: state.currentDrawing.length
    });
    
    // Validate coordinate bounds
    if (coordinate.x < -1024 || coordinate.x > 1024 || coordinate.y < -1024 || coordinate.y > 1024) {
      console.error('[Drawing] Coordinate out of bounds:', {
        coordinate,
        validRange: { min: -1024, max: 1024 }
      });
      setError('Coordinate out of valid range (-1024 to 1024)');
      return;
    }

    if (state.tool === 'point') {
      const newPoint: Point = {
        id: Date.now().toString(),
        coordinate,
        name: `New Point ${points.length + 1}`,
        type: 'landmark'
      };
      
      console.log('[Drawing] Creating new point:', {
        id: newPoint.id,
        coordinate: newPoint.coordinate,
        name: newPoint.name
      });
      
      // Optimistic update
      setPoints(prev => [...prev, newPoint]);
      selectItem(newPoint);
      
      // Save to API
      if (session?.access_token) {
        apiClient.createPoint(newPoint)
          .then(() => {
            console.log('[Drawing] Point created successfully:', newPoint.id);
          })
          .catch(err => {
            console.error('[Drawing] Failed to create point:', {
              error: err,
              point: newPoint,
              message: err.message || 'Unknown error'
            });
            // Revert optimistic update
            setPoints(prev => prev.filter(p => p.id !== newPoint.id));
            setError('Failed to create point: ' + (err.message || 'Unknown error'));
          });
      } else {
        console.warn('[Drawing] No auth token, point saved locally only');
      }
    } else if (state.tool === 'polygon' || state.tool === 'linestring') {
      const newPointCount = state.currentDrawing.length + 1;
      console.log('[Drawing] Adding point to', state.tool, ':', {
        pointNumber: newPointCount,
        coordinate,
        requiredPoints: state.tool === 'polygon' ? 3 : 2
      });
      
      setState(prev => ({
        ...prev,
        isDrawing: true,
        currentDrawing: [...prev.currentDrawing, coordinate]
      }));
    }
  }, [state.tool, points.length, selectItem, session?.access_token]);

  const cancelDrawing = useCallback(() => {
    console.log('[Drawing] Canceling drawing:', {
      tool: state.tool,
      pointsDrawn: state.currentDrawing.length
    });
    setState(prev => ({ ...prev, isDrawing: false, currentDrawing: [] }));
    setError(null); // Clear any drawing-related errors
  }, [state.tool, state.currentDrawing.length]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const finishDrawing = useCallback(() => {
    console.log('[Drawing] Attempting to finish drawing:', {
      tool: state.tool,
      isDrawing: state.isDrawing,
      pointsDrawn: state.currentDrawing.length,
      coordinates: state.currentDrawing
    });
    
    if (!state.isDrawing) {
      console.error('[Drawing] finishDrawing called but not currently drawing');
      return;
    }

    // Validate minimum points for each shape type
    const minPointsForTool = {
      polygon: 3,
      linestring: 2
    };

    const minPoints = minPointsForTool[state.tool as keyof typeof minPointsForTool];
    
    if (state.currentDrawing.length < minPoints) {
      const errorMsg = `${state.tool === 'polygon' ? 'Polygon' : 'Path'} requires at least ${minPoints} points`;
      console.error('[Drawing] Not enough points:', {
        tool: state.tool,
        currentPoints: state.currentDrawing.length,
        requiredPoints: minPoints
      });
      setError(errorMsg);
      return;
    }

    // Clear any previous errors
    setError(null);

    if (state.tool === 'polygon' && state.currentDrawing.length >= 3) {
      const newRegion: Region = {
        id: Date.now().toString(),
        vnum: regions.length + 103,
        name: `New Region ${regions.length + 1}`,
        type: 'geographic',
        coordinates: [...state.currentDrawing], // Create a copy to avoid reference issues
        properties: 'Custom region',
        color: '#F59E0B'
      };
      
      console.log('[Drawing] Creating new region:', {
        id: newRegion.id,
        vnum: newRegion.vnum,
        points: newRegion.coordinates.length,
        type: newRegion.type
      });
      
      // Optimistic update
      setRegions(prev => [...prev, newRegion]);
      selectItem(newRegion);
      
      // Save to API
      if (session?.access_token) {
        apiClient.createRegion(newRegion)
          .then(() => {
            console.log('[Drawing] Region created successfully:', newRegion.id);
          })
          .catch(err => {
            console.error('[Drawing] Failed to create region:', {
              error: err,
              region: newRegion,
              message: err.message || 'Unknown error'
            });
            // Revert optimistic update
            setRegions(prev => prev.filter(r => r.id !== newRegion.id));
            setError('Failed to create region: ' + (err.message || 'Unknown error'));
          });
      } else {
        console.warn('[Drawing] No auth token, region saved locally only');
      }
    } else if (state.tool === 'linestring' && state.currentDrawing.length >= 2) {
      const newPath: Path = {
        id: Date.now().toString(),
        vnum: paths.length + 203,
        name: `New Path ${paths.length + 1}`,
        type: 'road',
        coordinates: [...state.currentDrawing], // Create a copy to avoid reference issues
        color: '#EC4899'
      };
      
      console.log('[Drawing] Creating new path:', {
        id: newPath.id,
        vnum: newPath.vnum,
        points: newPath.coordinates.length,
        type: newPath.type
      });
      
      // Optimistic update
      setPaths(prev => [...prev, newPath]);
      selectItem(newPath);
      
      // Save to API
      if (session?.access_token) {
        apiClient.createPath(newPath)
          .then(() => {
            console.log('[Drawing] Path created successfully:', newPath.id);
          })
          .catch(err => {
            console.error('[Drawing] Failed to create path:', {
              error: err,
              path: newPath,
              message: err.message || 'Unknown error'
            });
            // Revert optimistic update
            setPaths(prev => prev.filter(p => p.id !== newPath.id));
            setError('Failed to create path: ' + (err.message || 'Unknown error'));
          });
      } else {
        console.warn('[Drawing] No auth token, path saved locally only');
      }
    }
    
    // Always clean up drawing state after processing
    console.log('[Drawing] Cleaning up drawing state');
    setState(prev => ({ ...prev, isDrawing: false, currentDrawing: [] }));
  }, [state.isDrawing, state.currentDrawing, state.tool, regions.length, paths.length, selectItem, session?.access_token]);

  const updateSelectedItem = useCallback((updates: Partial<Region | Path | Point>) => {
    if (!state.selectedItem) {
      console.warn('[Update] No item selected to update');
      return;
    }
    
    console.log('[Update] Updating selected item:', {
      id: state.selectedItem.id,
      updates: Object.keys(updates)
    });

    const itemId = state.selectedItem.id;
    
    if ('coordinates' in state.selectedItem) {
      if ('vnum' in state.selectedItem && 'type' in state.selectedItem) {
        // It's a Region or Path
        // Check if it's a region or path by checking if it has a vnum property
        if ('vnum' in state.selectedItem) {
          // First check if it's in regions array
          const isRegion = regions.some(r => r.id === itemId);
          
          if (isRegion) {
            // It's a Region
            setRegions(prev => prev.map(region => 
              region.id === itemId
                ? { ...region, ...updates } as Region
                : region
            ));
            
            // Save to API
            if (session?.access_token) {
              apiClient.updateRegion(itemId, updates)
                .then(() => {
                  console.log('[Update] Region updated successfully:', itemId);
                })
                .catch(err => {
                  console.error('[Update] Failed to update region:', {
                    error: err,
                    regionId: itemId,
                    updates,
                    message: err.message || 'Unknown error'
                  });
                  setError('Failed to update region: ' + (err.message || 'Unknown error'));
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
              apiClient.updatePath(itemId, updates)
                .then(() => {
                  console.log('[Update] Path updated successfully:', itemId);
                })
                .catch(err => {
                  console.error('[Update] Failed to update path:', {
                    error: err,
                    pathId: itemId,
                    updates,
                    message: err.message || 'Unknown error'
                  });
                  setError('Failed to update path: ' + (err.message || 'Unknown error'));
                });
            }
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
        apiClient.updatePoint(itemId, updates)
          .then(() => {
            console.log('[Update] Point updated successfully:', itemId);
          })
          .catch(err => {
            console.error('[Update] Failed to update point:', {
              error: err,
              pointId: itemId,
              updates,
              message: err.message || 'Unknown error'
            });
            setError('Failed to update point: ' + (err.message || 'Unknown error'));
          });
      }
    }
    
    setState(prev => ({ ...prev, selectedItem: { ...prev.selectedItem!, ...updates } }));
  }, [state.selectedItem, session, regions]);

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
    cancelDrawing,
    clearError,
    updateSelectedItem,
    loadData
  };
};