import React, { useState, useCallback, useEffect } from "react";

const useNeuralNetwork = (initialLayers) => {
  const [layers, setLayers] = useState(initialLayers);
  const [activations, setActivations] = useState([]);
  const [weights, setWeights] = useState([]);
  const [direction, setDirection] = useState("forward");
  const [activationFunction, setActivationFunction] = useState("sigmoid");

  const initializeNetwork = useCallback(() => {
    const newActivations = layers.map((layerSize) => Array(layerSize).fill(0));
    setActivations(newActivations);

    const newWeights = [];
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
    }
    setWeights(newWeights);
  }, [layers]);

  // Initialize the network when the hook is first called
  useEffect(() => {
    initializeNetwork();
  }, []);

  const handleLayerChange = (index, value) => {
    const newLayers = [...layers];
    const newSize = Math.max(parseInt(value) || 1, 1);
    newLayers[index] = newSize;

    const newWeights = [...weights];
    if (index > 0) {
      // Update incoming weights
      newWeights[index - 1] = newWeights[index - 1].map((row) => {
        const newRow = [...row];
        while (newRow.length < newSize) newRow.push(Math.random() * 2 - 1);
        return newRow.slice(0, newSize);
      });
    }
    if (index < newLayers.length - 1) {
      // Update outgoing weights
      newWeights[index] = Array(newSize)
        .fill()
        .map(() =>
          Array(newLayers[index + 1])
            .fill()
            .map(() => Math.random() * 2 - 1)
        );
    }

    setLayers(newLayers);
    setWeights(newWeights);

    // Reinitialize activations
    const newActivations = newLayers.map((layerSize) =>
      Array(layerSize).fill(0)
    );
    setActivations(newActivations);
  };

  const addLayer = () => setLayers([...layers, 1]);
  const removeLayer = () => layers.length > 2 && setLayers(layers.slice(0, -1));
  const toggleDirection = () =>
    setDirection(direction === "forward" ? "backward" : "forward");

  const simulateActivation = () => {
    const newActivations = [layers.map(() => Math.random())];
    for (let i = 1; i < layers.length; i++) {
      const layerActivations = [];
      for (let j = 0; j < layers[i]; j++) {
        let sum = 0;
        for (let k = 0; k < layers[i - 1]; k++) {
          sum += newActivations[i - 1][k] * weights[i - 1][k][j];
        }
        layerActivations.push(applyActivationFunction(sum));
      }
      newActivations.push(layerActivations);
    }
    setActivations(newActivations);
  };

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

  const updateWeight = (layerIndex, fromNode, toNode, value) => {
    const newWeights = [...weights];
    newWeights[layerIndex][fromNode][toNode] = parseFloat(value);
    setWeights(newWeights);
  };

  return {
    layers,
    activations,
    weights,
    direction,
    activationFunction,
    initializeNetwork,
    handleLayerChange,
    addLayer,
    removeLayer,
    toggleDirection,
    simulateActivation,
    setActivationFunction,
    updateWeight,
  };
};

const NeuralNetwork = () => {
  const nn = useNeuralNetwork([3, 4, 2]);

  React.useEffect(() => {
    nn.initializeNetwork();
  }, [nn.layers]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Neural Network Simulator</h1>
      <div className="mb-4 space-x-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={nn.addLayer}
        >
          Add Layer
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={nn.removeLayer}
        >
          Remove Layer
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={nn.toggleDirection}
        >
          {nn.direction === "forward"
            ? "Switch to Backward"
            : "Switch to Forward"}
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={nn.simulateActivation}
        >
          Simulate Activation
        </button>
        <select
          className="bg-gray-200 px-4 py-2 rounded"
          value={nn.activationFunction}
          onChange={(e) => nn.setActivationFunction(e.target.value)}
        >
          <option value="sigmoid">Sigmoid</option>
          <option value="relu">ReLU</option>
          <option value="tanh">Tanh</option>
        </select>
      </div>
      <div className="flex items-start">
        {nn.layers.map((layerSize, index) => (
          <React.Fragment key={index}>
            <Layer
              size={layerSize}
              activations={nn.activations[index]}
              onChange={(value) => nn.handleLayerChange(index, value)}
            />
            {index < nn.layers.length - 1 && nn.weights[index] && (
              <Connections
                fromSize={nn.layers[index]}
                toSize={nn.layers[index + 1]}
                weights={nn.weights[index]}
                direction={nn.direction}
                updateWeight={(from, to, value) =>
                  nn.updateWeight(index, from, to, value)
                }
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const Layer = ({ size, activations, onChange }) => {
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
              className="w-8 h-8 bg-blue-500 rounded-full mb-2 flex items-center justify-center text-white text-xs"
            >
              {activations && activations[i]?.toFixed(2)}
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
                    x1="0%"
                    y1={`${((i + 1) * 100) / (fromSize + 1)}%`}
                    x2="100%"
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
                      <input
                        type="number"
                        value={weights[i][j].toFixed(2)}
                        onChange={(e) => updateWeight(i, j, e.target.value)}
                        className="w-12 p-0 border rounded text-center"
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

export default NeuralNetwork;
