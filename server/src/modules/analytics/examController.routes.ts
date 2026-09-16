import { Router, Request, Response } from 'express';
import { examControllerService } from './examController.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await examControllerService.getDashboard(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/exams', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await examControllerService.getExams(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/exams', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await examControllerService.createExam(userId, institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/results', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const examId = req.query.examId as string | undefined;
    const data = await examControllerService.getExamResults(userId, institutionId!, examId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/results/publish', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { examId } = req.body;
    const data = await examControllerService.publishResults(userId, institutionId!, examId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/seating-plan', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const examId = req.query.examId as string | undefined;
    const data = await examControllerService.getSeatingPlan(userId, institutionId!, examId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/merit-list', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await examControllerService.getMeritList(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/calculate-grades', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { examId } = req.body;
    const data = await examControllerService.calculateGrades(userId, institutionId!, examId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
