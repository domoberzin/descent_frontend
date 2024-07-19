// TestCaseResult.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

function TestCaseResult({ input, output, expected, success }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title style={{ color: success ? 'green' : 'red' }}>
          Test Case {success ? "Passed" : "Failed"}
        </Card.Title>
        <Card.Text>
          <strong>Input:</strong>
          <ReactMarkdown>{`\`${input}\``}</ReactMarkdown>
        </Card.Text>
        <Card.Text>
          <strong>Output:</strong>
          <ReactMarkdown>{`\`${output}\``}</ReactMarkdown>
        </Card.Text>
        <Card.Text>
          <strong>Expected:</strong>
          <ReactMarkdown>{`\`${expected}\``}</ReactMarkdown>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default TestCaseResult;
