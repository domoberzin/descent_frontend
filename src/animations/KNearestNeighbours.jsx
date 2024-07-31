import React, { useState, useEffect, useRef } from "react";

export default function KNN() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [k, setK] = useState(3);
  const [newPoint, setNewPoint] = useState(null);

  const canvasSize = 400;
  const gridSize = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, k, newPoint]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = "#e0e0e0";
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

    // Draw points
    points.forEach((point) => {
      ctx.fillStyle = point.class === 1 ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw new point and its classification
    if (newPoint) {
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(newPoint.x, newPoint.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      const nearestNeighbors = findNearestNeighbors(newPoint, k);
      nearestNeighbors.forEach((neighbor) => {
        ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
        ctx.beginPath();
        ctx.moveTo(newPoint.x, newPoint.y);
        ctx.lineTo(neighbor.x, neighbor.y);
        ctx.stroke();
      });
    }
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newPoint = { x, y, class: points.length % 2 === 0 ? 1 : -1 };
    setPoints([...points, newPoint]);
  };

  const classifyNewPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setNewPoint({ x, y });
  };

  const findNearestNeighbors = (point, k) => {
    return points
      .map((p) => ({
        ...p,
        distance: Math.sqrt(
          Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        K-Nearest Neighbors Visualization
      </h2>
      <div className="mb-4">
        <label className="mr-2">
          K value:
          <input
            type="number"
            value={k}
            onChange={(e) => setK(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        onContextMenu={(e) => {
          e.preventDefault();
          classifyNewPoint(e);
        }}
        className="border border-gray-300 cursor-crosshair"
      />
      <p className="mt-2">
        Left-click to add points. Right-click to classify a new point.
      </p>
    </div>
  );
}
