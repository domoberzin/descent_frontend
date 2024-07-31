import React, { useState, useEffect, useRef } from "react";

export default function SVM() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [svmLine, setSvmLine] = useState(null);

  const canvasSize = 400;
  const gridSize = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, svmLine]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear canvas
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

    // Draw SVM line
    if (svmLine) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(svmLine.x1, svmLine.y1);
      ctx.lineTo(svmLine.x2, svmLine.y2);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const newPoint = { x, y, class: points.length % 2 === 0 ? 1 : -1 };
    setPoints([...points, newPoint]);
    updateSVM([...points, newPoint]);
  };

  const updateSVM = (currentPoints) => {
    if (currentPoints.length < 2) {
      setSvmLine(null);
      return;
    }

    // Simple SVM implementation (not a real SVM, just for visualization)
    const class1 = currentPoints.filter((p) => p.class === 1);
    const class2 = currentPoints.filter((p) => p.class === -1);

    if (class1.length === 0 || class2.length === 0) {
      setSvmLine(null);
      return;
    }

    const center1 = getCenterPoint(class1);
    const center2 = getCenterPoint(class2);

    const midPoint = {
      x: (center1.x + center2.x) / 2,
      y: (center1.y + center2.y) / 2,
    };

    const angle =
      Math.atan2(center2.y - center1.y, center2.x - center1.x) + Math.PI / 2;

    const lineLength = canvasSize * 1.5;

    setSvmLine({
      x1: midPoint.x - (Math.cos(angle) * lineLength) / 2,
      y1: midPoint.y - (Math.sin(angle) * lineLength) / 2,
      x2: midPoint.x + (Math.cos(angle) * lineLength) / 2,
      y2: midPoint.y + (Math.sin(angle) * lineLength) / 2,
    });
  };

  const getCenterPoint = (points) => {
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">SVM Visualization</h2>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        className="border border-gray-300 cursor-crosshair"
      />
      <p className="mt-2">
        Click on the canvas to add points. Blue points are class 1, red points
        are class -1.
      </p>
    </div>
  );
}
