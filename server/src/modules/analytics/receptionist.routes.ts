import { Router, Request, Response } from 'express';
import { ReceptionistService } from './receptionist.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getDashboard(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/visitors', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getVisitors(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/visitors', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { visitorName, purpose, personToMeet, phone, inTime } = req.body;
    const data = await ReceptionistService.logVisitor(userId, institutionId!, {
      visitorName,
      purpose,
      personToMeet,
      phone,
      inTime: inTime ? new Date(inTime) : undefined,
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/enquiries', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getAdmissionEnquiries(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/phone-logs', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getPhoneEnquiryLogs(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/phone-logs', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { callerName, phone, purpose, calledPerson, notes } = req.body;
    const data = await ReceptionistService.logPhoneEnquiry(userId, institutionId!, {
      callerName,
      phone,
      purpose,
      calledPerson,
      notes,
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/certificates', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getCertificates(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/certificates', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const { studentId, type, title, purpose, remarks } = req.body;
    const data = await ReceptionistService.generateCertificate(userId, institutionId!, {
      studentId,
      type,
      title,
      purpose,
      remarks,
    });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/id-cards', async (req: Request, res: Response) => {
  try {
    const { userId, institutionId } = req.user!;
    const data = await ReceptionistService.getIDCards(userId, institutionId!);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
