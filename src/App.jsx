import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProblemsList from './ProblemsList';
import ProblemPage from './ProblemPage';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ProblemsList />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
