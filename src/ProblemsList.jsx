import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ProblemsList.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function ProblemsList() {
  const [problems, setProblems] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState({ completed: false, notCompleted: false });

  useEffect(() => {
    axios.get('http://localhost:3000/v1/questions')
      .then(response => {
        setProblems(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the problems!', error);
      });
  }, []);

  const filteredProblems = problems.filter(problem => 
    (difficulty === 'all' || problem.difficulty === difficulty) &&
    (category === 'all' || problem.topic === category) &&
    ((!status.completed && !status.notCompleted) || 
     (status.completed && problem.status === 'completed') ||
     (status.notCompleted && problem.status !== 'completed'))
  );

  return (
    <div className="problem-list-container">
      <h1 className="title">Problem List</h1>
      
      <div className="filters-container">
        <div className="filter-item">
          <label htmlFor="difficulty">Difficulty:</label>
          <div className="select-wrapper">
            <select 
              id="difficulty" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="filter-item">
          <label htmlFor="category">Category:</label>
          <div className="select-wrapper">
            <select 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Matrices">Matrices</option>
              <option value="Linear Algebra">Linear Algebra</option>
              <option value="Neural Networks">Neural Networks</option>
            </select>
          </div>
        </div>

        <div className="filter-item">
          <span>Status:</span>
          <label>
            <input
              type="checkbox"
              checked={status.completed}
              onChange={() => setStatus(prev => ({ ...prev, completed: !prev.completed }))}
            />
            Completed
          </label>
          <label>
            <input
              type="checkbox"
              checked={status.notCompleted}
              onChange={() => setStatus(prev => ({ ...prev, notCompleted: !prev.notCompleted }))}
            />
            Not Completed
          </label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Difficulty</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProblems.map((problem, index) => (
            <TableRow key={index}>
              <TableCell className="clickable-cell">
                <Link to={`/problem/${problem.id}`}>
                  {problem.title}
                </Link>
              </TableCell>
              <TableCell>{problem.topic}</TableCell>
              <TableCell>{problem.difficulty}</TableCell>
              <TableCell>
                <input type="checkbox" checked={problem.status === 'completed'} readOnly />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ProblemsList;