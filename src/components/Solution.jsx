import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FaCopy, FaCheck } from 'react-icons/fa';

const SolutionComponent = ({ solution }) => {
  const [solutionCopied, setSolutionCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSolutionCopied(true);
        setTimeout(() => setSolutionCopied(false), 2000); // Reset the icon after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card>
      <Card.Body>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: 0 }}>Solution</h3>
          <Button
            variant="outline-secondary"
            onClick={() => copyToClipboard(solution)}
          >
            {solutionCopied ? <FaCheck /> : <FaCopy />}
          </Button>
        </div>
        <pre>{solution}</pre>
      </Card.Body>
    </Card>
  );
};

export default SolutionComponent;
