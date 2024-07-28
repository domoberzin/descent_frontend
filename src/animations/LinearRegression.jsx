// src/animations/LinearRegression.jsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Canvas from './Canvas';
import RegressionSteps from './RegressionSteps';
import './LinearRegression.css';

function LinearRegression({ title }) {
  const [points, setPoints] = useState([]);
  const [regressionLine, setRegressionLine] = useState(null);

  const addPoint = (x, y) => {
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    calculateRegression(newPoints);
  };

  const calculateRegression = (newPoints) => {
    if (newPoints.length < 2) {
      setRegressionLine(null);
      return;
    }

    const xMean = newPoints.reduce((sum, point) => sum + point.x, 0) / newPoints.length;
    const yMean = newPoints.reduce((sum, point) => sum + point.y, 0) / newPoints.length;

    const numerator = newPoints.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
    const denominator = newPoints.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
    const slope = numerator / denominator;
    const yIntercept = yMean - slope * xMean;

    setRegressionLine({ slope, yIntercept });
  };

  const reset = () => {
    setPoints([]);
    setRegressionLine(null);
  };

  const undo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    calculateRegression(newPoints);
  };

  const drawRegressionLine = (ctx, canvas) => {
    if (regressionLine) {
      ctx.beginPath();
      const startX = 0;
      const startY = canvas.height - (regressionLine.slope * startX + regressionLine.yIntercept);
      const endX = canvas.width;
      const endY = canvas.height - (regressionLine.slope * endX + regressionLine.yIntercept);

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'red';
      ctx.stroke();

      // Draw equation of the line
      ctx.font = '16px Arial';
      ctx.fillStyle = 'blue';
      ctx.fillText(`y = ${regressionLine.slope.toFixed(2)}x + ${regressionLine.yIntercept.toFixed(2)}`, 10, 20);
    }
  };

  return (
    <div className="LinearRegression">
      <div className="header">
        <h1>{title}</h1>
        <div className="buttons">
          <Button variant="outline-danger" onClick={reset} className="reset-button">
            Reset
          </Button>
          <Button variant="outline-warning" onClick={undo} className="undo-button">
            Undo
          </Button>
        </div>
      </div>
      <div className="canvas-container">
        <Canvas points={points} addPoint={addPoint} drawExtra={drawRegressionLine} />
      </div>
      <RegressionSteps points={points} regressionLine={regressionLine} />
    </div>
  );
}

export default LinearRegression;
