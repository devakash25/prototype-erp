import { Router, Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { generateReportSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.post('/generate/:slug', authorize('CHIEF_HEAD', 'PRINCIPAL', 'CEO'), validate(generateReportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const slug = req.params.slug as string;
    const report = await reportsService.generateReport(institutionId, slug, req.body);
    const csv = reportsService.toCsv(report);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${slug.replace(/[^a-zA-Z0-9_-]/g, '-')}.csv"`);
    res.send(csv);
  } catch (error) { next(error); }
});

export default router;
