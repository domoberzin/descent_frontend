// ErrorResult.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

function ErrorResult({ type, message, traceback }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title style={{ color: 'red' }}>
          <ReactMarkdown>{type}</ReactMarkdown>
        </Card.Title>
        <Card.Text>
          <ReactMarkdown>{`\`${message}\``}</ReactMarkdown>
        </Card.Text>
        <Card.Text>
          <ReactMarkdown>{traceback}</ReactMarkdown>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ErrorResult;
