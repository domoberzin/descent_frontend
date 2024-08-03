import { useState, useEffect, useRef } from "react";

export default function GradientBoost() {
  const [numTrees, setNumTrees] = useState(5);
  const [learningRate, setLearningRate] = useState(0.1);
  const [data, setData] = useState([]);
  const [models, setModels] = useState([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [dataSize, setDataSize] = useState(100);
  const [iterationDelay, setIterationDelay] = useState(500);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    generateData();
  }, [dataSize]);

  useEffect(() => {
    if (data.length > 0) drawVisualization();
  }, [data, models, currentIteration, showPredictions, selectedPoint]);

  useEffect(() => {
    if (trainingLogs.length > 0) drawChart();
  }, [trainingLogs]);

  const generateData = () => {
    const newData = Array(dataSize)
      .fill()
      .map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        label: Math.random() > 0.5 ? 1 : -1,
      }));
    setData(newData);
    setModels([]);
    setCurrentIteration(0);
    setTrainingLogs([]);
  };

  const trainModel = async () => {
    setIsTraining(true);
    let residuals = data.map((point) => point.label);
    const newModels = [];

    for (let i = 0; i < numTrees; i++) {
      if (!isTraining) break;

      const model = fitSimpleModel(residuals);
      newModels.push(model);

      // Update residuals
      residuals = residuals.map(
        (r, index) => r - learningRate * predict(data[index], model)
      );

      // Calculate training metrics
      const mse = calculateMSE(residuals);
      const accuracy = calculateAccuracy(newModels);

      setModels([...newModels]);
      setCurrentIteration(i + 1);
      setTrainingLogs((prevLogs) => [
        ...prevLogs,
        { iteration: i + 1, mse, accuracy },
      ]);

      await new Promise((resolve) => setTimeout(resolve, iterationDelay));
    }

    setIsTraining(false);
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

  const calculateMSE = (residuals) => {
    return residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
  };

  const calculateAccuracy = (models) => {
    const correct = data.reduce((sum, point) => {
      const prediction = models.reduce(
        (acc, model) => acc + learningRate * predict(point, model),
        0
      );
      return sum + (Math.sign(prediction) === point.label ? 1 : 0);
    }, 0);
    return correct / data.length;
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw data points
    data.forEach((point, index) => {
      ctx.fillStyle = point.label === 1 ? "blue" : "red";
      ctx.beginPath();
      ctx.arc(point.x * 4, point.y * 4, 3, 0, 2 * Math.PI);
      ctx.fill();

      if (index === selectedPoint) {
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
      for (let x = 0; x < 100; x++) {
        const y1 =
          models
            .slice(0, currentIteration)
            .reduce(
              (sum, model) => sum + learningRate * predict({ x }, model),
              0
            ) *
            2 +
          200;
        const y2 =
          models
            .slice(0, currentIteration)
            .reduce(
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

  const drawChart = () => {
    const ctx = chartRef.current.getContext("2d");
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

    const maxMSE = Math.max(...trainingLogs.map((log) => log.mse));

    ctx.strokeStyle = "blue";
    ctx.beginPath();
    trainingLogs.forEach((log, index) => {
      const x = (index / (trainingLogs.length - 1)) * chartRef.current.width;
      const y =
        chartRef.current.height - log.accuracy * chartRef.current.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "red";
    ctx.beginPath();
    trainingLogs.forEach((log, index) => {
      const x = (index / (trainingLogs.length - 1)) * chartRef.current.width;
      const y =
        chartRef.current.height - (log.mse / maxMSE) * chartRef.current.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / 4;
    const y = (event.clientY - rect.top) / 4;

    const clickedPointIndex = data.findIndex(
      (point) => Math.abs(point.x - x) < 1 && Math.abs(point.y - y) < 1
    );

    setSelectedPoint(clickedPointIndex !== -1 ? clickedPointIndex : null);
  };

  const togglePointLabel = () => {
    if (selectedPoint !== null) {
      const newData = [...data];
      newData[selectedPoint].label *= -1;
      setData(newData);
      setModels([]);
      setCurrentIteration(0);
      setTrainingLogs([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <h2 className="text-3xl font-bold mb-6">
        Gradient Boosting Visualization
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
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
        <button
          onClick={generateData}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Generate New Data
        </button>
        <button
          onClick={() => setShowPredictions(!showPredictions)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
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
                  <th className="px-2 py-1 border-b">MSE</th>
                  <th className="px-2 py-1 border-b">Accuracy</th>
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
                      {log.mse.toFixed(4)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {log.accuracy.toFixed(4)}
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
              MSE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
