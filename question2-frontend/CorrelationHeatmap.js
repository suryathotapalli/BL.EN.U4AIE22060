import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Box,
  Paper,
} from '@mui/material';

const STOCK_OPTIONS = [
  'NVDA', 'PYPL', 'AAPL', 'AMZN', 'GOOG', 'GOOGL', 'MSFT', 'META', 'TSLA'
];

const CorrelationHeatmap = () => {
  const [ticker1, setTicker1] = useState('NVDA');
  const [ticker2, setTicker2] = useState('PYPL');
  const [minutes, setMinutes] = useState(30);
  const [result, setResult] = useState(null);

  const fetchCorrelation = async () => {
    if (ticker1 === ticker2) {
      alert("Please select two different stocks.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:4000/stockcorrelation?minutes=${minutes}&ticker=${ticker1}&ticker=${ticker2}`
      );
      setResult(res.data);
    } catch (err) {
      console.error('Error fetching correlation:', err.message);
      alert('Failed to fetch correlation.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Stock Correlation Viewer
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <FormControl>
          <InputLabel>Ticker 1</InputLabel>
          <Select
            value={ticker1}
            label="Ticker 1"
            onChange={(e) => setTicker1(e.target.value)}
            sx={{ width: 120 }}
          >
            {STOCK_OPTIONS.map(stock => (
              <MenuItem key={stock} value={stock}>{stock}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Ticker 2</InputLabel>
          <Select
            value={ticker2}
            label="Ticker 2"
            onChange={(e) => setTicker2(e.target.value)}
            sx={{ width: 120 }}
          >
            {STOCK_OPTIONS.map(stock => (
              <MenuItem key={stock} value={stock}>{stock}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Minutes</InputLabel>
          <Select
            value={minutes}
            label="Minutes"
            onChange={(e) => setMinutes(Number(e.target.value))}
            sx={{ width: 120 }}
          >
            {[10, 30, 50, 100].map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={fetchCorrelation}>
          Analyze
        </Button>
      </Box>

      {result && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6">Correlation: <strong>{result.correlation}</strong></Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>{ticker1}</strong> Avg Price: {result.stocks[ticker1].averagePrice.toFixed(2)} <br />
            <strong>{ticker2}</strong> Avg Price: {result.stocks[ticker2].averagePrice.toFixed(2)}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CorrelationHeatmap;
