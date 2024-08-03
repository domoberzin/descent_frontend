import React, { useRef, useEffect, useState } from 'react';

function Canvas({ title, children }) {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const draw = (canvas, points) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw gridlines
    const drawGrid = () => {
      const step = 50;
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    // Draw axes
    const drawAxes = () => {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;

      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
    };

    drawGrid();
    drawAxes();

    // Draw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x * width, (1 - point.y) * height, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    });
    // Call the drawExtra function if provided
      if (drawExtra) {
        drawExtra(ctx, canvas);
      }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const resizeCanvas = () => {
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw(canvas, points);
      }
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      if (container) {
        resizeObserver.unobserve(container);
      }
    };
  }, [points]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX / canvas.width;
    const y = (e.clientY - rect.top) * scaleY / canvas.height;

    setPoints([...points, { x, y: 1 - y }]);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '300px' }}>
      <h2>{title}</h2>
      <canvas ref={canvasRef} onClick={handleClick} style={{ width: '100%', height: '100%' }} />
      {React.Children.map(children, child =>
        React.cloneElement(child, { canvasRef, points, setPoints })
      )}
    </div>
  );
}

export default Canvas;
