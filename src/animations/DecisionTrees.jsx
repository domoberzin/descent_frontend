import { useState, useEffect, useRef } from "react";

export default function DecisionTree() {
  const [maxDepth, setMaxDepth] = useState(3);
  const [features, setFeatures] = useState([
    { name: "Feature 1", value: 50 },
    { name: "Feature 2", value: 50 },
  ]);
  const [tree, setTree] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (tree) drawTree();
  }, [tree, hoveredNode]);

  const generateTree = (depth = 0) => {
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
      threshold: threshold.toFixed(2),
      left: generateTree(depth + 1),
      right: generateTree(depth + 1),
    };
  };

  const drawTree = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawNode = (node, x, y, width, path = []) => {
      const isHovered = JSON.stringify(node) === JSON.stringify(hoveredNode);
      ctx.fillStyle = node.type === "leaf" ? "#90EE90" : "#ADD8E6";
      ctx.strokeStyle = isHovered ? "#FF0000" : "#000000";
      ctx.lineWidth = isHovered ? 3 : 1;
      ctx.beginPath();
      ctx.ellipse(x, y, 40, 25, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#000000";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (node.type === "leaf") {
        ctx.fillText(node.value, x, y);
      } else {
        ctx.fillText(`${node.feature}`, x, y - 7);
        ctx.fillText(`< ${node.threshold}`, x, y + 7);

        // Draw lines to children
        const childY = y + 75;
        const childWidth = width / 2;
        ctx.beginPath();
        ctx.moveTo(x, y + 25);
        ctx.lineTo(x - childWidth / 2, childY - 25);
        ctx.moveTo(x, y + 25);
        ctx.lineTo(x + childWidth / 2, childY - 25);
        ctx.stroke();

        drawNode(node.left, x - childWidth / 2, childY, childWidth, [
          ...path,
          "left",
        ]);
        drawNode(node.right, x + childWidth / 2, childY, childWidth, [
          ...path,
          "right",
        ]);
      }

      // Store node info for interactivity
      node.x = x;
      node.y = y;
      node.width = 80;
      node.height = 50;
      node.path = path;
    };

    drawNode(tree, canvas.width / 2, 50, canvas.width);
  };

  const handleGenerateTree = () => {
    const newTree = generateTree();
    setTree(newTree);
    setPrediction(null);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const findClickedNode = (node) => {
      if (
        x >= node.x - node.width / 2 &&
        x <= node.x + node.width / 2 &&
        y >= node.y - node.height / 2 &&
        y <= node.y + node.height / 2
      ) {
        return node;
      }

      if (node.left) {
        const leftNode = findClickedNode(node.left);
        if (leftNode) return leftNode;
      }

      if (node.right) {
        const rightNode = findClickedNode(node.right);
        if (rightNode) return rightNode;
      }

      return null;
    };

    const clickedNode = findClickedNode(tree);
    setHoveredNode(clickedNode);
  };

  const handleCanvasMouseMove = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    canvas.style.cursor = "default";

    const isOverNode = (node) => {
      return (
        x >= node.x - node.width / 2 &&
        x <= node.x + node.width / 2 &&
        y >= node.y - node.height / 2 &&
        y <= node.y + node.height / 2
      );
    };

    const checkNode = (node) => {
      if (isOverNode(node)) {
        canvas.style.cursor = "pointer";
        return true;
      }

      if (node.left && checkNode(node.left)) return true;
      if (node.right && checkNode(node.right)) return true;

      return false;
    };

    checkNode(tree);
  };

  const classifyInstance = () => {
    const classify = (node) => {
      if (node.type === "leaf") {
        return node.value;
      }

      const featureValue = features.find((f) => f.name === node.feature).value;
      if (featureValue < parseFloat(node.threshold)) {
        return classify(node.left);
      } else {
        return classify(node.right);
      }
    };

    const result = classify(tree);
    setPrediction(result);
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
        Decision Tree Visualization
      </h2>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label>
          Max Depth:
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value)))}
            style={{ marginLeft: "10px", width: "60px" }}
            min="1"
            max="5"
          />
        </label>
        <button
          onClick={handleGenerateTree}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Generate Tree
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
        onClick={classifyInstance}
        style={{
          padding: "10px 20px",
          backgroundColor: "#008CBA",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Classify
      </button>
      {prediction && (
        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Prediction: <strong>{prediction}</strong>
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ border: "1px solid #ccc" }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      />
      {hoveredNode && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <h3 style={{ fontSize: "18px", marginBottom: "10px" }}>Node Info:</h3>
          <p>
            <strong>Type:</strong> {hoveredNode.type}
          </p>
          {hoveredNode.type === "node" ? (
            <>
              <p>
                <strong>Feature:</strong> {hoveredNode.feature}
              </p>
              <p>
                <strong>Threshold:</strong> {hoveredNode.threshold}
              </p>
            </>
          ) : (
            <p>
              <strong>Value:</strong> {hoveredNode.value}
            </p>
          )}
          <p>
            <strong>Path:</strong> {hoveredNode.path.join(" -> ")}
          </p>
        </div>
      )}
    </div>
  );
}
