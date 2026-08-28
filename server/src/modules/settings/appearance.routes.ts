import { Router, Request, Response, NextFunction } from 'express';
import { appearanceService } from './appearance.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { appearanceSettingsSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await appearanceService.getSettings(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/', authorize('CHIEF_HEAD'), validate(appearanceSettingsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await appearanceService.updateSettings(institutionId, req.body);
    res.json({ success: true, data, message: 'Appearance settings updated' });
  } catch (error) { next(error); }
});

router.post('/reset', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await appearanceService.resetSettings(institutionId);
    res.json({ success: true, data, message: 'Appearance settings reset' });
  } catch (error) { next(error); }
});

export default router;
