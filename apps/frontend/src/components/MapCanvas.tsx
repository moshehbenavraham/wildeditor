import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Coordinate, Region, Path, Point, EditorState } from '../types';

interface MapCanvasProps {
  state: EditorState;
  regions: Region[];
  paths: Path[];
  points: Point[];
  onMouseMove: (coordinate: Coordinate) => void;
  onClick: (coordinate: Coordinate) => void;
  onSelectItem: (item: Region | Path | Point | null) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  state,
  regions,
  paths,
  points,
  onMouseMove,
  onClick,
  onSelectItem
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAP_SIZE = 2048;
  const COORDINATE_RANGE = 1024;

  // Convert game coordinates (-1024 to +1024) to canvas coordinates (0 to MAP_SIZE)
  const gameToCanvas = useCallback((coord: Coordinate): { x: number; y: number } => {
    return {
      x: ((coord.x + COORDINATE_RANGE) / (COORDINATE_RANGE * 2)) * MAP_SIZE,
      y: ((COORDINATE_RANGE - coord.y) / (COORDINATE_RANGE * 2)) * MAP_SIZE
    };
  }, []);

  // Convert canvas coordinates to game coordinates
  const canvasToGame = useCallback((clientX: number, clientY: number): Coordinate => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!rect || !canvas) return { x: 0, y: 0 };
    
    // Get mouse position relative to canvas element
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    
    // Account for zoom scaling - the canvas is scaled by zoom but maintains aspect ratio
    const scale = state.zoom / 100;
    
    // Convert CSS coordinates to actual canvas coordinates
    // The canvas element may be scaled by CSS, so we need to account for that
    const actualCanvasWidth = canvas.width / scale;
    const actualCanvasHeight = canvas.height / scale;
    
    // Normalize to 0-1 range based on the displayed (scaled) canvas size
    const normalizedX = canvasX / actualCanvasWidth;
    const normalizedY = canvasY / actualCanvasHeight;
    
    // Ensure we're within bounds
    const clampedX = Math.max(0, Math.min(1, normalizedX));
    const clampedY = Math.max(0, Math.min(1, normalizedY));
    
    // Convert to game coordinates (-1024 to +1024)
    return {
      x: Math.round((clampedX * (COORDINATE_RANGE * 2)) - COORDINATE_RANGE),
      y: Math.round(COORDINATE_RANGE - (clampedY * (COORDINATE_RANGE * 2)))
    };
  }, [state.zoom]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!state.showGrid) return;

    const gridSize = 50; // Grid every 50 game units
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Vertical lines
    for (let gameX = -COORDINATE_RANGE; gameX <= COORDINATE_RANGE; gameX += gridSize) {
      const canvasPos = gameToCanvas({ x: gameX, y: 0 });
      ctx.beginPath();
      ctx.moveTo(canvasPos.x, 0);
      ctx.lineTo(canvasPos.x, MAP_SIZE);
      ctx.stroke();
    }

    // Horizontal lines
    for (let gameY = -COORDINATE_RANGE; gameY <= COORDINATE_RANGE; gameY += gridSize) {
      const canvasPos = gameToCanvas({ x: 0, y: gameY });
      ctx.beginPath();
      ctx.moveTo(0, canvasPos.y);
      ctx.lineTo(MAP_SIZE, canvasPos.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, [state.showGrid, gameToCanvas]);

  // Note: Removed old drawing functions as they're replaced by optimized versions

  // Optimized drawing functions that use pre-transformed coordinates
  const drawRegionOptimized = useCallback((ctx: CanvasRenderingContext2D, region: Region & { canvasCoords: {x: number, y:number}[] }) => {
    if (!state.showRegions || region.canvasCoords.length < 3) return;
    
    ctx.fillStyle = region.color + '40';
    ctx.strokeStyle = region.color;
    ctx.lineWidth = state.selectedItem?.id === region.id ? 3 : 2;

    ctx.beginPath();
    ctx.moveTo(region.canvasCoords[0].x, region.canvasCoords[0].y);
    for (let i = 1; i < region.canvasCoords.length; i++) {
      ctx.lineTo(region.canvasCoords[i].x, region.canvasCoords[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw vertices
    region.canvasCoords.forEach((coord, index) => {
      ctx.fillStyle = region.color;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw vertex numbers
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), coord.x, coord.y - 8);
    });
  }, [state.showRegions, state.selectedItem]);
  
  const drawPathOptimized = useCallback((ctx: CanvasRenderingContext2D, path: Path & { canvasCoords: {x: number, y:number}[] }) => {
    if (!state.showPaths || path.canvasCoords.length < 2) return;
    
    ctx.strokeStyle = path.color;
    ctx.lineWidth = state.selectedItem?.id === path.id ? 4 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(path.canvasCoords[0].x, path.canvasCoords[0].y);
    for (let i = 1; i < path.canvasCoords.length; i++) {
      ctx.lineTo(path.canvasCoords[i].x, path.canvasCoords[i].y);
    }
    ctx.stroke();

    // Draw vertices
    path.canvasCoords.forEach((coord, index) => {
      ctx.fillStyle = path.color;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw vertex numbers
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), coord.x, coord.y - 6);
    });
  }, [state.showPaths, state.selectedItem]);
  
  const drawPointOptimized = useCallback((ctx: CanvasRenderingContext2D, point: Point & { canvasPos: {x: number, y:number} }) => {
    const color = point.type === 'landmark' ? '#F59E0B' : '#8B5CF6';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = state.selectedItem?.id === point.id ? 3 : 2;

    ctx.beginPath();
    ctx.arc(point.canvasPos.x, point.canvasPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(point.name, point.canvasPos.x, point.canvasPos.y + 20);
  }, [state.selectedItem]);

  const drawCurrentDrawing = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!state.isDrawing || state.currentDrawing.length === 0) return;
    
    console.log('[Canvas] Drawing current shape:', {
      tool: state.tool,
      points: state.currentDrawing.length
    });

    const canvasCoords = state.currentDrawing.map(gameToCanvas);
    
    // Determine if the current drawing is valid
    const isValidDrawing = (
      (state.tool === 'polygon' && canvasCoords.length >= 3) ||
      (state.tool === 'linestring' && canvasCoords.length >= 2)
    );
    
    // Use different colors based on validity
    const strokeColor = isValidDrawing ? '#22C55E' : '#F59E0B';
    const fillColor = isValidDrawing ? '#22C55E20' : '#F59E0B20';
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);

    if (state.tool === 'polygon' && canvasCoords.length >= 2) {
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
      for (let i = 1; i < canvasCoords.length; i++) {
        ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
      }
      
      // Only close the path if we have 3+ points for a valid polygon
      if (canvasCoords.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
      
      // Draw connection line back to first point if we have 2+ points
      if (canvasCoords.length >= 2) {
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = strokeColor + '80';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvasCoords[canvasCoords.length - 1].x, canvasCoords[canvasCoords.length - 1].y);
        ctx.lineTo(canvasCoords[0].x, canvasCoords[0].y);
        ctx.stroke();
      }
    } else if (state.tool === 'linestring' && canvasCoords.length >= 1) {
      if (canvasCoords.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
        for (let i = 1; i < canvasCoords.length; i++) {
          ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
        }
        ctx.stroke();
      }
    }

    // Draw vertices with different styles based on validity
    canvasCoords.forEach((coord, index) => {
      ctx.fillStyle = strokeColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Draw vertex numbers
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), coord.x, coord.y - 12);
    });
    
    // Draw status text
    if (canvasCoords.length > 0) {
      const minPoints = state.tool === 'polygon' ? 3 : 2;
      const statusText = isValidDrawing 
        ? `${state.tool} (${canvasCoords.length} points) - Press Enter to finish` 
        : `${state.tool} (${canvasCoords.length}/${minPoints} points) - Need ${minPoints - canvasCoords.length} more`;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, 10, 400, 30);
      ctx.fillStyle = isValidDrawing ? '#22C55E' : '#F59E0B';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(statusText, 15, 30);
    }

    ctx.setLineDash([]);
  }, [state.isDrawing, state.currentDrawing, state.tool, gameToCanvas]);

  // Memoize expensive calculations
  const canvasScale = useMemo(() => state.zoom / 100, [state.zoom]);
  const canvasSize = useMemo(() => ({ 
    width: MAP_SIZE * canvasScale, 
    height: MAP_SIZE * canvasScale 
  }), [canvasScale]);
  
  // Memoize coordinate transformations for all objects to avoid recalculating every render
  const transformedRegions = useMemo(() => {
    return regions.map(region => ({
      ...region,
      canvasCoords: region.coordinates.map(gameToCanvas)
    }));
  }, [regions, gameToCanvas]);
  
  const transformedPaths = useMemo(() => {
    return paths.map(path => ({
      ...path,
      canvasCoords: path.coordinates.map(gameToCanvas)
    }));
  }, [paths, gameToCanvas]);
  
  const transformedPoints = useMemo(() => {
    return points.map(point => ({
      ...point,
      canvasPos: gameToCanvas(point.coordinate)
    }));
  }, [points, gameToCanvas]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('[Canvas] Canvas ref not available for rendering');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[Canvas] Failed to get 2D context');
      return;
    }
    
    // Set canvas internal resolution based on zoom
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Set canvas display size (this affects the CSS size and canvasToGame calculations)
    canvas.style.width = `${MAP_SIZE}px`;
    canvas.style.height = `${MAP_SIZE}px`;

    // Clear canvas
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale the context for zoom - this scales all drawing operations
    ctx.save();
    ctx.scale(canvasScale, canvasScale);

    // Draw grid
    drawGrid(ctx);

    // Draw coordinate axes
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 2;
    
    // X-axis (horizontal)
    const xAxisY = MAP_SIZE / 2;
    ctx.beginPath();
    ctx.moveTo(0, xAxisY);
    ctx.lineTo(MAP_SIZE, xAxisY);
    ctx.stroke();
    
    // Y-axis (vertical)
    const yAxisX = MAP_SIZE / 2;
    ctx.beginPath();
    ctx.moveTo(yAxisX, 0);
    ctx.lineTo(yAxisX, MAP_SIZE);
    ctx.stroke();

    // Draw origin marker
    const origin = gameToCanvas({ x: 0, y: 0 });
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw regions using pre-transformed coordinates
    transformedRegions.forEach(region => drawRegionOptimized(ctx, region));

    // Draw paths using pre-transformed coordinates
    transformedPaths.forEach(path => drawPathOptimized(ctx, path));

    // Draw points using pre-transformed coordinates
    transformedPoints.forEach(point => drawPointOptimized(ctx, point));

    // Draw current drawing
    drawCurrentDrawing(ctx);

    ctx.restore();
  }, [canvasSize, canvasScale, drawGrid, drawCurrentDrawing, transformedRegions, transformedPaths, transformedPoints, gameToCanvas, drawRegionOptimized, drawPathOptimized, drawPointOptimized]);

  useEffect(() => {
    render();
    
    // Store canvas ref for cleanup
    const canvas = canvasRef.current;
    
    // Cleanup function to handle component unmount
    return () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, [render]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const gameCoord = canvasToGame(e.clientX, e.clientY);
    onMouseMove(gameCoord);
  }, [canvasToGame, onMouseMove]);

  // Geometric utility functions for accurate selection
  const isPointInPolygon = useCallback((point: Coordinate, polygon: Coordinate[]): boolean => {
    if (polygon.length < 3) return false;
    
    let isInside = false;
    const x = point.x;
    const y = point.y;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        isInside = !isInside;
      }
    }
    
    return isInside;
  }, []);

  const distanceToLineSegment = useCallback((point: Coordinate, lineStart: Coordinate, lineEnd: Coordinate): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = lineStart.x + param * C;
    const yy = lineStart.y + param * D;
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const distanceToPath = useCallback((point: Coordinate, path: Coordinate[]): number => {
    if (path.length < 2) return Infinity;
    
    let minDistance = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const distance = distanceToLineSegment(point, path[i], path[i + 1]);
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  }, [distanceToLineSegment]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const gameCoord = canvasToGame(e.clientX, e.clientY);
    
    console.log('[Canvas] Click event:', {
      tool: state.tool,
      coordinate: gameCoord,
      mouseEvent: { clientX: e.clientX, clientY: e.clientY }
    });
    
    if (state.tool === 'select') {
      console.log('[Canvas] Selection mode - checking for items at:', gameCoord);
      const POINT_SELECTION_RADIUS = 10; // pixels
      const PATH_SELECTION_TOLERANCE = 8; // game units
      
      // Check for point selection first (highest priority)
      const clickedPoint = points.find(point => {
        const canvasPos = gameToCanvas(point.coordinate);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return false;
        
        const canvasClickX = e.clientX - rect.left;
        const canvasClickY = e.clientY - rect.top;
        
        // Account for canvas scaling
        const scale = state.zoom / 100;
        const scaledCanvasPos = {
          x: canvasPos.x * scale,
          y: canvasPos.y * scale
        };
        
        const distance = Math.sqrt(
          Math.pow(canvasClickX - scaledCanvasPos.x, 2) +
          Math.pow(canvasClickY - scaledCanvasPos.y, 2)
        );
        
        return distance <= POINT_SELECTION_RADIUS;
      });

      if (clickedPoint) {
        console.log('[Canvas] Point selected:', {
          point: clickedPoint.name,
          id: clickedPoint.id,
          coordinate: clickedPoint.coordinate
        });
        onSelectItem(clickedPoint);
        return;
      }

      // Check for region selection using proper point-in-polygon
      const clickedRegion = regions.find(region => {
        if (region.coordinates.length < 3) return false;
        return isPointInPolygon(gameCoord, region.coordinates);
      });

      if (clickedRegion) {
        console.log('[Canvas] Region selected:', {
          region: clickedRegion.name,
          id: clickedRegion.id,
          type: clickedRegion.type,
          pointCount: clickedRegion.coordinates.length
        });
        onSelectItem(clickedRegion);
        return;
      }

      // Check for path selection using distance to line segments
      const clickedPath = paths.find(path => {
        if (path.coordinates.length < 2) return false;
        const distance = distanceToPath(gameCoord, path.coordinates);
        return distance <= PATH_SELECTION_TOLERANCE;
      });

      if (clickedPath) {
        console.log('[Canvas] Path selected:', {
          path: clickedPath.name,
          id: clickedPath.id,
          type: clickedPath.type,
          pointCount: clickedPath.coordinates.length
        });
        onSelectItem(clickedPath);
        return;
      }

      // No selection found
      console.log('[Canvas] No item found at click position, clearing selection');
      onSelectItem(null);
    } else {
      // Drawing tools
      console.log('[Canvas] Passing click to drawing handler');
      onClick(gameCoord);
    }
  }, [state.tool, state.zoom, points, regions, paths, canvasToGame, gameToCanvas, onClick, onSelectItem, isPointInPolygon, distanceToPath]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto bg-gray-800">
      <canvas
        ref={canvasRef}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          imageRendering: 'pixelated',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
};