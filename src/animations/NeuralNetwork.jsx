import React, { useState, useEffect } from "react";

const NeuralNetwork = () => {
  const [layers, setLayers] = useState([3, 4, 2]);
  const [activations, setActivations] = useState([]);
  const [weights, setWeights] = useState([]);
  const [direction, setDirection] = useState("forward");

  useEffect(() => {
    initializeNetwork();
  }, [layers]);

  const initializeNetwork = () => {
    const newActivations = layers.map((layerSize) => Array(layerSize).fill(0));
    setActivations(newActivations);

    const newWeights = [];
    for (let i = 0; i < layers.length - 1; i++) {
      newWeights.push(
        Array(layers[i])
          .fill()
          .map(() => Array(layers[i + 1]).fill(0))
      );
    }
    setWeights(newWeights);
  };

  const handleLayerChange = (index, value) => {
    const newLayers = [...layers];
    newLayers[index] = parseInt(value) || 0;
    setLayers(newLayers);
  };

  const addLayer = () => {
    setLayers([...layers, 1]);
  };

  const removeLayer = () => {
    if (layers.length > 2) {
      setLayers(layers.slice(0, -1));
    }
  };

  const toggleDirection = () => {
    setDirection(direction === "forward" ? "backward" : "forward");
  };

  const simulateActivation = () => {
    const newActivations = activations.map((layer) =>
      layer.map(() => Math.random())
    );
    setActivations(newActivations);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Neural Network Simulator</h1>
      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={addLayer}
        >
          Add Layer
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          onClick={removeLayer}
        >
          Remove Layer
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          onClick={toggleDirection}
        >
          {direction === "forward" ? "Switch to Backward" : "Switch to Forward"}
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={simulateActivation}
        >
          Simulate Activation
        </button>
      </div>
      <div className="flex items-center">
        {layers.map((layerSize, index) => (
          <React.Fragment key={index}>
            <Layer
              size={layerSize}
              activations={activations[index]}
              onChange={(value) => handleLayerChange(index, value)}
            />
            {index < layers.length - 1 && (
              <Connections
                fromSize={layers[index]}
                toSize={layers[index + 1]}
                weights={weights[index]}
                direction={direction}
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

const Connections = ({ fromSize, toSize, weights, direction }) => {
  return (
    <div className="flex-1">
      <svg className="w-full h-32">
        {Array(fromSize)
          .fill()
          .map((_, i) =>
            Array(toSize)
              .fill()
              .map((_, j) => (
                <line
                  key={`${i}-${j}`}
                  x1="0%"
                  y1={`${((i + 1) * 100) / (fromSize + 1)}%`}
                  x2="100%"
                  y2={`${((j + 1) * 100) / (toSize + 1)}%`}
                  stroke={direction === "forward" ? "blue" : "red"}
                  strokeWidth="1"
                />
              ))
          )}
      </svg>
    </div>
  );
};

export default NeuralNetwork;
