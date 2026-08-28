import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { bulkService } from './bulk.service';
import { authenticate, authorize } from '../../middleware/auth';
import { AppError } from '../../utils/errors';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();
router.use(authenticate);

router.get('/template/:type', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.params.type as string;
    const csv = bulkService.getTemplate(type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.csv`);
    res.send(csv);
  } catch (error) { next(error); }
});

router.get('/export/:type', authorize('CHIEF_HEAD'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    const type = req.params.type as string;

    let csv: string;
    switch (type) {
      case 'students': csv = await bulkService.exportStudents(institutionId); break;
      case 'faculty': csv = await bulkService.exportFaculty(institutionId); break;
      case 'fees': csv = await bulkService.exportFees(institutionId); break;
      default: throw new AppError(400, 'Invalid export type');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
    res.send(csv);
  } catch (error) { next(error); }
});

router.post('/import/:type', authorize('CHIEF_HEAD'), upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const institutionId = req.user?.institutionId;
    if (!institutionId) throw new AppError(400, 'Institution not found');
    if (!req.file) throw new AppError(400, 'No file uploaded');
    const type = req.params.type as string;

    let data;
    switch (type) {
      case 'students': data = await bulkService.importStudents(institutionId, req.file); break;
      case 'faculty': data = await bulkService.importFaculty(institutionId, req.file); break;
      default: throw new AppError(400, 'Invalid import type');
    }

    res.json({ success: true, data, message: `Import completed: ${data.successful} successful, ${data.failed} failed` });
  } catch (error) { next(error); }
});

export default router;
