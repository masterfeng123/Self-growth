import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import goalsRouter from './routes/goals';
import habitsRouter from './routes/habits';
import journalRouter from './routes/journal';
import statsRouter from './routes/stats';
import dailyRouter from './routes/daily';
import weeklyReportRouter from './routes/weeklyReport';
import extraRouter from './routes/extra';
import achievementsRouter from './routes/achievements';
import projectsRouter from './routes/projects';
import debugLogsRouter from './routes/debugLogs';
import aiRouter from './routes/ai';
import usageRouter from './routes/usage';
import calendarRouter from './routes/calendar';
import newsRouter from './routes/news';
import { startScheduler } from './modules/scheduler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/goals', goalsRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/stats', statsRouter);
app.use('/api/daily', dailyRouter);
app.use('/api/weekly-report', weeklyReportRouter);
app.use('/api/extra', extraRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/debug-logs', debugLogsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/usage', usageRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/news', newsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌱 Self-growth 伺服器已啟動: http://localhost:${PORT}`);
  startScheduler();
});
