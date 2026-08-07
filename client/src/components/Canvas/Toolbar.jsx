import React from 'react';
import { Paintbrush, Eraser, PaintBucket, Trash2, Undo } from 'lucide-react';

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
  onFill,
  disabled
}) {
  if (disabled) return null;

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        gap: '14px',
        marginTop: '10px'
      }}
    >
      {/* Tools Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setTool('brush')}
          className={tool === 'brush' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          title="Brush Tool"
        >
          <Paintbrush size={16} /> Brush
        </button>
        <button
          type="button"
          onClick={() => setTool('eraser')}
          className={tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          title="Eraser Tool"
        >
          <Eraser size={16} /> Eraser
        </button>
        <button
          type="button"
          onClick={() => {
            setTool('fill');
            onFill(color);
          }}
          className={tool === 'fill' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          title="Fill Canvas"
        >
          <PaintBucket size={16} /> Fill
        </button>
      </div>

      {/* Brush Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15,23,42,0.5)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}>
        {BRUSH_SIZES.map((b) => (
          <button
            key={b.size}
            type="button"
            onClick={() => setBrushSize(b.size)}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: brushSize === b.size ? 'var(--accent-indigo)' : 'transparent',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Color Palette */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setColor(c);
              if (tool === 'eraser') setTool('brush');
            }}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              backgroundColor: c,
              border: color === c ? '2px solid white' : '1px solid rgba(0,0,0,0.3)',
              transform: color === c ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.1s'
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
          style={{
            width: '24px',
            height: '24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: 'transparent'
          }}
          title="Custom Color"
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onClear}
          className="btn-secondary"
          style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          title="Clear Canvas"
        >
          <Trash2 size={16} /> Clear
        </button>
      </div>
    </div>
  );
}
