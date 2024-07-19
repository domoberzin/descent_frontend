// ErrorResult.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

function ErrorResult({ message }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title style={{ color: 'red' }}>
          Error
        </Card.Title>
        <Card.Text>
          <ReactMarkdown>{`\`${message}\``}</ReactMarkdown>
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ErrorResult;
