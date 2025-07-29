import React, { useRef, useEffect, useCallback } from 'react';
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
  const canvasToGame = useCallback((x: number, y: number): Coordinate => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    // Get mouse position relative to canvas
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    // Get actual canvas dimensions (which may be scaled by CSS)
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    // Convert to canvas pixel coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const pixelX = canvasX * scaleX;
    const pixelY = canvasY * scaleY;
    
    // Convert to normalized coordinates (0-1) based on actual canvas size
    const normalizedX = pixelX / canvas.width;
    const normalizedY = pixelY / canvas.height;
    
    return {
      x: Math.round((normalizedX * (COORDINATE_RANGE * 2)) - COORDINATE_RANGE),
      y: Math.round(COORDINATE_RANGE - (normalizedY * (COORDINATE_RANGE * 2)))
    };
  }, []);

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

  const drawRegion = useCallback((ctx: CanvasRenderingContext2D, region: Region) => {
    if (!state.showRegions || region.coordinates.length < 3) return;

    const canvasCoords = region.coordinates.map(gameToCanvas);
    
    ctx.fillStyle = region.color + '40';
    ctx.strokeStyle = region.color;
    ctx.lineWidth = state.selectedItem?.id === region.id ? 3 : 2;

    ctx.beginPath();
    ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
    for (let i = 1; i < canvasCoords.length; i++) {
      ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw vertices
    canvasCoords.forEach((coord, index) => {
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
  }, [state.showRegions, state.selectedItem, gameToCanvas]);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: Path) => {
    if (!state.showPaths || path.coordinates.length < 2) return;

    const canvasCoords = path.coordinates.map(gameToCanvas);
    
    ctx.strokeStyle = path.color;
    ctx.lineWidth = state.selectedItem?.id === path.id ? 4 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
    for (let i = 1; i < canvasCoords.length; i++) {
      ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
    }
    ctx.stroke();

    // Draw vertices
    canvasCoords.forEach((coord, index) => {
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
  }, [state.showPaths, state.selectedItem, gameToCanvas]);

  const drawPoint = useCallback((ctx: CanvasRenderingContext2D, point: Point) => {
    const canvasPos = gameToCanvas(point.coordinate);
    
    const color = point.type === 'landmark' ? '#F59E0B' : '#8B5CF6';
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = state.selectedItem?.id === point.id ? 3 : 2;

    ctx.beginPath();
    ctx.arc(canvasPos.x, canvasPos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(point.name, canvasPos.x, canvasPos.y + 20);
  }, [state.selectedItem, gameToCanvas]);

  const drawCurrentDrawing = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!state.isDrawing || state.currentDrawing.length === 0) return;

    const canvasCoords = state.currentDrawing.map(gameToCanvas);
    
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (state.tool === 'polygon' && canvasCoords.length >= 3) {
      ctx.fillStyle = '#FBBF24' + '20';
      ctx.beginPath();
      ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
      for (let i = 1; i < canvasCoords.length; i++) {
        ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (state.tool === 'linestring' && canvasCoords.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(canvasCoords[0].x, canvasCoords[0].y);
      for (let i = 1; i < canvasCoords.length; i++) {
        ctx.lineTo(canvasCoords[i].x, canvasCoords[i].y);
      }
      ctx.stroke();
    }

    // Draw vertices
    canvasCoords.forEach(coord => {
      ctx.fillStyle = '#FBBF24';
      ctx.beginPath();
      ctx.arc(coord.x, coord.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.setLineDash([]);
  }, [state.isDrawing, state.currentDrawing, state.tool, gameToCanvas]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = state.zoom / 100;
    canvas.width = MAP_SIZE * scale;
    canvas.height = MAP_SIZE * scale;

    // Clear canvas
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scale the context for zoom
    ctx.save();
    ctx.scale(scale, scale);

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

    // Draw regions
    regions.forEach(region => drawRegion(ctx, region));

    // Draw paths
    paths.forEach(path => drawPath(ctx, path));

    // Draw points
    points.forEach(point => drawPoint(ctx, point));

    // Draw current drawing
    drawCurrentDrawing(ctx);

    ctx.restore();
  }, [state, regions, paths, points, drawGrid, drawRegion, drawPath, drawPoint, drawCurrentDrawing, gameToCanvas]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const gameCoord = canvasToGame(e.clientX, e.clientY);
    onMouseMove(gameCoord);
  }, [canvasToGame, onMouseMove]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const gameCoord = canvasToGame(e.clientX, e.clientY);
    
    if (state.tool === 'select') {
      // Check for point selection
      const clickedPoint = points.find(point => {
        const canvasPos = gameToCanvas(point.coordinate);
        const distance = Math.sqrt(
          Math.pow(e.clientX - (canvasPos.x + canvasRef.current!.getBoundingClientRect().left), 2) +
          Math.pow(e.clientY - (canvasPos.y + canvasRef.current!.getBoundingClientRect().top), 2)
        );
        return distance <= 10;
      });

      if (clickedPoint) {
        onSelectItem(clickedPoint);
        return;
      }

      // Check for region/path selection (simplified)
      const clickedRegion = regions.find(region => {
        // Simple point-in-polygon test (for demo purposes)
        return region.coordinates.some(coord => 
          Math.abs(coord.x - gameCoord.x) < 20 && Math.abs(coord.y - gameCoord.y) < 20
        );
      });

      if (clickedRegion) {
        onSelectItem(clickedRegion);
        return;
      }

      const clickedPath = paths.find(path => {
        return path.coordinates.some(coord => 
          Math.abs(coord.x - gameCoord.x) < 15 && Math.abs(coord.y - gameCoord.y) < 15
        );
      });

      if (clickedPath) {
        onSelectItem(clickedPath);
        return;
      }

      onSelectItem(null);
    } else {
      onClick(gameCoord);
    }
  }, [state.tool, points, regions, paths, canvasToGame, gameToCanvas, onClick, onSelectItem]);

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