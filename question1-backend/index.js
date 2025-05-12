const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 4000;

const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDU3NTkwLCJpYXQiOjE3NDcwNTcyOTAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImRkYTRjMjU3LWI3NTQtNGQ4Yi1hMDU4LTUyNmJiNmQxYTljNiIsInN1YiI6InN1cnlhdGhvdGFwYWxsaUBnbWFpbC5jb20ifSwiZW1haWwiOiJzdXJ5YXRob3RhcGFsbGlAZ21haWwuY29tIiwibmFtZSI6InN1cnlhIHRob3RhcGFsbGkiLCJyb2xsTm8iOiJibC5lbi51NGFpZTIyMDYwIiwiYWNjZXNzQ29kZSI6IlN3dXVLRSIsImNsaWVudElEIjoiZGRhNGMyNTctYjc1NC00ZDhiLWEwNTgtNTI2YmI2ZDFhOWM2IiwiY2xpZW50U2VjcmV0IjoiVFhxenRQdVRCYk5BeFZnUiJ9.dKzcTomMf3SENE-zFn1yzIc6KElRyMpFGGgVHcdlIdM';

app.use(express.json());
app.use(require('cors')());

app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;

  try {
    const response = await axios.get(`http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`, {
      headers: { Authorization: AUTH_TOKEN }
    });

    const priceHistory = response.data;

    if (aggregation === 'average') {
      const total = priceHistory.reduce((acc, cur) => acc + cur.price, 0);
      const avg = total / priceHistory.length;

      res.json({
        averageStockPrice: avg,
        priceHistory
      });
    } else {
      res.status(400).json({ error: 'Only aggregation=average supported' });
    }
  } catch (err) {
  console.error('AXIOS ERROR:', err.response?.data || err.message);
  res.status(500).json({ error: 'Failed to fetch stock data' });
}
});

function computeCorrelation(pricesX, pricesY) {
  const n = Math.min(pricesX.length, pricesY.length);
  if (n === 0) return 0;

  const meanX = pricesX.reduce((a, b) => a + b, 0) / n;
  const meanY = pricesY.reduce((a, b) => a + b, 0) / n;

  const cov = pricesX.reduce((sum, x, i) => {
    if (i >= n) return sum;
    return sum + (x - meanX) * (pricesY[i] - meanY);
  }, 0) / (n - 1);

  const stdDevX = Math.sqrt(pricesX.reduce((sum, x) => sum + ((x - meanX) ** 2), 0) / (n - 1));
  const stdDevY = Math.sqrt(pricesY.reduce((sum, y) => sum + ((y - meanY) ** 2), 0) / (n - 1));

  return +(cov / (stdDevX * stdDevY)).toFixed(4); 
}
app.get('/stockcorrelation', async (req, res) => {
  const { minutes, ticker } = req.query;

  if (!Array.isArray(ticker) || ticker.length !== 2) {
    return res.status(400).json({ error: 'Exactly 2 ticker values are required (e.g., ?ticker=NVDA&ticker=PYPL)' });
  }

  try {
    const [res1, res2] = await Promise.all(
      ticker.map(t =>
        axios.get(`http://20.244.56.144/evaluation-service/stocks/${t}?minutes=${minutes}`, {
          headers: { Authorization: AUTH_TOKEN },
        })
      )
    );

    const prices1 = res1.data.map(p => p.price);
    const prices2 = res2.data.map(p => p.price);

    const correlation = computeCorrelation(prices1, prices2);

    const avg1 = prices1.reduce((a, b) => a + b, 0) / prices1.length;
    const avg2 = prices2.reduce((a, b) => a + b, 0) / prices2.length;

    res.json({
      correlation,
      stocks: {
        [ticker[0]]: {
          averagePrice: avg1,
          priceHistory: res1.data,
        },
        [ticker[1]]: {
          averagePrice: avg2,
          priceHistory: res2.data,
        },
      },
    });
  } catch (err) {
    console.error('CORRELATION ERROR:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to compute correlation' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
