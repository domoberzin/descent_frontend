import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';

function ErrorResult({ type, message, traceback }) {
  // Function to replace <br> tags with actual line breaks
  const formatTraceback = (text) => {
    return text.replace(/<br>/g, '\n');
  };

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
          <pre 
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: formatTraceback(traceback) }} 
          />
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default ErrorResult;