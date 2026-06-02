import { Router, Request, Response } from 'express';
import { generateWeeklyReport, getLatestReport, getAllReports } from '../modules/weeklyEval';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const reports = getAllReports() as any[];
    const parsed = reports.map(r => ({
      ...r,
      highlights: JSON.parse(r.highlights),
      blind_spots: JSON.parse(r.blind_spots),
      raw_data: JSON.parse(r.raw_data),
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得週報列表' });
  }
});

router.get('/latest', (_req: Request, res: Response) => {
  try {
    const report = getLatestReport() as any;
    if (!report) return res.json({ success: true, data: null });
    res.json({
      success: true,
      data: {
        ...report,
        highlights: JSON.parse(report.highlights),
        blind_spots: JSON.parse(report.blind_spots),
        raw_data: JSON.parse(report.raw_data),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得最新週報' });
  }
});

router.post('/generate', async (_req: Request, res: Response) => {
  const result = await generateWeeklyReport();
  if (!result.success) {
    return res.status(500).json({ success: false, message: result.error });
  }

  const report = getLatestReport() as any;
  res.json({
    success: true,
    message: '週報生成成功',
    data: {
      ...report,
      highlights: JSON.parse(report.highlights),
      blind_spots: JSON.parse(report.blind_spots),
      raw_data: JSON.parse(report.raw_data),
    },
  });
});

export default router;
