import { Router, Request, Response } from 'express';
import { hostelService } from './hostel.service';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.getDashboard(user.institutionId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch dashboard' } });
  }
});

router.get('/hostels', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.getHostels(user.institutionId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch hostels' } });
  }
});

router.get('/hostels/:id', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.getHostelDetail(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch hostel' } });
  }
});

router.post('/hostels', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.createHostel(user.institutionId, req.body);
    res.json({ success: true, data, message: 'Hostel created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to create hostel' } });
  }
});

router.patch('/hostels/:id', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.updateHostel(req.params.id as string, req.body);
    res.json({ success: true, data, message: 'Hostel updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to update hostel' } });
  }
});

router.get('/rooms', async (req: Request, res: Response) => {
  try {
    const { hostelId, type, floor, availability } = req.query;
    if (!hostelId) {
      res.status(400).json({ success: false, error: { message: 'hostelId is required' } });
      return;
    }
    const data = await hostelService.getRooms(hostelId as string, {
      type: type as string | undefined,
      floor: floor ? parseInt(floor as string) : undefined,
      availability: availability as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch rooms' } });
  }
});

router.get('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.getRoomDetail(req.params.id as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch room' } });
  }
});

router.post('/rooms', async (req: Request, res: Response) => {
  try {
    const { hostelId, ...roomData } = req.body;
    if (!hostelId) {
      res.status(400).json({ success: false, error: { message: 'hostelId is required' } });
      return;
    }
    const data = await hostelService.createRoom(hostelId, roomData);
    res.json({ success: true, data, message: 'Room created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to create room' } });
  }
});

router.patch('/rooms/:id', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.updateRoom(req.params.id as string, req.body);
    res.json({ success: true, data, message: 'Room updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to update room' } });
  }
});

router.post('/allocate', async (req: Request, res: Response) => {
  try {
    const { studentId, roomId } = req.body;
    if (!studentId || !roomId) {
      res.status(400).json({ success: false, error: { message: 'studentId and roomId are required' } });
      return;
    }
    const data = await hostelService.allocateRoom({ studentId, roomId });
    res.json({ success: true, data, message: 'Room allocated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to allocate room' } });
  }
});

router.post('/deallocate/:studentId', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.deallocateRoom(req.params.studentId as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to deallocate room' } });
  }
});

router.get('/students', async (req: Request, res: Response) => {
  try {
    const hostelId = req.query.hostelId as string | undefined;
    const data = await hostelService.getStudents(hostelId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch students' } });
  }
});

router.get('/complaints', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, priority } = req.query;
    const data = await hostelService.getComplaints(user.institutionId, {
      status: status as string | undefined,
      priority: priority as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch complaints' } });
  }
});

router.post('/complaints', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.raiseComplaint(user.institutionId, {
      creatorId: user.userId,
      ...req.body,
    });
    res.json({ success: true, data, message: 'Complaint raised successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to raise complaint' } });
  }
});

router.patch('/complaints/:id', async (req: Request, res: Response) => {
  try {
    const data = await hostelService.updateComplaint(req.params.id as string, req.body);
    res.json({ success: true, data, message: 'Complaint updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to update complaint' } });
  }
});

router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.getAnalytics(user.institutionId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch analytics' } });
  }
});

router.get('/activities', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const data = await hostelService.getActivities(user.institutionId);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to fetch activities' } });
  }
});

export default router;
