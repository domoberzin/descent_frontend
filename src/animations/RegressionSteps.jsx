// src/animations/RegressionSteps.jsx
import React from 'react';

function RegressionSteps({ points, regressionLine }) {
  if (!points.length) return <p>No points added yet.</p>;
  if (!regressionLine) return <p>Select at least 2 points.</p>;

  const xMean = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const yMean = points.reduce((sum, point) => sum + point.y, 0) / points.length;

  const steps = [
    `Step 1: Calculate the means of x and y: x̄ = ${xMean.toFixed(2)}, ȳ = ${yMean.toFixed(2)}`,
    `Step 2: Calculate the slope (b1): ${regressionLine.slope.toFixed(2)}`,
    `Step 3: Calculate the y-intercept (b0): ${regressionLine.yIntercept.toFixed(2)}`,
    `Step 4: Regression Line: y = ${regressionLine.slope.toFixed(2)}x + ${regressionLine.yIntercept.toFixed(2)}`,
  ];

  return (
    <div>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
    </div>
  );
}

export default RegressionSteps;