import { Router, Request, Response } from 'express';
import { ParentService } from './parent.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getDashboard(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/children', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ParentService.getParentChildren(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/attendance', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getAttendance(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/timetable', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getTimetable(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/performance', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getPerformance(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/assignments', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getAssignments(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exams', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getExams(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/fees', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getFees(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/transport', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getTransport(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/hostel', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getHostel(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/library', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getLibrary(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/notices', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ParentService.getNotices(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/ptm', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ParentService.getPTM(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leave', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getLeaveRequests(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leave', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { studentId, startDate, endDate, reason, totalDays } = req.body;
    const data = await ParentService.createLeaveRequest(userId, institutionId!, studentId, {
      startDate,
      endDate,
      reason,
      totalDays,
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/complaints', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getComplaints(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complaints', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { studentId, title, description, category, priority } = req.body;
    const data = await ParentService.raiseComplaint(userId, institutionId!, studentId, {
      title,
      description,
      category,
      priority,
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documents', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getDocuments(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const childId = req.query.childId as string | undefined;
    const data = await ParentService.getActivityTimeline(userId, institutionId!, childId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ParentService.getMessages(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
