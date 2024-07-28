// src/animations/LinearRegression.jsx
import React from 'react';
import Canvas from './Canvas';
import RegressionSteps from './RegressionSteps';
import './LinearRegression.css';

function LinearRegression({ points, addPoint, regressionLine }) {
  const title = 'Interactive Linear Regression';
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
      </div>
      <div className="canvas-container">
        <Canvas points={points} addPoint={addPoint} drawExtra={drawRegressionLine} title={title} />
      </div>
      <RegressionSteps points={points} regressionLine={regressionLine} />
    </div>
  );
}

export default LinearRegression;
