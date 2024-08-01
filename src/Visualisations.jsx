import { useState } from "react";
import { Container } from "react-bootstrap";
import NeuralNetwork from "./animations/NeuralNetwork";
import SVM from "./animations/SVM";
import GradientDescent from "./animations/GradientDescent";
import KNN from "./animations/KNearestNeighbours";
import KMC from "./animations/KMeansClustering";
import RFC from "./animations/RandomForestClassifier";
import DecisionTreeVisualization from "./animations/DecisionTrees";
import GradientBoostingVisualization from "./animations/GradientBoosting";
import XGBoost from "./animations/XGBoost";

const concepts = [
  { title: "Neural Networks", component: NeuralNetwork, color: "bg-blue-300" },
  { title: "Support Vector Machines", component: SVM, color: "bg-yellow-300" },
  {
    title: "Gradient Descent",
    component: GradientDescent,
    color: "bg-green-300",
  },
  { title: "K-Nearest Neighbors", component: KNN, color: "bg-red-300" },
  { title: "K-Means Clustering", component: KMC, color: "bg-purple-300" },
  { title: "Random Forest Classifier", component: RFC, color: "bg-indigo-300" },
  {
    title: "Decision Trees",
    component: DecisionTreeVisualization,
    color: "bg-pink-300",
  },
  {
    title: "Gradient Boosting",
    component: GradientBoostingVisualization,
    color: "bg-teal-300",
  },
  { title: "XGBoost", component: XGBoost, color: "bg-orange-300" },
];

export default function Visualisations() {
  const [selectedConcept, setSelectedConcept] = useState(null);

  const openModal = (concept) => {
    setSelectedConcept(concept);
  };

  const closeModal = () => {
    setSelectedConcept(null);
  };

  return (
    <Container fluid className="app-container p-8 mt-20 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Machine Learning Visualizations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concepts.map((concept, index) => (
          <div
            key={index}
            className={`${concept.color} p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition duration-300`}
            onClick={() => openModal(concept)}
          >
            <h2 className="text-xl font-semibold">{concept.title}</h2>
            <p className="mt-2">Click to view visualization</p>
          </div>
        ))}
      </div>

      {selectedConcept && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedConcept.title}</h2>
            <div className="mb-4">
              <selectedConcept.component />
            </div>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Container>
  );
}
