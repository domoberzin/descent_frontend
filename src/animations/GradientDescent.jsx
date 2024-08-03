import { useState, useEffect, useRef } from "react";

export default function GradientDescent() {
  const canvasRef = useRef(null);
  const pointRef = useRef({ x: 0, y: 0 });
  const [, forceUpdate] = useState({});
  const isDescendingRef = useRef(false);
  const [learningRate, setLearningRate] = useState(0.01);
  const iterationsRef = useRef(0);
  const [minima, setMinima] = useState({ x: 0, y: 0 });
  const [maxima, setMaxima] = useState({ x: Math.PI / 2, y: Math.PI / 2 });
  const [useHeatmap, setUseHeatmap] = useState(true);
  const [adjustMode, setAdjustMode] = useState(null);

  const canvasSize = 400;
  const gridSize = 20;
  const scale = canvasSize / 4;

  useEffect(() => {
    drawCanvas();
    return () => {
      isDescendingRef.current = false;
    };
  }, [minima, maxima, useHeatmap]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw contour plot or heatmap
    for (let x = -2; x <= 2; x += 0.05) {
      for (let y = -2; y <= 2; y += 0.05) {
        const value = function3D(x, y);
        if (useHeatmap) {
          const color = getColorForValue(value);
          ctx.fillStyle = color;
          ctx.fillRect(
            (x + 2) * scale,
            canvasSize - (y + 2) * scale,
            scale * 0.05,
            scale * 0.05
          );
        } else {
          // Draw contour lines
          const threshold = Math.floor(value * 10) / 10;
          if (Math.abs(value - threshold) < 0.025) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(
              (x + 2) * scale,
              canvasSize - (y + 2) * scale,
              scale * 0.05,
              scale * 0.05
            );
          }
        }
      }
    }

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvasSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasSize, i);
      ctx.stroke();
    }

    // Draw current point
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      (pointRef.current.x + 2) * scale,
      canvasSize - (pointRef.current.y + 2) * scale,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Draw minima and maxima
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(
      (minima.x + 2) * scale,
      canvasSize - (minima.y + 2) * scale,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(
      (maxima.x + 2) * scale,
      canvasSize - (maxima.y + 2) * scale,
      5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };

  const function3D = (x, y) => {
    const dx = x - minima.x;
    const dy = y - minima.y;
    const sx = maxima.x - minima.x;
    const sy = maxima.y - minima.y;
    return Math.sin((dx / sx) * Math.PI) * Math.cos((dy / sy) * Math.PI);
  };

  const getColorForValue = (value) => {
    const hue = ((value + 1) / 2) * 240;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const gradient = (x, y) => {
    const dx = x - minima.x;
    const dy = y - minima.y;
    const sx = maxima.x - minima.x;
    const sy = maxima.y - minima.y;
    const gradX =
      (Math.PI / sx) *
      Math.cos((dx / sx) * Math.PI) *
      Math.cos((dy / sy) * Math.PI);
    const gradY =
      -(Math.PI / sy) *
      Math.sin((dx / sx) * Math.PI) *
      Math.sin((dy / sy) * Math.PI);
    return { x: gradX, y: gradY };
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale - 2;
    const y = 2 - (event.clientY - rect.top) / scale;

    if (adjustMode === "minima") {
      setMinima({ x, y });
      setAdjustMode(null);
    } else if (adjustMode === "maxima") {
      setMaxima({ x, y });
      setAdjustMode(null);
    } else {
      pointRef.current = { x, y };
      iterationsRef.current = 0;
    }

    drawCanvas();
    forceUpdate({});
  };

  const toggleDescent = () => {
    isDescendingRef.current = !isDescendingRef.current;
    if (isDescendingRef.current) {
      performGradientDescent();
    }
  };

  const performGradientDescent = () => {
    if (isDescendingRef.current) {
      const grad = gradient(pointRef.current.x, pointRef.current.y);
      pointRef.current = {
        x: pointRef.current.x - learningRate * grad.x,
        y: pointRef.current.y - learningRate * grad.y,
      };
      iterationsRef.current += 1;
      drawCanvas();
      forceUpdate({});
      requestAnimationFrame(performGradientDescent);
    }
  };

  const resetFunction = () => {
    setMinima({ x: 0, y: 0 });
    setMaxima({ x: Math.PI / 2, y: Math.PI / 2 });
    pointRef.current = { x: 0, y: 0 };
    iterationsRef.current = 0;
    drawCanvas();
    forceUpdate({});
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Gradient Descent Visualization
      </h2>
      <div className="mb-4">
        <button
          onClick={toggleDescent}
          className={`px-4 py-2 rounded mr-2 ${
            isDescendingRef.current
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {isDescendingRef.current ? "Stop Descent" : "Start Descent"}
        </button>
        <label className="mr-2">
          Learning Rate:
          <input
            type="number"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            className="ml-2 w-20 border rounded px-2 py-1"
            step="0.01"
            min="0.01"
            max="1"
          />
        </label>
        <label className="mr-2">
          <input
            type="checkbox"
            checked={useHeatmap}
            onChange={() => setUseHeatmap(!useHeatmap)}
            className="mr-1"
          />
          Use Heatmap
        </label>
      </div>
      <div className="mb-4">
        <button
          onClick={() => setAdjustMode("minima")}
          className="px-4 py-2 rounded mr-2 bg-blue-500 text-white"
        >
          Adjust Minima
        </button>
        <button
          onClick={() => setAdjustMode("maxima")}
          className="px-4 py-2 rounded mr-2 bg-green-500 text-white"
        >
          Adjust Maxima
        </button>
        <button
          onClick={resetFunction}
          className="px-4 py-2 rounded mr-2 bg-gray-500 text-white"
        >
          Reset
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        className="border border-gray-300 cursor-crosshair"
      />
      <p className="mt-2">
        Current position: ({pointRef.current.x.toFixed(2)},{" "}
        {pointRef.current.y.toFixed(2)})
      </p>
      <p>
        Function value:{" "}
        {function3D(pointRef.current.x, pointRef.current.y).toFixed(4)}
      </p>
      <p>Iterations: {iterationsRef.current}</p>
      <p className="mt-2">
        Click on the canvas to set the starting point. Use the "Adjust Minima"
        and "Adjust Maxima" buttons to change the function shape.
      </p>
    </div>
  );
}
