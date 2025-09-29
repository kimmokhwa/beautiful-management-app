import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import Procedures from './pages/Procedures';
import Upload from './pages/Upload';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/procedures" element={<Procedures />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;