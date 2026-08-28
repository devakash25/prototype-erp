import { Router, Request, Response, NextFunction } from 'express';
import { customReportsService } from './customReports.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReportSchema, updateReportSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await customReportsService.list(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post('/', authorize('CHIEF_HEAD'), validate(createReportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await customReportsService.create(institutionId, req.body);
    res.json({ success: true, data, message: 'Report created' });
  } catch (error) { next(error); }
});

router.post('/preview', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await customReportsService.preview(institutionId, req.body);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('CHIEF_HEAD'), validate(updateReportSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    const data = await customReportsService.update(institutionId, id, req.body);
    res.json({ success: true, data, message: 'Report updated' });
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    await customReportsService.delete(institutionId, id);
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) { next(error); }
});

router.post('/:id/run', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    const data = await customReportsService.run(institutionId, id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post('/:id/preview', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    const data = await customReportsService.preview(institutionId, id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export default router;
