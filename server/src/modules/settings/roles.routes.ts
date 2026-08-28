import { Router, Request, Response, NextFunction } from 'express';
import { rolesService } from './roles.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updatePermissionsSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await rolesService.getRoles(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/permissions', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await rolesService.getAllPermissions(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/:roleId/permissions', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'CEO'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await rolesService.getPermissions(institutionId, req.params.roleId as string);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/:roleId/permissions', authorize('CHIEF_HEAD'), validate(updatePermissionsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await rolesService.updatePermissions(institutionId, req.params.roleId as string, req.body);
    res.json({ success: true, data, message: 'Permissions updated' });
  } catch (error) { next(error); }
});

export default router;
