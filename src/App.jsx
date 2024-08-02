// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import ProblemsList from "./ProblemsList";
import ProblemPage from "./ProblemPage";
import Contact from "./Contact";
import Submission from "./Submission";
import Home from "./HomePage";
import Visualisations from "./Visualisations";
import 'firebaseui/dist/firebaseui.css';

const App = () => {
  return (
      <div className="bg-black min-h-screen text-white">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/problems" element={<ProblemsList />} />
              <Route path="/problem/:id" element={<ProblemPage />} />
              <Route path="/submission" element={<Submission />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/visuals" element={<Visualisations />} />
            </Routes>
          </Layout>
        </Router>
      </div>
  );
};

export default App;
