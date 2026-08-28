import { Router, Request, Response, NextFunction } from 'express';
import { backupService } from './backup.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { restoreBackupSchema, updateBackupSettingsSchema } from './settings.validation';
import { AppError } from '../../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await backupService.listBackups();
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.post('/', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await backupService.createBackup();
    res.json({ success: true, data, message: 'Backup created' });
  } catch (error) { next(error); }
});

router.get('/settings', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await backupService.getBackupSettings(institutionId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.put('/settings', authorize('CHIEF_HEAD'), validate(updateBackupSettingsSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const data = await backupService.updateBackupSettings(institutionId, req.body);
    res.json({ success: true, data, message: 'Backup settings updated' });
  } catch (error) { next(error); }
});

router.post('/restore', authorize('CHIEF_HEAD'), validate(restoreBackupSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { backupId } = req.body;
    if (!backupId) throw new AppError(400, 'Backup ID required');
    const data = await backupService.restoreBackup(backupId);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.get('/export/:key', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const key = req.params.key as string;
    const csv = await backupService.exportData(institutionId, key);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${key}_export.csv`);
    res.send(csv);
  } catch (error) { next(error); }
});

router.get('/:id/download', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const fs = await import('fs/promises');
    const path = await import('path');
    const filepath = path.join(process.cwd(), 'backups', `${id}.sql`);
    try { await fs.access(filepath); } catch { throw new AppError(404, 'Backup not found'); }
    res.download(filepath);
  } catch (error) { next(error); }
});

router.post('/:id/restore', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await backupService.restoreBackup(id);
    res.json({ success: true, data });
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await backupService.deleteBackup(id);
    res.json({ success: true, data, message: 'Backup deleted' });
  } catch (error) { next(error); }
});

export default router;
