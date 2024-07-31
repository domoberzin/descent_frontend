import React, { useState, useEffect, useRef } from "react";

export default function GradientBoostingVisualization() {
  const [numTrees, setNumTrees] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [data, setData] = useState([]);
  const [models, setModels] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    generateData();
  }, []);

  useEffect(() => {
    if (data.length > 0) drawVisualization();
  }, [data, models]);

  const generateData = () => {
    const newData = Array(100)
      .fill()
      .map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        label: Math.random() > 0.5 ? 1 : -1,
      }));
    setData(newData);
  };

  const trainModel = () => {
    let residuals = data.map((point) => point.label);
    const newModels = [];

    for (let i = 0; i < numTrees; i++) {
      const model = fitSimpleModel(residuals);
      newModels.push(model);

      // Update residuals
      residuals = residuals.map(
        (r, index) => r - learningRate * predict(data[index], model)
      );
    }

    setModels(newModels);
  };

  const fitSimpleModel = (residuals) => {
    // Simplified: just find the best split point
    let bestSplit = null;
    let bestError = Infinity;

    for (let i = 0; i < 100; i += 5) {
      const leftSum = residuals.reduce(
        (sum, r, index) => sum + (data[index].x < i ? r : 0),
        0
      );
      const rightSum = residuals.reduce(
        (sum, r, index) => sum + (data[index].x >= i ? r : 0),
        0
      );
      const error = Math.abs(leftSum) + Math.abs(rightSum);

      if (error < bestError) {
        bestError = error;
        bestSplit = i;
      }
    }

    return {
      split: bestSplit,
      leftValue:
        residuals.reduce(
          (sum, r, index) => sum + (data[index].x < bestSplit ? r : 0),
          0
        ) / data.filter((d) => d.x < bestSplit).length,
    };
  };

  const predict = (point, model) => {
    return point.x < model.split ? model.leftValue : -model.leftValue;
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw data points
    data.forEach((point) => {
      ctx.fillStyle = point.label === 1 ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(point.x * 4, point.y * 4, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw model predictions
    if (models.length > 0) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      for (let x = 0; x < 100; x++) {
        const y1 =
          models.reduce(
            (sum, model) => sum + learningRate * predict({ x }, model),
            0
          ) *
            2 +
          200;
        const y2 =
          models.reduce(
            (sum, model) => sum + learningRate * predict({ x: x + 1 }, model),
            0
          ) *
            2 +
          200;
        ctx.beginPath();
        ctx.moveTo(x * 4, y1);
        ctx.lineTo((x + 1) * 4, y2);
        ctx.stroke();
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Gradient Boosting Visualization
      </h2>
      <div className="mb-4">
        <label className="mr-4">
          Number of Trees:
          <input
            type="number"
            value={numTrees}
            onChange={(e) => setNumTrees(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
          />
        </label>
        <label className="mr-4">
          Learning Rate:
          <input
            type="number"
            value={learningRate}
            onChange={(e) =>
              setLearningRate(Math.max(0.01, parseFloat(e.target.value)))
            }
            className="ml-2 w-20 border rounded px-2 py-1"
            min="0.01"
            max="1"
            step="0.01"
          />
        </label>
        <button
          onClick={trainModel}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          Train Model
        </button>
        <button
          onClick={generateData}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Generate New Data
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border border-gray-300"
      />
    </div>
  );
}
