import React from 'react';
import { Card } from 'react-bootstrap';

function TestCaseResult({ input, output, expected, success, stdout }) {
  const resultColor = success ? 'green' : 'red';

  const renderContent = (content) => {
    // Convert to string, but keep 'null' as a string if it's null
    const stringContent = content === null ? 'null' : String(content);
    return (
      <pre style={{ color: resultColor, margin: 0, padding: 0 }}>
        <code>{stringContent}</code>
      </pre>
    );
  };

  const processInput = (input) => {
    if (input === null) return 'null';
    return String(input).replace(/^Input:\s*/, '');
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title style={{ color: resultColor }}>
          Test Case {success ? "Passed" : "Failed"}
        </Card.Title>
        <Card.Text>
          <strong>Input:</strong>{' '}
          {renderContent(processInput(input))}
        </Card.Text>
        <Card.Text>
          <strong>Output:</strong>{' '}
          {renderContent(output)}
        </Card.Text>
        <Card.Text>
          <strong>Expected:</strong>{' '}
          {renderContent(expected)}
        </Card.Text>
        {stdout && (
          <Card.Text>
            <strong>Output:</strong>{' '}
            {renderContent(stdout)}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}

export default TestCaseResult;