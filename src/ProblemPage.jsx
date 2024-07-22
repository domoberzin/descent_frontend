import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Button, Card } from 'react-bootstrap';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import './ProblemPage.css';
import TestCaseResult from './components/TestCaseResult';
import ErrorResult from './components/ErrorResult';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProblemPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`def solution(a, b): return a + b`);
  const [testResults, setTestResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [solution, setSolution] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3000/v1/questions/${id}`)
      .then(response => {
        setProblem(response.data);
        setCode(response.data.boilerplate); // Set the boilerplate code from the fetched data
        setSolution(response.data.solution);
      })
      .catch(error => {
        console.error('There was an error fetching the problem!', error);
      });
  }, [id]);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: String(id),
          code: code,
          language: 'python',
        }),
      });
      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
        setTestResults([]);
      } else if (data.results) {
        const formattedResults = data.results.map(result => ({
          input: `Input: ${JSON.stringify(result.input)}`,
          output: result.output,
          expected: result.expected_output,
          success: result.passed,
        }));
        setTestResults(formattedResults);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('An error occurred while fetching data.');
      setTestResults([]);
    }
  };

  const toggleSolution = () => {
    setShowSolution(prevShowSolution => !prevShowSolution);
  };

  if (!problem) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid className="app-container p-0">
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
          <Card className="h-100">
            <Card.Body>
              <Card.Title className="mb-3">{problem.title}</Card.Title>
              <Card.Text className="mb-3">{problem.description}</Card.Text>
              <div className="buttons-container mt-3">
                <Button variant="primary" className="mr-2">Learn</Button>
                <Button variant="secondary" onClick={toggleSolution}>
                  {showSolution ? 'Hide Solution' : 'Show Solution'}
                </Button>
              </div>
              {showSolution && (
                <div className="solution-container mt-3">
                  <Card>
                    <Card.Body>
                      <Card.Title>Solution</Card.Title>
                      <pre>{solution}</pre>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="solution-column resizable" style={{ minWidth: '400px' }}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <div className="solution-header">
                <Card.Title className="mb-0">Your Solution</Card.Title>
                <Button variant="primary" onClick={handleSubmit} className="submit-button">Submit Code</Button>
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
                  {errorMessage && <ErrorResult message={errorMessage} />}
                  {testResults.length > 0 && testResults.map((result, index) => (
                    <TestCaseResult
                      key={index}
                      input={result.input}
                      output={result.output}
                      expected={result.expected}
                      success={result.success}
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
