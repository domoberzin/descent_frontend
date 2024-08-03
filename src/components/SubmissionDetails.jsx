import React from 'react';
import { Button, Card, Badge } from 'react-bootstrap';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TestCaseResult from './TestCaseResult';
import ErrorResult from './ErrorResult';

const SubmissionDetails = ({ submission, onBack }) => {
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

  return (
    <div>
      <Button variant="link" onClick={onBack}>&larr; Back to submissions</Button>
    <Card.Title>Submission Details</Card.Title>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Overview</Card.Title>
          <Card.Text>
            <strong>ID:</strong> {submission._id}<br />
            <strong>Status:</strong> {getStatusBadge(submission.status)}<br />
            <strong>Submitted on:</strong> {new Date(submission.submissionTimestamp).toLocaleString()}
          </Card.Text>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Code</Card.Title>
          <SyntaxHighlighter language="python" style={atomDark}>
            {submission.code}
          </SyntaxHighlighter>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Results</Card.Title>
          {submission.results.error && (
            <ErrorResult
              message={submission.results.error.message}
              type={submission.results.error.type}
              traceback={submission.results.error.traceback}
            />
          )}
          {submission.results.results &&
            submission.results.results.map((result, index) => (
              <TestCaseResult
                key={index}
                input={`Input: ${JSON.stringify(result.input)}`}
                output={result.output}
                expected={result.expected_output}
                success={result.passed}
                stdout={result.stdout}
              />
            ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SubmissionDetails;