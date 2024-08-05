// ProblemPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import { FaCopy, FaCheck, FaLock } from "react-icons/fa";
import {
  Container,
  Button,
  Card,
  OverlayTrigger,
  Tooltip,
  Tabs,
  Tab,
  Table,
  Badge
} from "react-bootstrap";
import { motion } from "framer-motion";
import SolutionComponent from "./components/Solution";
import "./ProblemPage.css";
import TestCaseResult from "./components/TestCaseResult";
import ErrorResult from "./components/ErrorResult";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_URL } from "./config";
import LinearRegression from "./animations/LinearRegression";
import Canvas from "./animations/Canvas";
import NeuralNetwork from "./animations/NeuralNetwork";
import { useAuth } from "./components/AuthContext";
import apiFetch from "./api";
import SubmissionDetails from "./components/SubmissionDetails";

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
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [showLearn, setShowLearn] = useState(false); // State to control the visibility of the LinearRegression component
  const [points, setPoints] = useState([]);
  const [regressionLine, setRegressionLine] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsLoggedIn(user !== null);
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  useEffect(() => {
    apiFetch(`/v1/questions/${id}`)
      .then((response) => {
        console.log(response);
        setProblem(response);
        setCode(response.boilerplate);
        setTopic(response.topic);
        setSolution(response.solution);
      })
      .catch((error) => {
        console.error("There was an error fetching the problem!", error);
      });
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      const data = await apiFetch(`/v1/submit?problem_id=${id}`);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };


  const handleSubmit = async () => {
    try {

      const data = await apiFetch(`/v1/submit/`, {
        method: "POST",
        body: JSON.stringify({
          questionId: String(id),
          code: code,
          language: "python",
        }),
      });

      console.log(data);

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

    fetchSubmissions();
  };

  const toggleSolution = () => {
    setShowSolution((prevShowSolution) => !prevShowSolution);
  };

  const handleLearnClick = () => {
    setShowLearn(!showLearn); // Toggle the visibility of the LinearRegression component
  };

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmission(null);
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
        <div className="problem-column" style={{ minWidth: '300px' }}>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="description" title="Description">
                  <Card.Title>{problem?.title}</Card.Title>
                  <Card.Body>{problem?.description}</Card.Body>
                  <div className="buttons-container mt-3">
                  <Button variant="secondary" onClick={() => setShowSolution(!showSolution)}>
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </Button>
                  <Button variant="primary" onClick={handleLearnClick}>
                    {showLearn ? 'Hide Learn' : 'Learn'}
                  </Button>
                  </div>
                  {showSolution && <SolutionComponent solution={solution} />}
                  {showLearn && topic == "Neural Networks" && <NeuralNetwork />}
                  {showLearn && topic != "Neural Networks" && (
                    <Card className="mt-4">
                      <Card.Body>
                        <Canvas 
                          points={[]}
                          addPoint={() => {}}
                          drawExtra={() => {}}
                          title="Interactive Linear Regression"
                        >
                          <LinearRegression />
                        </Canvas>
                      </Card.Body>
                    </Card>
                  )}
                </Tab>
                <Tab eventKey="submissions" title={`Your Submissions (${submissions.length})`}>
                {selectedSubmission ? (
                  <SubmissionDetails
                    submission={selectedSubmission}
                    onBack={handleBackToSubmissions}
                  />
                ) : (
                  <div>
                    <Card.Title>Past Submissions</Card.Title>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub, index) => (
                          <tr 
                            key={sub.id} 
                            onClick={() => handleSubmissionClick(sub)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{index + 1}</td>
                            <td>{getStatusBadge(sub.status)}</td>
                            <td>{new Date(sub.submissionTimestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </div>
        <div
          className="solution-column resizable"
          style={{ minWidth: "400px" }}
        >
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="flex justify-content-between justify-center">
                <Card.Title className="mb-0">Your Solution</Card.Title>
                <div className="flex flex-row">
                  {isLoggedIn ? (
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      className="submit-button mr-2"
                    >
                      Submit Code
                    </Button>
                  ) : (
                    <LockedButton />
                  )}
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
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
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

const LockedButton = () => {
  const [isVibrating, setIsVibrating] = useState(false);
  const handleLockedClick = () => {
    setIsVibrating(true);
    setTimeout(() => setIsVibrating(false), 500);
  };

  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id="tooltip-top">Please sign in to submit code!</Tooltip>
      }
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="danger"
          className="submit-button mr-2"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={handleLockedClick}
        >
          <motion.div
            animate={
              isVibrating
                ? {
                    rotate: [0, -10, 10, -10, 10, 0],
                    transition: { duration: 0.5, loop: 1 },
                  }
                : {}
            }
          >
            <FaLock style={{ marginRight: "5px" }} />
          </motion.div>
          Submit Code
        </Button>
      </motion.div>
    </OverlayTrigger>
  );
};

export default ProblemPage;