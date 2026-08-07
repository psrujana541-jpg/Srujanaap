import { useRef, useState, useCallback } from 'react';

export function useCanvas() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser' | 'fill'
  const historyRef = useRef([]);

  // Utility to get normalized coordinates (0 to 1) for cross-resolution scaling
  const getNormalizedPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  }, []);

  // Utility to convert normalized pos to actual canvas pixels
  const getCanvasPos = useCallback((normPos) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    return {
      x: normPos.x * canvas.width,
      y: normPos.y * canvas.height
    };
  }, []);

  // Draw stroke on local canvas element
  const drawStroke = useCallback((strokeData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const from = { x: strokeData.from.x * canvas.width, y: strokeData.from.y * canvas.height };
    const to = { x: strokeData.to.x * canvas.width, y: strokeData.to.y * canvas.height };

    ctx.save();
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = strokeData.size;

    if (strokeData.tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
    } else {
      ctx.strokeStyle = strokeData.color;
    }

    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }, []);

  // Clear local canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Fill canvas with color
  const fillCanvas = useCallback((fillColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Re-draw canvas from array of stroke history
  const syncHistory = useCallback((history) => {
    clearCanvas();
    if (!Array.isArray(history)) return;
    history.forEach(item => {
      if (item.type === 'fill') {
        fillCanvas(item.color);
      } else {
        drawStroke(item);
      }
    });
  }, [clearCanvas, fillCanvas, drawStroke]);

  return {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    isDrawingRef,
    lastPosRef,
    getNormalizedPos,
    drawStroke,
    clearCanvas,
    fillCanvas,
    syncHistory
  };
}
