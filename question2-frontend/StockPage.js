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
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const STOCK_OPTIONS = [
  'NVDA', 'PYPL', 'AAPL', 'AMZN', 'GOOG', 'GOOGL', 'MSFT', 'META', 'TSLA'
];

const StockPage = () => {
  const [symbol, setTicker] = useState('NVDA');
  const [duration, setMinutes] = useState(30);
  const [graphData, setChartData] = useState(null);
  const [averagePrice, setAveragePrice] = useState(null);

  const getStockInsights = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/stocks/${symbol}?duration=${duration}&aggregation=average`);
      const history = res.data.priceHistory;
      const labels = history.map(p => new Date(p.lastUpdatedAt).toLocaleTimeString());
      const prices = history.map(p => p.price);
      const avg = res.data.averageStockPrice;

      setAveragePrice(avg);
      setChartData({
        labels,
        datasets: [
          {
            label: `${symbol} Price`,
            data: prices,
            borderColor: 'blue',
            tension: 0.3,
          },
          {
            label: 'Average Price',
            data: Array(prices.length).fill(avg),
            borderColor: 'red',
            borderDash: [5, 5],
            pointRadius: 0,
            tension: 0.3,
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch stock data:', error.message);
      alert('Failed to fetch stock data.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
        Stock Price Viewer
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <FormControl>
          <InputLabel>Ticker</InputLabel>
          <Select
            value={symbol}
            label="Ticker"
            onChange={(e) => setTicker(e.target.value)}
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
            value={duration}
            label="Minutes"
            onChange={(e) => setMinutes(Number(e.target.value))}
            sx={{ width: 120 }}
          >
            {[10, 30, 50, 100].map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={getStockInsights}>
          Fetch
        </Button>
      </Box>

      {graphData && (
        <>
          <Line data={graphData} />
          <Typography sx={{ mt: 2 }}>
            Average Price: <strong>{averagePrice.toFixed(2)}</strong>
          </Typography>
        </>
      )}
    </Container>
  );
};

export default StockPage;
