import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockPage from './components/StockPage';
import CorrelationHeatmap from './components/CorrelationHeatmap';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<CorrelationHeatmap />} />
      </Routes>
    </Router>
  );
};

export default App;
