import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './LinearRegression.css';

function LinearRegression({ canvasRef, points, setPoints }) {
  const [regressionLine, setRegressionLine] = useState(null);
  const [regressionSteps, setRegressionSteps] = useState([]);

  useEffect(() => {
  console.log('Regression line updated:', regressionLine);
  }, [regressionLine]);

  const calculateRegression = (newPoints) => {
  if (newPoints.length < 2) {
    setRegressionLine(null);
    setRegressionSteps([]);
    return;
  }

  const canvas = canvasRef.current;
  const width = canvas.width;
  const height = canvas.height;

  console.log('Canvas dimensions:', { width, height });

  const transformedPoints = newPoints.map(point => ({
    x: point.x * width - width / 2,
    y: height / 2 - point.y * height
  }));

  console.log('Transformed points:', transformedPoints);

  const n = transformedPoints.length;
  const xMean = transformedPoints.reduce((sum, point) => sum + point.x, 0) / n;
  const yMean = transformedPoints.reduce((sum, point) => sum + point.y, 0) / n;

  const numerator = transformedPoints.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const denominator = transformedPoints.reduce((sum, point) => sum + Math.pow(point.x - xMean, 2), 0);

  if (denominator === 0) {
    console.error('Cannot calculate slope: denominator is zero');
    setRegressionLine(null);
    setRegressionSteps(['Error: Cannot calculate regression line']);
    return;
  }

  const slope = numerator / denominator;
  const yIntercept = yMean - slope * xMean;

  console.log('Calculated regression line:', { slope, yIntercept });

  setRegressionLine({ slope, yIntercept });

  // Calculate R-squared
  const yPredicted = transformedPoints.map(point => slope * point.x + yIntercept);
  const ssRes = transformedPoints.reduce((sum, point, i) => sum + Math.pow(point.y - yPredicted[i], 2), 0);
  const ssTot = transformedPoints.reduce((sum, point) => sum + Math.pow(point.y - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);

  setRegressionSteps([
    `Number of points: ${n}`,
    `Mean of x: ${xMean.toFixed(2)}`,
    `Mean of y: ${yMean.toFixed(2)}`,
    `Slope: ${slope.toFixed(4)}`,
    `Y-intercept: ${yIntercept.toFixed(4)}`,
    `Equation: y = ${slope.toFixed(2)}x + ${yIntercept.toFixed(2)}`,
    `R-squared: ${rSquared.toFixed(4)}`
  ]);
};

  const handleReset = () => {
    setPoints([]);
    setRegressionLine(null);
    setRegressionSteps([]);
  };

  const handleUndo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    calculateRegression(newPoints);
  };

  useEffect(() => {
  if (points.length >= 2) {
    calculateRegression(points);
  } else {
    setRegressionLine(null);
    setRegressionSteps([]);
  }
}, [points]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid and axes
    const drawGridAndAxes = () => {
      const step = 50;
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 0.5;

      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw axes
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;

      // X-axis
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Y-axis
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
    };

    drawGridAndAxes();

    // Redraw points
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x * width, (1 - point.y) * height, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    });

    // Draw regression line if it exists
    if (regressionLine) {
      console.log('Drawing regression line:', regressionLine);
      ctx.beginPath();
      const startX = 0;
      const endX = width;
      const startY = height / 2 - (regressionLine.slope * (-width / 2) + regressionLine.yIntercept * height);
      const endY = height / 2 - (regressionLine.slope * (width / 2) + regressionLine.yIntercept * height);

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'red';
      ctx.stroke();

      // Draw equation of the line
      ctx.font = '16px Arial';
      ctx.fillStyle = 'blue';
      ctx.fillText(`y = ${regressionLine.slope.toFixed(2)}x + ${regressionLine.yIntercept.toFixed(2)}`, 10, 20);
    }
  }, [canvasRef, points, regressionLine]);

  return (
    <div className="LinearRegression">
      <div className="buttons mt-3">
        <Button variant="outline-danger" onClick={handleReset} className="mr-2">
          Reset
        </Button>
        <Button variant="outline-warning" onClick={handleUndo}>
          Undo
        </Button>
      </div>
      <div className="regression-steps mt-3">
        <h4>Regression Steps:</h4>
        {regressionSteps.map((step, index) => (
          <p key={index}>{step}</p>
        ))}
      </div>
    </div>
  );
}

export default LinearRegression;
