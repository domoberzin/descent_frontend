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

  useEffect(() => {
    axios.get(`http://localhost:3000/v1/questions/${id}`)
      .then(response => {
        setProblem(response.data);
        setCode(response.data.boilerplate); // Set the boilerplate code from the fetched data
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
        <div className="problem-column">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{problem.title}</Card.Title>
              <Card.Text>{problem.description}</Card.Text>
              <Button variant="primary">Learn</Button>
              <Button variant="secondary" className="ml-2">Show Solution</Button>
            </Card.Body>
          </Card>
        </div>
        <div className="solution-column resizable">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Your Solution</Card.Title>
              <div className="editor-container">
                <Editor
                  height="calc(100vh - 200px)"
                  defaultLanguage="python"
                  defaultValue={code}
                  onChange={(value) => setCode(value)}
                />
              </div>
              <Button variant="primary" onClick={handleSubmit} className="mt-2">Submit Code</Button>
              {errorMessage && <ErrorResult message={errorMessage} />}
              {testResults.map((result, index) => (
                <TestCaseResult key={index}
                  input={result.input}
                  output={result.output}
                  expected={result.expected}
                  success={result.success} />
              ))}
            </Card.Body>
          </Card>
        </div>
      </Split>
    </Container>
  );
};

export default ProblemPage;
