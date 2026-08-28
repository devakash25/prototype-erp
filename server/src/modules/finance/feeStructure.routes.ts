import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { feeStructureService } from './feeStructure.service';
import { prisma } from '../../config/database';

const router = Router();

router.use(authenticate);

// Stats — finance + management
router.get('/stats', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.getStats(user.institutionId);
  res.json({ success: true, data });
});

// List all fee structures — finance + management
router.get('/', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req: Request, res: Response) => {
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

// Get payments — finance + management
router.get('/payments', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);
  const payments = await prisma.feePayment.findMany({
    where: { student: { institutionId: user.institutionId } },
    include: {
      student: {
        include: { user: { select: { fullName: true } } },
      },
      feeStructure: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  res.json({ success: true, data: { items: payments, total: payments.length } });
});

// Bulk assign — CHIEF_HEAD only
router.post('/bulk-assign', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { feeStructureId, studentIds } = req.body;

  if (!feeStructureId || !studentIds?.length) {
    res.status(400).json({ success: false, error: { message: 'feeStructureId and studentIds are required' } });
    return;
  }

  const structure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
  if (!structure || structure.institutionId !== user.institutionId) {
    res.status(404).json({ success: false, error: { message: 'Fee structure not found' } });
    return;
  }

  const existingPayments = await prisma.feePayment.findMany({
    where: { feeStructureId, studentId: { in: studentIds } },
    select: { studentId: true },
  });
  const existingSet = new Set(existingPayments.map(p => p.studentId));
  const newStudentIds = studentIds.filter((id: string) => !existingSet.has(id));

  if (newStudentIds.length === 0) {
    res.json({ success: true, data: { created: 0, skipped: studentIds.length }, message: 'All students already assigned' });
    return;
  }

  const result = await prisma.feePayment.createMany({
    data: newStudentIds.map((studentId: string) => ({
      studentId,
      feeStructureId,
      amount: structure.totalAmount,
      dueAmount: structure.totalAmount,
      status: 'PENDING' as const,
      dueDate: structure.dueDate,
    })),
  });

  res.json({ success: true, data: { created: result.count, skipped: studentIds.length - result.count } });
});

// Get by ID — finance + management
router.get('/:id', authorize('CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ACCOUNTANT', 'CEO'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.getById(req.params.id as string, user.institutionId);
  res.json({ success: true, data });
});

// Create — CHIEF_HEAD only
router.post('/', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.create(req.body, user.institutionId);
  res.status(201).json({ success: true, data, message: 'Fee structure created' });
});

// Update — CHIEF_HEAD only
router.put('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  const data = await feeStructureService.update(req.params.id as string, req.body, user.institutionId);
  res.json({ success: true, data, message: 'Fee structure updated' });
});

// Delete — CHIEF_HEAD only
router.delete('/:id', authorize('CHIEF_HEAD'), async (req: Request, res: Response) => {
  const user = (req as any).user;
  await feeStructureService.delete(req.params.id as string, user.institutionId);
  res.json({ success: true, message: 'Fee structure deleted' });
});

export default router;
