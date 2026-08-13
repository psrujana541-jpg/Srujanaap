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
  // Works with Pointer Events (which unify mouse, touch, stylus)
  const getNormalizedPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Pointer Events provide clientX/clientY directly for both mouse and touch
    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

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
      x: Math.round(normPos.x * canvas.width),
      y: Math.round(normPos.y * canvas.height)
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

  // Full canvas fill (legacy — used in syncHistory for old fill records)
  const fillCanvas = useCallback((fillColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Scanline Flood Fill — fills enclosed area starting from pixel (startX, startY)
   * with the given color. Uses Euclidean color distance matching and 1px edge
   * dilation to cover anti-aliased stroke borders cleanly without white gaps.
   *
   * @param {number} startX - Canvas pixel X (integer)
   * @param {number} startY - Canvas pixel Y (integer)
   * @param {string} fillColorHex - CSS hex color string e.g. '#ff0000'
   * @param {number} [tolerance=40] - Color channel tolerance (0-255)
   */
  const floodFill = useCallback((startX, startY, fillColorHex, tolerance = 40) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    // Clamp start coords
    startX = Math.max(0, Math.min(Math.round(startX), width - 1));
    startY = Math.max(0, Math.min(Math.round(startY), height - 1));

    // Parse fill color to RGBA
    const fillRgb = hexToRgb(fillColorHex);
    if (!fillRgb) return;

    // Read full canvas pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const startIdx = (startY * width + startX) * 4;
    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];
    const targetA = data[startIdx + 3];

    // If target pixel is already virtually identical to fill color, skip
    const fillDist = Math.abs(targetR - fillRgb.r) + Math.abs(targetG - fillRgb.g) + Math.abs(targetB - fillRgb.b);
    if (fillDist <= 10 && Math.abs(targetA - 255) <= 10) {
      return;
    }

    // Color distance check helper
    const colorMatch = (idx, tol) => {
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      return (
        Math.abs(r - targetR) <= tol &&
        Math.abs(g - targetG) <= tol &&
        Math.abs(b - targetB) <= tol &&
        Math.abs(a - targetA) <= tol
      );
    };

    // Visited tracking map
    const visited = new Uint8Array(width * height);
    const stack = [{ x: startX, y: startY }];

    // Scanline flood fill loop
    while (stack.length > 0) {
      const { x, y } = stack.pop();

      const yOffset = y * width;
      const pos = x + yOffset;

      if (visited[pos] || !colorMatch(pos * 4, tolerance)) continue;

      let lx = x;
      while (lx >= 0 && !visited[lx + yOffset] && colorMatch((lx + yOffset) * 4, tolerance)) {
        lx--;
      }
      lx++; // First valid left pixel

      let rx = x + 1;
      while (rx < width && !visited[rx + yOffset] && colorMatch((rx + yOffset) * 4, tolerance)) {
        rx++;
      }
      rx--; // Last valid right pixel

      // Mark visited and update colors for segment lx..rx
      for (let i = lx; i <= rx; i++) {
        visited[i + yOffset] = 1;
        const pIdx = (i + yOffset) * 4;
        data[pIdx] = fillRgb.r;
        data[pIdx + 1] = fillRgb.g;
        data[pIdx + 2] = fillRgb.b;
        data[pIdx + 3] = 255;
      }

      // Scan rows above and below for unvisited matching spans
      const scanRow = (nextY) => {
        if (nextY < 0 || nextY >= height) return;
        const nextYOffset = nextY * width;
        let inSpan = false;

        for (let i = lx; i <= rx; i++) {
          const idx = i + nextYOffset;
          if (!visited[idx] && colorMatch(idx * 4, tolerance)) {
            if (!inSpan) {
              stack.push({ x: i, y: nextY });
              inSpan = true;
            }
          } else {
            inSpan = false;
          }
        }
      };

      scanRow(y - 1);
      scanRow(y + 1);
    }

    // 1-Pixel Edge Dilation Pass: Fill anti-aliased fuzzy edge pixels surrounding the filled area
    const extendedTol = tolerance * 2.5;
    const pixelsToDilate = [];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = x + y * width;
        if (visited[idx] === 1) {
          const neighbors = [idx - 1, idx + 1, idx - width, idx + width];
          for (let n of neighbors) {
            if (visited[n] === 0) {
              if (colorMatch(n * 4, extendedTol)) {
                pixelsToDilate.push(n);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < pixelsToDilate.length; i++) {
      const n4 = pixelsToDilate[i] * 4;
      data[n4] = fillRgb.r;
      data[n4 + 1] = fillRgb.g;
      data[n4 + 2] = fillRgb.b;
      data[n4 + 3] = 255;
    }

    // Write updated pixels back to canvas context
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Re-draw canvas from array of stroke history
  const syncHistory = useCallback((history) => {
    clearCanvas();
    if (!Array.isArray(history)) return;
    history.forEach(item => {
      if (item.type === 'fill') {
        if (item.x !== undefined && item.y !== undefined) {
          // New format: positioned flood fill
          const canvas = canvasRef.current;
          if (canvas) {
            floodFill(item.x * canvas.width, item.y * canvas.height, item.color);
          }
        } else {
          // Legacy format: full canvas fill
          fillCanvas(item.color);
        }
      } else {
        drawStroke(item);
      }
    });
  }, [clearCanvas, fillCanvas, floodFill, drawStroke]);

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
    getCanvasPos,
    drawStroke,
    clearCanvas,
    fillCanvas,
    floodFill,
    syncHistory
  };
}

// Helper: parse CSS hex color (#rrggbb or #rgb) to {r, g, b}
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }
  // Also handle shorthand #rgb
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16)
    };
  }
  return null;
}
