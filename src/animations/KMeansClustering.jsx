import { useState, useEffect, useRef } from "react";

export default function KMC() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [autoRun, setAutoRun] = useState(false);

  const canvasSize = 400;
  const gridSize = 20;

  useEffect(() => {
    drawCanvas();
  }, [points, k, centroids]);

  useEffect(() => {
    if (autoRun && centroids.length > 0 && !isRunning) {
      runKMeans();
    }
  }, [autoRun, centroids, isRunning]);

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
      ctx.fillStyle =
        point.cluster !== undefined ? getClusterColor(point.cluster) : "black";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw centroids
    centroids.forEach((centroid, index) => {
      ctx.fillStyle = getClusterColor(index);
      ctx.beginPath();
      ctx.arc(centroid.x, centroid.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();
    });
  };

  const getClusterColor = (index) => {
    const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
    return colors[index % colors.length];
  };

  const handleCanvasClick = (event) => {
    if (isRunning) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setPoints([...points, { x, y }]);
  };

  const initializeCentroids = () => {
    const newCentroids = Array(k)
      .fill()
      .map(() => ({
        x: Math.random() * canvasSize,
        y: Math.random() * canvasSize,
      }));
    setCentroids(newCentroids);
    setIterations(0);
  };

  const runKMeans = async () => {
    setIsRunning(true);
    let oldCentroids;
    let iterationCount = 0;
    do {
      oldCentroids = [...centroids];
      assignPointsToClusters();
      updateCentroids();
      setIterations(++iterationCount);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for visualization
    } while (!centroidsEqual(oldCentroids, centroids) && iterationCount < 50); // Add iteration limit
    setIsRunning(false);
  };

  const assignPointsToClusters = () => {
    const newPoints = points.map((point) => {
      const distances = centroids.map((centroid, index) => ({
        index,
        distance: Math.sqrt(
          Math.pow(centroid.x - point.x, 2) + Math.pow(centroid.y - point.y, 2)
        ),
      }));
      const nearestCentroid = distances.reduce((min, curr) =>
        curr.distance < min.distance ? curr : min
      );
      return { ...point, cluster: nearestCentroid.index };
    });
    setPoints(newPoints);
  };

  const updateCentroids = () => {
    const newCentroids = centroids.map((_, index) => {
      const clusterPoints = points.filter((point) => point.cluster === index);
      if (clusterPoints.length === 0) return centroids[index];
      const sumX = clusterPoints.reduce((sum, point) => sum + point.x, 0);
      const sumY = clusterPoints.reduce((sum, point) => sum + point.y, 0);
      return {
        x: sumX / clusterPoints.length,
        y: sumY / clusterPoints.length,
      };
    });
    setCentroids(newCentroids);
  };

  const centroidsEqual = (c1, c2) => {
    return c1.every(
      (centroid, index) =>
        Math.abs(centroid.x - c2[index].x) < 0.001 &&
        Math.abs(centroid.y - c2[index].y) < 0.001
    );
  };

  const resetVisualization = () => {
    setPoints([]);
    setCentroids([]);
    setIterations(0);
    setIsRunning(false);
  };

  const generateRandomPoints = () => {
    const numPoints = 50; // You can adjust this number
    const newPoints = Array(numPoints)
      .fill()
      .map(() => ({
        x: Math.random() * canvasSize,
        y: Math.random() * canvasSize,
      }));
    setPoints(newPoints);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        ✅ K-Means Clustering Visualization
      </h2>
      <div className="mb-4 flex flex-wrap gap-2">
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
        <button
          onClick={initializeCentroids}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isRunning}
        >
          Initialize Centroids
        </button>
        <button
          onClick={runKMeans}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={isRunning || centroids.length === 0}
        >
          Run K-Means
        </button>
        <button
          onClick={resetVisualization}
          className="px-4 py-2 bg-red-500 text-white rounded"
          disabled={isRunning}
        >
          Reset
        </button>
        <button
          onClick={generateRandomPoints}
          className="px-4 py-2 bg-purple-500 text-white rounded"
          disabled={isRunning}
        >
          Generate Random Points
        </button>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoRun}
            onChange={() => setAutoRun(!autoRun)}
            className="mr-2"
          />
          Auto-run
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onClick={handleCanvasClick}
        className="border border-gray-300 cursor-crosshair"
      />
      <p className="mt-2">
        Click to add points. Initialize centroids, then run K-means.
      </p>
      <p className="mt-2">Iterations: {iterations}</p>
    </div>
  );
}
