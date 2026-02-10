import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import summaryRouter from './routes/summary.js';
import driversRouter from './routes/drivers.js';
import riskFactorsRouter from './routes/risk-factors.js';
import recommendationsRouter from './routes/recommendations.js';
import revenueTrendRouter from './routes/revenue-trend.js';

initDb();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/summary', summaryRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/risk-factors', riskFactorsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/revenue-trend', revenueTrendRouter);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Revenue Intelligence API at http://localhost:${PORT}`);
});
