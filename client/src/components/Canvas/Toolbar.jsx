import React from 'react';
import { Paintbrush, Eraser, PaintBucket, Trash2, Undo2 } from 'lucide-react';

const PRESET_COLORS = [
  '#000000', '#ffffff', '#64748b', '#ef4444', 
  '#f97316', '#f59e0b', '#10b981', '#06b6d4', 
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
  '#78350f', '#15803d', '#1e3a8a', '#581c87'
];

const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 8 },
  { label: 'L', size: 16 },
  { label: 'XL', size: 28 }
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  tool,
  setTool,
  onClear,
  onUndo,
  disabled
}) {
  if (disabled) return null;

  return (
    <div
      className="toolbar glass-card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        gap: '12px',
        marginTop: '10px'
      }}
    >
      {/* Tools Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          id="tool-brush"
          onClick={() => setTool('brush')}
          className={tool === 'brush' ? 'btn-primary tool-btn' : 'btn-secondary tool-btn'}
          title="Brush Tool"
          aria-label="Brush"
        >
          <Paintbrush size={16} />
          <span className="tool-label">Brush</span>
        </button>
        <button
          type="button"
          id="tool-eraser"
          onClick={() => setTool('eraser')}
          className={tool === 'eraser' ? 'btn-primary tool-btn' : 'btn-secondary tool-btn'}
          title="Eraser Tool"
          aria-label="Eraser"
        >
          <Eraser size={16} />
          <span className="tool-label">Eraser</span>
        </button>
        <button
          type="button"
          id="tool-fill"
          onClick={() => setTool('fill')}
          className={tool === 'fill' ? 'btn-primary tool-btn' : 'btn-secondary tool-btn'}
          title="Fill Tool — click an area on the canvas to flood-fill it"
          aria-label="Fill"
        >
          <PaintBucket size={16} />
          <span className="tool-label">Fill</span>
        </button>
      </div>

      {/* Brush Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15,23,42,0.5)', padding: '4px 8px', borderRadius: 'var(--radius-md)', touchAction: 'manipulation' }}>
        {BRUSH_SIZES.map((b) => (
          <button
            key={b.size}
            type="button"
            onClick={() => setBrushSize(b.size)}
            aria-label={`Brush size ${b.label}`}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: brushSize === b.size ? 'var(--accent-indigo)' : 'transparent',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Color Palette */}
      <div className="color-palette" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', maxWidth: '280px', touchAction: 'manipulation' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              if (tool === 'eraser') setTool('brush');
            }}
            aria-label={`Color ${c}`}
            className="color-swatch"
            style={{
              backgroundColor: c,
              border: color === c ? '2px solid white' : '1px solid rgba(0,0,0,0.3)',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.1s',
              outline: color === c ? '2px solid var(--accent-indigo)' : 'none',
              outlineOffset: '1px'
            }}
          />
        ))}
        {/* Custom Hex Color Input */}
        <input
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            if (tool === 'eraser') setTool('brush');
          }}
          className="color-picker-input"
          title="Custom Color"
          aria-label="Custom color picker"
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          id="btn-undo"
          onClick={onUndo}
          className="btn-secondary tool-btn"
          title="Undo last action (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 size={16} />
          <span className="tool-label">Undo</span>
        </button>
        <button
          type="button"
          id="btn-clear"
          onClick={onClear}
          className="btn-secondary tool-btn"
          style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          title="Clear Canvas"
          aria-label="Clear canvas"
        >
          <Trash2 size={16} />
          <span className="tool-label">Clear</span>
        </button>
      </div>
    </div>
  );
}
