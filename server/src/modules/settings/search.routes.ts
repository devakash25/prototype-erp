import { Router, Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { searchQuerySchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', validate(searchQuerySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const { q, type } = req.query;
    const data = await searchService.search(institutionId, q as string, type as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/students', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const q = (req.query.q as string) || '';
    const data = await searchService.search(institutionId, q, 'students');
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/faculty', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const q = (req.query.q as string) || '';
    const data = await searchService.search(institutionId, q, 'faculty');
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/fees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const q = (req.query.q as string) || '';
    const data = await searchService.search(institutionId, q, 'finance');
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/notifications', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const q = (req.query.q as string) || '';
    const data = await searchService.searchNotifications(institutionId, q);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/announcements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const q = (req.query.q as string) || '';
    const data = await searchService.searchAnnouncements(institutionId, q);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export default router;
