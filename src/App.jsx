import React, { useState } from 'react';
import Home from './pages/Home';
import './App.css';

function App() {
  const [analysisState, setAnalysisState] = useState(null);

  const handleAnalysisStarted = (data) => {
    console.log('Analysis started payload for Member 3 handoff:', data);
    setAnalysisState(data);
  };

  return (
    <div className="app-container">
      <Home onAnalysisStarted={handleAnalysisStarted} />
    </div>
  );
}

export default App;
