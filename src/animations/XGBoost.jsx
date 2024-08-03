import { useState, useEffect, useRef } from "react";

export default function XGBoost() {
  const [numTrees, setNumTrees] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [regularization, setRegularization] = useState(1);
  const [maxDepth, setMaxDepth] = useState(3);
  const [data, setData] = useState([]);
  const [models, setModels] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showPredictions, setShowPredictions] = useState(true);
  const [dataSize, setDataSize] = useState(200);
  const [iterationDelay, setIterationDelay] = useState(500);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(false);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    generateData();
  }, []);

  useEffect(() => {
    if (data.length > 0) drawVisualization();
  }, [
    data,
    models,
    currentIteration,
    showPredictions,
    selectedPoint,
    showDecisionBoundary,
  ]);

  useEffect(() => {
    if (trainingLogs.length > 0) drawChart();
  }, [trainingLogs]);

  const generateData = () => {
    const newData = Array(dataSize)
      .fill()
      .map(() => ({
        x: Math.random() * 100,
        y: Math.sin(Math.random() * Math.PI * 2) * 50 + 50,
        label: Math.random() > 0.5 ? 1 : 0,
      }));
    setData(newData);
    resetModel();
  };

  const resetModel = () => {
    setModels([]);
    setCurrentIteration(0);
    setIsTraining(false);
    setSelectedPoint(null);
    setTrainingLogs([]);
  };

  const trainModel = async () => {
    setIsTraining(true);
    setTrainingLogs([]);
    let predictions = data.map(() => 0.5);
    let newModels = [];

    for (let i = 0; i < numTrees; i++) {
      if (!isTraining) break; // Check if training should stop

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

      // Calculate training metrics
      const accuracy = calculateAccuracy(predictions, data);
      const logLoss = calculateLogLoss(predictions, data);

      // Update state
      setModels([...newModels]);
      setCurrentIteration(i + 1);
      setTrainingLogs((prevLogs) => [
        ...prevLogs,
        { iteration: i + 1, accuracy, logLoss },
      ]);

      // Force a redraw and pause
      await new Promise((resolve) => setTimeout(resolve, iterationDelay));
    }

    setIsTraining(false);
  };

  const calculateAccuracy = (predictions, data) => {
    const correct = predictions.reduce((sum, pred, index) => {
      return sum + ((pred > 0.5 ? 1 : 0) === data[index].label ? 1 : 0);
    }, 0);
    return correct / data.length;
  };

  const calculateLogLoss = (predictions, data) => {
    const loss = predictions.reduce((sum, pred, index) => {
      const label = data[index].label;
      return sum - (label * Math.log(pred) + (1 - label) * Math.log(1 - pred));
    }, 0);
    return loss / data.length;
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

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw decision boundary
    if (showDecisionBoundary && models.length > 0) {
      for (let x = 0; x <= 100; x++) {
        for (let y = 0; y <= 100; y++) {
          const prob = predictProbability({ x, y });
          ctx.fillStyle = `rgba(0, 255, 0, ${prob * 0.5})`;
          ctx.fillRect(x * 4, y * 4, 4, 4);
        }
      }
    }

    // Draw data points
    data.forEach((point, index) => {
      ctx.fillStyle = point.label === 1 ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(point.x * 4, point.y * 4, 3, 0, 2 * Math.PI);
      ctx.fill();

      if (index === selectedPoint || index === hoveredPoint) {
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x * 4, point.y * 4, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw model predictions
    if (models.length > 0 && showPredictions) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      for (let x = 0; x <= 100; x += 2) {
        for (let y = 0; y <= 100; y += 2) {
          const prob = predictProbability({ x, y });
          ctx.fillStyle = `rgba(0, 255, 0, ${prob * 0.5})`;
          ctx.fillRect(x * 4, y * 4, 8, 8);
        }
      }
    }
  };

  const predictProbability = (point) => {
    return (
      1 /
      (1 +
        Math.exp(
          -models
            .slice(0, currentIteration)
            .reduce(
              (sum, model) => sum + learningRate * predictTree(point, model),
              0
            )
        ))
    );
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / 4;
    const y = (event.clientY - rect.top) / 4;

    const clickedPointIndex = data.findIndex(
      (point) => Math.abs(point.x - x) < 1 && Math.abs(point.y - y) < 1
    );

    if (clickedPointIndex !== -1) {
      setSelectedPoint(clickedPointIndex);
    } else {
      setSelectedPoint(null);
    }
  };

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / 4;
    const y = (event.clientY - rect.top) / 4;

    const hoveredPointIndex = data.findIndex(
      (point) => Math.abs(point.x - x) < 1 && Math.abs(point.y - y) < 1
    );

    setHoveredPoint(hoveredPointIndex !== -1 ? hoveredPointIndex : null);
  };

  const togglePointLabel = () => {
    if (selectedPoint !== null) {
      const newData = [...data];
      newData[selectedPoint].label = 1 - newData[selectedPoint].label;
      setData(newData);
      resetModel();
    }
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  const drawChart = () => {
    const ctx = chartRef.current.getContext("2d");
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

    const maxAccuracy = Math.max(...trainingLogs.map((log) => log.accuracy));
    const maxLogLoss = Math.max(...trainingLogs.map((log) => log.logLoss));

    ctx.strokeStyle = "blue";
    ctx.beginPath();
    trainingLogs.forEach((log, index) => {
      const x = (index / (trainingLogs.length - 1)) * chartRef.current.width;
      const y =
        chartRef.current.height -
        (log.accuracy / maxAccuracy) * chartRef.current.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    trainingLogs.forEach((log, index) => {
      const x = (index / (trainingLogs.length - 1)) * chartRef.current.width;
      const y =
        chartRef.current.height -
        (log.logLoss / maxLogLoss) * chartRef.current.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
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
        <label>
          Data Size:
          <input
            type="number"
            value={dataSize}
            onChange={(e) =>
              setDataSize(Math.max(10, parseInt(e.target.value)))
            }
            className="ml-2 w-20 border rounded px-2 py-1"
            min="10"
          />
        </label>
        <label>
          Iteration Delay (ms):
          <input
            type="number"
            value={iterationDelay}
            onChange={(e) =>
              setIterationDelay(Math.max(0, parseInt(e.target.value)))
            }
            className="ml-2 w-20 border rounded px-2 py-1"
            min="0"
          />
        </label>
      </div>
      {/* <div className="mb-4">
        <button
          onClick={trainModel}
          disabled={isTraining}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          {isTraining ? "Training..." : "Train Model"}
        </button>
        {isTraining && (
          <button
            onClick={stopTraining}
            className="px-4 py-2 bg-yellow-500 text-white rounded mr-2"
          >
            Stop Training
          </button>
        )}
        <button
          onClick={generateData}
          className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
        >
          Generate New Data
        </button>
        <button
          onClick={resetModel}
          className="px-4 py-2 bg-red-500 text-white rounded mr-2"
        >
          Reset Model
        </button>
        <button
          onClick={() => setShowPredictions(!showPredictions)}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          {showPredictions ? "Hide Predictions" : "Show Predictions"}
        </button>
      </div>
      <div className="flex">
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-300 cursor-pointer"
            onClick={handleCanvasClick}
          />
          <p className="mt-2">
            Current iteration: {currentIteration} / {numTrees}
          </p>
          {selectedPoint !== null && (
            <div className="mt-2">
              <p>
                Selected Point: ({data[selectedPoint].x.toFixed(2)},{" "}
                {data[selectedPoint].y.toFixed(2)})
              </p>
              <p>Label: {data[selectedPoint].label}</p>
              <button
                onClick={togglePointLabel}
                className="px-4 py-2 bg-yellow-500 text-white rounded mt-2"
              >
                Toggle Label
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-xl font-bold mb-2">Training Logs</h3>
          <div className="h-96 overflow-y-auto border border-gray-300 p-2">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-2 py-1">Iteration</th>
                  <th className="px-2 py-1">Accuracy</th>
                  <th className="px-2 py-1">Log Loss</th>
                </tr>
              </thead>
              <tbody>
                {trainingLogs.map((log, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-100" : ""}
                  >
                    <td className="px-2 py-1 text-center">{log.iteration}</td>
                    <td className="px-2 py-1 text-center">
                      {log.accuracy.toFixed(4)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {log.logLoss.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> */}
      <div className="mb-6 space-x-4">
        <button
          onClick={trainModel}
          disabled={isTraining}
          className={`px-4 py-2 rounded ${
            isTraining ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {isTraining ? "Training..." : "Train Model"}
        </button>
        {isTraining && (
          <button
            onClick={stopTraining}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Stop Training
          </button>
        )}
        <button
          onClick={generateData}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Generate New Data
        </button>
        <button
          onClick={resetModel}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Reset Model
        </button>
        <button
          onClick={() => setShowPredictions(!showPredictions)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
        >
          {showPredictions ? "Hide Predictions" : "Show Predictions"}
        </button>
        <button
          onClick={() => setShowDecisionBoundary(!showDecisionBoundary)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
        >
          {showDecisionBoundary
            ? "Hide Decision Boundary"
            : "Show Decision Boundary"}
        </button>
      </div>
      <div className="flex">
        <div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-300 cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
          />
          <p className="mt-2">
            Current iteration: {currentIteration} / {numTrees}
          </p>
          {selectedPoint !== null && (
            <div className="mt-4">
              <p>
                Selected Point: ({data[selectedPoint].x.toFixed(2)},{" "}
                {data[selectedPoint].y.toFixed(2)})
              </p>
              <p>Label: {data[selectedPoint].label}</p>
              <button
                onClick={togglePointLabel}
                className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
              >
                Toggle Label
              </button>
            </div>
          )}
        </div>
        <div className="ml-8 flex-1">
          <h3 className="text-xl font-bold mb-2">Training Logs</h3>
          <div className="h-72 overflow-y-auto border border-gray-300 p-2">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b">Iteration</th>
                  <th className="px-2 py-1 border-b">Accuracy</th>
                  <th className="px-2 py-1 border-b">Log Loss</th>
                </tr>
              </thead>
              <tbody>
                {trainingLogs.map((log, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-100" : ""}
                  >
                    <td className="px-2 py-1 text-center">{log.iteration}</td>
                    <td className="px-2 py-1 text-center">
                      {log.accuracy.toFixed(4)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {log.logLoss.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="text-xl font-bold mt-6 mb-2">
            Training Metrics Chart
          </h3>
          <canvas
            ref={chartRef}
            width={400}
            height={200}
            className="border border-gray-300"
          />
          <div className="flex justify-center mt-2 space-x-6">
            <div>
              <span className="inline-block w-5 h-3 bg-blue-500 mr-2"></span>
              Accuracy
            </div>
            <div>
              <span className="inline-block w-5 h-3 bg-red-500 mr-2"></span>
              Log Loss
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
