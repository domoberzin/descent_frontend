// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import ProblemsList from "./ProblemsList";
import ProblemPage from "./ProblemPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Contact from "./Contact";
import Submission from "./Submission";
import Home from "./HomePage";

const App = () => {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="bg-black min-h-screen text-white">
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/problems" element={<ProblemsList />} />
              <Route path="/problem/:id" element={<ProblemPage />} />
              <Route path="/submission" element={<Submission />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Layout>
        </Router>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
