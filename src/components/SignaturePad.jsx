import { useRef, useEffect, useCallback } from 'react';
import { useLang } from '../context/LangContext';

export default function SignaturePad({ sigDataURL, onSigChange }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const { t } = useLang();

  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - r.left) * scaleX, y: (src.clientY - r.top) * scaleY };
  }, []);

  const onStart = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const pos = getCanvasPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();
    updateSigData();
  }, [getCanvasPos]);

  const onMove = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#0A0A0A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }, [getCanvasPos]);

  const onEnd = useCallback(() => {
    drawing.current = false;
    updateSigData();
  }, []);

  const updateSigData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSigChange(canvas.toDataURL('image/png'));
  }, [onSigChange]);

  const clearSig = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    updateSigData();
  }, [updateSigData]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;
    const w = wrap.offsetWidth;
    if (!w) return;
    let saved = null;
    try { if (canvas.width > 0) saved = canvas.toDataURL(); } catch (e) {}
    canvas.width = w;
    canvas.height = 160;
    if (saved) {
      const img = new Image();
      img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0);
      img.src = saved;
    }
    updateSigData();
  }, [updateSigData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setTimeout(resizeCanvas, 50);
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Also resize when the export tab becomes visible
  useEffect(() => {
    resizeCanvas();
  }, []);

  const sigHasContent = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return false;
    try {
      const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) return true;
      }
    } catch (e) {}
    return false;
  };

  return (
    <div className="sig-wrap" id="sig-wrap">
      <canvas
        ref={canvasRef}
        id="signature-canvas"
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />
    </div>
  );
}
