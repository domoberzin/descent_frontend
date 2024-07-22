// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import ProblemsList from './ProblemsList';
import ProblemPage from './ProblemPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
    <div className="bg-gray-800 min-h-screen text-white">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ProblemsList />} />
            <Route path="/problem/:id" element={<ProblemPage />} />
          </Routes>
        </Layout>
      </Router>
    </div>
    </GoogleOAuthProvider>
  );
};

export default App;
