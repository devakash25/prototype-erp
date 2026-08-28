import { Router, Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateSettingsSchema, updateSettingByKeySchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await settingsService.getSettings(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/', authorize('CHIEF_HEAD'), validate(updateSettingsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await settingsService.updateSettings(institutionId, req.body);
    res.json({ success: true, data, message: 'Settings updated' });
  } catch (error) { next(error); }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await settingsService.getSettingByKey(institutionId, req.params.key as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/:key', authorize('CHIEF_HEAD'), validate(updateSettingByKeySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await settingsService.updateSettingByKey(institutionId, req.params.key as string, req.body.value);
    res.json({ success: true, data, message: 'Setting updated' });
  } catch (error) { next(error); }
});

router.post('/reset', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await settingsService.resetToDefaults(institutionId);
    res.json({ success: true, data, message: 'Settings reset to defaults' });
  } catch (error) { next(error); }
});

export default router;
