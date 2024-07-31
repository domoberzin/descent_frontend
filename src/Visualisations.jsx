import React from "react";
import { Container } from "react-bootstrap";
import NeuralNetwork from "./animations/NeuralNetwork";
import SVM from "./animations/SVM";
import GradientDescent from "./animations/GradientDescent";
import KNN from "./animations/KNearestNeighbours";
import KMC from "./animations/KMeansClustering";
import RFC from "./animations/RandomForestClassifier";
import DecisionTreeVisualization from "./animations/DecisionTrees";
import GradientBoostingVisualization from "./animations/GradientBoosting";
import XGBoostVisualization from "./animations/XGBoost";

export default function Visualisations() {
  return (
    // Background set to bg-white temporarily for debugging
    <Container fluid className="app-container p-0 mt-20 bg-white text-black">
      <div>Visualisations</div>
      <NeuralNetwork />
      <SVM />
      <GradientDescent />
      <KNN />
      <KMC />
      <RFC />
      <DecisionTreeVisualization />
      <GradientBoostingVisualization />
      <XGBoostVisualization />
    </Container>
  );
}
