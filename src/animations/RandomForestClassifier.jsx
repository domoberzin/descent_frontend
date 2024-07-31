import React, { useState } from "react";

export default function RFC() {
  const [numTrees, setNumTrees] = useState(5);
  const [maxDepth, setMaxDepth] = useState(3);
  const [features, setFeatures] = useState([
    { name: "Feature 1", value: 50 },
    { name: "Feature 2", value: 50 },
    { name: "Feature 3", value: 50 },
  ]);
  const [prediction, setPrediction] = useState(null);

  const generateRandomTree = (depth = 0) => {
    if (depth >= maxDepth) {
      return {
        type: "leaf",
        value: Math.random() > 0.5 ? "Class A" : "Class B",
      };
    }

    const featureIndex = Math.floor(Math.random() * features.length);
    const threshold = Math.random() * 100;

    return {
      type: "node",
      feature: features[featureIndex].name,
      threshold,
      left: generateRandomTree(depth + 1),
      right: generateRandomTree(depth + 1),
    };
  };

  const classifyWithTree = (tree, data) => {
    if (tree.type === "leaf") {
      return tree.value;
    }

    const featureValue = data.find((f) => f.name === tree.feature).value;
    if (featureValue < tree.threshold) {
      return classifyWithTree(tree.left, data);
    } else {
      return classifyWithTree(tree.right, data);
    }
  };

  const runRandomForest = () => {
    const forest = Array(numTrees)
      .fill()
      .map(() => generateRandomTree());
    const predictions = forest.map((tree) => classifyWithTree(tree, features));
    const finalPrediction = predictions.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    setPrediction(
      Object.entries(finalPrediction).sort((a, b) => b[1] - a[1])[0][0]
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Random Forest Classifier Visualization
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
        {features.map((feature, index) => (
          <div key={index} className="mb-2">
            <label>
              {feature.name}:
              <input
                type="range"
                min="0"
                max="100"
                value={feature.value}
                onChange={(e) => {
                  const newFeatures = [...features];
                  newFeatures[index].value = parseInt(e.target.value);
                  setFeatures(newFeatures);
                }}
                className="ml-2"
              />
              <span className="ml-2">{feature.value}</span>
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={runRandomForest}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Run Random Forest
      </button>
      {prediction && (
        <p className="mt-4">
          Prediction: <strong>{prediction}</strong>
        </p>
      )}
    </div>
  );
}
