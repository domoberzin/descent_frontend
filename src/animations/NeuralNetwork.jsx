import React, { useState, useCallback, useEffect } from "react";

export default function NeuralNetwork() {
  const [layers, setLayers] = useState([3, 4, 2]);
  const [activations, setActivations] = useState([]);
  const [weights, setWeights] = useState([]);
  const [biases, setBiases] = useState([]);
  const [direction, setDirection] = useState("forward");
  const [activationFunction, setActivationFunction] = useState("sigmoid");
  const [currentStep, setCurrentStep] = useState(0);
  const [dropoutRate, setDropoutRate] = useState(0.5);
  const [useBatchNorm, setUseBatchNorm] = useState(false);
  const [batchNormParams, setBatchNormParams] = useState([]);
  const [gradients, setGradients] = useState({ weights: [], biases: [] });

  const initializeNetwork = useCallback(() => {
    const newActivations = layers.map((layerSize) => Array(layerSize).fill(0));
    setActivations(newActivations);

    const newWeights = [];
    const newBiases = [];
    const newBatchNormParams = [];
    for (let i = 0; i < layers.length - 1; i++) {
      newWeights.push(
        Array(layers[i])
          .fill()
          .map(() =>
            Array(layers[i + 1])
              .fill()
              .map(() => Math.random() * 2 - 1)
          )
      );
      newBiases.push(Array(layers[i + 1]).fill(0));
      newBatchNormParams.push({
        gamma: Array(layers[i + 1]).fill(1),
        beta: Array(layers[i + 1]).fill(0),
        movingMean: Array(layers[i + 1]).fill(0),
        movingVariance: Array(layers[i + 1]).fill(1),
      });
    }
    setWeights(newWeights);
    setBiases(newBiases);
    setBatchNormParams(newBatchNormParams);
    setGradients({ weights: [], biases: [] });
  }, [layers]);

  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  const handleLayerChange = (index, value) => {
    const newLayers = [...layers];
    const newSize = Math.max(parseInt(value) || 1, 1);
    newLayers[index] = newSize;
    setLayers(newLayers);
    initializeNetwork();
  };

  const addLayer = () => setLayers([...layers, 1]);
  const removeLayer = () => layers.length > 2 && setLayers(layers.slice(0, -1));
  const toggleDirection = () =>
    setDirection(direction === "forward" ? "backward" : "forward");

  const applyActivationFunction = (x) => {
    switch (activationFunction) {
      case "sigmoid":
        return 1 / (1 + Math.exp(-x));
      case "relu":
        return Math.max(0, x);
      case "tanh":
        return Math.tanh(x);
      default:
        return x;
    }
  };

  const applyActivationFunctionDerivative = (x) => {
    switch (activationFunction) {
      case "sigmoid":
        const sig = applyActivationFunction(x);
        return sig * (1 - sig);
      case "relu":
        return x > 0 ? 1 : 0;
      case "tanh":
        const tanh = Math.tanh(x);
        return 1 - tanh * tanh;
      default:
        return 1;
    }
  };

  const applyDropout = (layerActivations) => {
    return layerActivations.map((a) =>
      Math.random() > dropoutRate ? a / (1 - dropoutRate) : 0
    );
  };

  const applyBatchNorm = (layerIndex, layerActivations) => {
    const { gamma, beta, movingMean, movingVariance } =
      batchNormParams[layerIndex];
    const mean =
      layerActivations.reduce((sum, a) => sum + a, 0) / layerActivations.length;
    const variance =
      layerActivations.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) /
      layerActivations.length;

    // Update moving average and variance
    const momentum = 0.9;
    batchNormParams[layerIndex].movingMean =
      momentum * movingMean + (1 - momentum) * mean;
    batchNormParams[layerIndex].movingVariance =
      momentum * movingVariance + (1 - momentum) * variance;

    return layerActivations.map(
      (a, i) => gamma[i] * ((a - mean) / Math.sqrt(variance + 1e-8)) + beta[i]
    );
  };

  const stepForward = () => {
    if (currentStep < layers.length - 1) {
      const newActivations = [...activations];
      const layerIndex = currentStep;
      let layerInput = newActivations[layerIndex];

      if (useBatchNorm && layerIndex > 0) {
        layerInput = applyBatchNorm(layerIndex - 1, layerInput);
      }

      if (dropoutRate > 0) {
        layerInput = applyDropout(layerInput);
      }

      for (let j = 0; j < layers[layerIndex + 1]; j++) {
        let sum = biases[layerIndex][j];
        for (let k = 0; k < layers[layerIndex]; k++) {
          sum += layerInput[k] * weights[layerIndex][k][j];
        }
        newActivations[layerIndex + 1][j] = applyActivationFunction(sum);
      }

      setActivations(newActivations);
      setCurrentStep(currentStep + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      const newGradients = {
        weights: [...gradients.weights],
        biases: [...gradients.biases],
      };
      const layerIndex = currentStep - 1;

      // Initialize gradients if not exist
      if (!newGradients.weights[layerIndex]) {
        newGradients.weights[layerIndex] = weights[layerIndex].map((row) =>
          row.map(() => 0)
        );
        newGradients.biases[layerIndex] = biases[layerIndex].map(() => 0);
      }

      // Compute output layer gradients
      if (layerIndex === layers.length - 2) {
        for (let j = 0; j < layers[layerIndex + 1]; j++) {
          const error = activations[layerIndex + 1][j] - (j === 0 ? 1 : 0); // Assuming binary classification
          const delta =
            error *
            applyActivationFunctionDerivative(activations[layerIndex + 1][j]);

          newGradients.biases[layerIndex][j] += delta;
          for (let k = 0; k < layers[layerIndex]; k++) {
            newGradients.weights[layerIndex][k][j] +=
              activations[layerIndex][k] * delta;
          }
        }
      } else {
        // Compute hidden layer gradients
        for (let j = 0; j < layers[layerIndex + 1]; j++) {
          let delta = 0;
          for (let k = 0; k < layers[layerIndex + 2]; k++) {
            delta +=
              weights[layerIndex + 1][j][k] *
              newGradients.biases[layerIndex + 1][k];
          }
          delta *= applyActivationFunctionDerivative(
            activations[layerIndex + 1][j]
          );

          newGradients.biases[layerIndex][j] += delta;
          for (let k = 0; k < layers[layerIndex]; k++) {
            newGradients.weights[layerIndex][k][j] +=
              activations[layerIndex][k] * delta;
          }
        }
      }

      setGradients(newGradients);
      setCurrentStep(currentStep - 1);
    }
  };

  const resetPropagation = () => {
    setCurrentStep(0);
    initializeNetwork();
  };

  const randomActivation = () => {
    const newActivations = layers.map((layerSize) =>
      Array(layerSize)
        .fill()
        .map(() => Math.random())
    );
    setActivations(newActivations);
    setCurrentStep(0);
    setGradients({ weights: [], biases: [] });
  };

  const updateWeight = (layerIndex, fromNode, toNode, value) => {
    const newWeights = [...weights];
    newWeights[layerIndex][fromNode][toNode] = parseFloat(value);
    setWeights(newWeights);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Neural Network Simulator</h1>
      <div className="mb-4 space-x-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addLayer}
        >
          Add Layer
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={removeLayer}
        >
          Remove Layer
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={toggleDirection}
        >
          {direction === "forward" ? "Switch to Backward" : "Switch to Forward"}
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={randomActivation}
        >
          Random Activation
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={stepForward}
          disabled={currentStep >= layers.length - 1}
        >
          Step Forward
        </button>
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded"
          onClick={stepBackward}
          disabled={currentStep <= 0}
        >
          Step Backward
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={resetPropagation}
        >
          Reset
        </button>
        <select
          className="bg-gray-200 px-4 py-2 rounded"
          value={activationFunction}
          onChange={(e) => setActivationFunction(e.target.value)}
        >
          <option value="sigmoid">Sigmoid</option>
          <option value="relu">ReLU</option>
          <option value="tanh">Tanh</option>
        </select>
        <label className="inline-flex items-center">
          Dropout Rate:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={dropoutRate}
            onChange={(e) => setDropoutRate(parseFloat(e.target.value))}
            className="ml-2"
          />
          <span className="ml-2">{dropoutRate.toFixed(1)}</span>
        </label>
        <label className="inline-flex items-center ml-4">
          Use Batch Norm:
          <input
            type="checkbox"
            checked={useBatchNorm}
            onChange={(e) => setUseBatchNorm(e.target.checked)}
            className="ml-2"
          />
        </label>
      </div>
      <div className="flex items-start">
        {layers.map((layerSize, index) => (
          <React.Fragment key={index}>
            <Layer
              size={layerSize}
              activations={activations[index]}
              gradients={gradients.biases[index]}
              onChange={(value) => handleLayerChange(index, value)}
            />
            {index < layers.length - 1 && weights[index] && (
              <Connections
                fromSize={layers[index]}
                toSize={layers[index + 1]}
                weights={weights[index]}
                gradients={gradients.weights[index]}
                direction={direction}
                updateWeight={(from, to, value) =>
                  updateWeight(index, from, to, value)
                }
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const Layer = ({ size, activations, gradients, onChange }) => {
  return (
    <div className="flex flex-col items-center mx-2">
      <input
        type="number"
        value={size}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 mb-2 p-1 border rounded text-center"
        min="1"
      />
      <div className="bg-gray-200 p-2 rounded">
        {Array(size)
          .fill()
          .map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-blue-500 rounded-full mb-2 flex flex-col items-center justify-center text-white text-xs"
              title={`Activation: ${activations?.[i]?.toFixed(4)}\nGradient: ${
                gradients?.[i]?.toFixed(4) || "N/A"
              }`}
            >
              <div>{activations?.[i]?.toFixed(2) || "0.00"}</div>
              <div>{gradients?.[i]?.toFixed(2) || "N/A"}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

const Connections = ({
  fromSize,
  toSize,
  weights,
  gradients,
  direction,
  updateWeight,
}) => {
  return (
    <div className="flex-1">
      <svg className="w-full h-32">
        {Array(fromSize)
          .fill()
          .map((_, i) =>
            Array(toSize)
              .fill()
              .map((_, j) => (
                <g key={`${i}-${j}`}>
                  <line
                    x1={`${5}%`}
                    y1={`${((i + 1) * 100) / (fromSize + 1)}%`}
                    x2={`${95}%`}
                    y2={`${((j + 1) * 100) / (toSize + 1)}%`}
                    stroke={direction === "forward" ? "blue" : "red"}
                    strokeWidth="1"
                  />
                  <text
                    x="50%"
                    y={`${
                      ((i + 1) / (fromSize + 1) + (j + 1) / (toSize + 1)) * 50
                    }%`}
                    textAnchor="middle"
                    className="text-xs"
                  >
                    <tspan>{weights[i][j].toFixed(2)}</tspan>
                    <tspan dy="10" x="50%">
                      {gradients?.[i]?.[j]?.toFixed(2) || "N/A"}
                    </tspan>
                    <tspan dy="20" x="50%">
                      <input
                        type="number"
                        value={weights[i][j].toFixed(2)}
                        onChange={(e) => updateWeight(i, j, e.target.value)}
                        className="w-16 p-0 border rounded text-center"
                        step="0.1"
                      />
                    </tspan>
                  </text>
                </g>
              ))
          )}
      </svg>
    </div>
  );
};
