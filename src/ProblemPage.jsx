// ProblemPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Button, Card } from "react-bootstrap";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { FaCopy, FaCheck } from "react-icons/fa";
import SolutionComponent from "./components/Solution";
import "./ProblemPage.css";
import TestCaseResult from "./components/TestCaseResult";
import ErrorResult from "./components/ErrorResult";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_URL } from "./config";
import LinearRegression from "./animations/LinearRegression"; // Import the LinearRegression component
import NeuralNetwork from "./animations/NeuralNetwork";

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`def solution(a, b): return a + b`);
  const [topic, setTopic] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [solution, setSolution] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [showLearn, setShowLearn] = useState(false); // State to control the visibility of the LinearRegression component
  const [points, setPoints] = useState([]);
  const [regressionLine, setRegressionLine] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/v1/questions/${id}`)
      .then((response) => {
        setProblem(response.data);
        setCode(response.data.boilerplate);
        setTopic(response.data.topic);
        setSolution(response.data.solution);
      })
      .catch((error) => {
        console.error("There was an error fetching the problem!", error);
      });
  }, [id]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_URL}/v1/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: String(id),
          code: code,
          language: "python",
        }),
      });
      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
        setTestResults([]);
      } else if (data.results) {
        const formattedResults = data.results.map((result) => ({
          input: `Input: ${JSON.stringify(result.input)}`,
          output: result.output,
          expected: result.expected_output,
          success: result.passed,
          stdout: result.stdout,
        }));
        setTestResults(formattedResults);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data.");
      setTestResults([]);
    }
  };

  const toggleSolution = () => {
    setShowSolution((prevShowSolution) => !prevShowSolution);
  };

  const handleLearnClick = () => {
    setShowLearn(!showLearn); // Toggle the visibility of the LinearRegression component
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset the icon after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

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

    const xMean =
      newPoints.reduce((sum, point) => sum + point.x, 0) / newPoints.length;
    const yMean =
      newPoints.reduce((sum, point) => sum + point.y, 0) / newPoints.length;

    const numerator = newPoints.reduce(
      (sum, point) => sum + (point.x - xMean) * (point.y - yMean),
      0
    );
    const denominator = newPoints.reduce(
      (sum, point) => sum + (point.x - xMean) ** 2,
      0
    );
    const slope = numerator / denominator;
    const yIntercept = yMean - slope * xMean;

    setRegressionLine({ slope, yIntercept });
  };

  const handleReset = () => {
    setPoints([]);
    setRegressionLine(null);
  };

  const handleUndo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    calculateRegression(newPoints);
  };

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="app-container p-0 mt-20">
      <Split
        className="split-pane"
        sizes={[25, 75]}
        minSize={[200, 50]}
        gutterSize={10}
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
      >
        <div className="problem-column" style={{ minWidth: "300px" }}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="mb-3">{problem.title}</Card.Title>
              <Card.Text className="mb-3">{problem.description}</Card.Text>
              <div className="buttons-container mt-3">
                <Button
                  variant="primary"
                  className="mr-2"
                  onClick={handleLearnClick}
                >
                  Learn
                </Button>
                <Button variant="secondary" onClick={toggleSolution}>
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </Button>
              </div>
              {showSolution && (
                <div className="solution-container mt-3">
                  <SolutionComponent solution={solution} />
                </div>
              )}
              {showLearn && topic == "Neural Networks" && <NeuralNetwork />}
              {showLearn && topic != "Neural Networks" && (
                <Card className="mt-4">
                  <Card.Body>
                    <LinearRegression
                      points={points}
                      addPoint={addPoint}
                      regressionLine={regressionLine}
                    />
                    <div className="buttons mt-3">
                      <Button
                        variant="outline-danger"
                        onClick={handleReset}
                        className="mr-2"
                      >
                        Reset
                      </Button>
                      <Button variant="outline-warning" onClick={handleUndo}>
                        Undo
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </div>
        <div
          className="solution-column resizable"
          style={{ minWidth: "400px" }}
        >
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="solution-header d-flex justify-content-between align-items-center">
                <Card.Title className="mb-0">Your Solution</Card.Title>
                <div>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    className="submit-button mr-2"
                  >
                    Submit Code
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => copyToClipboard(code, setCodeCopied)}
                  >
                    {codeCopied ? <FaCheck /> : <FaCopy />}
                  </Button>
                </div>
              </div>
              <div className="editor-container">
                <Editor
                  height="calc(100vh - 200px)"
                  defaultLanguage="python"
                  defaultValue={code}
                  onChange={(value) => setCode(value)}
                />
              </div>
              {(errorMessage || testResults.length > 0) && (
                <div className="overlay-container">
                  {errorMessage && (
                    <ErrorResult
                      message={errorMessage.message}
                      type={errorMessage.type}
                      traceback={errorMessage.traceback}
                    />
                  )}
                  {testResults.length > 0 &&
                    testResults.map((result, index) => (
                      <TestCaseResult
                        key={index}
                        input={result.input}
                        output={result.output}
                        expected={result.expected}
                        success={result.success}
                        stdout={result.stdout}
                      />
                    ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </Split>
    </Container>
  );
};

export default ProblemPage;
