import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { feeStructureService } from './feeStructure.service';

const router = Router();

router.use(authenticate);

// Stats
router.get('/stats', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.getStats(user.institutionId);
  res.json({ success: true, data });
});

// List all fee structures
router.get('/', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = {
    search: req.query.search as string,
    departmentId: req.query.departmentId as string,
    courseId: req.query.courseId as string,
    isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 20,
  };
  const data = await feeStructureService.getAll(filters, user.institutionId);
  res.json({ success: true, data });
});

// Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.getById(req.params.id as string, user.institutionId);
  res.json({ success: true, data });
});

// Create
router.post('/', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.create(req.body, user.institutionId);
  res.status(201).json({ success: true, data, message: 'Fee structure created' });
});

// Update
router.put('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.update(req.params.id as string, req.body, user.institutionId);
  res.json({ success: true, data, message: 'Fee structure updated' });
});

// Delete
router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  await feeStructureService.delete(req.params.id as string, user.institutionId);
  res.json({ success: true, message: 'Fee structure deleted' });
});

export default router;
