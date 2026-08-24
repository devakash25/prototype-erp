import { Router, Request, Response } from 'express';
import { AdministrativeService } from './administrative.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

const adminOnly = ['ADMINISTRATIVE_STAFF'];
const allRoles = ['CHIEF_HEAD', 'DIRECTOR', 'PRINCIPAL', 'ADMINISTRATIVE_STAFF'];

// Dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getDashboard(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/activities', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getActivities(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Certificates
router.get('/certificates', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { status, type } = req.query;
    const data = await AdministrativeService.getCertificates(institutionId!, { status: status as string, type: type as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/certificates/stats', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getCertificateStats(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/certificates', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.createCertificate(institutionId!, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/certificates/:id', async (req: Request, res: Response) => {
  try {
    const { status, remarks } = req.body;
    const data = await AdministrativeService.updateCertificateStatus(req.params.id, status, remarks);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Student Requests
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { status, type } = req.query;
    const data = await AdministrativeService.getStudentRequests(institutionId!, { status: status as string, type: type as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/requests/stats', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getRequestStats(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/requests/:id', async (req: Request, res: Response) => {
  try {
    const data = await AdministrativeService.updateStudentRequest(req.params.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Notices
router.get('/notices', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getNotices(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notices', async (req: Request, res: Response) => {
  try {
    const { institutionId, userId } = req.user!;
    const data = await AdministrativeService.createNotice(institutionId!, userId, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Meetings
router.get('/meetings', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getMeetings(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/meetings', async (req: Request, res: Response) => {
  try {
    const { institutionId, userId } = req.user!;
    const data = await AdministrativeService.createMeeting(institutionId!, { ...req.body, organizerId: userId });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/meetings/:id', async (req: Request, res: Response) => {
  try {
    const data = await AdministrativeService.updateMeeting(req.params.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Workflows
router.get('/workflows', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const { status } = req.query;
    const data = await AdministrativeService.getWorkflows(institutionId!, { status: status as string });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/workflows/:id', async (req: Request, res: Response) => {
  try {
    const data = await AdministrativeService.updateWorkflow(req.params.id, req.body.status);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Documents
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getDocuments(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complaints
router.get('/complaints', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getComplaints(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/complaints/:id', async (req: Request, res: Response) => {
  try {
    const data = await AdministrativeService.updateComplaint(req.params.id, req.body);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reports
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const { institutionId } = req.user!;
    const data = await AdministrativeService.getReports(institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
