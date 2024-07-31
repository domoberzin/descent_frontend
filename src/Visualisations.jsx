import React from "react";
import { Container } from "react-bootstrap";
import NeuralNetwork from "./animations/NeuralNetwork";
import SVM from "./animations/SVM";
import GradientDescent from "./animations/GradientDescent";

export default function Visualisations() {
  return (
    <Container fluid className="app-container p-0 mt-20">
      <div>Visualisations</div>
      <NeuralNetwork />
      <SVM />
      <GradientDescent />
    </Container>
  );
}
