import { useState, useEffect } from "react";

export default function RFC() {
  const [numTrees, setNumTrees] = useState(5);
  const [maxDepth, setMaxDepth] = useState(3);
  const [features, setFeatures] = useState([
    { name: "Feature 1", value: 50 },
    { name: "Feature 2", value: 50 },
    { name: "Feature 3", value: 50 },
  ]);
  const [prediction, setPrediction] = useState(null);
  const [forest, setForest] = useState([]);
  const [treeVotes, setTreeVotes] = useState([]);
  const [selectedTree, setSelectedTree] = useState(null);

  useEffect(() => {
    generateForest();
  }, [numTrees, maxDepth]);

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

  const generateForest = () => {
    const newForest = Array(numTrees)
      .fill()
      .map(() => generateRandomTree());
    setForest(newForest);
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
    const predictions = forest.map((tree) => classifyWithTree(tree, features));
    const finalPrediction = predictions.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    setPrediction(
      Object.entries(finalPrediction).sort((a, b) => b[1] - a[1])[0][0]
    );
    setTreeVotes(
      predictions.map((pred, index) => ({
        name: `Tree ${index + 1}`,
        vote: pred,
      }))
    );
  };

  const renderTree = (node, depth = 0) => {
    const indent = "  ".repeat(depth);
    if (node.type === "leaf") {
      return `${indent}Leaf: ${node.value}\n`;
    }
    return (
      `${indent}${node.feature} < ${node.threshold.toFixed(2)}\n` +
      `${renderTree(node.left, depth + 1)}` +
      `${renderTree(node.right, depth + 1)}`
    );
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Random Forest Classifier Visualization
      </h2>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <label>
          Number of Trees:
          <input
            type="number"
            value={numTrees}
            onChange={(e) => setNumTrees(Math.max(1, parseInt(e.target.value)))}
            style={{ marginLeft: "10px", width: "60px" }}
            min="1"
          />
        </label>
        <label>
          Max Depth:
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value)))}
            style={{ marginLeft: "10px", width: "60px" }}
            min="1"
          />
        </label>
        <button
          onClick={generateForest}
          style={{
            padding: "5px 10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Regenerate Forest
        </button>
      </div>
      <div style={{ marginBottom: "20px" }}>
        {features.map((feature, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
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
                style={{ marginLeft: "10px", width: "200px" }}
              />
              <span style={{ marginLeft: "10px" }}>{feature.value}</span>
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={runRandomForest}
        style={{
          padding: "10px 20px",
          backgroundColor: "#008CBA",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Run Random Forest
      </button>
      {prediction && (
        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          Prediction: <strong>{prediction}</strong>
        </p>
      )}
      {treeVotes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Tree Votes</h3>
          <div
            style={{ display: "flex", height: "200px", alignItems: "flex-end" }}
          >
            {treeVotes.map((vote, index) => (
              <div
                key={index}
                style={{
                  width: `${100 / treeVotes.length}%`,
                  height: `${vote.vote === "Class A" ? "100%" : "50%"}`,
                  backgroundColor:
                    vote.vote === "Class A" ? "#4CAF50" : "#FFA500",
                  margin: "0 2px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedTree(index)}
              >
                <div
                  style={{
                    padding: "5px",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                >
                  {vote.vote}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            {treeVotes.map((vote, index) => (
              <div
                key={index}
                style={{
                  width: `${100 / treeVotes.length}%`,
                  textAlign: "center",
                  fontSize: "12px",
                }}
              >
                Tree {index + 1}
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedTree !== null && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>
            Tree {selectedTree + 1} Structure
          </h3>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          >
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {renderTree(forest[selectedTree])}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
