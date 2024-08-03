import { useState, useEffect, useRef } from "react";

export default function KNN() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [k, setK] = useState(3);
  const [newPoint, setNewPoint] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [currentClass, setCurrentClass] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasSize = 400;
  const gridSize = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, k, newPoint, is3D, rotation]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    if (!is3D) {
      draw2D(ctx);
    } else {
      draw3D(ctx);
    }
  };

  const draw2D = (ctx) => {
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
      ctx.fillStyle = getColorForClass(point.class);
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

  const draw3D = (ctx) => {
    const transformedPoints = transformPoints(points);

    // Draw transformed grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i += 0.2) {
      drawLine(
        ctx,
        transformPoint({ x: i, y: -1, z: -1 }),
        transformPoint({ x: i, y: 1, z: -1 })
      );
      drawLine(
        ctx,
        transformPoint({ x: i, y: -1, z: 1 }),
        transformPoint({ x: i, y: 1, z: 1 })
      );
      drawLine(
        ctx,
        transformPoint({ x: -1, y: i, z: -1 }),
        transformPoint({ x: 1, y: i, z: -1 })
      );
      drawLine(
        ctx,
        transformPoint({ x: -1, y: i, z: 1 }),
        transformPoint({ x: 1, y: i, z: 1 })
      );
    }

    // Draw points
    transformedPoints.forEach((point) => {
      ctx.fillStyle = getColorForClass(point.class);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw new point and its classification
    if (newPoint) {
      const transformedNewPoint = transformPoint(newPoint);
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(transformedNewPoint.x, transformedNewPoint.y, 5, 0, 2 * Math.PI);
      ctx.fill();

      const nearestNeighbors = findNearestNeighbors(newPoint, k);
      nearestNeighbors.forEach((neighbor) => {
        const transformedNeighbor = transformPoint(neighbor);
        ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
        ctx.beginPath();
        ctx.moveTo(transformedNewPoint.x, transformedNewPoint.y);
        ctx.lineTo(transformedNeighbor.x, transformedNeighbor.y);
        ctx.stroke();
      });
    }
  };

  const drawLine = (ctx, start, end) => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const transformPoint = (point) => {
    const { x, y, z } = point;
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    const rotatedX = cosY * x + sinY * z;
    const rotatedY = sinX * sinY * x + cosX * y - sinX * cosY * z;
    const rotatedZ = -cosX * sinY * x + sinX * y + cosX * cosY * z;

    return {
      x: ((rotatedX + 1) * canvasSize) / 2,
      y: ((-rotatedY + 1) * canvasSize) / 2,
      z: rotatedZ,
      class: point.class,
    };
  };

  const transformPoints = (points) => {
    return points.map(transformPoint);
  };

  const handleCanvasClick = (event) => {
    if (isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const z = is3D ? Math.random() * 2 - 1 : 0;
    const newPoint = {
      x: is3D ? (x / canvasSize) * 2 - 1 : x,
      y: is3D ? -(y / canvasSize) * 2 + 1 : y,
      z,
      class: currentClass,
    };
    setPoints([...points, newPoint]);
  };

  const classifyNewPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const z = is3D ? Math.random() * 2 - 1 : 0;
    setNewPoint({
      x: is3D ? (x / canvasSize) * 2 - 1 : x,
      y: is3D ? -(y / canvasSize) * 2 + 1 : y,
      z,
    });
  };

  const findNearestNeighbors = (point, k) => {
    return points
      .map((p) => ({
        ...p,
        distance: Math.sqrt(
          Math.pow(p.x - point.x, 2) +
            Math.pow(p.y - point.y, 2) +
            Math.pow(p.z - point.z, 2)
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, k);
  };

  const getColorForClass = (classValue) => {
    switch (classValue) {
      case 1:
        return "blue";
      case 2:
        return "red";
      case 3:
        return "green";
      default:
        return "black";
    }
  };

  const handleMouseDown = (event) => {
    if (is3D) {
      setIsDragging(true);
      setLastMousePos({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !is3D) return;

    const dx = event.clientX - lastMousePos.x;
    const dy = event.clientY - lastMousePos.y;

    setRotation({
      x: rotation.x + dy * 0.01,
      y: rotation.y + dx * 0.01,
    });

    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetVisualization = () => {
    setPoints([]);
    setNewPoint(null);
    setRotation({ x: 0, y: 0 });
    setIs3D(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        K-Nearest Neighbors Visualization
      </h2>
      <div className="mb-4 flex space-x-4">
        <label className="mr-2">
          K Value:
          <input
            type="number"
            value={k}
            onChange={(e) => setK(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
          />
        </label>
        <select
          value={currentClass}
          onChange={(e) => setCurrentClass(parseInt(e.target.value))}
          className="px-4 py-2 rounded border"
        >
          <option value={1}>Class 1 (Blue)</option>
          <option value={2}>Class 2 (Red)</option>
          <option value={3}>Class 3 (Green)</option>
        </select>
        <button
          onClick={() => setIs3D(!is3D)}
          className="px-4 py-2 rounded bg-blue-500 text-white"
        >
          Toggle {is3D ? "2D" : "3D"}
        </button>
        <button
          onClick={resetVisualization}
          className="px-4 py-2 rounded bg-red-500 text-white"
        >
          Reset
        </button>
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-300 cursor-crosshair"
      />
      <p className="mt-2">
        Left-click to add points. Right-click to classify a new point.
        {is3D && " In 3D mode, click and drag to rotate the view."}
      </p>
    </div>
  );
}
