import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProblemsList.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/v1/questions')
      .then(response => {
        setProblems(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the problems!', error);
      });
  }, []);

  return (
    <div className="problems-list-container">
      <h1>ML Code Challenges</h1>
      <div className="problems-table">
        <div className="problems-header">
          <div>Title</div>
          <div>Category</div>
          <div>Difficulty</div>
          <div>Status</div>
        </div>
        {problems.map((problem, index) => (
          <Link key={index} to={`/problem/${problem.id}`} className="problem-row">
            <div>{problem.title}</div>
            <div>{problem.topic}</div>
            <div>{problem.difficulty}</div>
            <div>Unsolved</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProblemsList;
