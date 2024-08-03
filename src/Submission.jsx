import React, { useState } from 'react';
import { Container, Form, Button, Card, Spinner, Toast, Alert } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import Editor from "@monaco-editor/react";
import apiFetch from './api';

const QuestionSubmissionForm = () => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState(JSON.stringify([
    {
      "input": {"a": [1, 2, 3], "b": 2},
      "output": 5
    },
    {
      "input": {"a": [4, 5, 6], "b": 3},
      "output": 9
    }
  ], null, 2));
  const [solutionCode, setSolutionCode] = useState(`def solution(a: list, b: int):
    # Your code here
    pass

# Example usage:
# result = solution([1, 2, 3], 2)
# print(result)
`);

  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);

    try {
      const data = await apiFetch('/v1/question-requests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          topic,
          testCases: JSON.parse(testCases),
          solution: solutionCode,
          description: description,
        }),
      });
      setIsSubmitted(true);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while submitting the question.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container className="mt-5">
        <Alert variant="success" className="d-flex align-items-center">
          <FaCheckCircle className="me-2" size={24} />
          <div>
            Your question has been successfully submitted for review. Thank you for your contribution!
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: '300px',  // Adjust width as needed
        }}
      >
        <Toast 
          show={showError} 
          onClose={() => setShowError(false)} 
          delay={3000} 
          autohide
          bg="light"
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto text-danger">Error</strong>
          </Toast.Header>
          <Toast.Body className="text-danger">{errorMessage}</Toast.Body>
        </Toast>
      </div>
      <Card>
        <Card.Body>
          <Card.Title>Submit a New Question</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control className="rounded-md"
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter question title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Topic</Form.Label>
              <Form.Control className="rounded-md" 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter question topic"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Provide a detailed description of the question.
              </Form.Text>
              <Form.Control
                as="textarea"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the question description here. Include any necessary context, constraints, and examples."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Test Cases (JSON format)</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Provide test cases in the format shown. Each test case should have an input object and an expected output.
              </Form.Text>
              <Editor
                height="200px"
                defaultLanguage="json"
                value={testCases}
                onChange={setTestCases}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Solution Code</Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Provide your solution code here. Use the function signature provided and replace the pass statement with your implementation.
              </Form.Text>
              <Editor
                height="300px"
                defaultLanguage="python"
                value={solutionCode}
                onChange={setSolutionCode}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                'Submit Question'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuestionSubmissionForm;