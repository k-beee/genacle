'use client';

import { useEffect, useRef } from 'react';

export function ScalesCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let targetAngle = 0;
    let currentAngle = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      // Normalise cursor position to angle between -0.15 and 0.15 radians
      targetAngle = ((mx / w) - 0.5) * 0.3;
    };

    const handleMouseLeave = () => {
      targetAngle = 0;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Damp current angle towards target
      currentAngle += (targetAngle - currentAngle) * 0.05;
      // Add a subtle idle sway (breathing effect)
      const sway = Math.sin(t * 0.0015) * 0.02;
      const angle = currentAngle + sway;

      // Layout coordinates (center scale in viewport)
      const cx = w / 2;
      const cy = h * 0.55;
      const beamLength = Math.min(w * 0.35, 140);
      const pillarHeight = Math.min(h * 0.45, 160);

      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Draw Pillar & Base (Forest Green/Gold styling)
      ctx.strokeStyle = 'rgba(223, 195, 132, 0.4)'; // Muted gold
      ctx.beginPath();
      // Base steps
      ctx.moveTo(cx - 40, cy + pillarHeight);
      ctx.lineTo(cx + 40, cy + pillarHeight);
      ctx.moveTo(cx - 30, cy + pillarHeight - 6);
      ctx.lineTo(cx + 30, cy + pillarHeight - 6);
      // Vertical pillar
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + pillarHeight - 6);
      ctx.stroke();

      // Pillar cap details
      ctx.fillStyle = '#dfc384'; // Bright gold
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Tilted Beam
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.strokeStyle = '#dfc384'; // Gold
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-beamLength, 0);
      ctx.lineTo(beamLength, 0);
      ctx.stroke();

      // Hanger hooks at ends of the beam
      ctx.fillStyle = '#dfc384';
      ctx.beginPath();
      ctx.arc(-beamLength, 0, 3, 0, Math.PI * 2);
      ctx.arc(beamLength, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Hanging Scales (Left and Right)
      const drawPan = (bx: number, by: number) => {
        ctx.save();
        ctx.translate(bx, by);
        // Undo rotation for the pans so they hang vertically
        ctx.rotate(-angle);

        ctx.strokeStyle = 'rgba(223, 195, 132, 0.65)';
        ctx.lineWidth = 1.5;

        // Strings
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-18, 40);
        ctx.moveTo(0, 0);
        ctx.lineTo(18, 40);
        ctx.stroke();

        // Pan dish
        ctx.strokeStyle = '#dfc384';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-22, 40);
        ctx.quadraticCurveTo(0, 48, 22, 40);
        ctx.stroke();

        ctx.restore();
      };

      drawPan(-beamLength, 0);
      drawPan(beamLength, 0);

      ctx.restore();

      t += 16;
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-auto" aria-hidden="true" />;
}
