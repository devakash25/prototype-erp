import { Router, Request, Response } from 'express';
import { feeService } from './fees.service';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createFeeStructureSchema, updateFeeStructureSchema } from './fees.validation';

const router = Router();

router.use(authenticate);

router.get('/summary', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeService.getSummary(user.institutionId);
  res.json({ success: true, data });
});

router.get('/', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { departmentId, isActive, search } = req.query;
  const data = await feeService.getAll(user.institutionId, {
    departmentId: departmentId as string,
    isActive: isActive !== undefined ? isActive === 'true' : undefined,
    search: search as string,
  });
  res.json({ success: true, data });
});

router.get('/:id', async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeService.getById(req.params.id as string, user.institutionId);
  res.json({ success: true, data });
});

router.post('/', authorize('CHIEF_HEAD'), validate(createFeeStructureSchema), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeService.create(req.body, user.institutionId);
  res.status(201).json({ success: true, data });
});

router.put('/:id', authorize('CHIEF_HEAD'), validate(updateFeeStructureSchema), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeService.update(req.params.id as string, req.body, user.institutionId);
  res.json({ success: true, data });
});

router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  await feeService.delete(req.params.id as string, user.institutionId);
  res.json({ success: true, message: 'Fee structure deleted' });
});

router.patch('/:id/toggle', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeService.toggleActive(req.params.id as string, user.institutionId);
  res.json({ success: true, data });
});

export default router;
