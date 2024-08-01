import { useState, useEffect, useRef } from "react";

export default function SVM() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [svmLine, setSvmLine] = useState(null);
  const [svmPlane, setSvmPlane] = useState(null);
  const [currentClass, setCurrentClass] = useState(1);
  const [equation, setEquation] = useState("");
  const [is3D, setIs3D] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const canvasSize = 400;
  const gridSize = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, svmLine, svmPlane, currentClass, is3D, rotation]);

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
      ctx.arc(
        ((point.x + 1) * canvasSize) / 2,
        ((1 - point.y) * canvasSize) / 2,
        5,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });

    // Draw SVM line
    if (svmLine) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(svmLine.x1, svmLine.y1);
      ctx.lineTo(svmLine.x2, svmLine.y2);
      ctx.stroke();
    }
  };

  const draw3D = (ctx) => {
    const points3D = transformPoints(points);

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

    // Draw SVM plane
    if (svmPlane) {
      const planePoints = generatePlanePoints(svmPlane);
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
      ctx.beginPath();
      const firstPoint = transformPoint(planePoints[0][0]);
      ctx.moveTo(firstPoint.x, firstPoint.y);
      for (let i = 0; i < planePoints.length; i++) {
        for (let j = 0; j < planePoints[i].length; j++) {
          const point = transformPoint(planePoints[i][j]);
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.closePath();
      ctx.fill();
    }

    // Draw points
    points3D.forEach((point) => {
      ctx.fillStyle = getColorForClass(point.class);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
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

  const generatePlanePoints = (plane) => {
    const { a, b, c, d } = plane;
    const points = [];
    for (let x = -1; x <= 1; x += 0.1) {
      const row = [];
      for (let y = -1; y <= 1; y += 0.1) {
        const z = (-d - a * x - b * y) / c;
        row.push({ x, y, z });
      }
      points.push(row);
    }
    return points;
  };

  const handleCanvasClick = (event) => {
    if (isDragging || showContextMenu) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newPoint = {
      x: (x / canvasSize) * 2 - 1,
      y: -(y / canvasSize) * 2 + 1,
      z: is3D ? 0 : 0, // Set z to 0 for both 2D and 3D
      class: currentClass,
    };
    setPoints([...points, newPoint]);
    updateSVM([...points, newPoint]);
  };

  const handleCanvasContextMenu = (event) => {
    event.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedPoint = points.find((point) => {
      const screenPoint = transformPoint(point);
      const distance = Math.sqrt(
        Math.pow(screenPoint.x - x, 2) + Math.pow(screenPoint.y - y, 2)
      );
      return distance < 10; // Adjust this value to change the click sensitivity
    });

    if (clickedPoint) {
      setSelectedPoint(clickedPoint);
      setShowContextMenu(true);
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
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

  const updateSVM = (currentPoints) => {
    if (currentPoints.length < 2) {
      setSvmLine(null);
      setSvmPlane(null);
      setEquation("");
      return;
    }

    const classes = [...new Set(currentPoints.map((p) => p.class))];
    if (classes.length < 2) {
      setSvmLine(null);
      setSvmPlane(null);
      setEquation("");
      return;
    }

    if (!is3D) {
      const class1 = currentPoints.filter((p) => p.class === classes[0]);
      const class2 = currentPoints.filter((p) => p.class === classes[1]);

      const center1 = getCenterPoint(class1);
      const center2 = getCenterPoint(class2);

      const midPoint = {
        x: (center1.x + center2.x) / 2,
        y: (center1.y + center2.y) / 2,
      };

      const angle =
        Math.atan2(center2.y - center1.y, center2.x - center1.x) + Math.PI / 2;

      const lineLength = canvasSize * 1.5;

      const line = {
        x1: midPoint.x - (Math.cos(angle) * lineLength) / 2,
        y1: midPoint.y - (Math.sin(angle) * lineLength) / 2,
        x2: midPoint.x + (Math.cos(angle) * lineLength) / 2,
        y2: midPoint.y + (Math.sin(angle) * lineLength) / 2,
      };

      setSvmLine(line);

      // Calculate line equation
      const m = (line.y2 - line.y1) / (line.x2 - line.x1);
      const b = line.y1 - m * line.x1;
      setEquation(`y = ${m.toFixed(2)}x + ${b.toFixed(2)}`);
    } else {
      // 3D plane calculation (simplified)
      const centroid = getCenterPoint(currentPoints);
      const normal = {
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random() - 0.5,
      };
      const d = -(
        normal.x * centroid.x +
        normal.y * centroid.y +
        normal.z * centroid.z
      );

      setSvmPlane({ a: normal.x, b: normal.y, c: normal.z, d });
      setEquation(
        `${normal.x.toFixed(2)}x + ${normal.y.toFixed(2)}y + ${normal.z.toFixed(
          2
        )}z + ${d.toFixed(2)} = 0`
      );
    }
  };

  const getCenterPoint = (points) => {
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
      { x: 0, y: 0, z: 0 }
    );
    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
      z: sum.z / points.length,
    };
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

  const resetVisualization = () => {
    setPoints([]);
    setSvmLine(null);
    setSvmPlane(null);
    setEquation("");
    setRotation({ x: 0, y: 0 });
    setIs3D(false);
  };

  const handleCoordinateChange = (coord, value) => {
    const updatedPoints = points.map((point) =>
      point === selectedPoint ? { ...point, [coord]: parseFloat(value) } : point
    );
    setPoints(updatedPoints);
    updateSVM(updatedPoints);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
    setSelectedPoint(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">SVM Visualization</h2>
      <div className="mb-4 flex space-x-4">
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
          onClick={() => {
            setIs3D(!is3D);
            setSvmLine(null);
            setSvmPlane(null);
            setEquation("");
            setRotation({ x: 0, y: 0 });
          }}
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasContextMenu}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border border-gray-300 cursor-crosshair"
        />
        {showContextMenu && (
          <div
            className="absolute bg-white border border-gray-300 p-2 rounded shadow"
            style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
          >
            <div className="mb-2">
              <label className="mr-2">X:</label>
              <input
                type="number"
                value={selectedPoint.x}
                onChange={(e) => handleCoordinateChange("x", e.target.value)}
                className="border rounded px-1 w-20"
                step="0.1"
              />
            </div>
            <div className="mb-2">
              <label className="mr-2">Y:</label>
              <input
                type="number"
                value={selectedPoint.y}
                onChange={(e) => handleCoordinateChange("y", e.target.value)}
                className="border rounded px-1 w-20"
                step="0.1"
              />
            </div>
            {is3D && (
              <div className="mb-2">
                <label className="mr-2">Z:</label>
                <input
                  type="number"
                  value={selectedPoint.z}
                  onChange={(e) => handleCoordinateChange("z", e.target.value)}
                  className="border rounded px-1 w-20"
                  step="0.1"
                />
              </div>
            )}
            <button
              onClick={closeContextMenu}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        )}
      </div>
      {equation && <p className="mt-2">Equation: {equation}</p>}
      <p className="mt-2">
        Click on the canvas to add points. Use the dropdown to select the class.
        {is3D &&
          " In 3D mode, click and drag to rotate the view. Right-click on points to edit coordinates."}
      </p>
    </div>
  );
}
