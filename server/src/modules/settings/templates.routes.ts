import { Router, Request, Response, NextFunction } from 'express';
import { templatesService } from './templates.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createTemplateSchema, updateTemplateSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await templatesService.list(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post('/', authorize('CHIEF_HEAD'), validate(createTemplateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await templatesService.create(institutionId, req.body);
    res.json({ success: true, data, message: 'Template created' });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('CHIEF_HEAD'), validate(updateTemplateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    const data = await templatesService.update(institutionId, id, req.body);
    res.json({ success: true, data, message: 'Template updated' });
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    await templatesService.delete(institutionId, id);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) { next(error); }
});

router.patch('/:id/toggle', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const id = req.params.id as string;
    const data = await templatesService.toggle(institutionId, id);
    res.json({ success: true, data, message: 'Template toggled' });
  } catch (error) { next(error); }
});

export default router;
