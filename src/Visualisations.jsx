import { useState, useRef, useEffect } from "react";
import { Container } from "react-bootstrap";
import NeuralNetwork from "./animations/NeuralNetwork";
import SVM from "./animations/SVM";
import GradientDescent from "./animations/GradientDescent";
import KNN from "./animations/KNearestNeighbours";
import KMC from "./animations/KMeansClustering";
import RFC from "./animations/RandomForestClassifier";
import DecisionTree from "./animations/DecisionTrees";
import GradientBoost from "./animations/GradientBoosting";
import XGBoost from "./animations/XGBoost";

const concepts = [
  {
    title: "Neural Networks",
    component: NeuralNetwork,
    color: "bg-blue-300",
    icon: "🧠",
  },
  {
    title: "Support Vector Machines",
    component: SVM,
    color: "bg-yellow-300",
    icon: "📊",
  },
  {
    title: "Gradient Descent",
    component: GradientDescent,
    color: "bg-green-300",
    icon: "📉",
  },
  {
    title: "K-Nearest Neighbours",
    component: KNN,
    color: "bg-red-300",
    icon: "🎯",
  },
  {
    title: "K-Means Clustering",
    component: KMC,
    color: "bg-purple-300",
    icon: "🔬",
  },
  {
    title: "Random Forest Classifier",
    component: RFC,
    color: "bg-indigo-300",
    icon: "🌳",
  },
  {
    title: "Decision Trees",
    component: DecisionTree,
    color: "bg-pink-300",
    icon: "🌿",
  },
  {
    title: "Gradient Boosting",
    component: GradientBoost,
    color: "bg-teal-300",
    icon: "🚀",
  },
  { title: "XGBoost", component: XGBoost, color: "bg-orange-300", icon: "💪" },
];

export default function Visualisations() {
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [notes, setNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [searchTerm, setSearchTerm] = useState("");
  // const [hoveredConcept, setHoveredConcept] = useState(null);
  const modalRef = useRef(null);

  const openModal = (concept) => {
    setSelectedConcept(concept);
    setNotes("");
  };

  const closeModal = () => {
    setSelectedConcept(null);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const copyNotes = () => {
    navigator.clipboard.writeText(notes).then(() => {
      setCopyStatus("Copied ✓");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    });
  };

  const filteredConcepts = concepts.filter((concept) =>
    concept.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid className="app-container p-8 mt-20 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Machine Learning Visualizations
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search concepts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-black">
        {filteredConcepts.map((concept, index) => (
          <div
            key={index}
            className={`${concept.color} p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition duration-300 relative overflow-hidden`}
            onClick={() => openModal(concept)}
            // onMouseEnter={() => setHoveredConcept(concept)}
            // onMouseLeave={() => setHoveredConcept(null)}
          >
            <div className="flex items-center mb-2">
              <span className="text-4xl mr-2">{concept.icon}</span>
              <h2 className="text-xl font-semibold">{concept.title}</h2>
            </div>
            <p className="mt-2">Click to view visualization</p>
            {/* {hoveredConcept === concept && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="font-bold">Preview</p>
                  <div className="w-32 h-32 overflow-hidden">
                    <concept.component />
                  </div>
                </div>
              </div>
            )} */}
          </div>
        ))}
      </div>

      {selectedConcept && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedConcept.title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <selectedConcept.component />
            </div>
            <div className="mt-4 relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes here..."
                className="w-full h-32 p-2 border border-gray-300 rounded resize-none"
              />
              <button
                onClick={copyNotes}
                className={`absolute top-2 right-2 px-2 py-1 rounded text-sm text-white transition-colors duration-300 ${
                  copyStatus === "Copied ✓"
                    ? "bg-green-500"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {copyStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
