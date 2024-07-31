import React, { useState, useEffect, useRef } from "react";

export default function XGBoostVisualization() {
  const [numTrees, setNumTrees] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [regularization, setRegularization] = useState(1);
  const [maxDepth, setMaxDepth] = useState(3);
  const [data, setData] = useState([]);
  const [models, setModels] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    generateData();
  }, []);

  useEffect(() => {
    if (data.length > 0) drawVisualization();
  }, [data, models, currentIteration]);

  const generateData = () => {
    const newData = Array(200)
      .fill()
      .map(() => ({
        x: Math.random() * 100,
        y: Math.sin(Math.random() * Math.PI * 2) * 50 + 50,
        label: Math.random() > 0.5 ? 1 : 0,
      }));
    setData(newData);
    setModels([]);
    setCurrentIteration(0);
  };

  const trainModel = async () => {
    let predictions = data.map(() => 0.5);
    const newModels = [];

    for (let i = 0; i < numTrees; i++) {
      const gradients = data.map(
        (point, index) => point.label - predictions[index]
      );
      const hessians = data.map((_, index) => {
        const p = predictions[index];
        return p * (1 - p);
      });

      const model = fitTree(
        gradients,
        hessians,
        0,
        data.map((_, i) => i)
      );
      newModels.push(model);

      // Update predictions
      predictions = predictions.map((p, index) => {
        const newP = p + learningRate * predictTree(data[index], model);
        return 1 / (1 + Math.exp(-newP)); // Apply sigmoid to get probability
      });

      setModels([...newModels]);
      setCurrentIteration(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for visualization
    }
  };

  const fitTree = (gradients, hessians, depth, indices) => {
    if (depth >= maxDepth || indices.length <= 1) {
      const sumGradients = indices.reduce((sum, i) => sum + gradients[i], 0);
      const sumHessians = indices.reduce((sum, i) => sum + hessians[i], 0);
      return {
        type: "leaf",
        value: sumGradients / (sumHessians + regularization),
      };
    }

    let bestSplit = null;
    let bestGain = -Infinity;
    let bestLeftIndices = [];
    let bestRightIndices = [];

    for (let feature of ["x", "y"]) {
      const sortedIndices = indices.sort(
        (a, b) => data[a][feature] - data[b][feature]
      );
      const uniqueValues = [
        ...new Set(sortedIndices.map((i) => data[i][feature])),
      ];

      for (let splitValue of uniqueValues) {
        const leftIndices = sortedIndices.filter(
          (i) => data[i][feature] < splitValue
        );
        const rightIndices = sortedIndices.filter(
          (i) => data[i][feature] >= splitValue
        );

        if (leftIndices.length === 0 || rightIndices.length === 0) continue;

        const leftSum = leftIndices.reduce((sum, i) => sum + gradients[i], 0);
        const rightSum = rightIndices.reduce((sum, i) => sum + gradients[i], 0);
        const leftHessianSum = leftIndices.reduce(
          (sum, i) => sum + hessians[i],
          0
        );
        const rightHessianSum = rightIndices.reduce(
          (sum, i) => sum + hessians[i],
          0
        );

        const gain =
          (leftSum * leftSum) / (leftHessianSum + regularization) +
          (rightSum * rightSum) / (rightHessianSum + regularization) -
          ((leftSum + rightSum) * (leftSum + rightSum)) /
            (leftHessianSum + rightHessianSum + regularization);

        if (gain > bestGain) {
          bestGain = gain;
          bestSplit = { feature, value: splitValue };
          bestLeftIndices = leftIndices;
          bestRightIndices = rightIndices;
        }
      }
    }

    if (bestSplit === null) {
      const sumGradients = indices.reduce((sum, i) => sum + gradients[i], 0);
      const sumHessians = indices.reduce((sum, i) => sum + hessians[i], 0);
      return {
        type: "leaf",
        value: sumGradients / (sumHessians + regularization),
      };
    }

    return {
      type: "node",
      split: bestSplit,
      left: fitTree(gradients, hessians, depth + 1, bestLeftIndices),
      right: fitTree(gradients, hessians, depth + 1, bestRightIndices),
    };
  };

  const predictTree = (point, tree) => {
    if (tree.type === "leaf") {
      return tree.value;
    }
    if (point[tree.split.feature] < tree.split.value) {
      return predictTree(point, tree.left);
    } else {
      return predictTree(point, tree.right);
    }
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
      for (let x = 0; x <= 100; x++) {
        for (let y = 0; y <= 100; y++) {
          const prob =
            1 /
            (1 +
              Math.exp(
                -models
                  .slice(0, currentIteration)
                  .reduce(
                    (sum, model) =>
                      sum + learningRate * predictTree({ x, y }, model),
                    0
                  )
              ));
          ctx.fillStyle = `rgba(0, 255, 0, ${prob * 0.5})`;
          ctx.fillRect(x * 4, y * 4, 4, 4);
        }
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">XGBoost Visualization</h2>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <label>
          Number of Trees:
          <input
            type="number"
            value={numTrees}
            onChange={(e) => setNumTrees(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
          />
        </label>
        <label>
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
        <label>
          Regularization:
          <input
            type="number"
            value={regularization}
            onChange={(e) =>
              setRegularization(Math.max(0, parseFloat(e.target.value)))
            }
            className="ml-2 w-20 border rounded px-2 py-1"
            min="0"
            step="0.1"
          />
        </label>
        <label>
          Max Depth:
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
          />
        </label>
      </div>
      <div className="mb-4">
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
      <p className="mt-2">
        Current iteration: {currentIteration} / {numTrees}
      </p>
    </div>
  );
}
