import { Router, Request, Response, NextFunction } from 'express';
import { auditLogService } from './auditLog.service';
import { authenticate, authorize } from '../../middleware/auth';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');

    const { from, to, action, module, limit, offset } = req.query;
    const data = await auditLogService.getLogs(institutionId, {
      from: from as string,
      to: to as string,
      action: action as string,
      module: module as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/modules', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await auditLogService.getModules(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/actions', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await auditLogService.getActions(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

export default router;
