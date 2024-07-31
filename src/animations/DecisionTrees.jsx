import React, { useState, useEffect, useRef } from "react";

export default function DecisionTreeVisualization() {
  const [maxDepth, setMaxDepth] = useState(3);
  const [features, setFeatures] = useState([
    { name: "Feature 1", value: 50 },
    { name: "Feature 2", value: 50 },
  ]);
  const [tree, setTree] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (tree) drawTree();
  }, [tree]);

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

    const drawNode = (node, x, y, width) => {
      ctx.fillStyle = node.type === "leaf" ? "#90EE90" : "#ADD8E6";
      ctx.strokeStyle = "#000000";
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

        drawNode(node.left, x - childWidth / 2, childY, childWidth);
        drawNode(node.right, x + childWidth / 2, childY, childWidth);
      }
    };

    drawNode(tree, canvas.width / 2, 50, canvas.width);
  };

  const handleGenerateTree = () => {
    const newTree = generateTree();
    setTree(newTree);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Decision Tree Visualization</h2>
      <div className="mb-4">
        <label className="mr-4">
          Max Depth:
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value)))}
            className="ml-2 w-20 border rounded px-2 py-1"
            min="1"
            max="5"
          />
        </label>
        <button
          onClick={handleGenerateTree}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Generate Tree
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border border-gray-300"
      />
    </div>
  );
}
